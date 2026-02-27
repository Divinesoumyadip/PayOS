import React, { useState, useEffect } from 'react';
import { Overview } from './pages/Overview';
import { PayAgent } from './pages/PayAgent';
import { NeuralRoute } from './pages/NeuralRoute';
import { SentinelPay } from './pages/SentinelPay';
import { FlowForge } from './pages/FlowForge';
import { ClearLedger } from './pages/ClearLedger';
import './App.css';

const NAV = [
  { id: 'overview',    label: 'Overview',    dot: '#e2e2f0' },
  { id: 'payagent',    label: '🤖 PayAgent',  dot: '#00f5a0' },
  { id: 'neuralroute', label: 'NeuralRoute',  dot: '#00f5a0' },
  { id: 'sentinel',    label: 'SentinelPay',  dot: '#a78bfa' },
  { id: 'flowforge',   label: 'FlowForge',    dot: '#ff8c42' },
  { id: 'clearledger', label: 'ClearLedger',  dot: '#4d9fff' },
];

export default function App() {
  const [screen, setScreen] = useState('overview');
  const [merchant, setMerchant] = useState('');
  const [onboarded, setOnboarded] = useState(false);

  const handleOnboard = (name) => {
    setMerchant(name || 'Demo Merchant');
    setOnboarded(true);
  };

  if (!onboarded) return <Onboarding onSubmit={handleOnboard} />;

  const screens = {
    overview:    <Overview    setScreen={setScreen} />,
    payagent:    <PayAgent />,
    neuralroute: <NeuralRoute />,
    sentinel:    <SentinelPay />,
    flowforge:   <FlowForge />,
    clearledger: <ClearLedger />,
  };

  return (
    <div className="app">
      {/* Topbar */}
      <header className="topbar">
        <div className="logo">
          <div className="logo-icon">⬡</div>
          Pay<span>OS</span>
        </div>
        <nav className="nav">
          {NAV.map(n => (
            <button key={n.id} className={`nav-btn ${screen === n.id ? 'active' : ''}`} onClick={() => setScreen(n.id)}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          <div className="badge-live">● LIVE</div>
          <span className="merchant-name">{merchant}</span>
        </div>
      </header>

      {/* Sidebar */}
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-section">SUITE</div>
          {NAV.map(n => (
            <div key={n.id} className={`sidebar-item ${screen === n.id ? 'active' : ''}`} onClick={() => setScreen(n.id)}>
              <div className="si-dot" style={{ background: n.dot, opacity: screen === n.id ? 1 : 0.3 }} />
              {n.label}
            </div>
          ))}
          <div className="sidebar-bottom">
            <div className="merchant-card">
              <div className="mc-name">{merchant.split(' ')[0]}</div>
              <div className="mc-id">mid_payos_demo</div>
              <div className="mc-status">● Hyperswitch Active</div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="main">
          {screens[screen]}
        </main>
      </div>
    </div>
  );
}

function Onboarding({ onSubmit }) {
  const [name, setName] = useState('');
  const [hsKey, setHsKey] = useState('');
  const [aiKey, setAiKey] = useState('');

  return (
    <div className="onboarding">
      <div className="onboard-card">
        <div className="logo" style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>
          <div className="logo-icon">⬡</div> Pay<span>OS</span>
        </div>
        <h1>Welcome to PayOS</h1>
        <p className="onboard-sub">Payment Intelligence Suite — powered by Juspay Hyperswitch + Claude AI</p>

        <div className="form-group">
          <label>MERCHANT NAME</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Online Store" />
        </div>
        <div className="form-group">
          <label>HYPERSWITCH API KEY</label>
          <input value={hsKey} onChange={e => setHsKey(e.target.value)} placeholder="hs_sandbox_xxxx" />
          <span className="hint">Get free key at app.hyperswitch.io</span>
        </div>
        <div className="form-group">
          <label>CLAUDE AI KEY (optional — for PayAgent)</label>
          <input value={aiKey} onChange={e => setAiKey(e.target.value)} placeholder="sk-ant-xxxx" type="password" />
          <span className="hint">Powers autonomous AI features</span>
        </div>

        <button className="btn-primary btn-full" onClick={() => {
          if (hsKey) localStorage.setItem('hs_key', hsKey);
          if (aiKey) localStorage.setItem('ai_key', aiKey);
          onSubmit(name);
        }}>
          Launch Dashboard →
        </button>
        <p className="demo-note">
          No keys? <button className="link-btn" onClick={() => onSubmit('Demo Merchant')}>Load demo mode</button>
        </p>
      </div>
    </div>
  );
}
