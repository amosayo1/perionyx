# Developer Guide

## Getting Started

### Import the Service
```typescript
import { consService } from "@/server/consolidation";
```

### Accessing Data
```typescript
// All entities
const entities = consService.entityManagement.getAll();

// Group tree
const tree = consService.groupStructure.buildTree();

// Ownership records
const ownerships = consService.ownership.getAll();

// Active consolidation runs
const activeRuns = consService.consolidationEngine.getActive();

// Executive summary
const summary = consService.getExecutiveSummary();

// Aggregate metrics
const metrics = consService.getAggregateMetrics();
```

### Entity Management
```typescript
// Add entity
consService.entityManagement.add(entity);

// Get by type
const subsidiaries = consService.entityManagement.getByType("subsidiary");

// Get by country
const usEntities = consService.entityManagement.getByCountry("US");

// Get consolidated entities
const consolidated = consService.entityManagement.getConsolidated();

// Search
const results = consService.entityManagement.search("Acme");

// Update
consService.entityManagement.update("entity-id", { status: "dormant" });
```

### Tree Navigation
```typescript
// Build full tree
const tree = consService.groupStructure.buildTree();

// Get roots (top-level entities)
const roots = consService.groupStructure.getRoots();

// Get children
const children = consService.groupStructure.getChildren("parent-id");

// Get descendants (recursive)
const descendants = consService.groupStructure.getDescendants("entity-id");

// Get ancestors
const ancestors = consService.groupStructure.getAncestors("entity-id");

// Get hierarchy path
const path = consService.groupStructure.getHierarchyPath("entity-id");

// Get depth
const depth = consService.groupStructure.getDepth("entity-id");
```

### Ownership Queries
```typescript
// Get effective ownership
const effective = consService.ownership.getEffectiveOwnership("parent-id", "subsidiary-id");

// Get consolidation scope
const scope = consService.ownership.getConsolidationScope("entity-id");

// Get direct ownership records
const direct = consService.ownership.getDirect();

// Get indirect ownership records
const indirect = consService.ownership.getIndirect();

// Get active ownership records
const active = consService.ownership.getActive();
```

### Consolidation Run Management
```typescript
// Start a new run
const run = consService.consolidationEngine.startRun(
  "period-id", "monthly", 2026, 6, "USD", ["entity-1", "entity-2"]
);

// Advance to next step
consService.consolidationEngine.advanceStep("run-id");

// Complete run
consService.consolidationEngine.completeRun("run-id");

// Approve run
consService.consolidationEngine.approveRun("run-id", "user-id");

// Lock run
consService.consolidationEngine.lockRun("run-id");

// Get readiness score
const score = consService.consolidationEngine.getReadinessScore(run);
```

### Translation and Elimination Operations
```typescript
// Start translation
const translation = consService.currencyTranslation.startTranslation(
  "run-id", "EUR", "USD", "average", 1.08, 1.12
);

// Calculate CTA
const cta = consService.currencyTranslation.calculateCTA(1000000, 1.08, 1.12);

// Complete translation
consService.currencyTranslation.completeTranslation("translation-id");

// Match IC records
consService.intercompanyEliminations.matchRecords("id1", "id2", 50000, "user-id");

// Eliminate matched record
consService.intercompanyEliminations.eliminate("record-id", 50000, "journal-id", "user-id");

// Get unmatched records
const unmatched = consService.intercompanyEliminations.getUnmatched();
```

### Financial Statement Generation
```typescript
// Generate balance sheet
const bs = consService.financialStatements.generateBalanceSheet(
  "run-id", "period-id", "USD", entries
);

// Generate income statement
const is = consService.financialStatements.generateIncomeStatement(
  "run-id", "period-id", "USD", entries
);

// Check balance
const balanced = consService.financialStatements.checkBalance("statement-id");
```

### Report Generation
```typescript
// Generate board report
const report = consService.boardReporting.generateBoardReport(
  "run-id", "period-id", "USD",
  "Executive summary text",
  ["Highlight 1", "Highlight 2"],
  ["Risk 1", "Risk 2"],
  ["Recommendation 1"]
);

// Add section with metrics
consService.boardReporting.addSection("report-id", {
  title: "Revenue Analysis",
  content: "Revenue by segment...",
  metrics: [{ label: "Revenue", value: "$1.2B", trend: "up" }],
});

// Approve report
consService.boardReporting.approveReport("report-id", "user-id");
```

