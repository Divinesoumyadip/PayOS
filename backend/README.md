# PayOS — AI-Native Payment Orchestration

> An HFT-ready, agentic payment switch built on **Hyperswitch**, optimized for 300M+ daily transactions.

[![Built on Hyperswitch](https://img.shields.io/badge/Built%20on-Hyperswitch-00f5a0?style=flat)](https://github.com/juspay/hyperswitch)
[![AI Powered](https://img.shields.io/badge/AI-Local%20Transformers-a78bfa?style=flat)](/)
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%2B%20C%2B%2B%20%2B%20React-4d9fff?style=flat)](/)

##  Technical Highlights (Juspay-Audit Tier)
Engineered with a focus on first-principles computing, low latency, and functional purity:

* **Hybrid Architecture**: Pure functional Node.js backend augmented with a **C++ Core** to move heavy mathematics off the JS event loop.
* **O(1) NeuralRoute Engine**: Replaced standard \(N)\$ rule-matching with an immutable, matrix-based routing engine in C++ for microsecond-level decision making.
* **Graph-Based FX Arbitrage**: Implemented a modified Bellman-Ford algorithm to find the absolute cheapest routing path across international liquidity pools.
* **Local Edge AI**: Deployed a local quantized DistilBERT model (\	ransformers.js\) for zero-latency fraud intent classification, ensuring data sovereignty without API delays.
* **Zero-Classes / FP Philosophy**: Core services are built using pure functions with zero side-effects, ensuring thread-safety in high-concurrency environments.

##  Core Modules

| Module | Problem Solved |
|---|---|
|  **NeuralRoute** | Replaces static routing with C++ optimized \(1)\$ gateway selection. |
|  **SentinelPay** | Replaces manual review with local LLM intent scoring and Z-Score anomaly detection. |
|  **FlowForge** | Replaces 3DS/OTP friction with Passive Behavioral Biometric auth. |
|  **ClearLedger** | Replaces manual reconciliation with pure-function ledger matching. |
|  **PayAgent** | Autonomous swarm that intercepts webhook failures and resolves disputes. |

##  The Architecture

\\\	ext
Frontend (React + Behavioral Biometrics)
        
Backend (Node.js — pure functional, zero global state)
        

  C++ Core Binding                                      
   neural_engine.cpp (Matrix math & O(1) routing)     
   fx_arbitrage.cpp  (Graph Theory / Bellman-Ford)    
   anomaly_stats.cpp (Standard Deviation / Z-Score)   

        
Hyperswitch API
\\\

##  Quick Start

1. \git clone https://github.com/Divinesoumyadip/PayOS.git\
2. \cd backend && npm install\ (Installs Node modules and local ML weights)
3. \cd ../frontend && npm install\
4. Configure \.env\ with Hyperswitch keys.
5. \
pm run dev\

---
*Architected by a 2024 & 2025 ICPC Regionalist and Codeforces Candidate Master.*
