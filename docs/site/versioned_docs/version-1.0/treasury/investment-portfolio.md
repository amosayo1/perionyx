---
id: investment-portfolio
title: Investment Portfolio
sidebar_label: Investments
---

# Investment Portfolio

The Investment Portfolio module manages short-term investment allocations and surplus cash deployment.

## Investment Buckets

The `TreasuryInvestmentBucket` model tracks short-term investment allocations:

- **Bucket definitions** — Named investment categories (money market, commercial paper, treasury bills, etc.)
- **Allocation tracking** — Amount invested per bucket with currency and maturity information
- **Return metrics** — Yield, duration, and risk profile per bucket
- **Rebalancing triggers** — Threshold-based alerts when allocations drift from targets

## Surplus Cash Deployment

Surplus cash (cash classified above operational and reserve tiers) is allocated to investment instruments:

| Category | Description | Risk Profile |
|---|---|---|
| Money Market Funds | Low-risk, highly liquid instruments | Conservative |
| Commercial Paper | Short-term corporate debt | Moderate |
| Treasury Bills | Government-backed short-term securities | Low risk |
| Certificates of Deposit | Fixed-term bank deposits | Low risk |
| Intercompany Loans | Loans to subsidiary entities | Variable |

## Integration with Liquidity Management

Investment allocations are coordinated with liquidity tiers:

- **Operational tier** — Not available for investment
- **Reserve tier** — Partially available for very short-term, high-liquidity instruments
- **Surplus tier** — Fully available for investment deployment

## Interaction with Other Domains

| Domain | Interaction |
|---|---|
| Ledger | Investment purchases and maturities post as journal entries |
| Reporting | Investment returns feed into financial statements |
| Risk | Counterparty risk assessments inform investment limits |
| Intelligence Platform | AI models suggest optimal allocation strategies |
| Notifications | Maturity alerts and rebalancing triggers |
