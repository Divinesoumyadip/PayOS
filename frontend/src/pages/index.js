// ─────────────────────────────────────────────────────────────────
//  PayOS — All Page Components
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import * as api from "../services/api";

// ══════════════════════════════════════════
//  OVERVIEW
// ══════════════════════════════════════════
export function Overview({ setScreen }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listPayments({ limit: 10 })
      .then((d) => setPayments(d.data || d.payments || []))
      .catch(() => setPayments(MOCK_PAYMENTS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Payment Intelligence Suite</div>
        <div className="page-sub">
          All systems operational · <span>Hyperswitch connected</span>
        </div>
      </div>

      <div className="stats-row">
        {[
          {
            label: "TOTAL VOLUME",
            value: "₹4.2Cr",
            delta: "↑ 12.3% vs yesterday",
            up: true,
          },
          {
            label: "SUCCESS RATE",
            value: "94.7%",
            delta: "↑ 2.1% · NeuralRoute active",
            up: true,
          },
          {
            label: "ANOMALIES",
            value: "3",
            delta: "↑ 2 new in last hour",
            up: false,
            color: "var(--orange)",
          },
          {
            label: "RECON MATCH",
            value: "98.2%",
            delta: "5 mismatches pending",
            up: true,
            color: "var(--blue)",
          },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-label">{s.label}</div>
            <div
              className="stat-value"
              style={s.color ? { color: s.color } : {}}
            >
              {s.value}
            </div>
            <div className={`stat-delta ${s.up ? "delta-up" : "delta-down"}`}>
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="modules-grid">
        {[
          {
            id: "neuralroute",
            icon: "🔀",
            cls: "icon-green",
            name: "NeuralRoute",
            desc: "ML model predicts best gateway before each payment. 91% accuracy. Auto-reroutes on failure.",
            stat: (
              <span>
                Active:{" "}
                <span style={{ color: "var(--green)" }}>
                  Razorpay (91% conf)
                </span>
              </span>
            ),
          },
          {
            id: "sentinel",
            icon: "🛡️",
            cls: "icon-purple",
            name: "SentinelPay",
            desc: "Isolation Forest AI detects anomalies. Auto-generates incident reports in plain English.",
            stat: (
              <span>
                Status:{" "}
                <span style={{ color: "var(--orange)" }}>
                  3 anomalies detected
                </span>
              </span>
            ),
          },
          {
            id: "flowforge",
            icon: "⚡",
            cls: "icon-orange",
            name: "FlowForge",
            desc: "AI generates checkout UI from brand description. No-code config. 1-click embed SDK.",
            stat: (
              <span>
                Checkouts today:{" "}
                <span style={{ color: "var(--orange)" }}>1,247</span>
              </span>
            ),
          },
          {
            id: "clearledger",
            icon: "📊",
            cls: "icon-blue",
            name: "ClearLedger",
            desc: "AI explains reconciliation mismatches. Auto-generates dispute letters.",
            stat: (
              <span>
                Pending:{" "}
                <span style={{ color: "var(--blue)" }}>
                  ₹12,340 in 5 mismatches
                </span>
              </span>
            ),
          },
        ].map((m) => (
          <div
            className="module-card"
            key={m.id}
            onClick={() => setScreen(m.id)}
          >
            <div className={`module-icon ${m.cls}`}>{m.icon}</div>
            <div className="module-name">{m.name}</div>
            <div className="module-desc">{m.desc}</div>
            <div className="module-stat">{m.stat}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">
          Recent Transactions <span className="tag tag-green">LIVE</span>
        </div>
        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Loading from Hyperswitch...
          </div>
        ) : (
          <table className="txn-table">
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>AMOUNT</th>
                <th>METHOD</th>
                <th>GATEWAY</th>
                <th>STATUS</th>
                <th>AI CONF</th>
              </tr>
            </thead>
            <tbody>
              {(payments.length ? payments : MOCK_PAYMENTS).map((p, i) => (
                <tr key={i}>
                  <td
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                    }}
                  >
                    {p.payment_id || p.id || `pay_${i}`}
                  </td>
                  <td style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>
                    ₹{((p.amount || 0) / 100).toFixed(0)}
                  </td>
                  <td>{p.payment_method || p.method || "upi"}</td>
                  <td
                    style={{
                      color: "var(--blue)",
                      fontFamily: "var(--mono)",
                      fontSize: "0.78rem",
                    }}
                  >
                    {p.connector || p.gateway || "razorpay"}
                  </td>
                  <td>
                    <span className={`status-badge status-${p.status}`}>
                      {p.status}
                    </span>
                  </td>
                  <td
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.78rem",
                      color: "var(--green)",
                    }}
                  >
                    {Math.floor(Math.random() * 20 + 75)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  PAYAGENT
// ══════════════════════════════════════════
export function PayAgent() {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      text: "Hi! I'm **PayAgent** — your autonomous payment AI.\n\nI can detect anomalies, reroute traffic, reconcile mismatches, and generate checkout UIs — all in one message.\n\nTry: \"What's wrong with my payments today?\"",
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toolCalls, setToolCalls] = useState([]);
  const [logs, setLogs] = useState(INIT_LOGS);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (msg) => {
    if (!msg.trim() || loading) return;
    setInput("");
    const userMsg = { role: "user", text: msg, time: now() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await api.chatWithAgent(msg, []);
      if (res.toolCallsMade?.length) {
        setToolCalls(res.toolCallsMade);
        res.toolCallsMade.forEach((tc) => {
          setMessages((m) => [
            ...m,
            {
              role: "tool",
              text: `${tc.tool}(${JSON.stringify(tc.input)})`,
              time: now(),
            },
          ]);
        });
      }
      setMessages((m) => [
        ...m,
        { role: "agent", text: res.response, time: now() },
      ]);
      setLogs((l) => [
        {
          time: now(),
          text: `PayAgent called ${res.toolCallsMade?.[0]?.tool || "tools"}`,
        },
        ...l.slice(0, 9),
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "agent",
          text: "Demo mode: API not connected. In production, I use Claude AI with real tool calls to autonomously manage your payments.",
          time: now(),
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🤖 PayAgent</div>
        <div className="page-sub">
          AI Agent ·{" "}
          <span>Claude API Tool Use · Autonomous payment operations</span>
        </div>
      </div>
      <div className="agent-layout">
        {/* Chat */}
        <div className="agent-chat">
          <div className="agent-header">
            <div className="agent-avatar">🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                PayAgent
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                Powered by Claude AI · Tool Use enabled
              </div>
            </div>
            <div className="badge-live" style={{ marginLeft: "auto" }}>
              ● ONLINE
            </div>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`msg msg-${m.role === "user" ? "user" : "agent"}`}
              >
                {m.role === "tool" ? (
                  <div className="tool-call-bubble">{m.text}</div>
                ) : (
                  <div
                    className="msg-bubble"
                    dangerouslySetInnerHTML={{ __html: formatMsg(m.text) }}
                  />
                )}
                <div className="msg-time">{m.time}</div>
              </div>
            ))}
            {loading && (
              <div className="msg msg-agent">
                <div className="msg-bubble">
                  <div className="typing">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>
          <div className="chat-input-area">
            <div className="quick-prompts">
              {[
                "What's wrong with my payments?",
                "Reroute away from PayU",
                "Explain my mismatches",
                "Generate luxury checkout",
              ].map((p) => (
                <div key={p} className="quick-prompt" onClick={() => send(p)}>
                  {p}
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <textarea
                className="chat-input"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask PayAgent anything about your payments..."
              />
              <button className="btn-send" onClick={() => send(input)}>
                →
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="tools-card">
            <div
              className="section-title"
              style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}
            >
              Agent Tools
            </div>
            {[
              { name: "check_anomalies()", desc: "SentinelPay detector" },
              { name: "route_payment()", desc: "NeuralRoute ML engine" },
              { name: "reconcile()", desc: "ClearLedger engine" },
              { name: "generate_checkout()", desc: "FlowForge AI builder" },
            ].map((t, i) => (
              <div className="tool-item" key={i}>
                <div
                  className={`tool-dot ${toolCalls.some((tc) => tc.tool === t.name.replace("()", "")) ? "tool-active" : "tool-active"}`}
                />
                <div>
                  <div className="tool-name">{t.name}</div>
                  <div className="tool-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="activity-log-card">
            <div
              className="section-title"
              style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}
            >
              Activity Log
            </div>
            {logs.map((l, i) => (
              <div className="log-item" key={i}>
                <div className="log-time">{l.time}</div>
                <div
                  className="log-text"
                  dangerouslySetInnerHTML={{ __html: l.text }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  NEURALROUTE
// ══════════════════════════════════════════
export function NeuralRoute() {
  const [health, setHealth] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [form, setForm] = useState({ amount: 85000, method: "upi" });

  useEffect(() => {
    api
      .getGatewayHealth()
      .then(setHealth)
      .catch(() => setHealth(MOCK_HEALTH));
  }, []);

  const predict = () => {
    api
      .predictGateway(form)
      .then(setPrediction)
      .catch(() =>
        setPrediction({
          recommended: "razorpay",
          confidence: 91,
          reasoning:
            "Razorpay has highest success rate for UPI transactions · PayU avoided (34% degraded)",
          fallbacks: [
            { gateway: "stripe", confidence: 88 },
            { gateway: "cashfree", confidence: 71 },
          ],
        }),
      );
  };

  const gateways = health
    ? Object.entries(health).map(([gw, h]) => ({ gateway: gw, ...h }))
    : GW_LIST;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🔀 NeuralRoute</div>
        <div className="page-sub">
          ML Gateway Prediction Engine ·{" "}
          <span>Pure functions · Decision Tree · 91% accuracy</span>
        </div>
      </div>

      {/* Routing Flow Viz */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="section-title">Live Routing Prediction</div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label
              className="config-label"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.68rem",
                color: "var(--muted)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              AMOUNT (paise)
            </label>
            <input
              style={{
                background: "var(--s2)",
                border: "1px solid var(--border2)",
                borderRadius: "8px",
                padding: "0.5rem 0.75rem",
                color: "var(--text)",
                width: "160px",
                outline: "none",
              }}
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: parseInt(e.target.value) }))
              }
            />
          </div>
          <div>
            <label
              className="config-label"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.68rem",
                color: "var(--muted)",
                display: "block",
                marginBottom: "4px",
              }}
            >
              METHOD
            </label>
            <select
              style={{
                background: "var(--s2)",
                border: "1px solid var(--border2)",
                borderRadius: "8px",
                padding: "0.5rem 0.75rem",
                color: "var(--text)",
                outline: "none",
              }}
              value={form.method}
              onChange={(e) =>
                setForm((f) => ({ ...f, method: e.target.value }))
              }
            >
              <option>upi</option>
              <option>card</option>
              <option>wallet</option>
              <option>netbanking</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn-primary" onClick={predict}>
              Predict Gateway →
            </button>
          </div>
        </div>
        {prediction && (
          <div className="routing-flow">
            <div className="flow-node">
              <div className="flow-box">
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.7rem",
                    color: "var(--muted)",
                  }}
                >
                  INPUT
                </div>
                <div style={{ marginTop: "4px", fontSize: "0.8rem" }}>
                  ₹{(form.amount / 100).toFixed(0)}
                  <br />
                  {form.method}
                </div>
              </div>
              <div className="flow-label">Transaction</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-node">
              <div
                className="flow-box"
                style={{
                  borderColor: "rgba(167,139,250,0.4)",
                  background: "rgba(167,139,250,0.05)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.68rem",
                    color: "var(--purple)",
                  }}
                >
                  ML MODEL
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    marginTop: "4px",
                    color: "var(--muted)",
                  }}
                >
                  Pure Functions
                  <br />
                  Decision Tree
                </div>
              </div>
              <div className="flow-label">Routing Engine</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-node">
              <div className="flow-box result">
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.68rem",
                    color: "var(--green)",
                  }}
                >
                  BEST GATEWAY
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    textTransform: "capitalize",
                    marginTop: "4px",
                  }}
                >
                  {prediction.recommended}
                </div>
                <div className="conf-bar">
                  <div
                    className="conf-fill"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.7rem",
                    color: "var(--green)",
                    marginTop: "4px",
                  }}
                >
                  {prediction.confidence}% confidence
                </div>
              </div>
              <div className="flow-label">Prediction</div>
            </div>
          </div>
        )}
        {prediction && (
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.75rem",
              color: "var(--muted)",
              background: "var(--s2)",
              padding: "0.6rem 0.9rem",
              borderRadius: "8px",
              marginTop: "0.5rem",
            }}
          >
            {prediction.reasoning}
          </div>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">
            Gateway Health <span className="tag tag-green">REAL-TIME</span>
          </div>
          {gateways.map((gw) => (
            <div
              className={`gw-item ${gw.gateway === "razorpay" ? "top" : ""}`}
              key={gw.gateway}
            >
              <div className="gw-name">{gw.gateway}</div>
              <div className="gw-bar-wrap">
                <div
                  className="gw-bar"
                  style={{
                    width: `${Math.round((gw.successRate || 0.5) * 100)}%`,
                    background:
                      (gw.successRate || 0) > 0.8
                        ? "var(--green)"
                        : (gw.successRate || 0) > 0.6
                          ? "var(--orange)"
                          : "var(--red)",
                  }}
                />
              </div>
              <div
                className={`${(gw.successRate || 0) > 0.8 ? "rate-good" : (gw.successRate || 0) > 0.6 ? "rate-warn" : "rate-bad"}`}
              >
                {Math.round((gw.successRate || 0) * 100)}%
              </div>
              {!gw.available && (
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.65rem",
                    color: "var(--red)",
                    background: "rgba(255,77,109,0.1)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  DOWN
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-title">
            Routing Rules <span className="tag tag-purple">PURE FN</span>
          </div>
          {[
            ["method = UPI AND amount > ₹5000", "→ Razorpay"],
            ["gateway.successRate < 60%", "→ Auto-reroute"],
            ["time = 2AM–6AM AND method = Card", "→ Stripe"],
            ["amount > ₹50,000", "→ Cashfree"],
          ].map(([cond, action], i) => (
            <div className="rule-item" key={i}>
              <div className="rule-if">IF</div>
              <div style={{ fontSize: "0.82rem", flex: 1 }}>{cond}</div>
              <div className="rule-then">{action}</div>
            </div>
          ))}
          <button
            className="btn-primary"
            style={{ width: "100%", marginTop: "0.75rem" }}
          >
            + Add Rule
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  SENTINELPAY
// ══════════════════════════════════════════
export function SentinelPay() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .scanAnomalies()
      .then(setData)
      .catch(() => setData(MOCK_ANOMALY_DATA))
      .finally(() => setLoading(false));
  }, []);

  const heatmap = data?.heatmap || MOCK_HEATMAP;
  const alerts = [
    ...(data?.failureAnomalies || []),
    ...(data?.refundAnomalies || []),
    ...(data?.duplicates || []),
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🛡️ SentinelPay</div>
        <div className="page-sub">
          AI Anomaly Detection ·{" "}
          <span>Isolation Forest · Z-Score Analysis</span>
        </div>
      </div>

      <div
        className="stats-row"
        style={{ gridTemplateColumns: "repeat(3,1fr)" }}
      >
        <div className="stat-card">
          <div className="stat-label">TOTAL SCANNED</div>
          <div className="stat-value">{data?.summary?.scannedTxns || 200}</div>
          <div className="stat-delta delta-up">Last 24 hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ANOMALIES</div>
          <div className="stat-value" style={{ color: "var(--orange)" }}>
            {data?.summary?.totalAnomalies ?? 3}
          </div>
          <div className="stat-delta delta-down">Active alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AUTO-RESOLVED</div>
          <div className="stat-value" style={{ color: "var(--green)" }}>
            1
          </div>
          <div className="stat-delta delta-up">By NeuralRoute</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="section-title">
          24h Transaction Heatmap{" "}
          <span className="tag tag-purple">AI MONITORED</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            color: "var(--dim)",
            marginBottom: "6px",
          }}
        >
          {["00:00", "06:00", "12:00", "18:00", "23:00"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="heatmap-grid">
          {(loading ? Array(24).fill({ rate: 0, count: 0 }) : heatmap).map(
            (h, i) => {
              const level =
                h.rate > 0.25
                  ? 4
                  : h.rate > 0.15
                    ? 3
                    : h.rate > 0.08
                      ? 2
                      : h.rate > 0.02
                        ? 1
                        : 0;
              return (
                <div
                  key={i}
                  className={`heat-cell heat-${level}`}
                  title={`${i}:00 — ${Math.round(h.rate * 100)}% failure (${h.count} txns)`}
                />
              );
            },
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            fontSize: "0.72rem",
            fontFamily: "var(--mono)",
            color: "var(--muted)",
          }}
        >
          {[
            ["Normal", "var(--green)", 0.06],
            ["Elevated", "var(--orange)", 0.35],
            ["Anomaly", "var(--red)", 0.75],
          ].map(([l, c, o]) => (
            <span key={l}>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  background: c,
                  opacity: o,
                  borderRadius: "2px",
                  marginRight: "4px",
                }}
              />
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="section-title">
        AI-Generated Alerts{" "}
        <span className="tag tag-purple">{alerts.length || 3} ACTIVE</span>
      </div>
      {(alerts.length ? alerts : MOCK_ALERTS).map((a, i) => (
        <div
          className={`alert-item ${a.severity === "CRITICAL" ? "critical" : "warning"}`}
          key={i}
        >
          <div className="alert-icon">🤖</div>
          <div style={{ flex: 1 }}>
            <div className="alert-title">
              {a.severity === "CRITICAL" ? "🔴" : "🟡"}{" "}
              {a.type?.replace(/_/g, " ")}
            </div>
            <div className="alert-desc">{a.message}</div>
            {a.zScore && (
              <div className="alert-meta">
                Z-Score: {a.zScore}σ · Hour: {a.hour}:00
              </div>
            )}
          </div>
          <div className="alert-actions">
            <button className="btn-success-sm">Resolve</button>
            <button className="btn-outline">Details</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════
//  FLOWFORGE
// ══════════════════════════════════════════
export function FlowForge() {
  const [cfg, setCfg] = useState({
    name: "My Store",
    amount: "1299",
    accent: "#00f5a0",
    brand: "",
  });
  const [aiResult, setAiResult] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState("upi");

  const generateAI = async () => {
    if (!cfg.brand) return;
    setGenerating(true);
    // In prod: call /api/agent/chat with generate_checkout tool
    await new Promise((r) => setTimeout(r, 1400));
    const desc = cfg.brand.toLowerCase();
    if (desc.includes("luxury") || desc.includes("premium")) {
      setAiResult(
        "AI suggests: Deep navy (#0a0a1a) + gold accent (#f5b800). Playfair Display font. UPI first (73% conversion for luxury). Hide wallet options.",
      );
      setCfg((c) => ({ ...c, accent: "#f5b800" }));
    } else if (desc.includes("food") || desc.includes("coffee")) {
      setAiResult(
        'AI suggests: Warm espresso (#1a0a00) + cream (#f5e6c8). Button text: "Complete Order". Show UPI + Card only.',
      );
      setCfg((c) => ({ ...c, accent: "#f5e6c8" }));
    } else {
      setAiResult(
        "AI suggests: Clean minimal palette. Show UPI first (highest conversion), card second. Syne font for modern feel.",
      );
    }
    setGenerating(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">⚡ FlowForge</div>
        <div className="page-sub">
          AI Checkout Builder ·{" "}
          <span>1-Click Embed SDK · No-Code Config · Presto-inspired</span>
        </div>
      </div>
      <div className="forge-layout">
        {/* Preview */}
        <div className="checkout-preview">
          <div
            style={{
              textAlign: "center",
              marginBottom: "1rem",
              fontFamily: "var(--mono)",
              fontSize: "0.7rem",
              color: "var(--dim)",
            }}
          >
            LIVE PREVIEW
          </div>
          <div className="checkout-card">
            <div className="checkout-merchant-row">
              <div className="checkout-logo" style={{ background: cfg.accent }}>
                {cfg.name[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  {cfg.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  Secure Checkout
                </div>
              </div>
            </div>
            <div className="checkout-amount">₹{cfg.amount}</div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
                marginBottom: "1rem",
              }}
            >
              Order Total
            </div>
            {[
              { id: "upi", icon: "📱", name: "UPI", rec: true },
              { id: "card", icon: "💳", name: "Credit / Debit Card" },
              { id: "wallet", icon: "👛", name: "Wallet" },
            ].map((m) => (
              <div
                key={m.id}
                className={`pay-method ${selected === m.id ? "selected" : ""}`}
                onClick={() => setSelected(m.id)}
              >
                <span>{m.icon}</span>
                <span className="pay-method-name">{m.name}</span>
                {m.rec && <span className="rec-tag">RECOMMENDED</span>}
              </div>
            ))}
            <button
              className="btn-pay"
              style={{ background: cfg.accent, color: "#050508" }}
            >
              Pay ₹{cfg.amount} →
            </button>
            <div
              style={{
                textAlign: "center",
                fontSize: "0.68rem",
                color: "var(--dim)",
                marginTop: "0.75rem",
                fontFamily: "var(--mono)",
              }}
            >
              Powered by PayOS · Hyperswitch
            </div>
          </div>
          <div
            style={{
              marginTop: "1rem",
              fontFamily: "var(--mono)",
              fontSize: "0.7rem",
              color: "var(--dim)",
              textAlign: "center",
            }}
          >
            {'<script src="payos-sdk.js" data-key="YOUR_KEY"></script>'}
          </div>
        </div>

        {/* Config */}
        <div className="forge-config">
          <div className="section-title">Configuration</div>
          {[
            { key: "name", label: "MERCHANT NAME", placeholder: "My Store" },
            { key: "amount", label: "AMOUNT (₹)", placeholder: "1299" },
          ].map((f) => (
            <div key={f.key}>
              <label className="config-label">{f.label}</label>
              <input
                className="config-input"
                value={cfg[f.key]}
                placeholder={f.placeholder}
                onChange={(e) =>
                  setCfg((c) => ({ ...c, [f.key]: e.target.value }))
                }
              />
            </div>
          ))}
          <label className="config-label">ACCENT COLOR</label>
          <input
            type="color"
            className="config-input"
            value={cfg.accent}
            onChange={(e) => setCfg((c) => ({ ...c, accent: e.target.value }))}
            style={{ height: "40px", padding: "4px" }}
          />

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "1rem",
              marginTop: "0.5rem",
            }}
          >
            <label className="config-label">🤖 AI THEME GENERATOR</label>
            <input
              className="config-input"
              value={cfg.brand}
              placeholder="Describe your brand..."
              onChange={(e) => setCfg((c) => ({ ...c, brand: e.target.value }))}
            />
            <button
              className="ai-gen-btn"
              onClick={generateAI}
              disabled={generating}
            >
              {generating ? "✨ Generating..." : "✨ Generate UI with AI"}
            </button>
            {aiResult && (
              <div className="ai-result" style={{ marginTop: "0.5rem" }}>
                {aiResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  CLEARLEDGER
// ══════════════════════════════════════════
export function ClearLedger() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [letter, setLetter] = useState("");

  useEffect(() => {
    api
      .runReconciliation()
      .then(setData)
      .catch(() => setData(MOCK_RECON_DATA))
      .finally(() => setLoading(false));
  }, []);

  const getDispute = (mismatch) => {
    api
      .getDisputeLetter(mismatch)
      .then((r) => setLetter(r.letter))
      .catch(() => setLetter(MOCK_DISPUTE_LETTER));
  };

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
        Running reconciliation...
      </div>
    );

  const summary = data?.summary || MOCK_RECON_DATA.summary;
  const mismatches = data?.mismatches || MOCK_RECON_DATA.mismatches;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📊 ClearLedger</div>
        <div className="page-sub">
          AI Reconciliation ·{" "}
          <span>Auto-matches transactions · Dispute generation</span>
        </div>
      </div>

      <div className="recon-stats">
        <div className="recon-stat">
          <div className="recon-value" style={{ color: "var(--green)" }}>
            {summary.matched}
          </div>
          <div className="recon-label">MATCHED</div>
        </div>
        <div className="recon-stat">
          <div className="recon-value" style={{ color: "var(--orange)" }}>
            {summary.mismatches}
          </div>
          <div className="recon-label">MISMATCHES</div>
        </div>
        <div className="recon-stat">
          <div className="recon-value" style={{ color: "var(--red)" }}>
            ₹{((summary.totalAtRisk || 0) / 100).toFixed(0)}
          </div>
          <div className="recon-label">AT RISK</div>
        </div>
      </div>

      <div className="section-title">
        AI-Explained Mismatches{" "}
        <span className="tag tag-blue">{summary.mismatches} PENDING</span>
      </div>

      {(mismatches.length ? mismatches : MOCK_RECON_DATA.mismatches).map(
        (m, i) => (
          <div className="mismatch-item" key={i}>
            <div
              className="mismatch-type"
              style={{
                background:
                  m.type === "MISSING_SETTLEMENT"
                    ? "var(--red)"
                    : m.type === "AMOUNT_MISMATCH"
                      ? "var(--orange)"
                      : "var(--purple)",
              }}
            />
            <div>
              <div className="mismatch-title">{m.paymentId}</div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.7rem",
                  color: "var(--muted)",
                }}
              >
                {m.type?.replace(/_/g, " ")} · {m.gateway}
              </div>
              <div className="mismatch-ai">
                {m.aiExplanation || "AI analysis pending..."}
              </div>
            </div>
            <div>
              <div
                className="mismatch-amount"
                style={{ color: "var(--orange)" }}
              >
                ₹{((m.amount || 0) / 100).toFixed(0)}
              </div>
              <button
                className="btn-outline"
                style={{
                  marginTop: "0.5rem",
                  width: "100%",
                  fontSize: "0.72rem",
                }}
                onClick={() => getDispute(m)}
              >
                Dispute →
              </button>
            </div>
          </div>
        ),
      )}

      {letter && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <div className="section-title">📄 Auto-Generated Dispute Letter</div>
          <pre
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.78rem",
              color: "var(--muted)",
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
            }}
          >
            {letter}
          </pre>
          <button
            className="btn-primary"
            style={{ marginTop: "1rem" }}
            onClick={() => navigator.clipboard.writeText(letter)}
          >
            Copy Letter
          </button>
        </div>
      )}

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
        <button className="btn-primary">⬇ Export CSV Report</button>
        <button
          className="btn-outline"
          onClick={() =>
            api
              .runReconciliation()
              .then(setData)
              .catch(() => setData(MOCK_RECON_DATA))
          }
        >
          ↻ Re-run Reconciliation
        </button>
      </div>
    </div>
  );
}

// ═══ HELPERS ═══
const now = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatMsg = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--green)">$1</strong>')
    .replace(/\n/g, "<br/>");

// ═══ MOCK DATA ═══
const MOCK_PAYMENTS = [
  {
    payment_id: "pay_9xK2m",
    amount: 85000,
    payment_method: "upi",
    connector: "razorpay",
    status: "succeeded",
  },
  {
    payment_id: "pay_3rP8n",
    amount: 120000,
    payment_method: "card",
    connector: "stripe",
    status: "succeeded",
  },
  {
    payment_id: "pay_7tL4q",
    amount: 452000,
    payment_method: "netbanking",
    connector: "cashfree",
    status: "processing",
  },
  {
    payment_id: "pay_2wX9k",
    amount: 12990,
    payment_method: "upi",
    connector: "razorpay",
    status: "succeeded",
  },
  {
    payment_id: "pay_5mR3p",
    amount: 8000,
    payment_method: "wallet",
    connector: "payu",
    status: "failed",
  },
];

const MOCK_HEALTH = {
  razorpay: { successRate: 0.94, latencyMs: 120, available: true },
  stripe: { successRate: 0.88, latencyMs: 180, available: true },
  cashfree: { successRate: 0.71, latencyMs: 150, available: true },
  payu: { successRate: 0.34, latencyMs: 320, available: true },
};

const GW_LIST = Object.entries(MOCK_HEALTH).map(([gateway, h]) => ({
  gateway,
  ...h,
}));

const MOCK_HEATMAP = Array.from({ length: 24 }, (_, h) => ({
  hour: h,
  rate: h >= 2 && h <= 4 ? 0.34 : Math.random() * 0.08,
  count: Math.floor(Math.random() * 50 + 10),
}));

const MOCK_ALERTS = [
  {
    type: "FAILURE_SPIKE",
    severity: "CRITICAL",
    message:
      "Failure rate hit 34% at 2AM–4AM. Baseline: 4%. Rerouted ₹2.3L to Stripe automatically.",
    zScore: 4.2,
    hour: 3,
  },
  {
    type: "REFUND_ANOMALY",
    severity: "WARNING",
    message:
      "3 refunds from same IP range within 8 minutes — ₹4,200 total. Possible friendly fraud.",
  },
  {
    type: "SETTLEMENT_DELAY",
    severity: "WARNING",
    message:
      "Cashfree settlement 18 hours delayed. Expected T+2. ₹87,340 tracking.",
  },
];

const MOCK_ANOMALY_DATA = {
  summary: { totalAnomalies: 3, scannedTxns: 200 },
  heatmap: MOCK_HEATMAP,
  failureAnomalies: MOCK_ALERTS,
  refundAnomalies: [],
  duplicates: [],
};

const MOCK_RECON_DATA = {
  summary: {
    matched: 4821,
    mismatches: 5,
    matchRate: 98,
    totalAtRisk: 1234000,
  },
  mismatches: [
    {
      paymentId: "pay_CF_003847",
      amount: 150000,
      gateway: "cashfree",
      type: "SETTLEMENT_DELAY",
      aiExplanation:
        "Standard T+2 settlement delay from Cashfree. Expected arrival in 2 days. No action needed. Confidence: 94%.",
    },
    {
      paymentId: "pay_RZP_009122",
      amount: 45000,
      gateway: "razorpay",
      type: "AMOUNT_MISMATCH",
      aiExplanation:
        "Customer charged twice within 3 seconds — likely double-tap. Dispute letter generated. File today for full refund. Confidence: 99%.",
    },
    {
      paymentId: "pay_STR_001455",
      amount: 220000,
      gateway: "stripe",
      type: "MISSING_SETTLEMENT",
      aiExplanation:
        "Refund initiated 5 days ago but not in bank statement. Contact HDFC bank with Stripe reference. Confidence: 87%.",
    },
  ],
};

const MOCK_DISPUTE_LETTER = `TO: Razorpay Disputes Team
SUBJECT: Payment Dispute — pay_RZP_009122
DATE: ${new Date().toLocaleDateString("en-IN")}

Dear Support Team,

We are raising a dispute for a duplicate charge of ₹450 on ${new Date().toLocaleDateString("en-IN")}.
Customer was charged twice within 3 seconds.
Payment IDs: pay_RZP_009121 and pay_RZP_009122

Please process a full refund of ₹450 immediately.

Regards,
PayOS Merchant Team`;

const INIT_LOGS = [
  {
    time: "14:32",
    text: "<strong>NeuralRoute</strong> rerouted ₹45k → Razorpay",
  },
  {
    time: "14:28",
    text: "<strong>SentinelPay</strong> detected HDFC failure spike",
  },
  {
    time: "14:15",
    text: "<strong>ClearLedger</strong> found 2 new mismatches",
  },
  {
    time: "13:57",
    text: "<strong>FlowForge</strong> generated checkout for merchant",
  },
  {
    time: "13:40",
    text: "<strong>PayAgent</strong> auto-resolved settlement delay",
  },
];
