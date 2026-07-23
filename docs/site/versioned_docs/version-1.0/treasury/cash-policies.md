---
id: cash-policies
title: Cash Policies
sidebar_label: Cash Policies
---

# Cash Policies

Cash policies define the rules and limits governing how the organization manages its cash positions, investments, and exposures.

## Policy Model

The `TreasuryCashPolicy` model stores configurable policy rules and limits:

- **Policy definitions** — Named policies with effective dates and status tracking
- **Rule parameters** — Specific limits, thresholds, and approval requirements
- **Compliance tracking** — Monitoring adherence to defined policies
- **Exception handling** — Process for requesting and approving policy exceptions

## Policy Types

### Cash Position Policies

| Policy | Description |
|---|---|
| Minimum balance | Required minimum balance per account or entity |
| Maximum balance | Upper limit on idle cash before investment trigger |
| Target balance | Optimal cash level for operational efficiency |
| Sweep threshold | Balance level triggering automated sweeps |

### Investment Policies

| Policy | Description |
|---|---|
| Approved instruments | List of permitted investment types |
| Maximum duration | Maximum term length for investments |
| Minimum yield | Floor for acceptable investment returns |
| Diversification limits | Maximum concentration per instrument or counterparty |

### Exposure Policies

| Policy | Description |
|---|---|
| FX exposure limits | Maximum net exposure per currency pair |
| Counterparty limits | Maximum exposure per financial institution |
| Concentration limits | Maximum percentage of cash with single counterparty |
| Hedge requirements | Minimum hedge ratio for material exposures |

### Operational Policies

| Policy | Description |
|---|---|
| Approval thresholds | Amounts requiring treasury committee approval |
| Payment controls | Limits on unauthorized payment types |
| Reconciliation frequency | Required reconciliation cadence by account type |
| Reporting requirements | Mandatory reports and their frequency |

## Compliance Monitoring

Policies are actively monitored:

- **Real-time evaluation** — Transaction and position checks against policy limits
- **Breach detection** — Immediate identification when limits are exceeded
- **Alert routing** — Notifications sent to treasury team and compliance officers
- **Exception tracking** — Log of all policy exceptions with approval chain

## Interaction with Other Domains

| Domain | Interaction |
|---|---|
| Treasury | Policies govern all treasury operations and decisions |
| Risk | Policy compliance feeds into risk assessments |
| Governance | Policies are part of the enterprise governance framework |
| Notifications | Policy breach alerts and compliance reminders |
| Reporting | Policy compliance status feeds into audit reports |
