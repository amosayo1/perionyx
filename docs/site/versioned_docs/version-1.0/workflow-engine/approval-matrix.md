---
id: approval-matrix
title: Approval Matrix
sidebar_label: Approval Matrix
description: Approval matrix rules, escalation, delegation, and IF/THEN automation engine for workflow orchestration.
---

# Approval Matrix

## Automation Engine

`AutomationEngine.evaluate(ctx, eventType, payload?)`:

1. Fetches all active rules matching the event type, ordered by priority descending
2. For each rule, checks cooldown (if configured, skips if recently fired)
3. Evaluates rule conditions against the payload
4. Executes each action in sequence

### Action Types

| Action | Effect |
|---|---|
| `start_workflow` | Triggers a workflow execution |
| `send_notification` | Emits a notification event |
| `update_status` | Updates a resource status |
| `escalate` | Escalates an approval or alert |
| `log_audit` | Records an audit log entry |

## Template Library

`TemplateLibrary` provides 10 built-in templates:

| Template | Slug | Steps |
|---|---|---|
| Month-End Close | `month-end-close` | 6 steps: trial balance → reconciliation → condition → statements → approval → notification |
| Daily Treasury Review | `daily-treasury-review` | 4 steps: cash position → FX rates → liquidity → notification |
| Weekly Executive Brief | `weekly-executive-brief` | 4 steps: KPIs → variance report → recommendations → notification |
| Bank Reconciliation | `bank-reconciliation` | 4 steps: sync bank → match → condition → notification |
| Cash Forecast Refresh | `cash-forecast-refresh` | 5 steps: cash → receivables → payables → forecast → notification |
| Budget Review | `budget-review` | 5 steps: actuals → budget comparison → variance → report → notification |
| Board Pack Generation | `board-pack-generation` | 4 steps: financials → board pack → commentary → distribution |
| Quarter-End Close | `quarter-end-close` | 7 steps: extended month-end with additional reporting |
| Year-End Close | `year-end-close` | 8 steps: full close with audit preparation |
| Audit Preparation | `audit-preparation` | 6 steps: evidence collection → trail export → compliance report |

## Data Models

All orchestration data is scoped to `companyId`:
- `AutomationRule` — event type, condition, actions, cooldown, priority
- `WorkflowSchedule` — cron expression, timezone, next/last run
- `WorkflowLog` — audit trail entries
