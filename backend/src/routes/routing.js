// ── routing.js ──
const express = require('express');
const router  = express.Router();
const { predictGateway, getGatewayHealth, updateGatewayHealth, detectReroute } = require('../services/neuralRoute');

// GET /api/routing/health
router.get('/health', (_req, res) => res.json(getGatewayHealth()));

// POST /api/routing/predict
router.post('/predict', (req, res) => {
  const { amount, method, currency } = req.body;
  res.json(predictGateway({ amount, method, currency }));
});

// POST /api/routing/update-health
router.post('/update-health', (req, res) => {
  const { gateway, successRate, latencyMs, available } = req.body;
  const reroute = detectReroute(gateway, successRate);
  const health  = updateGatewayHealth(gateway, { successRate, latencyMs, available });
  res.json({ health, reroute });
});

module.exports = router;
