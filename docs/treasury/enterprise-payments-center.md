# Enterprise Payments & Cash Movement Center

## Architecture

The Enterprise Payments & Cash Movement Center is the operational treasury workspace for planning, approving, executing, tracking, reconciling, and analyzing all enterprise cash movements. It consumes only Treasury Domain modules (Phase 9B.1) and Banking abstractions (Phase 9A), remaining fully provider-agnostic.

### System Context

```
Treasury Domain (Phase 9B.1)
  └── Enterprise Payments Center (Phase 9B.4)
        ├── Payment Planning & Scheduling
        ├── Approval Workflow Engine
        ├── Execution & Settlement Tracking
        ├── Cash Movement & Reconciliation
        ├── Payment Rail Optimization
        ├── Risk & Compliance Monitoring
        └── Analytics & Reporting
```

### Component Hierarchy

```
GlobalPaymentsDashboard
├── ExecutivePaymentsHeader (KPI summary bar)
├── TreasuryPaymentFilters (15-dimension filter)
├── PaymentsOverview (10 KPI metric cards)
├── OutgoingPaymentsTable (250 payments, 16 columns)
├── IncomingCollectionsTable (150 collections, 11 columns)
├── PaymentApprovalQueue (40 approval cards)
├── IntercompanyPaymentsGrid (50 intercompany cards)
├── CashMovementTimeline (waterfall visualization)
├── PaymentCalendar (day/week/month views)
├── PaymentRailDistribution (14 rails comparison)
├── PaymentRoutingMatrix (20 routes)
├── Analytics Charts (9 chart components)
├── PaymentRecommendationsPanel (25 AI recommendations)
├── PaymentRiskPanel (8 risk categories)
├── PaymentAlertsPanel (20 alerts)
└── ExecutivePaymentInsights (8 key observations)
```

### Data Flow

1. **Mock data layer** (`data.ts`) provides 250+ payments, 150 collections, 40 approvals, 50 intercompany payments, 30 treasury transfers, 20 alerts, 25 recommendations, and supporting reference data
2. **Client components** consume mock data directly via imports — no API calls, no provider integrations, no SDKs
3. **Filter state** managed locally via `useState` and passed to child components
4. **Tab navigation** switches between 11 views, all rendering instantly from in-memory data

## Key Design Decisions

- **Provider-agnostic**: No banking providers, no SDKs, no external APIs. All banking references use "Mock Provider" labels
- **Enterprise scale**: Realistic dataset with 12 entities, 12 banks, 14 currencies, 8 regions
- **Executive focus**: Every component answers a specific question CFOs, Treasurers, and Controllers need
- **Instant rendering**: All data in memory — no loading states, no waterfalls, no skeleton screens
- **Perionyx design language**: Dark-only, ~95% charcoal, ~4% white, ~1% gold (#c9a84c)

## Accessibility

- All interactive elements have `aria-label` attributes
- Color is never the sole indicator of meaning (text labels, icons, patterns accompany color)
- Badge systems use both color and text labels
- WCAG 2.1 AA target contrast ratios maintained
- All table cells have appropriate role attributes

## Future AI Extension Points

- Recommendation engine scoring based on real-time data
- Anomaly detection for duplicate/fraud payments
- Optimal routing suggestions using ML
- Predictive settlement time estimation
- Cash flow forecasting with AI confidence scoring
- Automated approval escalation based on payment patterns
