import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { botBrain } from './services/botBrain.js';
import { chromeWhatsAppService } from './services/chromeClient.js';

const app = express();
const port = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. WhatsApp Web Simulator UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'simulator.html'));
});

// 2. WhatsApp Web Chrome Link / QR View
app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'qr.html'));
});

// 3. Chrome WhatsApp Client Telemetry & Controls
app.get('/api/chrome/status', (req, res) => {
  res.json(chromeWhatsAppService.getStatus());
});

app.post('/api/chrome/start', async (req, res) => {
  try {
    const headless = req.body?.headless ?? true;
    // Asynchronously initialize without blocking HTTP response
    chromeWhatsAppService.init({ headless }).catch((err) => {
      console.error('[Chrome Start Error]', err);
    });
    return res.json({ success: true, message: 'Chrome client initialization started' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/chrome/stop', async (req, res) => {
  try {
    await chromeWhatsAppService.destroy();
    return res.json({ success: true, message: 'Chrome client stopped' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Direct Simulator API Endpoint
app.post('/api/simulate', async (req, res) => {
  try {
    const { text, sender = '9876543210', location } = req.body;
    const reply = await botBrain.processIncomingMessage({ text, sender, location });
    return res.json({ success: true, reply });
  } catch (err) {
    console.error('[Simulator Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Reset Simulator Session Endpoint
app.post('/api/simulate/reset', async (req, res) => {
  try {
    const { sender = '9876543210' } = req.body;
    const { backendClient } = await import('./services/backendClient.js');
    await backendClient.resetBotSession(sender);
    return res.json({ success: true, message: 'Session reset successfully' });
  } catch (err) {
    return res.json({ success: true });
  }
});

// 3. Meta WhatsApp Cloud API Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'vendiconnect_webhook_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Meta Webhook] Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// 4. Meta WhatsApp Cloud API Incoming Message Handler
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const message = changes?.messages?.[0];

    if (message) {
      const sender = message.from;
      let text = '';
      let location = null;

      if (message.type === 'text') {
        text = message.text.body;
      } else if (message.type === 'location') {
        location = {
          latitude: message.location.latitude,
          longitude: message.location.longitude,
        };
      }

      console.log(`[WhatsApp Inbound] From ${sender}: ${text || JSON.stringify(location)}`);

      // Process message through botBrain
      const replyText = await botBrain.processIncomingMessage({ text, sender, location });

      // In production with Meta Graph API configured:
      const apiToken = process.env.WHATSAPP_API_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (apiToken && phoneId && !apiToken.startsWith('mock_')) {
        await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: sender,
            type: 'text',
            text: { body: replyText },
          }),
        });
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('[WhatsApp Webhook Error]', err);
    return res.sendStatus(500);
  }
});

// 5. Twilio WhatsApp Webhook Handler (TwiML)
app.post('/twilio', async (req, res) => {
  try {
    const incomingText = req.body.Body || '';
    const from = req.body.From || '';

    let location = null;
    if (req.body.Latitude && req.body.Longitude) {
      location = {
        latitude: parseFloat(req.body.Latitude),
        longitude: parseFloat(req.body.Longitude),
      };
    }

    const replyText = await botBrain.processIncomingMessage({
      text: incomingText,
      sender: from,
      location,
    });

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message></Response>`;
    res.end(twiml);
  } catch (err) {
    console.error('[Twilio Error]', err);
    res.status(500).send('Error');
  }
});

// 6. Bot Service Health
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'VendiConnect WhatsApp Bot',
    port,
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`[WhatsApp Bot] Listening on http://localhost:${port}`);
  console.log(`[WhatsApp Bot] Web Simulator running at http://localhost:${port}/`);
  console.log(`[WhatsApp Bot] Live QR Code for Phone Link at http://localhost:${port}/qr`);

  const autoStart = process.env.AUTO_START_CLIENT !== 'false';
  const headless = process.env.CHROME_HEADLESS !== 'false';

  if (autoStart) {
    console.log('[WhatsApp Bot] Initializing WhatsApp Web Client for QR code phone linking...');
    chromeWhatsAppService.init({ headless }).catch((err) => {
      console.warn('[WhatsApp Bot] WhatsApp Web Client notice:', err.message);
    });
  }
});
