# O2C Developer Guide

## How to Extend the Module

### Adding a New Domain Service

1. **Create the domain service** in `src/server/order-to-cash/domain/<name>/<name>-service.ts`:
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

2. **Add types** to `src/server/order-to-cash/types/index.ts`:
```typescript
export interface YourEntity {
  id: string;
  // ... fields
}
```

3. **Register in the facade** in `src/server/order-to-cash/services/order-to-cash-service.ts`:
```typescript
import { YourService } from "../domain/your/your-service";

export class OrderToCashService {
  your: YourService;

  constructor() {
    // ...
    this.your = new YourService();
  }
}
```

4. **Export from barrel** in `src/server/order-to-cash/index.ts`:
```typescript
export { YourService } from "./domain/your/your-service";
```

5. **Add seed data** in `src/server/order-to-cash/order-to-cash-seed.ts`:
```typescript
function seedYourService(service: YourService) {
  service.add({ id: "your-1", ... });
}
```

### Adding a New Page Route

1. **Create directory** and `page.tsx` in `src/app/(shell)/order-to-cash/<name>/`:
```typescript
import { orderToCashService } from "../../../../server/order-to-cash";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";

export default function YourPage() {
  const data = orderToCashService.your.getAll();
  return (
    <PageContainer>
      <EnterprisePageHeader title="Your Page" description="..." />
      <div className="mt-6">{/* Your component */}</div>
    </PageContainer>
  );
}
```

2. **Add navigation entry** in `src/components/navigation/nav-config.ts`:
```typescript
{ href: "/order-to-cash/your-page", label: "Your Page", icon: YourIcon, permission: "ordertocash.view", minRole: "MEMBER" },
```

### Adding a New Component

1. **Create component** in `src/components/order-to-cash/`:
```typescript
"use client";

interface YourComponentProps {
  data: YourEntity[];
}

export function YourComponent({ data }: YourComponentProps) {
  return (/* JSX */);
}
```

2. **Add to barrel** if needed (components are imported directly by pages)

### Adding a New Chart

1. Create chart component in `src/components/order-to-cash/` following the pattern of existing charts (custom SVG, no external chart libraries)
2. Interface should accept typed data via props
3. Use Tailwind styling consistent with the platform's dark theme

### Adding KPIs

1. Add KPI data via `O2CAnalyticsService.addKPI()` with proper category, unit, and trend
2. KPIs are displayed by page components using `FPAKPICard` or custom components
3. See [KPIs](./kpis.md) for the complete KPI reference

### Adding Alerts

1. Create alerts via `O2CAnalyticsService.addAlert()` with severity, type, title, and message
2. Alerts appear in `AlertsPanel` components across pages
3. Alerts can be dismissed via `dismissAlert(id)`

### Adding Recommendations

1. Create recommendations via `O2CAnalyticsService.addRecommendation()` with type, title, description, impact, and confidence
2. Recommendations appear in `RecommendationsPanel` components
3. Can be marked implemented via `implementRecommendation(id)`

### Testing

```typescript
import { orderToCashService } from "@/server/order-to-cash";

// Service tests
const customers = orderToCashService.customers.getAllCustomers();
expect(customers.length).toBeGreaterThan(0);

// Page rendering
// Use vitest + testing-library for component tests
```

### Conventions

- **Server components**: Pages are server components that call service methods synchronously
- **Client components**: All UI components are `"use client"` with `"use client"` directive
- **Types**: Re-export server types via `o2c-types.ts` for component use
- **Styling**: Dark theme (bg-[#1a1a1a], border-gray-800), charcoal surfaces, Tailwind CSS
- **Icons**: Use lucide-react icons consistently
- **Data flow**: Server → Client props, no client-side data fetching
- **No external chart libraries**: All charts are custom SVG

### Migration to Database

When migrating from in-memory stores to Prisma:
1. Define Prisma models matching the domain types
2. Create repository interfaces in `src/server/order-to-cash/repositories/`
3. Implement Prisma repositories following the pattern in `src/server/persistence/`
4. Update domain services to use repositories instead of in-memory Maps
5. Add migration scripts and seed data

See `docs/persistence/` and `docs/architecture/architecture-freeze-v1.md` for guidance.
