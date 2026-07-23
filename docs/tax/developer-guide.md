# Tax Module Developer Guide

## Module Structure

```
src/server/tax/
  index.ts                              -- Barrel exports, factory
  tax-seed.ts                           -- Deterministic seed data
  services/
    tax-service.ts                      -- Singleton facade composing all 15 domain services
  domain/
    rules/tax-rules-service.ts          -- TaxRuleService
    jurisdictions/jurisdictions-service.ts -- JurisdictionService
    indirect-tax/indirect-tax-service.ts -- IndirectTaxService
    direct-tax/direct-tax-service.ts    -- DirectTaxService
    withholding/withholding-service.ts  -- WithholdingTaxService
    transfer-pricing/tp-service.ts      -- TransferPricingService
    calendar/calendar-service.ts        -- TaxCalendarService
    returns/returns-service.ts          -- TaxReturnService
    payments/payments-service.ts        -- TaxPaymentService
    reconciliation/reconciliation-service.ts -- TaxReconciliationService
    compliance/compliance-service.ts    -- TaxComplianceService
    audit/audit-service.ts              -- TaxAuditService
    analytics/analytics-service.ts      -- TaxAnalyticsService
    forecasting/forecast-service.ts     -- TaxForecastService
  types/index.ts                        -- All Tax domain types
```

## How to Extend the Module

### Adding a New Domain Service

1. **Create the domain service** in `src/server/tax/domain/<name>/<name>-service.ts`:

```typescript
import type { YourEntity } from "../../types";

export class YourService {
  private store = new Map<string, YourEntity>();

  add(entity: YourEntity): YourEntity {
    this.store.set(entity.id, entity);
    return entity;
  }

  getAll(): YourEntity[] {
    return Array.from(this.store.values());
  }

  get(id: string): YourEntity | undefined {
    return this.store.get(id);
  }

  count(): number {
    return this.store.size;
  }
}
```

2. **Add types** to `src/server/tax/types/index.ts`:

```typescript
export interface YourEntity {
  id: string;
  // ... fields
}
```

3. **Register in the facade** in `src/server/tax/services/tax-service.ts`:

```typescript
import { YourService } from "../domain/your/your-service";

export class TaxService {
  your: YourService;

  constructor() {
    // ...
    this.your = new YourService();
  }
}
```

4. **Export from barrel** in `src/server/tax/index.ts`:

```typescript
export { YourService } from "./domain/your/your-service";
```

5. **Add seed data** in `src/server/tax/tax-seed.ts`:

```typescript
function seedYourService(service: YourService) {
  service.add({ id: "your-1", ... });
}
```

### Adding a New Jurisdiction

1. **Add jurisdiction entry** via `JurisdictionService.add()` or seed data:

```typescript
const jurisdiction = taxService.jurisdictions.add({
  id: "us-ca",
  code: "US-CA",
  name: "California",
  level: "state",
  parentId: "us",           // Parent country
  currency: "USD",
  timezone: "America/Los_Angeles",
  taxYearStart: "01-01",
  filingFrequency: "annual",
  defaultLanguage: "en",
  active: true,
  effectiveFrom: "2024-01-01",
  effectiveTo: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

2. **Add tax numbers** for your legal entities in that jurisdiction:

```typescript
taxService.jurisdictions.addTaxNumber({
  jurisdictionId: "us-ca",
  entityId: "entity-1",
  taxType: "sales-tax",
  number: "CA-123456789",
  type: "ein",
  status: "active",
  // ...
});
```

3. **Add tax rules** for the jurisdiction:

```typescript
taxService.rules.add({
  jurisdictionId: "us-ca",
  taxType: "sales-tax",
  rate: 7.25,              // CA base rate
  rateType: "standard",
  effectiveFrom: "2024-01-01",
  effectiveTo: null,
  conditions: [],
  // ...
});
```

### Adding a New Tax Type

1. **Add the tax type** to the `TaxType` union type in `types/index.ts`:

```typescript
export type TaxType = "vat" | "gst" | "sales-tax" | "cit" | "wht"
  | "property-tax" | "payroll-tax" | "customs" | "excise"
  | "digital-services-tax" | "your-new-tax-type";
```

2. **Add tax rules** for the new type across relevant jurisdictions.

3. **Update domain services** that need to handle the new tax type (likely `TaxRuleService` for rate resolution, `TaxComplianceService` for compliance scoring).

4. **Add UI components** for the new tax type if it needs a dedicated view.

### Creating Custom Tax Rules

Tax rules support conditions for targeted application:

```typescript
taxService.rules.add({
  jurisdictionId: "uk",
  taxType: "vat",
  rate: 5.0,                // Reduced rate
  rateType: "reduced",
  effectiveFrom: "2024-01-01",
  effectiveTo: null,
  conditions: [
    {
      field: "productCategory",
      operator: "in",
      value: ["children-clothing", "car-seats", "baby-products"],
    },
    {
      field: "transactionType",
      operator: "eq",
      value: "sale",
    },
  ],
  // ...
});
```

Condition operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `between`

Available condition fields:
- `productCategory` - Product/service category code
- `transactionType` - Type of transaction (sale, purchase, import, export)
- `amountThreshold` - Transaction amount threshold
- `partyType` - Counterparty type (business, consumer, government)
- `customerVatStatus` - Customer VAT registration status
- `importOrigin` - Country of origin for imports

### Adding a New Page Route

1. **Create directory** and `page.tsx` in `src/app/(shell)/tax/<name>/`:

```typescript
import { taxService } from "../../../../server/tax";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { YourComponent } from "../../../../components/tax/your-component";

