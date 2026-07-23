# Asset Maintenance

## Maintenance Types
| Type | Description | Scheduling |
|---|---|---|
| Preventive | Scheduled routine maintenance | Calendar-based (quarterly, annually) |
| Corrective | Repairs after failure | On-demand |
| Emergency | Urgent unplanned repairs | Immediate response |
| Inspection | Compliance or safety checks | Regulatory schedule |

## Maintenance Record
Each maintenance event tracks:
- Asset, type, priority, status
- Scheduled and actual dates
- Cost (labor, parts, vendor)
- Downtime hours
- Vendor and assignee
- Parts replaced
- Notes and resolution

## Maintenance KPIs
- Preventive vs corrective ratio (higher preventive = better)
- Mean time between failures (MTBF)
- Mean time to repair (MTTR)
- Maintenance cost as % of asset value
- Emergency maintenance ratio

## Integration with Recommendations
The system generates recommendations based on maintenance patterns:
- Schedule overdue preventive maintenance
- Alert when emergency maintenance ratio exceeds threshold
- Recommend replacement when maintenance costs exceed 50% of replacement value
- Identify assets with abnormally high maintenance costs
