# Developer Guide

## Getting Started

The Accounting module is a bounded context within the Perionyx Platform Core. It follows the same patterns and conventions as other enterprise modules (treasury, investments, risk, CRM).

## Directory Structure

```
src/server/accounting/          — Server-side domain logic
src/components/accounting/      — UI components
src/app/(shell)/accounting/     — Page routes
docs/accounting/                — Documentation
```

## Adding a New Account Type

1. Add the type to the union in `src/server/accounting/types/index.ts`:
```typescript
export type AccountType = "asset" | "liability" | ... | "new-type";
```

2. Add sample accounts in `src/server/accounting/accounting-seed.ts`:
```typescript
const newAccounts = [
  { code: "NEW0", name: "New Category", class: "current-asset", parentCode: "1000" },
];
```

3. The chart-of-accounts service automatically picks up the new type.

## Adding a New Domain Service

1. Create the file in `src/server/accounting/domain/`:
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

2. Export from `src/server/accounting/index.ts`

3. Add to the facade in `src/server/accounting/services/accounting-service.ts`

## Adding a New Component

1. Create in `src/components/accounting/`:
```typescript
"use client";
import type { Entity } from "./accounting-types";

interface Props { items: Entity[]; }
export function NewComponent({ items }: Props) {
  return <div>...</div>;
}
```

2. Use in a page at `src/app/(shell)/accounting/your-section/page.tsx`

## Adding a New Page

1. Create directory `src/app/(shell)/accounting/your-section/`
2. Create `page.tsx`:
```typescript
import { accountingService } from "../../../../server/accounting";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";

export default function YourSectionPage() {
  const data = accountingService.someService.getAll();
  return (
    <PageContainer>
      <EnterprisePageHeader title="Your Section" description="Description" />
      <div className="mt-6">...</div>
    </PageContainer>
  );
}
```

3. Register in navigation at `src/components/navigation/nav-config.ts`

## Testing

The module is designed for testability:
- Pure domain services with in-memory stores
- Deterministic seed data
- All services instantiated independently
- No database, no external dependencies

Run tests:
```bash
pnpm test -- --testPathPattern=accounting
```

## Type Checking

Ensure zero TypeScript errors:
```bash
pnpm typecheck
```

## Building

```bash
pnpm build
```

## Conventions

- **File naming**: kebab-case for files, PascalCase for components/classes, camelCase for methods/variables
- **Types**: String literal unions, not enums
- **Services**: Class-based with in-memory Map store
- **Facade**: Singleton with public property composition
- **Components**: Client components with `"use client"`
- **Pages**: Server components with async data fetching
- **Exports**: Barrel re-export from `index.ts`
