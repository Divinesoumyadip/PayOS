# PayOS — Payment Intelligence Suite

> AI-powered payment operations platform built by us

[![Built on Hyperswitch](https://img.shields.io/badge/Built%20on-Hyperswitch-00f5a0?style=flat)](https://github.com/juspay/hyperswitch)
[![AI Powered](https://img.shields.io/badge/AI-Claude%20API-a78bfa?style=flat)](https://anthropic.com)
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%2B%20React-4d9fff?style=flat)](/)

## What is PayOS?

PayOS is a full-stack merchant payment dashboard that solves 4 real problems every online merchant faces:

| Module | Problem Solved |
|---|---|
| 🔀 **NeuralRoute** | Razorpay went down at 2AM — ₹2L in orders failed |
| 🛡️ **SentinelPay** | Unusual refund spike at midnight — nobody noticed |
| ⚡ **FlowForge** | Bad checkout UI = customers abandoning cart |
| 📊 **ClearLedger** | Bank says ₹98,500, gateway says ₹1,00,000 — where's ₹1,500? |
| 🤖 **PayAgent** | Merchant types "what's wrong?" → AI autonomously fixes everything |

## Architecture

```
Frontend (React + Recharts)
        ↓
Backend (Node.js — pure functional, zero classes)
        ↓
┌──────────────────────────────────┐
│  NeuralRoute  │  Pure fn routing engine    │
│  SentinelPay  │  Z-Score + Isolation Forest│
│  ClearLedger  │  Reconciliation pipeline   │
│  PayAgent     │  Claude API tool_use loop  │
└──────────────────────────────────┘
        ↓
Hyperswitch Sandbox API (sandbox.hyperswitch.io)
```

## Quick Start

### 1. Get your API keys (free)

**Hyperswitch Sandbox Key:**
1. Go to [app.hyperswitch.io](https://app.hyperswitch.io)
2. Sign up free → Developers → API Keys → Create
3. Copy the sandbox key

**Claude AI Key (optional — for PayAgent):**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create account → API Keys → Create Key

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — add your HYPERSWITCH_API_KEY and CLAUDE_API_KEY
npm run dev
# Backend running on http://localhost:4000
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start
# Frontend running on http://localhost:3000
```

### 4. Open PayOS

Go to `http://localhost:3000` → Enter merchant name + API keys → Launch Dashboard

## API Endpoints

```
POST /api/payments/create          → Create payment (uses NeuralRoute to pick gateway)
POST /api/payments/:id/confirm     → Confirm with payment method
GET  /api/payments                 → List payments from Hyperswitch
GET  /api/routing/health           → Gateway health scores
POST /api/routing/predict          → ML gateway prediction
GET  /api/anomaly/scan             → Run SentinelPay anomaly detection
GET  /api/reconcile/run            → Run ClearLedger reconciliation
POST /api/reconcile/dispute-letter → Generate dispute letter
POST /api/agent/chat               → Chat with PayAgent (Claude AI)
```

## Key Technical Decisions (FP Philosophy — Juspay style)

- **Zero classes** — entire backend is pure functions
- **Composable routing rules** — each rule is `(txn, gateway) => score_adjustment`
- **Pure transform pipeline** — reconciliation is `gatewayTxns → bankEntries → mismatches`
- **Agentic loop** — PayAgent uses Claude `tool_use` for real autonomy, not just chat

## Project Structure

```
payos/
├── backend/
│   └── src/
│       ├── services/
│       │   ├── hyperswitch.js   ← Real Hyperswitch API calls
│       │   ├── neuralRoute.js   ← Pure fn ML routing engine
│       │   ├── sentinelPay.js   ← Z-Score anomaly detection
│       │   ├── clearLedger.js   ← Reconciliation engine
│       │   └── payAgent.js      ← Claude AI agent loop
│       └── routes/
│           ├── payments.js
│           ├── routing.js
│           ├── anomaly.js
│           ├── reconcile.js
│           └── agent.js
└── frontend/
    └── src/
        ├── App.js               ← Main layout + routing
        ├── pages/               ← 6 module pages
        └── services/api.js      ← Backend API calls
```

## Deploy to Render (free)

```bash
# Backend: render.com → New Web Service → Node → npm start
# Frontend: render.com → New Static Site → npm run build
# Set env vars in Render dashboard
```

## Built With

- **Juspay Hyperswitch** — payment orchestration API
- **Claude AI** — PayAgent autonomous operations
- **Node.js** — pure functional backend (mirrors Haskell FP philosophy)
- **React + Recharts** — dashboard UI
- **PostgreSQL** — transaction storage (optional, works without)
