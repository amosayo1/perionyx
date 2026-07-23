# Phase 8C.7 — Executive Timeline & Enterprise Activity Intelligence

## Architecture

The Executive Timeline is NOT an audit log or notification center — it is the enterprise's operational timeline. Every event is permission-aware, tenant-aware, role-aware, chronological, auditable, explainable, and actionable.

```
┌──────────────────────────────────────────────────────────────┐
│                   ExecutiveTimelineEngine                     │
│  (public facade — all external entry points)                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              TimelineAggregator                      │    │
│  │  11 parallel Prisma collectors (Promise.allSettled)  │    │
│  │                                                      │    │
│  │  payments    → Payment[] (200)                       │    │
│  │  workflows   → WorkflowInstance[] (200)              │    │
│  │  approvals   → TransactionApproval[] (200)           │    │
│  │  compliance  → PolicyViolation[] (100)               │    │
│  │  risk        → RiskAlert[] (100)                     │    │
│  │  policies    → AuditLog[] (100)                      │    │
│  │  audit       → AuditLog[] (100)                      │    │
│  │  notifications → Notification[] (100)                │    │
│  │  automation  → WorkflowInstance[] (100)              │    │
│  │  invoices    → AccountingInvoice[] (100)             │    │
│  │  treasury    → TreasuryAccount + Transfer[] (100)    │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │               TimelinePriorityScorer                  │    │
│  │  severityScore (100→5) + recencyBonus (10-hours)    │    │
│  │  + entityBonus (5) + actionBonus (3) + readBonus    │    │
│  │  + narrativeBonus (2) + trendBonus (5)              │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────┴────────────────────────────┐    │
│  │              TimelineNarrativeBuilder                 │    │
│  │  source groups (≥2) → severity groups (≥3)          │    │
│  │  → natural language summaries + period overviews    │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│  ┌────────────┐  ┌───────┴────────┐  ┌──────────────┐     │
│  │Timeline    │  │Timeline        │  │Timeline      │     │
│  │FilterService│  │SearchService   │  │Cache         │     │
│  │7 views     │  │full-text on    │  │view-aware    │     │
│  │modules/    │  │title/summary/  │  │60s→3600s TTL │     │
│  │severity/   │  │source/entities │  │per company   │     │
│  │type/ranges │  │                │  │              │     │
│  └────────────┘  └───────────────┘  └──────────────┘     │
│                                                           │
│  ┌────────────────────────┐  ┌────────────────────────┐  │
│  │TimelineSubscription    │  │TimelineAuditBridge     │  │
│  │Manager                 │  │connects to             │  │
│  │eventType/source/       │  │SearchAuditService      │  │
│  │minSeverity subscribers │  │VIEW_RESULT/SAVE_SEARCH │  │
│  └────────────────────────┘  └────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────┐     │
│  │           TimelineEventRegistry                  │     │
│  │  38 event types with metadata, icons, actions   │     │
│  └─────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

## Design Principles

1. **Not an audit log** — events carry business impact statements and quick actions, not raw log lines
2. **Parallel collection** — `Promise.allSettled` prevents single-source failures from blocking the timeline
3. **View-aware caching** — "Today" view caches for 60s, "This Quarter" for 3600s
4. **Priority scoring** — severity, recency, entity relationships, actionability, read status
5. **Narrative generation** — groups events into natural language summaries for quick scanning

## 38 Event Types

| Source | Event Types |
|---|---|
| Payments | PAYMENT_INITIATED, PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_CANCELLED, PAYMENT_FRAUD_FLAGGED |
| Workflows | WORKFLOW_STARTED, WORKFLOW_COMPLETED, WORKFLOW_FAILED, WORKFLOW_ESCALATED |
| Approvals | APPROVAL_SUBMITTED, APPROVAL_APPROVED, APPROVAL_REJECTED, APPROVAL_ESCALATED, APPROVAL_DELEGATED |
| Compliance | COMPLIANCE_VIOLATION_CREATED, COMPLIANCE_VIOLATION_RESOLVED, COMPLIANCE_VIOLATION_ESCALATED |
| Risk | RISK_ALERT_CREATED, RISK_ALERT_RESOLVED, RISK_ALERT_ESCALATED, RISK_LIMIT_BREACH |
| Policies | POLICY_CREATED, POLICY_UPDATED, POLICY_VIOLATION_DETECTED |
| Audit | AUDIT_LOG_CREATED, AUDIT_LOG_REVIEWED |
| Notifications | NOTIFICATION_SENT, NOTIFICATION_FAILED, NOTIFICATION_ESCALATED |
| Automation | AUTOMATION_EXECUTED, AUTOMATION_FAILED, AUTOMATION_SCHEDULED |
| Invoices | INVOICE_CREATED, INVOICE_APPROVED, INVOICE_REJECTED, INVOICE_PAID, INVOICE_OVERDUE |
| Treasury | TREASURY_BALANCE_CHANGED, TREASURY_TRANSFER_INITIATED, TREASURY_TRANSFER_COMPLETED, TREASURY_TRANSFER_FAILED |

## 7 Views

| View | Data Range | Cache TTL |
|---|---|---|
| today | start of today → now | 60s |
| yesterday | yesterday start → end | 120s |
| this_week | start of week → now | 180s |
| this_month | start of month → now | 600s |
| last_month | previous month | 1200s |
| this_quarter | start of quarter → now | 1800s |
| custom | user-specified range | 3600s |

## Collectors

Each collector maps Prisma data to typed `TimelineEvent` with:
- `entities` — related entity references (type + id + label)
- `quickActions` — contextual action buttons
- `evidence` — supporting data payload
- `severity` — critical/high/medium/low/info
- `businessImpact` — natural language impact statement
- `recommendedAction` — suggested next step

## Caching Strategy

```
view → TTL mapping:
  today:       60s  (fast refresh for current activity)
  yesterday:   120s
  this_week:   180s
  this_month:  600s
  last_month:  1200s
  this_quarter: 1800s
  custom:      3600s (longer TTL for past data)
```

## Access Control

All timeline events are:
- **Permission-aware**: bridged to enterprise search audit service
- **Tenant-aware**: scoped to `companyId` on all queries
- **Role-aware**: severity filtering based on user role
- **Explainable**: every event carries `businessImpact` and `recommendedAction`
- **Actionable**: events carry `quickActions` for one-click resolution
- **Auditable**: all access and actions recorded via `TimelineAuditBridge`

## File Reference

| File | Description |
|---|---|
| `src/server/intelligence/timeline/types.ts` | 18 sources, 38 event types, 7 views |
| `src/server/intelligence/timeline/timeline-event-registry.ts` | Event type definitions |
| `src/server/intelligence/timeline/timeline-aggregator.ts` | 11 parallel Prisma collectors |
| `src/server/intelligence/timeline/timeline-priority-scorer.ts` | Multi-factor scoring |
| `src/server/intelligence/timeline/timeline-narrative-builder.ts` | Group + summary generation |
| `src/server/intelligence/timeline/timeline-filter-service.ts` | Filter by 7 dimensions |
| `src/server/intelligence/timeline/timeline-search-service.ts` | Full-text search |
| `src/server/intelligence/timeline/timeline-cache.ts` | View-aware TTL caching |
| `src/server/intelligence/timeline/timeline-audit-bridge.ts` | Audit logging |
| `src/server/intelligence/timeline/timeline-subscription-manager.ts` | Event subscriptions |
| `src/server/intelligence/timeline/executive-timeline-engine.ts` | Main facade |
| `src/server/intelligence/timeline/index.ts` | Barrel exports |
