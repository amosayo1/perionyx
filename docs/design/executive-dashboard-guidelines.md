# Executive Dashboard Guidelines — Phase 8B.2

## Philosophy

Executive dashboards must answer three questions within 10 seconds:

1. **What happened?** — Current state vs. expected state
2. **Why did it happen?** — Trends, anomalies, bottlenecks
3. **What needs my attention?** — Alerts, approvals, failures

Every widget on the page serves at least one of these. If it doesn't, remove it.

## Information Hierarchy

```
1. Executive Summary     ← 6 KPIs, health at a glance
2. Alerts               ← Critical/high prioritized
3. Primary Metrics       ← Trend-capable metric cards
4. Activity Feed         ← Recent events + drill-down
5. Quick Actions         ← Contextual action groups
6. Secondary Analytics   ← Charts, queues, performance
```

## Executive UX Rules

### The 10-Second Test
An executive should understand the business health of the domain within 10 seconds of page load. If they have to scroll, hover, or click to understand the state, the hierarchy is wrong.

### Signal vs. Noise
| Signal (keep) | Noise (remove) |
|---|---|
| Large metric values | Decorative icons |
| Trend percentages | Background gradients |
| Status indicators (dot) | Multiple accent colors |
| Comparison periods | Framer Motion entrances |
| Confidence indicators | Staggered animations |
| Alert severity | Full-color status backgrounds |
| Actionable drill-downs | Non-clickable summaries |

