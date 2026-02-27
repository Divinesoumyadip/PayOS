// ─────────────────────────────────────────────────────────────────
//  ClearLedger — Reconciliation Engine
//  Pure functions. No mutation.
//  Input: gateway txns + bank statement → Output: mismatches
// ─────────────────────────────────────────────────────────────────

// ── Pure: normalize transaction for comparison ──
const normalizeTxn = (txn) => ({
  id:        txn.payment_id || txn.id,
  amount:    txn.amount,
  status:    txn.status,
  gateway:   txn.connector || txn.gateway || 'unknown',
  createdAt: new Date(txn.created || txn.created_at || txn.date),
});

// ── Pure: match gateway txn to bank statement ──
const matchTransaction = (gatewayTxn, bankEntries) => {
  const normalized = normalizeTxn(gatewayTxn);
  const match = bankEntries.find(entry =>
    Math.abs(entry.amount - normalized.amount) < 1 &&      // amount matches (within 1 paisa)
    Math.abs(new Date(entry.date) - normalized.createdAt) < 3 * 24 * 60 * 60 * 1000  // within 3 days (T+2)
  );
  return match ?? null;
};

// ── Pure: classify mismatch type ──
const classifyMismatch = (gatewayTxn, bankEntry) => {
  if (!bankEntry) {
    const daysSince = (Date.now() - new Date(gatewayTxn.created || gatewayTxn.created_at)) / (1000 * 60 * 60 * 24);
    if (daysSince <= 3) return 'SETTLEMENT_DELAY';      // T+2 is normal
    if (daysSince <= 7) return 'LATE_SETTLEMENT';
    return 'MISSING_SETTLEMENT';
  }
  if (bankEntry.amount !== gatewayTxn.amount) return 'AMOUNT_MISMATCH';
  return 'UNKNOWN';
};

// ── Pure: AI explanation templates (in prod: call Claude API) ──
const mismatchExplanations = {
  SETTLEMENT_DELAY: (txn) =>
    `This is a standard T+2 settlement delay from ${txn.gateway || 'gateway'}. ` +
    `Expected settlement within ${2 - Math.floor((Date.now() - new Date(txn.created || txn.created_at)) / 86400000)} days. No action needed.`,

  LATE_SETTLEMENT: (txn) =>
    `Settlement is delayed beyond normal T+2 window from ${txn.gateway || 'gateway'}. ` +
    `Recommend contacting gateway support with payment ID: ${txn.payment_id || txn.id}.`,

  MISSING_SETTLEMENT: (txn) =>
    `Payment ${txn.payment_id || txn.id} has not settled after 7+ days. ` +
    `Raise a formal dispute with ${txn.gateway || 'the gateway'} immediately.`,

  AMOUNT_MISMATCH: (txn) =>
    `Amount discrepancy detected. Gateway shows ₹${(txn.amount / 100).toFixed(2)} but bank shows different amount. ` +
    `Could be a fee deduction or processing error. Verify fee agreement with ${txn.gateway || 'gateway'}.`,

  UNKNOWN: (_txn) =>
    `Unclassified mismatch. Manual review required.`,
};

// ── Pure: generate dispute letter ──
const generateDisputeLetter = (mismatch) => `
TO: ${mismatch.gateway.charAt(0).toUpperCase() + mismatch.gateway.slice(1)} Disputes Team
SUBJECT: Payment Dispute — ${mismatch.paymentId}
DATE: ${new Date().toLocaleDateString('en-IN')}

Dear Support Team,

We are raising a dispute for the following payment:

  Payment ID : ${mismatch.paymentId}
  Amount     : ₹${(mismatch.amount / 100).toFixed(2)}
  Date       : ${new Date(mismatch.createdAt).toLocaleDateString('en-IN')}
  Issue Type : ${mismatch.type}

Issue Description:
${mismatch.aiExplanation}

We request an immediate investigation and resolution within 48 hours.

Regards,
PayOS Merchant Team
`.trim();

// ── Pure: reconcile gateway transactions vs bank statement ──
const reconcile = (gatewayTxns, bankEntries) => {
  const results = gatewayTxns
    .filter(txn => txn.status === 'succeeded')
    .map(txn => {
      const bankMatch = matchTransaction(txn, bankEntries);
      const type      = classifyMismatch(txn, bankMatch);
      const isMismatch = !bankMatch || type !== 'SETTLEMENT_DELAY';

      return {
        paymentId:     txn.payment_id || txn.id,
        amount:        txn.amount,
        gateway:       txn.connector || txn.gateway || 'unknown',
        createdAt:     txn.created || txn.created_at,
        status:        txn.status,
        bankMatched:   !!bankMatch,
        type:          bankMatch ? 'MATCHED' : type,
        isMismatch:    !bankMatch,
        aiExplanation: !bankMatch ? mismatchExplanations[type]?.(txn) : null,
        disputeLetter: (!bankMatch && type === 'MISSING_SETTLEMENT')
          ? generateDisputeLetter({ paymentId: txn.payment_id || txn.id, amount: txn.amount, gateway: txn.connector || txn.gateway, createdAt: txn.created || txn.created_at, type, aiExplanation: mismatchExplanations[type]?.(txn) })
          : null,
      };
    });

  const mismatches = results.filter(r => r.isMismatch);
  const matched    = results.filter(r => !r.isMismatch);

  return {
    summary: {
      total:           results.length,
      matched:         matched.length,
      mismatches:      mismatches.length,
      matchRate:       results.length ? Math.round((matched.length / results.length) * 100) : 100,
      totalAtRisk:     mismatches.reduce((sum, m) => sum + m.amount, 0),
    },
    mismatches,
    matched: matched.slice(0, 10), // return first 10 matched for display
  };
};

// ── Pure: generate mock bank statement ──
const generateMockBankStatement = (gatewayTxns) => {
  // Simulate: 90% of transactions settle, 10% are delayed
  return gatewayTxns
    .filter(() => Math.random() > 0.10)
    .map(txn => ({
      id:     `BANK_${txn.payment_id}`,
      amount: txn.amount,
      date:   new Date(Date.now() - (Math.random() * 2 * 86400000)).toISOString(), // 0-2 days ago
      ref:    txn.payment_id,
    }));
};

module.exports = {
  reconcile,
  generateDisputeLetter,
  generateMockBankStatement,
  classifyMismatch,
};
