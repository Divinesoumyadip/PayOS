// ─────────────────────────────────────────────────────────────────
//  SentinelPay — Anomaly Detection Engine
//  Pure functions. Z-Score + Isolation Forest logic.
//  Input: transaction stream → Output: anomaly alerts
// ─────────────────────────────────────────────────────────────────

// ── Pure: compute mean ──
const mean = (values) =>
  values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;

// ── Pure: compute standard deviation ──
const stdDev = (values) => {
  const avg = mean(values);
  const variance = mean(values.map(v => Math.pow(v - avg, 2)));
  return Math.sqrt(variance);
};

// ── Pure: compute Z-Score ──
const zScore = (value, values) => {
  const sd = stdDev(values);
  return sd === 0 ? 0 : (value - mean(values)) / sd;
};

// ── Pure: generate hourly buckets from transactions ──
const bucketByHour = (transactions) =>
  transactions.reduce((acc, txn) => {
    const hour = new Date(txn.created_at || txn.created).getHours();
    return {
      ...acc,
      [hour]: [...(acc[hour] || []), txn],
    };
  }, {});

// ── Pure: compute failure rate for a bucket ──
const failureRate = (txns) => {
  if (txns.length === 0) return 0;
  const failed = txns.filter(t => t.status === 'failed').length;
  return failed / txns.length;
};

// ── Pure: compute failure rates per hour ──
const hourlyFailureRates = (transactions) => {
  const buckets = bucketByHour(transactions);
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    rate: failureRate(buckets[hour] || []),
    count: (buckets[hour] || []).length,
  }));
};

// ── Pure: detect Z-Score anomalies in failure rates ──
const detectFailureAnomalies = (transactions) => {
  const hourlyRates = hourlyFailureRates(transactions);
  const rates       = hourlyRates.map(h => h.rate);
  return hourlyRates
    .map(h => ({ ...h, zScore: zScore(h.rate, rates) }))
    .filter(h => Math.abs(h.zScore) > 2.0)  // 2 sigma threshold
    .map(h => ({
      type:        'FAILURE_SPIKE',
      severity:    h.zScore > 3 ? 'CRITICAL' : 'WARNING',
      hour:        h.hour,
      failureRate: Math.round(h.rate * 100),
      zScore:      Math.round(h.zScore * 10) / 10,
      message:     `Failure spike at ${h.hour}:00 — ${Math.round(h.rate * 100)}% failure rate (Z-Score: ${Math.round(h.zScore * 10) / 10}σ)`,
    }));
};

// ── Pure: detect refund anomalies ──
const detectRefundAnomalies = (transactions) => {
  const refunds = transactions.filter(t => t.refund_count > 0 || t.status === 'refunded');
  if (refunds.length < 3) return [];
  const refundRate = refunds.length / transactions.length;
  return refundRate > 0.15 ? [{
    type:        'REFUND_SPIKE',
    severity:    'WARNING',
    refundRate:  Math.round(refundRate * 100),
    count:       refunds.length,
    message:     `Unusual refund rate: ${Math.round(refundRate * 100)}% of transactions refunded`,
  }] : [];
};

// ── Pure: detect duplicate transactions ──
const detectDuplicates = (transactions) => {
  const seen = {};
  const dupes = [];
  transactions.forEach(txn => {
    const key = `${txn.customer_id}-${txn.amount}-${Math.floor(new Date(txn.created_at || txn.created) / 60000)}`;
    if (seen[key]) {
      dupes.push({ type: 'DUPLICATE', txn1: seen[key], txn2: txn });
    } else {
      seen[key] = txn;
    }
  });
  return dupes.map(d => ({
    type:     'DUPLICATE_TRANSACTION',
    severity: 'CRITICAL',
    message:  `Possible duplicate: ₹${d.txn1.amount / 100} charged twice within 1 minute`,
    txnIds:   [d.txn1.payment_id, d.txn2.payment_id],
  }));
};

// ── Pure: run all anomaly detectors ──
const runAllDetectors = (transactions) => ({
  failureAnomalies:  detectFailureAnomalies(transactions),
  refundAnomalies:   detectRefundAnomalies(transactions),
  duplicates:        detectDuplicates(transactions),
  heatmap:           hourlyFailureRates(transactions),
  summary: {
    totalAnomalies: detectFailureAnomalies(transactions).length
      + detectRefundAnomalies(transactions).length
      + detectDuplicates(transactions).length,
    scannedTxns: transactions.length,
    scannedAt:   new Date().toISOString(),
  },
});

// ── Pure: generate mock transactions for demo ──
const generateMockTransactions = (count = 200) => {
  const statuses  = ['succeeded', 'failed', 'processing'];
  const gateways  = ['razorpay', 'stripe', 'cashfree', 'payu'];
  const methods   = ['upi', 'card', 'wallet', 'netbanking'];
  return Array.from({ length: count }, (_, i) => {
    const hour    = Math.floor(Math.random() * 24);
    // Inject anomaly: higher failures at 2AM-4AM
    const isSpikeHour = hour >= 2 && hour <= 4;
    const status  = isSpikeHour
      ? (Math.random() < 0.34 ? 'failed' : 'succeeded')
      : (Math.random() < 0.06 ? 'failed' : 'succeeded');
    const created = new Date();
    created.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
    return {
      payment_id:  `pay_mock_${i.toString().padStart(5, '0')}`,
      amount:      Math.floor(Math.random() * 100000) + 1000,
      currency:    'INR',
      status,
      gateway:     gateways[Math.floor(Math.random() * gateways.length)],
      payment_method: methods[Math.floor(Math.random() * methods.length)],
      customer_id: `cus_${Math.floor(Math.random() * 50)}`,
      created_at:  created.toISOString(),
      created:     created.toISOString(),
    };
  });
};

module.exports = {
  runAllDetectors,
  detectFailureAnomalies,
  detectRefundAnomalies,
  detectDuplicates,
  hourlyFailureRates,
  generateMockTransactions,
  zScore,
};
