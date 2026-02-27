// ── reconcile.js ──
const express = require('express');
const router  = express.Router();
const { reconcile, generateMockBankStatement, generateDisputeLetter } = require('../services/clearLedger');
const { generateMockTransactions } = require('../services/sentinelPay');
const hs = require('../services/hyperswitch');

router.get('/run', async (req, res, next) => {
  try {
    let txns = [];
    try {
      const real = await hs.listPayments({ limit: 50 });
      txns = (real.data || real.payments || []).filter(t => t.status === 'succeeded');
    } catch (_) {}
    if (txns.length < 10) {
      txns = generateMockTransactions(50).filter(t => t.status === 'succeeded');
    }
    const bankStatement = generateMockBankStatement(txns);
    const result = reconcile(txns, bankStatement);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/dispute-letter', (req, res) => {
  const { paymentId, amount, gateway, createdAt, type, aiExplanation } = req.body;
  const letter = generateDisputeLetter({ paymentId, amount, gateway, createdAt, type, aiExplanation });
  res.json({ letter });
});

module.exports = router;
