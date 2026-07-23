# Payment Dashboard

## Overview

The Payments Dashboard provides a unified operational view of all enterprise payment activity. It answers: What payments are happening today? What needs attention? What is the overall health of payment operations?

## Tabs

| Tab | Purpose | Key Component |
|---|---|---|
| Overview | 10 KPI summary metrics | `PaymentsOverview` |
| Outgoing | Detailed outbound payment list | `OutgoingPaymentsTable` |
| Incoming | Expected/received collections | `IncomingCollectionsTable` |
| Approvals | Pending approval queue | `PaymentApprovalQueue` |
| Intercompany | Entity-to-entity transfers | `IntercompanyPaymentsGrid` |
| Cash Movement | Waterfall cash flow timeline | `CashMovementTimeline` |
| Calendar | Payment schedule visualization | `PaymentCalendar` |
| Analytics | 9 analytical chart views | Analytics chart components |
| Recommendations | AI-powered suggestions | `PaymentRecommendationsPanel` |
| Alerts | Operational alert feed | `PaymentAlertsPanel` |
| Rails | Payment rail comparison | `PaymentRailDistribution` + `PaymentRoutingMatrix` |

## Executive Header KPIs

| Metric | Description |
|---|---|
| Today's Payments | Count and total value of outbound payments today |
| Today's Collections | Count and total value of inbound collections today |
| Net Cash Movement | Incoming minus outgoing (colored green/red) |
| Pending Approvals | Count and total value awaiting approval |
| Payments In Flight | Count of payments currently processing |
| Failed Payments | Count and total value of failed payments today |
| Average Settlement Time | Mean settlement duration across all rails |
| Entities/Banks/Currencies | Counts of active entities, banks, currencies |
| Alerts | Count of active operational alerts |

## Filters

The filter bar supports 15 dimensions: Region, Legal Entity, Business Unit, Bank, Currency, Payment Type, Payment Rail, Priority, Status, Approver, Date Range, Amount Range, Counterparty. First 6 shown inline, remaining behind "More Filters" toggle.

## Accessibility

- All KPIs have `aria-label` for screen readers
- Color-coded trends accompanied by directional text (up/down/stable)
- Tab navigation has `aria-selected` states
- Filter dropdowns use native `<select>` with labels
