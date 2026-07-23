---
id: counterparty-risk
title: Counterparty Risk
sidebar_label: Counterparty Risk
---

# Counterparty Risk

Counterparty risk is assessed across all financial relationships to protect the organization from concentration and credit risk.

## Risk Categories

The `TreasuryCounterpartyRisk` model evaluates risk across three counterparty types:

| Category | Description | Examples |
|---|---|---|
| Bank counterparties | Deposit concentration risk | Operating accounts, time deposits |
| Investment counterparties | Money market and commercial paper exposure | Money market funds, commercial paper issuers |
| Trading counterparties | FX and derivatives exposure | FX forward counterparties, swap counterparties |

## Risk Scoring

Risk scores are computed from:

- **Credit ratings** — External credit ratings from rating agencies
- **Exposure amounts** — Total exposure as a percentage of available capital
- **Tenure** — Length of relationship with the counterparty
- **Concentration** — Proportion of total exposure held with a single counterparty

## Alert Thresholds

Alerts are triggered when:

- **Concentration limits** — Exposure to a single counterparty exceeds configured thresholds
- **Credit thresholds** — Counterparty credit rating deteriorates below minimum acceptable level
- **Exposure growth** — Rapid increase in exposure without proportional capital growth
- **Maturity concentration** — Too much exposure concentrated in a single maturity window

## Risk Dashboard

Counterparty risk data feeds into the executive dashboard and reporting platform:

- **Risk score cards** — Per-counterparty risk ratings with trend indicators
- **Concentration charts** — Visual representation of exposure distribution
- **Alert feeds** — Real-time notifications for threshold breaches

## Interaction with Other Domains

| Domain | Interaction |
|---|---|
| Treasury | Counterparty data informs investment and banking decisions |
| Risk | Counterparty exposure feeds into enterprise risk scoring |
| Reporting | Risk data feeds board packs and compliance reports |
| Notifications | Breach alerts and threshold notifications |
| Intelligence Platform | AI models predict counterparty risk trends |
