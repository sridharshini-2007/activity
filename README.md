# HTTP Request Sequence Monitoring System

An interdisciplinary full-stack web application integrating:
- **FSWD (22ITT51):** React 18, Express, Node.js EventEmitters, MongoDB/Mongoose CRUD
- **CN (22ITT52):** HTTP protocol, request/response lifecycle, status code taxonomy, connection anomaly detection
- **FLAT (22ITT53):** Finite Automata (DFA), Regular Expressions, Context-Free Grammars (CFG), Pushdown Automata (PDA), Turing Machine Decidability

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Local Run

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

3. **Start the Backend Server (Port 5000):**
   ```bash
   cd ../backend
   npm start
   ```

4. **Start the Frontend Development Server (Port 3000):**
   ```bash
   cd ../frontend
   npm run dev
   ```

5. Open your browser at `http://localhost:3000` to interact with the live monitoring dashboard.

---

## 🗂️ Project Directory Structure

```text
fswd project/
├── backend/                  # Node.js + Express API Backend
│   ├── automata/             # FLAT: DFA, Regex, CFG, PDA, TM engines
│   ├── config/               # MongoDB Mongoose & resilient fallback config
│   ├── controllers/          # FSWD: Request CRUD & Automata controllers
│   ├── models/               # Mongoose Schemas (RequestLog, AnomalyAlert)
│   ├── routes/               # Express API routes
│   ├── services/             # FSWD CO4: EventEmitter for connection alerts
│   ├── package.json
│   └── server.js
├── frontend/                 # React 18 + Vite Frontend Dashboard
│   ├── src/
│   │   ├── components/       # UI Components (Form, DFA Visualizer, Alerts, CRUD)
│   │   ├── pages/            # Multi-page routes (Dashboard, Simulator, Logs, Theory)
│   │   ├── App.jsx           # React Router v6
│   │   └── index.css         # Modern dark tech theme
│   ├── package.json
│   └── vite.config.js
├── api/
│   └── index.js              # Vercel Serverless Function entry point
├── vercel.json               # Vercel full-stack cloud deployment config
├── DOCUMENTATION.md          # Comprehensive Academic Lab Report for CO1-CO5
└── README.md
```

---

## 🌐 Cloud Deployment (Vercel)

This repository is configured for instantaneous deployment on Vercel:
- Frontend compiles into `frontend/dist`.
- Backend runs as a unified Vercel Serverless Function under `api/index.js`.
- Rewrites route `/api/*` to the serverless backend, and all other traffic to the React SPA.
