# Development Guide

## Getting Started

```bash
npm run dev       # Next.js dev server (port 3000)
npm run build     # Production build (standalone output)
```

## Database

After modifying `prisma/schema.prisma`:

```bash
npx prisma migrate dev   # Generate + apply migration
npx prisma generate       # Regenerate client
npx prisma studio         # GUI data browser
```

Reset with `npx prisma migrate reset` and seed with `npx prisma db seed`.

## TypeScript

```bash
npx tsc --noEmit    # Type check (also aliased as npm run typecheck)
```

The project uses strict TypeScript. `any` is prohibited except in documented adapter layers.

## Testing

Tests live in `test/` and run with Vitest:

```bash
npm test               # Run all tests
npm test -- --watch    # Watch mode
npm run e2e            # Playwright end-to-end tests
npm run e2e:ui         # Playwright UI mode
```

Unit/integration tests cover services, connectors, ledger, approvals, policies, FX, audit, and more. E2e tests live in `e2e/`.

## Creating a New Module

1. Create `src/modules/<name>/`
2. Add service file(s) with domain logic
3. Add types file for public types
4. Add `index.ts` barrel exporting the public API
5. Register API routes in `src/app/api/` if client components need them

Modules communicate through typed function calls. Keep circular dependencies in check by importing only through the barrel.

## Linting

```bash
npm run lint    # ESLint
```

Lint-staged runs `eslint --fix` and `tsc --noEmit` on staged files.
