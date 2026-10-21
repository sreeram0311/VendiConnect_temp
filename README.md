# VendiConnect — Full-Stack Platform

A community-powered street vendor alert and operations platform that bridges the gap between hyper-local push-cart vendors and neighborhood residents while preserving privacy and operational transparency.

---

## 1. System Architecture

The repository contains four primary components:

* `Backend/`: Express.js 5.2 (ES Modules) REST API connected to MongoDB Atlas and Firebase Admin SDK.
* `admin-dashboard/`: Operations portal built with React 19, Vite, TypeScript, Tailwind CSS, React Router DOM, Leaflet (OpenStreetMap), and Recharts.
* `resident-app/`: Mobile application built with React Native, Expo (SDK 58), TypeScript, React Navigation, Zustand, and Leaflet OpenStreetMap in WebView.
* `whatsapp-bot/`: Interactive WhatsApp service for street vendors and neighborhood residents, featuring dual webhook support (Meta WhatsApp Cloud API + Twilio) and a full-featured browser-based WhatsApp Web simulator.

```
vendiconnect/
├── Backend/               # Express.js REST API & MongoDB Data Models
│   ├── src/
│   │   ├── config/        # DB and Firebase Admin setup
│   │   ├── controllers/   # Controllers for auth, vendors, residents, alerts, ratings
│   │   ├── middleware/    # Auth guards, CORS, rate limiters
│   │   ├── models/        # Mongoose schemas (Vendor, Resident, Location, Alert, Rating)
│   │   └── services/      # Geofencing, proximity matching, SLA monitoring
│   ├── openapi.yaml       # OpenAPI 3.0.3 specification
│   └── package.json
│
├── admin-dashboard/       # Operations & Analytics Web Dashboard
│   ├── src/
│   │   ├── components/    # Reusable UI cards, tables, modals, and Leaflet OperationsMap
│   │   ├── pages/         # Overview, Live Operations, Vendors, Residents, Categories, Alerts, Ratings, Analytics, Settings
│   │   ├── services/      # Centralized API client and adminService
│   │   └── store/         # Zustand admin authentication store
│   └── package.json
│
├── resident-app/          # Resident Mobile & Web Discovery App
│   ├── src/
│   │   ├── components/    # VendorMap, VendorBottomSheet, RatingModal
│   │   ├── navigation/    # AppNavigator and TabNavigator
│   │   ├── screens/       # Welcome, Login, Home, Map, Alerts, Preferences, Profile
│   │   ├── services/      # API client, residentService, notificationService
│   │   └── store/         # Zustand auth and resident discovery stores
│   └── package.json
│
└── whatsapp-bot/          # WhatsApp Bot & Interactive Web Simulator
    ├── src/
    │   ├── services/      # backendClient.js, botBrain.js
    │   ├── views/         # simulator.html (WhatsApp Web clone UI)
    │   └── server.js      # Webhooks (Meta, Twilio) and Simulator API
    └── package.json
```

---

## 2. Quick Start Guide

### Prerequisites
- Node.js `v20.x` or `v24.x`
- npm `v10.x` or `v11.x`

---

### Step A: Start the Backend API

1. Navigate to the `Backend/` directory:
   ```bash
   cd Backend
   npm install
   ```

2. Verify environment configuration in `Backend/.env`:
   ```ini
   PORT=5000
   ALLOWED_ORIGINS=http://localhost:5000,http://localhost:3000,http://localhost:5173,http://localhost:8081
   JWT_SECRET=7d5641e615670a16b0a6f84d420dce95c423f3d63df10dc38d1487e6b4ff2fb8
   JWT_EXPIRES_IN=8h
   DEFAULT_ADMIN_EMAIL=admin@vendiconnect.com
   DEFAULT_ADMIN_PASSWORD=Admin@123
   ```

3. Start the backend server:
   ```bash
   npm start
   # Or for auto-reload during development:
   npm run dev
   ```
   The backend will listen on `http://localhost:5000`. Swagger API documentation is available at `http://localhost:5000/api-docs`.

---

### Step B: Start the Admin Dashboard

1. Navigate to the `admin-dashboard/` directory:
   ```bash
   cd admin-dashboard
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

3. **Seeded Admin Login Credentials**:
   - **Email**: `admin@vendiconnect.com`
   - **Password**: `Admin@123`
   *(Or click the "Fill Seeded Credentials" quick-fill button on the login screen).*

---

### Step C: Start the Resident App (Expo)

1. Navigate to the `resident-app/` directory:
   ```bash
   cd resident-app
   npm install
   ```

2. Launch Expo for Web or Mobile:
   ```bash
   # Run in Web browser:
   npm run web

   # Or run on iOS Simulator (macOS):
   npm run ios

   # Or run on Android Emulator / Physical Device with Expo Go:
   npm run android
   ```

3. **Resident Sign In**:
   - Enter any 10-digit mobile number and receive a 6-digit OTP code (`123456`).
   - Or click **⚡ Instant Sign In as Karthik (T. Nagar Resident)** for immediate sandbox access.

---

### Step D: Start the WhatsApp Bot (Simulator & Real Chrome Client)

1. Navigate to the `whatsapp-bot/` directory:
   ```bash
   cd whatsapp-bot
   npm install
   ```

2. Start the WhatsApp Bot service:
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

3. **Two Ways to Use the WhatsApp Bot**:
   - **A. Interactive WhatsApp Web Simulator (Instant Testing)**:
     Open `http://localhost:5001/` in any browser.
     Click the quick pills (`VENDORS`, `CATEGORIES`, `STATUS`, `📍 Send GPS Pin`, `START`), or type natural language messages.
   - **B. Real WhatsApp Web Client via Google Chrome (`whatsapp-web.js`)**:
     Open `http://localhost:5001/qr` or run `npm run client` in `whatsapp-bot/`.
     Scan the displayed QR code with your mobile phone (**WhatsApp -> Linked Devices -> Link a Device**).
     Once linked, the bot will directly listen and reply to incoming messages on your real WhatsApp phone number using your local Google Chrome installation!

