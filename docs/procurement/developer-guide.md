# Developer Guide

## Getting Started

The Procurement module is a bounded context within the Perionyx Platform Core. It follows the same patterns and conventions as other enterprise modules (accounting, treasury, investments, risk, CRM).

## Directory Structure

```
src/server/procurement/          — Server-side domain logic
src/components/procurement/      — UI components
src/app/(shell)/procurement/     — Page routes
docs/procurement/                — Documentation
```

## Adding a New Domain Service

1. Create the file in `src/server/procurement/domain/`:

```typescript
import type { NewEntity } from "../types";

export class NewService {
  private store = new Map<string, NewEntity>();

  add(entity: NewEntity): void { this.store.set(entity.id, entity); }
  get(id: string): NewEntity | undefined { return this.store.get(id); }
  getAll(): NewEntity[] { return [...this.store.values()]; }
  count(): number { return this.store.size; }
}
```

2. Export from `src/server/procurement/index.ts`:

```typescript
export { NewService } from "./domain/new-service";
```

3. Add to the facade in `src/server/procurement/services/procurement-service.ts`:

```typescript
import { NewService } from "../domain/new-service";

export class ProcurementService {
  public newService: NewService;
  // ...
  constructor() {
    this.newService = new NewService();
    // ...
  }
}
```

## Adding a New Page

1. Create directory `src/app/(shell)/procurement/your-section/`
2. Create `page.tsx`:

```typescript
import { procurementService } from "../../../../server/procurement";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";

export default function YourSectionPage() {
  const data = procurementService.someService.getAll();
  return (
    <PageContainer>
      <EnterprisePageHeader title="Your Section" description="Description" />
      <div className="mt-6">
        {/* Your component here */}
      </div>
    </PageContainer>
  );
}
```

3. Register in `src/components/navigation/nav-config.ts` under the Procurement section:

```typescript
{ href: "/procurement/your-section", label: "Your Section", icon: SomeIcon, permission: "procurement.view", minRole: "MEMBER" },
```

4. Create the corresponding component in `src/components/procurement/`

## Adding a New Type or Status

1. Add the type to the union in `src/server/procurement/types/index.ts`:

```typescript
export type NewStatus = "value1" | "value2";
```

2. Add sample data in `src/server/procurement/procurement-seed.ts`
3. The corresponding service will automatically support the new type

## Working with Seed Data

Seed data is generated deterministically in `procurement-seed.ts`. To regenerate:

```typescript
import { procurementService } from "../server/procurement";
import { seedProcurementData } from "../server/procurement";

seedProcurementData(procurementService);
```

Current seed counts:
- 800 vendors (150+ names, 5 companies)
- 1,500 purchase requests (10 departments, 12 categories)
- 1,200 purchase orders (5 types, full fulfillment tracking)
- 700 receipts (goods + services)
- 900 invoices (2-way and 3-way matching)
- 200 approval requests (multi-level routing)
- 500 payments (multiple methods)
- 350 contracts (8 types)
- 400 catalog items
- 300 spend analytics records
- 16 KPIs, 300 forecasts
- 200 alerts, 300 recommendations

## Conventions

- All domain services use in-memory `Map<string, Entity>` stores
- Status types use string literal unions, not TypeScript enums
- Pages are Server Components fetching data from the service facade
- All data flows through `ProcurementService` singleton
- UI components are Client Components in `src/components/procurement/`

## Testing

- Unit tests should test domain services in isolation
- Integration tests should test page data flow through `ProcurementService`
- Mock factory patterns follow the existing testing framework in `src/testing/`
