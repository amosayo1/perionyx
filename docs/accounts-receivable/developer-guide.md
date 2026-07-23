# Developer Guide

## Getting Started

### Import the Service
```typescript
import { arService } from "@/server/accounts-receivable";
```

### Accessing Data
```typescript
// All customers
const customers = arService.customers.getAll();

// Overdue invoices
const overdue = arService.invoices.getOverdue();

// Active collections
const collections = arService.collections.getAll();

// KPIs
const kpis = arService.analytics.getAllKPIs();

// Executive summary
const summary = arService.getExecutiveSummary();

// Aggregate metrics
const metrics = arService.getAggregateMetrics();
```

### Adding Data
```typescript
arService.invoices.add(newInvoice);
arService.receipts.add(newReceipt);
arService.collections.add(newCollection);
```

### Creating Pages
Pages are server components that import `arService`, fetch data, and render components:
```typescript
import { arService } from "../../../server/accounts-receivable";
import { PageContainer } from "../../../components/enterprise/page-container";
import { MyComponent } from "../../../components/accounts-receivable/my-component";

export default function MyPage() {
  const data = arService.myService.getAll();
  return (
    <PageContainer>
      <EnterprisePageHeader title="My Page" />
      <MyComponent data={data} />
    </PageContainer>
  );
}
```

### Available Sub-Services
| Service | Methods |
|---|---|
| `arService.customers` | CRUD, search, filter by status/type/risk |
| `arService.invoices` | CRUD, getOverdue, getByStatus, getAgingSummary |
| `arService.receipts` | CRUD, getUnapplied, filter by payment method |
| `arService.cashApplication` | CRUD, autoMatch, addAllocation |
| `arService.collections` | CRUD, addActivity, escalate, recordPromiseToPay |
| `arService.credit` | CRUD, addReview, calculateRiskScore |
| `arService.disputes` | CRUD, resolve, assign |
| `arService.adjustments` | CRUD, approve, reject |
| `arService.writeOffs` | CRUD, approve, reject, recordRecovery |
| `arService.statements` | CRUD, generateStatement |
| `arService.analytics` | KPIs, calculateAggregateMetrics, calculateExecutiveSummary |
| `arService.forecasting` | CRUD, generateForecast, generatePaymentProjections |
| `arService.recommendations` | CRUD, generateCollectionRecommendations |
| `arService.alerts` | CRUD, acknowledge, resolve, generateAlerts |
| `arService.reporting` | generateAgingReport, generateDSOReport, generateCEIReport |
| `arService.glIntegration` | Generate journal entries for accounting events |
| `arService.treasuryIntegration` | Calculate cash position impact, liquidity forecasts |
| `arService.taxIntegration` | Tax calculation, reporting, compliance validation |