---

## 3. Key Features & Backend Integrations

### Admin Dashboard (`admin-dashboard/`)
* **Live Operations Map**: Interactive Leaflet map utilizing OpenStreetMap tiles. Renders authorized active vendor markers, category filters, and privacy-preserving resident density buffers.
* **Overview & KPI Telemetry**: Metric cards displaying active vendors, residents, dispatched alerts, and active hours alongside Recharts area and bar charts.
* **Vendor Operations**: Search, filter, inspect vendor locations, review session consent status, and mutate vendor operational statuses (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
* **Category Manager**: Full CRUD management of vendor trade classifications with live vendor count tallies.
* **Proximity Alerts Audit**: Audit logs tracking vendor name, resident name, walking ETA in minutes, geofence distance, and dispatch timestamps.
* **Ratings & Feedback**: Community feedback reviews with star scores and text comments.
* **Pilot Analytics**: Recharts visualizations for average ratings per trade category, alert engagement density ratios, and active vendor hours.
* **System Settings & SLAs**: Live monitoring of backend health (`/api/health`), database latency in milliseconds, uptime, memory, and SLA threshold targets.

### Resident Mobile App (`resident-app/`)
* **Phone Authentication**: Clean mobile login with OTP verification, resend cooldown timer, and a dedicated development mode fallback.
* **Geofence Perimeter Configuration**: Residents select alert perimeters (`200m`, `300m`, `500m`, `1000m`) and set home locations via device GPS or manual street search.
* **Vendor Discovery Map**: Live OpenStreetMap showing approaching vendors, walking ETA in minutes, star ratings, and approximate distance.
* **Trade Preferences**: Subscribe to or mute specific vendor categories (e.g. Vegetables, Fresh Juice, Flowers, Tiffin) to prevent alert fatigue.
* **Anti-Fraud Rating Guard**: Submitting a vendor rating requires an actual proximity alert between the vendor and resident within the last 2 hours (`RATING_PROXIMITY_WINDOW_HOURS=2`), preventing fake reviews.
* **Push Notifications**: Expo Notifications & FCM token registration (`PATCH /api/residents/auth/fcm-token`) with an in-app alert simulator for testing without waiting for live hardware GPS tracks.

### WhatsApp Bot (`whatsapp-bot/`)
* **Real WhatsApp Web Client (Google Chrome)**: Powered by `whatsapp-web.js` and Puppeteer. Launches Google Chrome, displays an auth QR code in the terminal and on `http://localhost:5001/qr`, saves session credentials into `.wwebjs_auth/`, and interfaces with actual WhatsApp chats.
* **Browser Simulator UI**: Built-in WhatsApp Web clone on `http://localhost:5001/` for instant zero-configuration testing without scanning QR codes.
* **Cloud Webhook Adapters**: Ready-to-go webhook endpoints for Meta WhatsApp Cloud API (`/webhook`) and Twilio WhatsApp API (`/twilio`).
* **Live Catalog & Active Vendors**: Direct REST queries into the Backend (`/api/vendors/nearby`, `/api/vendors/active-vendors`, `/api/public/categories`).
* **Location Pin Geofencing**: Accepts WhatsApp location attachments (`{ latitude, longitude }`), finds vendors within proximity, and calculates arrival ETAs.
* **Street Vendor Telematics**: Enables vendors to broadcast their location (`VENDOR ON`) and terminate their broadcast session (`VENDOR OFF`).
* **Health & Telemetry**: Reports API connectivity, database status, server uptime, and active broadcasting vendor count in real-time (`STATUS`).

---

## 4. Privacy & Security Rules

1. **Resident Geofence Privacy**: A resident's exact home latitude and longitude are **never** exposed to vendors or unauthorized third parties. Proximity calculations execute strictly server-side using MongoDB's `2dsphere` spatial indexing.
2. **Vendor Location Truncation**: Vendor GPS coordinates are stored at approximate resolutions to safeguard vendor safety and prevent unauthorized tracking.
3. **Rating Proximity Verification**: `POST /api/ratings` enforces that a vendor must have triggered an alert for that resident within 2 hours. Submissions without qualifying alerts return HTTP 403.

---

## 5. Verification Commands

* **Admin Dashboard Build Check**:
  ```bash
  cd admin-dashboard
  npm run build
  ```
  *(Expected: Bundles clean HTML/CSS/JS in `dist/` with 0 errors)*

* **Resident App Type Check**:
  ```bash
  cd resident-app
  npx tsc --noEmit
  ```
  *(Expected: Passes with 0 errors)*

* **WhatsApp Bot Health Check**:
  ```bash
  curl http://localhost:5001/health
  ```
  *(Expected: `{"success": true, "service": "VendiConnect WhatsApp Bot", "status": "online"}`)*

* **Backend Health Check**:
  ```bash
  curl http://localhost:5000/api/health
  ```
  *(Expected: `{"success": true, "status": "ok", "database": {"connected": true}}`)*
