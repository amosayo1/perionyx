# Task Engine

## Close Task Management
The task engine orchestrates the close process by managing task dependencies, assignments, and completion tracking.

## Task Dependencies
Tasks can depend on other tasks, creating a directed acyclic graph. The engine automatically:
- Identifies blocked tasks
- Calculates critical path
- Recommends parallel execution where possible
- Alerts when dependencies cause delays

## Task Categories
| Category | Description |
|---|---|
| reconciliation | Balance matching activities |
| journal | Journal entry preparation and posting |
| accrual | Accrual calculations and entries |
| allocation | Cost allocation runs |
| fx | Foreign exchange revaluation |
| intercompany | Intercompany matching and entries |
| consolidation | Consolidation entries |
| reporting | Financial statement preparation |
| compliance | Tax and regulatory compliance |
| audit | Audit support and documentation |

## Task Priority
- **Critical** — Blocks the close process
- **High** — Important for timely close
- **Medium** — Standard close tasks
- **Low** — Nice-to-have or informational

## Checklist Engine
Pre-close and post-close checklists ensure completeness:
- Required items must be completed before proceeding
- Optional items tracked for process improvement
- Category-based organization
- Completion rate tracking
