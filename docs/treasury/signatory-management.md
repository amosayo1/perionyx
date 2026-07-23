# Signatory Management

## Overview

The signatory management system provides complete governance over who can authorize transactions on each bank account, with what authority, and up to what limit.

## Signing Authorities

| Authority | Description | Typical Use |
|---|---|---|
| Sole | Any one signatory can authorize | Low-risk, low-value |
| Joint | Two specific signatories required | High-value payments |
| Any Two | Any two of registered signatories | Standard operational |
| Any Three | Any three of registered signatories | High-risk accounts |
| Manager | Manager-level signatory only | Operational limits |
| Director | Director-level signatory only | Medium-high value |
| CFO | CFO-level signatory only | Large value |
| CEO | CEO-level signatory only | Strategic transactions |

## Approval Limits by Role

| Role | Single Transaction | Daily Aggregate |
|---|---|---|
| Manager | $50,000 | $200,000 |
| Director | $500,000 | $2,000,000 |
| VP Finance | $2,000,000 | $5,000,000 |
| CFO | $10,000,000 | $25,000,000 |
| CEO | $25,000,000 | $50,000,000 |
| Board | Unlimited | Unlimited |

## Signatory Lifecycle

1. **Appointed** — Named as signatory on account
2. **Active** — Currently authorized to sign
3. **Expiring** — Authority approaching expiration (30-day warning)
4. **Expired** — Authority lapsed, renewal required
5. **Revoked** — Authority removed by entity/board

## Governance Rules

- No self-approval of own signatory status
- Dual control for adding/removing signatories
- Annual review of all signatory authorities
- Immediate revocation on role change/departure
- Audit trail for all signatory changes
