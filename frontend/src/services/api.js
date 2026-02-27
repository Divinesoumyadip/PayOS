// ─────────────────────────────────────────────────────────────────
//  PayOS Frontend API Service
//  Pure functions — each returns a Promise
// ─────────────────────────────────────────────────────────────────
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// ── NeuralRoute ──
export const getGatewayHealth = () =>
  api.get("/routing/health").then((r) => r.data);
export const predictGateway = (txn) =>
  api.post("/routing/predict", txn).then((r) => r.data);
export const updateGatewayHealth = (data) =>
  api.post("/routing/update-health", data).then((r) => r.data);

// ── SentinelPay ──
export const scanAnomalies = () => api.get("/anomaly/scan").then((r) => r.data);

// ── ClearLedger ──
export const runReconciliation = () =>
  api.get("/reconcile/run").then((r) => r.data);
export const getDisputeLetter = (data) =>
  api.post("/reconcile/dispute-letter", data).then((r) => r.data);

// ── Payments ──
export const createPayment = (data) =>
  api.post("/payments/create", data).then((r) => r.data);
export const listPayments = (params) =>
  api.get("/payments", { params }).then((r) => r.data);
export const getPayment = (id) =>
  api.get(`/payments/${id}`).then((r) => r.data);

// ── PayAgent ──
export const chatWithAgent = (message, history) =>
  api.post("/agent/chat", { message, history }).then((r) => r.data);
