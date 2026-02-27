const GATEWAYS = ["razorpay", "stripe", "cashfree", "payu"];

const BIN_ROUTING_MAP = {
  411111: "stripe",
  512345: "razorpay",
  652144: "cashfree",
};

const updateHealthState = (currentState, gateway, stats) => ({
  ...currentState,
  [gateway]: { ...currentState[gateway], ...stats },
});

const buildTxnContext = (txn) => ({
  ...txn,
  isLateNight: new Date().getHours() >= 22 || new Date().getHours() <= 6,
  isHighValueCard: txn.method === "card" && txn.amount > 50000,
  isUpi: txn.method === "upi",
  binMatch: txn.cardNumber
    ? BIN_ROUTING_MAP[txn.cardNumber.substring(0, 6)]
    : null,
});

const calculateRuleScore = (ctx, gateway, health) => {
  let score = health[gateway]?.successRate ?? 0;

  if (ctx.binMatch === gateway) return 1.5;

  if (ctx.isUpi && gateway === "razorpay") score += 0.1;
  if (ctx.isHighValueCard && ctx.isLateNight && gateway === "stripe")
    score += 0.08;
  if (ctx.amount > 500000 && gateway === "cashfree") score += 0.05;

  if (health[gateway]?.successRate < 0.6) score -= 0.5;
  if (!health[gateway]?.available) score = -1.0;

  return Math.min(1, Math.max(0, score));
};

const rankGateways = (txn, healthState) => {
  const ctx = buildTxnContext(txn);

  return GATEWAYS.map((gateway) => {
    const score = calculateRuleScore(ctx, gateway, healthState);
    return { gateway, score, confidence: Math.round(score * 100) };
  }).sort((a, b) => b.score - a.score);
};

const predictGateway = (txn, currentHealthState) => {
  const ranked = rankGateways(txn, currentHealthState);
  const primary = ranked[0];
  const fallbacks = ranked.slice(1).filter((g) => g.confidence > 40);

  return {
    recommended: primary.gateway,
    confidence: primary.confidence,
    fallbacks: fallbacks.map((f) => ({
      gateway: f.gateway,
      confidence: f.confidence,
    })),
    allGateways: ranked,
  };
};

module.exports = {
  predictGateway,
  updateHealthState,
};
