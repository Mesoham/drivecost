# DriveCost – Vehicle Expense Tracker

> **“Know exactly what your vehicle costs every month.”**

A mobile-first, local-first Progressive Web App (PWA) built specifically for Indian vehicle owners: cars, motorcycles, scooters, auto-rickshaws, and small commercial vehicles. Tracks fuel refills, EV charging, servicing, insurance, PUC, EMI loans, tolls, parking, and overall running costs with Indian rupee formatting (₹ / Lakhs) and strict verified fuel-efficiency calculations.

---

## 🌟 Key Features

1. **Local-First & 100% Offline Capable**
   - Built on IndexedDB using Dexie.js for persistent, instant client-side storage.
   - PWA Service Worker (`/sw.js`) caches static assets for complete offline usability after the initial load.
   - No mandatory login, account creation, or external servers required.

2. **Accurate Indian Fuel & Efficiency Calculations**
   - **Full-Tank Verified Mileage**: Calculates true fuel efficiency (`km/l` or `L/100km`) exclusively between two consecutive full tank refills. Partial refills are logged as expenses without producing distorted efficiency numbers.
   - **Cost Per Kilometre (`₹/km`)**: Real total cost of ownership including fuel, maintenance, insurance, and running costs computed against verified odometer intervals.
   - **Two-Way Calculation Assistant**: Automatically computes fuel litres, total amount, or price per litre based on input fields.

3. **Indian Regional & Regulatory Standards**
   - Default currency formatting in Indian Rupees (`₹ 1,25,000` lakh separators via `Intl.NumberFormat('en-IN')`).
   - Gentle validation for standard Indian state RTO license plates (e.g., `MH 12 AB 1234`) and Bharat series (`22 BH 1234 AA`).
   - Privacy-focused registration number masking on overview screens (`MH 12 •••• 1234`).
   - Tracking for Indian statutory requirements: Pollution Under Control (**PUC**), Comprehensive & Third-Party Insurance, FASTag / expressway tolls, and vehicle loan EMIs.

4. **Multi-Vehicle Management**
   - Filter all dashboards and reports by single vehicle or aggregate across your entire household/business fleet.
   - Track vehicle types: Car, Motorcycle, Scooter, EV, Auto-rickshaw, and Commercial Fleet.

5. **Alerts & Reminder Engine**
   - Tracks upcoming and overdue PUC certificates, insurance renewals, and service deadlines by both target date and target odometer readings.
   - Alerts are surfaced directly on the dashboard without requiring push notification permissions; optional browser notification integration is available on user request.

6. **Interactive Analytics & Audit Reports**
   - 6-month monthly spend trend charts and category breakdown donuts powered by Recharts.
   - Filter expenses by date ranges (This Month, Last Month, Last 3 Months, This Year, All Time) and categories.
   - One-click **Export to CSV** for spreadsheets and print-optimized PDF view.

7. **Data Ownership, Backup & Restore**
   - Export your entire database to standard JSON backup with one click.
   - Full atomic import and restore validation.
   - Resettable demo dataset featuring real-world Indian test vehicles (Honda Activa 6G + Maruti Suzuki Swift ZXi) with 6 months of historical transactions.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack, Partial Prerendering & React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS
- **Local Storage Engine**: Dexie.js (IndexedDB wrapper) & `dexie-react-hooks`
- **State Management**: Zustand
- **Charts & Data Visuals**: Recharts
- **Validation**: Zod schema validation
- **Icons**: Lucide React
- **Testing**: Vitest, React Testing Library, JSDOM & Playwright (Chromium E2E)
- **PWA**: Web App Manifest (`manifest.json`), service worker (`sw.js`), standalone mobile display mode

---

## 🚀 Local Setup & Development

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Mesoham/drivecost.git
cd drivecost
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 3. Run Unit & Calculation Tests
```bash
npm test
```
Executes Vitest covering fuel calculations, mileage verification rules, cost-per-km metrics, reminder thresholds, Indian registration formatting, and JSON backup/restore logic.

### 4. Run End-to-End Tests
```bash
npm run test:e2e
```
Runs Playwright automated tests verifying the critical user journey: onboarding, vehicle creation, fuel fill logging, verified mileage calculations, and reports.

### 5. Production Build
```bash
npm run build
npm start
```

---

## ☁️ Deployment Guide

DriveCost contains no proprietary server components and can be hosted for free on any static/serverless platform:

### Deploying to Vercel
1. Push your repository to GitHub or GitLab.
2. Import the project into Vercel.
3. Keep default settings (`Framework Preset: Next.js`).
4. Click **Deploy**.

### Deploying to Netlify
1. Connect repository in Netlify dashboard.
2. Build command: `npm run build`.
3. Publish directory: `.next`.
4. Set `@netlify/plugin-nextjs` essential plugin.

### Deploying to Cloudflare Pages
1. Build command: `npx @cloudflare/next-on-pages`.
2. Build output directory: `.vercel/output/static`.

---

## 🔒 Privacy & Data Ownership Statement

- **Device Boundary**: All user records, mileage metrics, and expense receipts remain solely in your browser storage.
- **Zero Telemetry**: No third-party trackers, advertisements, or profiling analytics are included.
- **Cloud Sync Architecture**: A decoupled interface is provided in `src/lib/sync/repository.ts` for optional future cloud sync (e.g. Supabase), ensuring that local-first operation remains completely independent.

---

## 📱 Installing as a PWA on Mobile

- **Android (Chrome)**: Tap the 3-dots browser menu → **Install app** or **Add to Home Screen**.
- **iOS (Safari)**: Tap the Share icon → **Add to Home Screen**.
Once installed, DriveCost opens in standalone full-screen mode without browser address bars and works seamlessly offline.
