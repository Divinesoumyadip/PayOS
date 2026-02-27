// ─────────────────────────────────────────────────────────────────
//  PayAgent — Claude AI Agent with Tool Use
//  Autonomous: detects anomalies, reroutes, reconciles
//  Uses Claude API tool_use for real agentic loop
// ─────────────────────────────────────────────────────────────────
const fetch = require('node-fetch');
const { predictGateway, getGatewayHealth, updateGatewayHealth, detectReroute } = require('./neuralRoute');
const { runAllDetectors, generateMockTransactions }                             = require('./sentinelPay');
const { reconcile, generateMockBankStatement }                                  = require('./clearLedger');

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';
const CLAUDE_URL     = 'https://api.anthropic.com/v1/messages';

// ── Tool definitions for Claude ──
const AGENT_TOOLS = [
  {
    name: 'check_anomalies',
    description: 'Check for payment anomalies — failure spikes, refund patterns, duplicates. Returns detected anomalies with severity.',
    input_schema: {
      type: 'object',
      properties: {
        timeRange: { type: 'string', description: "Time range to check: 'last_24h' | 'last_6h' | 'last_1h'", default: 'last_24h' },
        gateway:   { type: 'string', description: 'Specific gateway to check (optional)' },
      },
    },
  },
  {
    name: 'route_payment',
    description: 'Get optimal gateway recommendation for a payment, or disable/enable a gateway.',
    input_schema: {
      type: 'object',
      properties: {
        action:  { type: 'string', description: "'predict' | 'disable' | 'enable' | 'status'", default: 'status' },
        gateway: { type: 'string', description: 'Gateway name for disable/enable actions' },
        amount:  { type: 'number', description: 'Payment amount in paise (for predict)' },
        method:  { type: 'string', description: "Payment method: 'upi' | 'card' | 'wallet'" },
      },
    },
  },
  {
    name: 'reconcile',
    description: 'Run reconciliation to find mismatches between gateway and bank records.',
    input_schema: {
      type: 'object',
      properties: {
        dateRange:       { type: 'string', description: "Date range: 'today' | 'last_7_days' | 'last_30_days'" },
        generateReports: { type: 'boolean', description: 'Whether to generate dispute letters', default: false },
      },
    },
  },
  {
    name: 'generate_checkout',
    description: 'Generate a checkout UI config from a brand description using AI.',
    input_schema: {
      type: 'object',
      properties: {
        brandDescription: { type: 'string', description: 'Text description of the brand, e.g. "minimalist luxury coffee brand"' },
        merchantName:     { type: 'string', description: 'Merchant name' },
      },
      required: ['brandDescription'],
    },
  },
];

// ── Tool execution functions (pure where possible) ──
const executeTool = async (toolName, toolInput) => {
  switch (toolName) {

    case 'check_anomalies': {
      const mockTxns = generateMockTransactions(200);
      const results  = runAllDetectors(mockTxns);
      const allAlerts = [
        ...results.failureAnomalies,
        ...results.refundAnomalies,
        ...results.duplicates,
      ];
      return {
        totalAnomalies: results.summary.totalAnomalies,
        alerts:         allAlerts.slice(0, 5),
        scannedTxns:    results.summary.scannedTxns,
        criticalCount:  allAlerts.filter(a => a.severity === 'CRITICAL').length,
        heatmapPeaks:   results.heatmap.filter(h => h.rate > 0.2).map(h => `${h.hour}:00 (${Math.round(h.rate * 100)}% failure)`),
      };
    }

    case 'route_payment': {
      const { action = 'status', gateway, amount = 100000, method = 'upi' } = toolInput;
      if (action === 'status') {
        return getGatewayHealth();
      }
      if (action === 'disable' && gateway) {
        updateGatewayHealth(gateway, { available: false, successRate: 0 });
        const rerouted = predictGateway({ amount, method });
        return { disabled: gateway, rerouted: rerouted.recommended, confidence: rerouted.confidence };
      }
      if (action === 'enable' && gateway) {
        updateGatewayHealth(gateway, { available: true });
        return { enabled: gateway };
      }
      // predict
      return predictGateway({ amount, method });
    }

    case 'reconcile': {
      const mockTxns  = generateMockTransactions(50).filter(t => t.status === 'succeeded');
      const bankStmt  = generateMockBankStatement(mockTxns);
      const result    = reconcile(mockTxns, bankStmt);
      return {
        matchRate:     result.summary.matchRate,
        mismatches:    result.summary.mismatches,
        totalAtRisk:   `₹${(result.summary.totalAtRisk / 100).toFixed(2)}`,
        topMismatches: result.mismatches.slice(0, 3).map(m => ({
          id:          m.paymentId,
          type:        m.type,
          explanation: m.aiExplanation,
        })),
      };
    }

    case 'generate_checkout': {
      const { brandDescription = '', merchantName = 'Merchant' } = toolInput;
      const desc = brandDescription.toLowerCase();
      const theme = desc.includes('luxury') || desc.includes('premium')
        ? { primary: '#1a0a00', accent: '#f5b800', font: 'Playfair Display', payOrder: ['upi', 'card'] }
        : desc.includes('dark') || desc.includes('tech')
        ? { primary: '#0a0a1a', accent: '#00f5a0', font: 'IBM Plex Mono', payOrder: ['card', 'upi', 'wallet'] }
        : { primary: '#ffffff', accent: '#4d9fff', font: 'Syne', payOrder: ['upi', 'card', 'wallet'] };
      return { merchantName, theme, embedCode: `<script src="https://payos.dev/sdk.js" data-merchant="${merchantName.toLowerCase().replace(/\s/g, '-')}" data-theme='${JSON.stringify(theme)}'></script>` };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
};

// ── Main: run agentic loop with Claude ──
const runAgent = async (userMessage, conversationHistory = []) => {
  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const callClaude = async (msgs) => {
    const res = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `You are PayAgent, an autonomous AI agent for payment operations.
You have access to 4 tools: check_anomalies, route_payment, reconcile, generate_checkout.
When a merchant asks about their payments, proactively call the relevant tools to get data.
Be concise, data-driven, and action-oriented. Always state what you found and what action you took.`,
        messages: msgs,
        tools: AGENT_TOOLS,
      }),
    });
    return res.json();
  };

  const toolCallsMade = [];
  let currentMessages = messages;

  // Agentic loop: keep calling tools until Claude gives a final response
  for (let i = 0; i < 5; i++) {  // max 5 iterations
    const response = await callClaude(currentMessages);

    if (response.stop_reason === 'end_turn') {
      // Final text response
      const text = response.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');
      return { response: text, toolCallsMade, conversationHistory: [...currentMessages, { role: 'assistant', content: response.content }] };
    }

    if (response.stop_reason === 'tool_use') {
      // Execute tool calls
      const toolUseBlocks  = response.content.filter(b => b.type === 'tool_use');
      const toolResults    = await Promise.all(
        toolUseBlocks.map(async (block) => {
          const result = await executeTool(block.name, block.input);
          toolCallsMade.push({ tool: block.name, input: block.input, result });
          return {
            type:        'tool_result',
            tool_use_id: block.id,
            content:     JSON.stringify(result),
          };
        })
      );

      // Continue conversation with tool results
      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];
    } else {
      break;
    }
  }

  return { response: 'Agent loop completed', toolCallsMade, conversationHistory: currentMessages };
};

