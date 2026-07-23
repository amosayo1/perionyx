# AI Integration

## Capabilities

### Consolidation Readiness Score
- Calculate readiness score based on run progress, entity submission, and step completion
- Identify bottlenecks in the consolidation pipeline
- Predict time to completion based on current status
- Flag stalled runs exceeding expected duration

### Missing Eliminations Detection
- Identify unmatched intercompany transactions
- Recommend elimination entries for recurring IC items
- Flag significant differences requiring investigation
- Prioritize by amount and entity impact

### FX Translation Anomalies
- Detect unusual rate spreads between average and closing rates
- Flag translation runs with significant CTA amounts
- Identify entities with high FX exposure
- Recommend hedging actions for unhedged exposure

### Ownership Inconsistencies
- Flag entities with full consolidation method but < 50% ownership
- Detect cross-ownership structures requiring special treatment
- Identify dormant or dissolved entities still in consolidation scope
- Review consolidation method alignment with ownership percentage

### Variance Explanations
- Natural language explanations for significant variances
- Period-over-period comparison for revenue, expenses, net income
- Entity-level performance attribution
- Root cause analysis suggestions

### Board-Level Executive Summaries
- Automated narrative generation for board reports
- Key highlights and risk identification
- Comparative period analysis
- Consolidation readiness score explanation

### Consolidation Recommendations
| Type | Description |
|---|---|
| elimination | Unmatched IC transactions requiring resolution |
| translation | Pending or anomalous currency translations |
| ownership | Inconsistencies between ownership % and consolidation method |
| consolidation | Stalled runs, missing entity submissions |
| reporting | Missing financial statements or board reports |
| governance | Policy compliance and approval gaps |
| process | Process improvement opportunities |
| compliance | Regulatory and audit compliance issues |
