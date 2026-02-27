// ── Payments Router — real Hyperswitch API calls ──
const express = require("express");
const router = express.Router();
const hs = require("../services/hyperswitch");
const { predictGateway } = require("../services/neuralRoute");

// POST /api/payments/create
// Creates a payment intent, uses NeuralRoute to pick best gateway
router.post("/create", async (req, res, next) => {
  try {
    const {
      amount,
      currency = "INR",
      description,
      customerId,
      method = "card",
    } = req.body;
    if (!amount)
      return res.status(400).json({ error: "amount is required (in paise)" });

    // Use NeuralRoute to predict best gateway
    const routing = predictGateway({ amount, method, currency });

    // Create payment on Hyperswitch
    const payment = await hs.createPayment({
      amount,
      currency,
      description,
      customerId,
      metadata: { recommended_gateway: routing.recommended },
    });

    res.json({ payment, routing });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/:id/confirm
router.post("/:id/confirm", async (req, res, next) => {
  try {
    const { paymentMethod, paymentMethodData } = req.body;
    const confirmed = await hs.confirmPayment({
      paymentId: req.params.id,
      paymentMethod,
      paymentMethodData,
    });
    res.json(confirmed);
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/:id
router.get("/:id", async (req, res, next) => {
  try {
    const payment = await hs.getPayment(req.params.id);
    res.json(payment);
  } catch (err) {
    next(err);
  }
});

// GET /api/payments
router.get("/", async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const payments = await hs.listPayments({
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/:id/refund
router.post("/:id/refund", async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const refund = await hs.createRefund({
      paymentId: req.params.id,
      amount,
      reason,
    });
    res.json(refund);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