// ── Fallback: demo responses when no Claude API key ──
const runAgentDemo = async (userMessage) => {
  const msg = userMessage.toLowerCase();
  await new Promise(r => setTimeout(r, 1200)); // simulate thinking

  const mockTxns = generateMockTransactions(200);
  const anomalies = runAllDetectors(mockTxns);

  if (msg.includes('wrong') || msg.includes('problem') || msg.includes('issue')) {
    return {
      response: `I ran a full diagnostic. Here's what I found:\n\n🔴 **${anomalies.summary.totalAnomalies} anomalies detected** across last 24 hours\n\n• Failure spike at 2AM-4AM: 34% failure rate (normal: 4%)\n• Rerouted ₹2.3L from PayU → Razorpay automatically\n• 2 reconciliation mismatches pending: ₹1,500 + ₹450\n\n✅ All critical issues auto-resolved by NeuralRoute.`,
      toolCallsMade: [
        { tool: 'check_anomalies', input: { timeRange: 'last_24h' } },
        { tool: 'route_payment', input: { action: 'status' } },
        { tool: 'reconcile', input: { dateRange: 'today' } },
      ],
    };
  }
  if (msg.includes('reroute') || msg.includes('razorpay') || msg.includes('gateway')) {
    return {
      response: `Done. ✅ **Rerouted traffic away from PayU** (34% success rate → degraded).\n\nNew routing:\n• Primary: **Razorpay** (94% confidence)\n• Fallback: **Stripe** (88%)\n• Cashfree: standby\n\nEstimated improvement: +12% success rate on current transaction volume.`,
      toolCallsMade: [{ tool: 'route_payment', input: { action: 'disable', gateway: 'payu' } }],
    };
  }
  if (msg.includes('reconcil') || msg.includes('mismatch') || msg.includes('settlement')) {
    return {
      response: `Reconciliation complete for last 7 days:\n\n📊 **98.2% match rate** (4,821 matched, 5 mismatches)\n\n• ₹1,500 — Cashfree T+2 delay → resolves Mar 9 (no action)\n• ₹450 — Duplicate charge → dispute letter generated ✅\n• ₹2,200 — Stripe refund pending → follow up with bank\n\n**Total at risk: ₹12,340** · Only ₹450 needs urgent action.`,
      toolCallsMade: [{ tool: 'reconcile', input: { dateRange: 'last_7_days', generateReports: true } }],
    };
  }
  if (msg.includes('checkout') || msg.includes('brand') || msg.includes('forge')) {
    return {
      response: `Checkout config generated! 🎨\n\n**Theme:** Dark luxury palette\n**Accent:** Gold (#f5b800)\n**Font:** Playfair Display\n**Payment order:** UPI first (73% conversion) → Card → hide wallet\n\nEmbed code is ready in FlowForge. Click the tab to preview and copy your \`<script>\` tag.`,
      toolCallsMade: [{ tool: 'generate_checkout', input: { brandDescription: msg } }],
    };
  }
  return {
    response: `I've checked your payment systems. Everything looks operational:\n\n• **Razorpay**: 94% ✅ · **Stripe**: 88% ✅ · **Cashfree**: 71% ⚠️ · **PayU**: 34% 🔴\n• 3 anomalies being monitored\n• Last reconciliation: 98.2% match rate\n\nWhat would you like me to investigate further?`,
    toolCallsMade: [{ tool: 'check_anomalies', input: {} }, { tool: 'route_payment', input: { action: 'status' } }],
  };
};

module.exports = { runAgent, runAgentDemo, executeTool };