### Gold Usage
Gold (#c9a84c) is reserved for:
- The page/domain badge
- The primary metric value on executive summary rows
- Active/focused states on interactive elements
- The loading indicator

Never use gold for: backgrounds, borders on non-interactive elements, decorative highlights, chart lines.

### Status Dot Convention
- **Green dot** — Positive, healthy, completed, active
- **Amber dot** — Warning, pending, needs review, degraded
- **Red dot** — Error, failed, critical, blocked
- **Blue dot** — Informational, running, in-progress
- **Gray dot** — Neutral, idle, disabled, archived

Status text is never a full-colored background — use 10% opacity tinted backgrounds with colored text.

## Metric Card Standards

### Layout
```
┌──────────────────────────────┐
│ Label (uppercase, 11px)  ●   │ ← Status chip (optional)
│                              │
│ Value (32px, bold)  ▲ 12.4% │ ← Trend indicator
│ Subtitle (12px, subtle)      │
│                              │
│ vs last month · 95% conf     │ ← Comparison + confidence
│ Last updated Jun 5, 2:30 PM  │
└──────────────────────────────┘
```

### When to Gold
Gold a metric card only when:
- It's the primary KPI for the current view
- The value represents currency or financial performance
- The metric is at or above target

### Trend Badge Rules
- **Up + green**: positive trend (increased success rate, higher liquidity)
- **Down + red**: negative trend (more failures, higher risk)
- **Up + red**: sometimes correct (increased failed transactions)
- **Down + green**: sometimes correct (reduced pending items)
- Context matters — annotate the direction meaning.

### Sparkline Rules
- Show only when data has 5+ points
- Render at low opacity (0.04) — suggestive, not dominant
- Use gold stroke for primary metrics, gray for secondary
- Never animate sparklines

## Alert Standards

### Severity Order
1. **Critical** — Red, left border, requires immediate action
2. **High** — Orange, left border, needs attention today
3. **Medium** — Amber, left border, review this week
4. **Low** — Gray, informational, no deadline

### Alert Layout
```
│● Critical  │ Payment processing failed        │ 5m ago │
│ Operations │ Payment gateway timeout          │        │
│ Suggested: Retry connection or contact SRE   │        │
│ Owner: ops-team                                │        │
```

### Empty State
When no alerts exist, show an "All Clear" message with a green indicator. Never show an empty box.

## Activity Standards

### Timeline Event Format
```
[Icon] Actor performed action                  ● Completed · 2h ago
       Workflow/in context reference
```

### Icon Color
Use the semantic icon color matching the event type:
- Green for completions
- Red for failures
- Blue for running/in-progress
- Amber for pending/waiting

### Click Behavior
Every activity event should be clickable and navigate to the relevant detail view. No dead-end activity items.

## Page Header Anatomy

```
[Badge] [Environment]                    [Actions]
Executive Dashboard Title                [Button] [Button]
Two-line description of what this page shows.
Last updated Jun 5, 2024 · Company Name
```

- Badge: uppercase, gold border, gold text — the domain name
- Environment: production (green), sandbox (amber), development (blue)
- Title: 28px, semibold
- Description: 14px, secondary text, max 2 lines
- Last updated: 12px, tertiary text
- Actions: secondary buttons and primary CTA

## Dashboard Primitives

All available in `src/components/enterprise/`:

| Component | Purpose | File |
|---|---|---|
| `ExecutiveHeader` | Page header with badge, title, description, timestamp, env, health | `executive-header.tsx` |
| `ExecutiveMetricCard` | Metric card with value, trend, status, confidence, sparkline | `executive-metric-card.tsx` |
| `ExecutiveSummaryPanel` | 6-column KPI grid with status dots | `executive-summary-panel.tsx` |
| `AlertCenter` | Severity-prioritized alert list with owner + action | `alert-center.tsx` |
| `ActivityTimeline` | Vertical timeline with icons, actor, status, drill-down | `activity-timeline.tsx` |
| `QuickActionGroup` | 2-column action grid grouped by category | `quick-action-group.tsx` |
| `DashboardSection` | Titled section with optional description + action | `dashboard-section.tsx` |
| `DashboardDivider` | Subtle horizontal divider, optional label | `dashboard-divider.tsx` |
| `MetricTrend` | Trend badge (up/down/neutral with percentage) | `metric-trend.tsx` |
| `StatusChip` | Status indicator (dot + label, or dot-only) | `status-chip.tsx` |

## Grid Rules

- Metric rows: 6-column grid on desktop, 3 on tablet, 2 on mobile
- Feature tiles: 7-column grid on desktop, 4 on tablet, 2 on mobile
- Content columns: 2-column (50/50) or 3-column (1/3 each) — never 4+
- Card padding: 20px (p-5)
- Card gap: 24px (gap-6)
- Section spacing: 32px vertical (space-y-8 page-level, space-y-6 section-level)
- Page max-width: 1280px (max-w-7xl)

## Empty States

Every data section must handle:
1. **Loading** — skeleton placeholders matching card dimensions
2. **Empty** — centered illustration (icon in circle) + title + description + optional CTA
3. **Error** — error message + retry button

Empty states should guide the user toward the next action. Never show raw "No data" or an empty card.

## Performance

- Use `React.memo` on all metric card components
- Realtime data flows through SSE only (not polling)
- Lazy-load charts and heavy visualizations via `next/dynamic`
- No fetch waterfalls — gather all dashboard data in the server component
- Metric values render first, charts render second

## Files Reference

### New Files
| File | Purpose |
|---|---|
| `src/components/enterprise/executive-header.tsx` | Page header primitive |
| `src/components/enterprise/executive-metric-card.tsx` | Metric card primitive |
| `src/components/enterprise/executive-summary-panel.tsx` | Summary KPI grid |
| `src/components/enterprise/alert-center.tsx` | Alert list primitive |
| `src/components/enterprise/activity-timeline.tsx` | Activity feed primitive |
| `src/components/enterprise/quick-action-group.tsx` | Quick action groups |
| `src/components/enterprise/metric-trend.tsx` | Trend percentage badge |
| `src/components/enterprise/status-chip.tsx` | Status indicator |
| `src/components/enterprise/dashboard-section.tsx` | Section wrapper |
| `src/components/enterprise/dashboard-divider.tsx` | Section divider |
| `docs/design/executive-dashboard-guidelines.md` | This file |

### Modified Files
| File | Change |
|---|---|
| `src/components/enterprise/index.ts` | Added exports for 10 new primitives |
| `src/components/automation-studio/automation-dashboard.tsx` | Refined with executive components, gold usage reduced, hierarchy improved, spacing standardized |
| `AGENTS.md` | Added Engineering Constitution — UI Decision Mandate |

## Future Extension Points

1. **Drill-down framework** — standardized pattern for metric → detail navigation
2. **Custom dashboard layouts** — user-configurable widget placement
3. **Dashboard export** — PDF/CSV snapshot of current view
4. **Saved filters** — per-executive filter presets
5. **Benchmark comparison** — peer/industry metric comparison
6. **Annotation system** — executives can annotate metric anomalies
7. **Goals & targets** — visual target tracking on metric cards
