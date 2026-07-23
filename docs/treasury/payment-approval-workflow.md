# Payment Approval Workflow

## Overview

The approval workflow ensures every payment receives appropriate authorization based on amount, risk, counterparty, and policy rules. The workflow is policy-driven with escalation paths for SLA breaches.

## Approval Levels

| Level | Role | Threshold |
|---|---|---|
| Level 1 | Manager | Up to $500K |
| Level 2 | Director | Up to $2M |
| Level 3 | VP Finance | Up to $5M |
| Level 4 | CFO | Up to $20M |
| Level 5 | Board | Over $20M |

## Approval Chain

Each payment has a defined approval chain (2-5 approvers). The chain is evaluated based on:

- **Amount**: Higher amounts require more approvals
- **Risk Score**: High-risk payments escalate to VP/CFO level regardless of amount
- **Counterparty**: New or high-risk counterparties trigger enhanced approval
- **Payment Type**: Cross-border and SWIFT payments require additional scrutiny
- **Policy Rules**: Treasury policies may override default chain

## SLA & Escalation

- Each approval has an SLA timer (8 hours default)
- If SLA approaches breach (>4h remaining), amber warning shown
- If SLA breached, auto-escalate to next approver in chain
- Critical payments (<30 min SLA remaining) get urgent red highlighting

## Actions

| Action | Effect |
|---|---|
| Approve | Moves to next level or marks payment approved |
| Reject | Returns payment to draft with rejection reason |
| Request Changes | Sends back to requester with change notes |
| View Audit | Displays full approval chain history |
| Escalate | Manually escalate to next approver level |

## Audit Trail

Every approval action is recorded:
- Approver identity (role + name)
- Timestamp
- Action taken
- Notes/comments
- Previous and new status
- Escalation level

## Policy Enforcement

The approval system enforces:
- No self-approval
- No delegation below required level
- Dual approval for high-risk payments
- Board approval for >$5M payments
- Sanctions/AML screening before approval
