import cors from 'cors';

const defaultOrigins = ['http://localhost:5000', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:8081'];

// Parse allowed origins from env or use defaults
function parseAllowedOrigins() {
  const input = process.env.ALLOWED_ORIGINS;
  if (!input) {
    return defaultOrigins;
  }

  return input
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins();

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    // Allow localhost, local network IPs (e.g. mobile devices on Wi-Fi), and explicit whitelist
    const isLocalNetwork = /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
    if (isLocalNetwork || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked request from disallowed origin: ${origin}`);
    return callback(new Error('Not allowed by CORS policy'));
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
});

export default corsMiddleware;
