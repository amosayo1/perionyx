# Developer Guide

## Getting Started

### Import the Service
```typescript
import { fcService } from "@/server/financial-close";
```

### Accessing Data
```typescript
// All close periods
const periods = fcService.closeManagement.getAll();

// Active period
const active = fcService.closeManagement.getActive();

// Tasks for current period
const tasks = fcService.taskEngine.getByPeriod("period-current");

// Pending approvals
const pending = fcService.approvals.getPending();

// Unbalanced reconciliations
const unbalanced = fcService.reconciliation.getUnbalanced();

// Executive summary
const summary = fcService.getExecutiveSummary();

// Aggregate metrics
const metrics = fcService.getAggregateMetrics();

// Readiness score
const score = fcService.getReadinessScore();
```

### Adding Data
```typescript
fcService.closeManagement.add(newPeriod);
fcService.taskEngine.add(newTask);
fcService.approvals.add(newApproval);
```

### Available Sub-Services
| Service | Methods |
|---|---|
| `fcService.closeManagement` | CRUD, start/complete/reopen periods, calculateProgress |
| `fcService.closeCalendar` | CRUD, getByPeriod, getUpcoming |
| `fcService.taskEngine` | CRUD, getOverdue, getBlocked, complete, assign |
| `fcService.checklistEngine` | CRUD, completeItem, addItem, getCompletionRate |
| `fcService.reconciliation` | CRUD, addAdjustment, approve, getCompletionStats |
| `fcService.accountReconciliation` | CRUD, addReconcilingItem, approve |
| `fcService.intercompanyReconciliation` | CRUD, addItem, approve, getCompletionStats |
| `fcService.journalReview` | CRUD, addFlag, resolveFlag, approve |
| `fcService.approvals` | CRUD, approve, reject, escalate, getApprovalRate |
| `fcService.varianceAnalysis` | CRUD, calculateVariance, getSummaryStats |
| `fcService.closeDashboard` | calculateProgress, calculateReadinessScore, getPeriodSummary |
| `fcService.analytics` | Metric CRUD, calculateAggregateMetrics, calculateExecutiveSummary |
| `fcService.recommendations` | CRUD, generateTaskRecommendation, generateAllRecommendations |
| `fcService.alerts` | CRUD, acknowledge, resolve, generateAlerts |
| `fcService.executiveInsights` | generateInsights |
