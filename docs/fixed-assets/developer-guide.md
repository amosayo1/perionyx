# Developer Guide

## Getting Started

### Import the Service
```typescript
import { faService } from "@/server/fixed-assets";
```

### Accessing Data
```typescript
// All assets
const assets = faService.registry.getAll();

// Single asset
const asset = faService.registry.get("asset-1");

// Filtered assets
const computers = faService.registry.getByCategory("computers");
const active = faService.registry.getActive();
const fullyDep = faService.registry.getFullyDepreciated();

// Acquisitions
const allAcq = faService.acquisition.getAll();
const byVendor = faService.acquisition.getByVendor("Dell Technologies");

// Capitalizations
const allCap = faService.capitalization.getAll();
const pendingCap = faService.capitalization.getPendingCapitalization();

// Depreciation
const allDep = faService.depreciation.getAll();
const unposted = faService.depreciation.getUnposted();
const schedule = faService.depreciation.getByAsset("asset-1");

// Impairments
const allImp = faService.impairment.getAll();
const byIndicator = faService.impairment.getByIndicator("obsolescence");

// Transfers
const allTrf = faService.transfers.getAll();
const fromDept = faService.transfers.getByFromDepartment("Engineering");

// Maintenance
const allMnt = faService.maintenance.getAll();
const scheduled = faService.maintenance.getScheduled();
const totalCost = faService.maintenance.getTotalCost();

// Disposals
const allDisp = faService.disposals.getAll();
const byType = faService.disposals.getByType("sale");
const totalGL = faService.disposals.getTotalGainLoss();

// Revaluations
const allRev = faService.revaluation.getAll();
const netSurplus = faService.revaluation.getNetRevaluation();

// Lease Readiness
const leased = faService.leaseReadiness.getLeased();
const financeLeases = faService.leaseReadiness.getFinanceLeases();
const totalLiability = faService.leaseReadiness.getTotalLeaseLiability();

// Analytics
const metrics = faService.analytics.getAllMetrics();
const aggregates = faService.getAggregateMetrics();
const summary = faService.getExecutiveSummary();
const depSchedule = faService.analytics.generateDepreciationScheduleReport(assets);
const capexReport = faService.analytics.generateCapExReport(assets, "2026-Q2", 5000000);
const agingReport = faService.analytics.generateAgingReport(assets, "computers");
const maintReport = faService.analytics.generateMaintenanceCostReport(assets, "2026-Q2");
const disposalReport = faService.analytics.generateDisposalReport(assets);

// Recommendations
const activeRecs = faService.recommendations.getActive();
const byAsset = faService.recommendations.getByAsset("asset-8");

// Alerts
const unresolved = faService.alerts.getUnresolved();
faService.alerts.acknowledge("fa-alert-001");
faService.alerts.resolve("fa-alert-001");

// Executive Insights
const insights = faService.executiveInsights.generateInsights(assets, alerts, recs);
```

### Paginated Registry Access
```typescript
const result = faService.registry.getPaginated(
  { status: ["inService"], category: ["computers"] },
  { field: "cost", direction: "desc" },
  1,  // page
  25, // pageSize
);
// result.items, result.total, result.totalPages
```

### Search
```typescript
const found = faService.registry.search("server");
```

### Available Sub-Services
| Service | Methods |
|---|---|
| `faService.registry` | CRUD, getByStatus/Category/Department/Custodian, search, getPaginated |
| `faService.acquisition` | CRUD, getByVendor/Type, getPendingApproval, getTotalAcquisitions |
| `faService.capitalization` | CRUD, getPendingCapitalization, getTotalCapitalized |
| `faService.depreciation` | CRUD, getByAsset/Period, getUnposted, calculateMonthlyDepreciation, generateDepreciationSchedule |
| `faService.impairment` | CRUD, getByAsset/Indicator, getTotalImpairmentLoss, getReversals |
| `faService.transfers` | CRUD, getByAsset/Reason/Department, getPendingApproval |
| `faService.maintenance` | CRUD, getByAsset/Type/Priority/Status, getOverdue, getTotalCost, complete |
| `faService.disposals` | CRUD, getByAsset/Type, getTotalProceeds, getTotalGainLoss |
| `faService.revaluation` | CRUD, getByAsset/Type, getTotalSurplus/Loss, getNetRevaluation |
| `faService.leaseReadiness` | get/set, getLeased/FinanceLeases/OperatingLeases, getTotalLeaseLiability |
| `faService.analytics` | Metric CRUD, calculateAggregateMetrics/ExecutiveSummary, generate reports |
| `faService.recommendations` | CRUD, getByType/Priority/Status/Asset, generate recommendations |
| `faService.alerts` | CRUD, getByType/Severity, getUnread/Unresolved, acknowledge, resolve |
| `faService.executiveInsights` | generateInsights |
| `faService.repositories` | findById, findAll, findByField, insert, update, delete |
