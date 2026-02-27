const express = require('express');
const router  = express.Router();
const { runAllDetectors, generateMockTransactions } = require('../services/sentinelPay');
const hs = require('../services/hyperswitch');

// GET /api/anomaly/scan
// Scans real Hyperswitch transactions + mock fill
router.get('/scan', async (req, res, next) => {
  try {
    let transactions = [];
    try {
      // Try to get real transactions from Hyperswitch
      const real = await hs.listPayments({ limit: 100 });
      transactions = real.data || real.payments || [];
    } catch (_) {
      // Fallback to mock data if API key not set
    }
    // Supplement with mock data for richer anomaly detection
    if (transactions.length < 50) {
      transactions = [...transactions, ...generateMockTransactions(200 - transactions.length)];
    }
    const results = runAllDetectors(transactions);
    res.json(results);
  } catch (err) { next(err); }
});

module.exports = router;
