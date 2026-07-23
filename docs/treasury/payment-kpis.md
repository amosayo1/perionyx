# Payment KPIs

## Executive Metrics

| KPI | Formula | Interpretation |
|---|---|---|
| Outgoing Payment Volume | Count of payments sent | Operational throughput |
| Outgoing Payment Value | Sum of payment amounts | Cash outflow magnitude |
| Incoming Collection Volume | Count of collections received | Revenue efficiency |
| Incoming Collection Value | Sum of collection amounts | Cash inflow magnitude |
| Net Cash Flow | Incoming - Outgoing | Daily cash position change |
| Pending Payments | Count in non-terminal status | Operations backlog |
| Awaiting Approval | Count in pending_approval | Approval bottleneck |
| Completed Today | Count settled today | Daily throughput |
| Failed Today | Count failed today | Operational health |
| Average Processing Time | Mean time from queue to execution | Operational efficiency |
| Average Settlement Time | Mean time from execution to settlement | Rail performance |
| Daily Volume | Unique payments today | Scale indicator |

## Payment Risk Metrics

| KPI | Thresholds | Response |
|---|---|---|
| High Value Payments | >$5M | Board approval required |
| Duplicate Risk | Same beneficiary/amount within 24h | Manual review |
| Sanctions Review | Counterparty on screening list | Compliance review |
| Approval Breach | Approved below required level | Policy violation |
| Settlement Delay | >SLA target | Trace with bank |
| Liquidity Risk | Balance < minimum after payment | Halt/cash sweep |
| Counterparty Risk | Credit rating downgraded | Reduce exposure |

## Rail Performance Metrics

| Metric | Best | Warning | Critical |
|---|---|---|---|
| Success Rate | >99% | 97-99% | <97% |
| Average Cost | Lowest quartile | Market median | Highest quartile |
| Settlement Time | Within SLA | 2x SLA | >3x SLA |
| Volume Capacity | <70% utilization | 70-90% | >90% |

## Trend Indicators

- **Up ↑**: Metric increasing (positive for collections, negative for failures)
- **Down ↓**: Metric decreasing (negative for volume, positive for failures)
- **Stable →**: Within expected variance

All KPIs show current value, trend direction, and delta percentage for at-a-glance executive assessment.
