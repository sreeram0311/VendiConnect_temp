import 'dotenv/config';

const BACKEND_URL = (process.env.BACKEND_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export const backendClient = {
  // Fetch active vendors
  async getActiveVendors() {
    try {
      const res = await fetch(`${BACKEND_URL}/vendors/active-vendors`);
      return await res.json();
    } catch (err) {
      console.error('[backendClient.getActiveVendors]', err.message);
      return { success: false, data: [] };
    }
  },

  // Fetch nearby vendors by coordinates
  async getNearbyVendors(lat, lng, radius = 1500) {
    try {
      const res = await fetch(
        `${BACKEND_URL}/vendors/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      return await res.json();
    } catch (err) {
      console.error('[backendClient.getNearbyVendors]', err.message);
      return { success: false, data: [] };
    }
  },

  // Fetch all trade categories
  async getCategories() {
    try {
      const res = await fetch(`${BACKEND_URL}/public/categories`);
      return await res.json();
    } catch (err) {
      console.error('[backendClient.getCategories]', err.message);
      return { success: false, data: [] };
    }
  },

  // Update vendor location
  async updateVendorLocation(vendorId, latitude, longitude) {
    try {
      const res = await fetch(`${BACKEND_URL}/vendors/${vendorId}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      return await res.json();
    } catch (err) {
      console.error('[backendClient.updateVendorLocation]', err.message);
      return { success: false, message: err.message };
    }
  },

  // Vendor consent update
  async updateConsent(vendorId, consent = true) {
    try {
      const endpoint = consent ? 'session/consent' : 'session/withdraw';
      const res = await fetch(`${BACKEND_URL}/vendors/${vendorId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (err) {
      console.error('[backendClient.updateConsent]', err.message);
      return { success: false, message: err.message };
    }
  },

  // Health check
  async getHealth() {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      return await res.json();
    } catch (err) {
      return { success: false, status: 'offline' };
    }
  },

  // Process incoming WhatsApp message through backend bilingual bot engine
  async processBotMessage({ text, sender, location }) {
    try {
      const res = await fetch(`${BACKEND_URL}/vendors/bot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender, location }),
      });
      const data = await res.json();
      return data.reply || data.message || 'No reply from server';
    } catch (err) {
      console.error('[backendClient.processBotMessage]', err.message);
      return '⚠️ Service temporarily unavailable. Please try again shortly / சேவை தற்காலிகமாக கிடைக்கவில்லை.';
    }
  },

  // Reset bot session state in backend
  async resetBotSession(phone) {
    try {
      const res = await fetch(`${BACKEND_URL}/vendors/bot/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      return await res.json();
    } catch (err) {
      console.error('[backendClient.resetBotSession]', err.message);
      return { success: false };
    }
  },
};
