# Demo Guide

## Setup

```bash
npm run dev
```

Open `http://localhost:3000` and sign in with a seeded account.

## Primary Entry Point: Command Center

Navigate to **Command Center** (`/command-center`). This is the primary enterprise view — a unified operations hub showing real-time KPIs, active decisions, outstanding approvals, and platform status at a glance.

## Key Pages

| Page | Route | What to Show |
|------|-------|-------------|
| Executive Overview | `/dashboard` | KPI metrics (liquidity, transaction volume, approval ratios), wallet balances, FX sync status, ledger integrity, sparkline trends, financial insights panel |
| Command Center | `/command-center` | Unified operations hub: decision queue, active alerts, treasury snapshot, approval bottlenecks, recent activity timeline, platform telemetry |
| Copilot | `/copilot` | AI-powered natural language query interface. Demonstrate asking about treasury positions, transaction history, risk alerts. Show confidence ratings and source citations |
| Risk Intelligence | `/risk-intelligence` | Risk scoring, anomaly detection, active alerts with severity levels, risk trend charts, what-if simulation results |
| Platform Health | `/platform` | Service status, queue depth, database metrics, connector health, worker status, latency charts |

## Demo Flow (5–7 minutes)

1. **Executive Overview** — Start with high-level financial KPIs and wallet balances
2. **Command Center** — Show the unified decision queue, active alerts, and pending approvals
3. **Treasury Position** — Navigate to treasury/wallets to show account balances, FX positions, and transaction history
4. **Risk Intelligence** — Demonstrate risk alerts, anomaly flags, and scoring
5. **Copilot** — Ask natural language questions ("What's our current cash position?", "Show recent high-value transactions")
6. **Executive Briefing** — If available, show the daily executive briefing with AI-generated summary
7. **Platform Health** — End with the operational health dashboard showing system reliability

## Terminology

Refer to the [Governance Constitution](GOVERNANCE_CONSTITUTION.md) for standardized product language:

- "Executive Overview" not "Dashboard" in navigation context
- "Copilot" not "AI Chat" for the AI interface
- "Command Center" not "Control Center" for the operations hub
- "Risk Intelligence" not "Risk Dashboard"
- "Enterprise Treasury Operating System" as the product category