### Alert and Recommendation Querying
```typescript
// Get unresolved alerts
const alerts = consService.alerts.getUnresolved();

// Get critical alerts
const critical = consService.alerts.getBySeverity("critical");

// Acknowledge alert
consService.alerts.acknowledge("alert-id");

// Get active recommendations
const recs = consService.recommendations.getActive();

// Generate recommendations
const elimRecs = consService.recommendations.generateEliminationRecommendation(icRecords);
const transRecs = consService.recommendations.generateTranslationRecommendation(translations);
const ownRecs = consService.recommendations.generateOwnershipRecommendation(ownerships);

// Generate alerts
const alerts = consService.alerts.generateConsolidationAlerts(runs, icRecords, adjustments, entities);
```

### Executive Insights
```typescript
const summary = consService.getExecutiveSummary();
const metrics = consService.getAggregateMetrics();

const insights = consService.executiveInsights.generateInsights(
  summary, entities, runs, icRecords, adjustments, kpis
);
// Returns: { summary, highlights, risks, actions }
```

## Full Sub-Service Methods

| Service | Methods |
|---|---|
| `consService.entityManagement` | add, get, getAll, getByType, getByCountry, getByStatus, getByParent, getActive, getConsolidated, getByConsolidationMethod, getByFunctionalCurrency, count, countByType, countByCountry, update, delete, search |
| `consService.groupStructure` | add, get, getAll, getRoots, getChildren, getDescendants, getAncestors, getDepth, update, delete, remove, rebuild, buildTree, getHierarchyPath, count, countByType |
| `consService.ownership` | add, get, getAll, getByParent, getBySubsidiary, getByType, getByMethod, getActive, getDirect, getIndirect, getEffectiveOwnership, getConsolidationScope, count, countByType, countByMethod, update, delete |
| `consService.consolidationEngine` | add, get, getAll, getByStatus, getByPeriod, getByType, getActive, getByFiscalYear, startRun, advanceStep, completeRun, lockRun, approveRun, getReadinessScore, count, update, delete |
| `consService.currencyTranslation` | add, get, getAll, getByConsolidationRun, getByStatus, getBySourceCurrency, getByTargetCurrency, startTranslation, completeTranslation, approveTranslation, calculateCTA, getTotalCTA, count, update, delete |
| `consService.intercompanyEliminations` | add, get, getAll, getByConsolidationRun, getByType, getByStatus, getByFromEntity, getByToEntity, getMatched, getUnmatched, getEliminated, getByPeriod, getTotalUnmatched, getTotalEliminated, getTotalEliminationAmount, getTotalUnmatchedAmount, matchRecords, eliminate, count, update, delete |
| `consService.minorityInterest` | add, get, getAll, getByConsolidationRun, getByEntity, getByPeriod, calculateMinorityInterest, getTotalMinorityEquity, getTotalMinorityNetIncome, count, update, delete |
| `consService.equityAccounting` | add, get, getAll, getByConsolidationRun, getByEntity, getByPeriod, calculateEquityShare, getTotalGoodwill, getTotalCarryingAmount, count, update, delete |
| `consService.consolidationAdjustments` | add, get, getAll, getByConsolidationRun, getByType, getByStatus, getByEntity, getByPeriod, getPending, getApproved, getPosted, approve, reject, post, getTotalAdjustmentAmount, count, countByType, countByStatus, update, delete |
| `consService.financialStatements` | add, get, getAll, getByConsolidationRun, getByPeriod, getByType, generateBalanceSheet, generateIncomeStatement, generateCashFlow, generateEquityChanges, generateTrialBalance, checkBalance, count, update, delete |
| `consService.boardReporting` | add, get, getAll, getByConsolidationRun, getByPeriod, count, generateBoardReport, addSection, approveReport, update, delete |
| `consService.managementReporting` | add, get, getAll, getByConsolidationRun, getByEntity, getByPeriod, getTotalRevenue, getTotalNetIncome, getTotalExpenses, count, update, delete |
| `consService.analytics` | addMetric, getMetric, getAllMetrics, getMetricsByCategory, getMetricsByStatus, deleteMetric, calculateAggregateMetrics, calculateExecutiveSummary, generateEntityPerformanceReport, generateFXExposureReport, generateIntercompanyExposureReport |
| `consService.recommendations` | add, get, getAll, getByType, getByPriority, getActive, getImplemented, getByConsolidationRun, getByEntity, count, update, delete, dismiss, implement, generateEliminationRecommendation, generateTranslationRecommendation, generateOwnershipRecommendation |
| `consService.alerts` | add, get, getAll, getByType, getBySeverity, getUnread, getUnresolved, getByConsolidationRun, getByEntity, count, update, delete, acknowledge, resolve, generateConsolidationAlerts |
| `consService.executiveInsights` | generateInsights |