export default function YourPage() {
  const data = taxService.your.getAll();
  return (
    <PageContainer>
      <EnterprisePageHeader title="Your Page" description="..." />
      <div className="mt-6">
        <YourComponent data={data} />
      </div>
    </PageContainer>
  );
}
```

2. **Add navigation entry** in `src/components/navigation/nav-config.ts`:

```typescript
{ href: "/tax/your-page", label: "Your Page", icon: YourIcon, permission: "tax.view", minRole: "MEMBER" },
```

## Integration Patterns

### Consuming Data from Other Modules

Tax is a consuming-only module. Read data from other modules via their service facades:

```typescript
// Read from Accounting
const accounts = accountingService.getAccounts();

// Read from O2C
const invoices = orderToCashService.billing.getAllInvoices();

// Read from Treasury
const cashPosition = treasuryService.getCashPosition();

// Read from FP&A
const forecasts = fpAndAService.getForecasts();
```

### Providing Data to Other Modules

Tax data is consumed by:

```typescript
// AI Platform
const kpis = taxService.analytics.getAllKPIs();
const alerts = taxService.analytics.getActiveAlerts();

// Audit
const events = taxService.audit.getEvents({ dateRange });
```

### Service Method Naming Convention

| Pattern | Example | When to Use |
|---------|---------|-------------|
| `getAll*()` | `getAllReturns()` | Return all entities |
| `getBy*(filter)` | `getByJurisdiction(jurisdictionId)` | Filtered query |
| `get(id)` | `get(returnId)` | Single entity lookup |
| `add(entity)` | `add(returnData)` | Create new entity |
| `update(id, data)` | `update(returnId, changes)` | Modify existing entity |
| `delete(id)` | `delete(returnId)` | Soft delete / deactivate |
| `count()` | `count()` | Entity count |

## Testing

### Service Tests

```typescript
import { taxService } from "@/server/tax";

// Service tests
const rules = taxService.rules.getAll();
expect(rules.length).toBeGreaterThan(0);

// Rate resolution test
const rate = taxService.rules.getEffectiveRate({
  jurisdictionId: "uk",
  taxType: "vat",
  date: "2026-01-15",
});
expect(rate).toBe(20.0);
```

### Calculation Tests

```typescript
// Indirect tax calculation
const result = taxService.indirectTax.calculateTax({
  lines: [
    { netAmount: 1000, productCategory: "electronics" },
  ],
  jurisdictionId: "uk",
  taxType: "vat",
  date: "2026-01-15",
});
expect(result.totalTaxAmount).toBe(200.0); // 20% VAT
```

### Page Rendering Tests

```typescript
// Component tests with vitest + testing-library
import { render, screen } from "@testing-library/react";
import { TaxDashboard } from "@/components/tax/tax-dashboard";

test("renders tax dashboard KPIs", () => {
  render(<TaxDashboard data={mockData} />);
  expect(screen.getByText("Global ETR")).toBeInTheDocument();
});
```

## Error Handling

Follow the platform's error handling patterns via `handleRouteError()` and `zodErrorResponse()` from `src/server/http/handle-route.ts`:

```typescript
import { handleRouteError } from "@/server/http/handle-route";

try {
  const result = taxService.indirectTax.calculateTax(input);
  return Response.json(result);
} catch (error) {
  return handleRouteError(error);
}
```

## Conventions

- **Server components**: Pages are server components that call service methods synchronously.
- **Client components**: All UI components are `"use client"` with the `"use client"` directive.
- **Types**: Re-export server types via `tax-types.ts` for component use.
- **Styling**: Dark theme (bg-[#1a1a1a], border-gray-800), charcoal surfaces, Tailwind CSS.
- **Icons**: Use lucide-react icons consistently.
- **Data flow**: Server -> Client props, no client-side data fetching.
- **No external chart libraries**: All charts are custom SVG.

## Migration to Database

When migrating from in-memory stores to Prisma:

1. Define Prisma models matching the domain types.
2. Create repository interfaces in `src/server/tax/repositories/`.
3. Implement Prisma repositories following the pattern in `src/server/persistence/`.
4. Update domain services to use repositories instead of in-memory Maps.
5. Add migration scripts and seed data.

See `docs/persistence/` and `docs/architecture/architecture-freeze-v1.md` for guidance.

## Performance Considerations

| Scenario | Guidance |
|----------|----------|
| Rate resolution (single) | O(log n) with B-tree index on (jurisdiction, date range) |
| Rate resolution (batch) | Cache results, LRU with 1000 entries, 5-minute TTL |
| Transaction processing | Line-level calculation, batch where possible |
| Report generation | Pre-compute aggregates, avoid real-time calculation |
| Audit queries | Use indexed queries by event type, entity, date range |
| Large jurisdiction sets | Lazy-load child jurisdictions, cache hierarchy |
| Cross-currency conversion | Cache exchange rates per date |
