import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import { botBrain } from './botBrain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect installed Google Chrome paths on Windows / standard environments
function getChromeExecutablePath() {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }
  const candidatePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe')
      : null,
  ].filter(Boolean);

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined; // Fallback to Puppeteer default Chromium bundle
}

class ChromeWhatsAppService {
  constructor() {
    this.client = null;
    this.status = 'idle'; // 'idle' | 'initializing' | 'qr_ready' | 'authenticated' | 'ready' | 'disconnected'
    this.qrRaw = null;
    this.qrDataUrl = null;
    this.userPhone = null;
  }

  async init({ headless = true } = {}) {
    if (this.client && this.status !== 'disconnected') {
      console.log(`[Chrome WhatsApp] Client already in status: ${this.status}`);
      return;
    }

    this.status = 'initializing';
    const chromePath = getChromeExecutablePath();
    console.log(`[Chrome WhatsApp] Initializing with Chrome at: ${chromePath || 'Puppeteer Chromium'}`);

    const authDir = path.resolve(__dirname, '../../.wwebjs_auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: authDir,
      }),
      puppeteer: {
        headless,
        executablePath: chromePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });

    // 1. QR Code Event
    this.client.on('qr', async (qr) => {
      this.status = 'qr_ready';
      this.qrRaw = qr;
      try {
        this.qrDataUrl = await QRCode.toDataURL(qr, { scale: 8, margin: 2 });
      } catch (err) {
        console.error('[Chrome WhatsApp] Failed to render QR to data URL:', err);
      }

      console.log('\n======================================================');
      console.log(' [WHATSAPP WEB QR CODE] Scan with your WhatsApp Mobile App:');
      console.log(' Open WhatsApp on phone -> Linked Devices -> Link a Device');
      console.log(' (Or view live QR code in browser at http://localhost:5001/qr)');
      console.log('======================================================\n');
      qrcodeTerminal.generate(qr, { small: true });
    });

    // 2. Authentication Event
    this.client.on('authenticated', () => {
      this.status = 'authenticated';
      this.qrRaw = null;
      this.qrDataUrl = null;
      console.log('[Chrome WhatsApp] Session authenticated successfully!');
    });

    // 3. Ready Event
    this.client.on('ready', () => {
      this.status = 'ready';
      this.userPhone = this.client.info?.wid?.user || 'Connected';
      console.log(`[Chrome WhatsApp] Ready! Connected as +${this.userPhone}`);
      console.log('[Chrome WhatsApp] Listening for inbound WhatsApp messages...');
    });

    // 4. Inbound Message Handling
    this.client.on('message', async (msg) => {
      // Ignore broadcast status updates
      if (msg.from === 'status@broadcast') return;

      try {
        let location = null;
        if (msg.type === 'location' && msg.location) {
          location = {
            latitude: msg.location.latitude,
            longitude: msg.location.longitude,
          };
        }

        const sender = msg.from.replace('@c.us', '');
        const text = msg.body || '';

        console.log(`[Chrome WhatsApp] Inbound message from ${sender}: ${text || '[Location Pin]'}`);

        // Process message through botBrain
        const replyText = await botBrain.processIncomingMessage({
          text,
          sender,
          location,
        });

        if (replyText) {
          await msg.reply(replyText);
          console.log(`[Chrome WhatsApp] Replied to ${sender}`);
        }
      } catch (err) {
        console.error('[Chrome WhatsApp Message Error]', err);
      }
    });

    // 5. Auth Failure & Disconnect
    this.client.on('auth_failure', (err) => {
      this.status = 'auth_failure';
      console.error('[Chrome WhatsApp] Authentication failure:', err);
    });

    this.client.on('disconnected', (reason) => {
      this.status = 'disconnected';
      this.userPhone = null;
      console.log('[Chrome WhatsApp] Client disconnected:', reason);
    });

    try {
      await this.client.initialize();
    } catch (err) {
      this.status = 'error';
      console.error('[Chrome WhatsApp Init Error]', err);
    }
  }

  getStatus() {
    return {
      status: this.status,
      qrRaw: this.qrRaw,
      qrDataUrl: this.qrDataUrl,
      userPhone: this.userPhone,
    };
  }

  async destroy() {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.status = 'disconnected';
    }
  }
}

export const chromeWhatsAppService = new ChromeWhatsAppService();
