// ─────────────────────────────────────────────────────────────────
//  PayOS Backend — Express Server
//  Pure functional style: no classes, composable middleware chains
// ─────────────────────────────────────────────────────────────────
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const paymentsRouter = require("./routes/payments");
const routingRouter = require("./routes/routing");
const anomalyRouter = require("./routes/anomaly");
const reconcileRouter = require("./routes/reconcile");
const agentRouter = require("./routes/agent");

const app = express();

// ── Middleware ──
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// ── Request logger (pure function) ──
const logRequest = (req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};
app.use(logRequest);

// ── Routes ──
app.use("/api/payments", paymentsRouter);
app.use("/api/routing", routingRouter);
app.use("/api/anomaly", anomalyRouter);
app.use("/api/reconcile", reconcileRouter);
app.use("/api/agent", agentRouter);

// ── Health check ──
app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "PayOS", version: "1.0.0" }),
);

// ── Error handler (pure function) ──
const errorHandler = (err, _req, res, _next) => {
  console.error("[ERROR]", err.message);
  res.status(err.status || 500).json({ error: err.message });
};
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 PayOS Backend running on http://localhost:${PORT}`),
);
