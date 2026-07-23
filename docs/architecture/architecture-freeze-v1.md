# Architecture Freeze v1.0 — Perionyx Platform Core

## Effective Date

2026-07-09

## Freeze Declaration

The following architectural components are declared **frozen** as of Perionyx Platform Core v1.0. Future work must **extend** — not redesign — these components unless a Major Version Change is approved by architecture review board.

## Frozen Components

### Repository Pattern ✅
- Generic Repository (`IRepository<T>`)
- Base Repository with CRUD operations
- Repository Registry pattern
- All repository adapters (Memory, PostgreSQL, MySQL, SQLite)
- **Rule**: New data access must implement existing `IRepository<T>` interface

### Unit of Work ✅
- `UnitOfWork` interface and implementation
- Transaction scope management
- **Rule**: All multi-repository operations must use the Unit of Work pattern

### Transaction Management ✅
- `TransactionManager` interface
- Begin/commit/rollback semantics
- Nested transaction support
- **Rule**: Transaction boundaries must respect existing abstraction

### Persistence Layer ✅
- `src/server/persistence/` directory structure
- Domain type definitions
- Migration framework
- Schema versioning
- Health monitoring
- **Rule**: No new persistence providers without architecture review

### Prisma Schema ✅
- Projection schema (`prisma/schema.prisma`)
- All 100 models
- Enum definitions
- Relation mappings
- **Rule**: Schema additions must use existing naming conventions and patterns

### Provider Abstraction ✅
- `ICacheProvider` interface (Memory + Redis)
- `ILockManager` interface (Memory + Redis)
- `IQueue` / `IQueueManager` interfaces
- **Rule**: New infrastructure providers must implement existing interfaces

### Treasury Architecture ✅
- Treasury service layer
- Treasury repository layer (Prisma + InMemory)
- Cash position, liquidity, forecast models
- FX exposure, counterparty risk models
- **Rule**: Treasury extensions must use existing service/repository pattern

### Banking Architecture ✅
- Banking domain models
- Transaction processing
- Reconciliation framework
- **Rule**: Banking extensions must respect existing domain boundaries

### Design System ✅
- Charcoal surfaces ~95%
- Typography ~4% white/off-white
- Gold accents ~1%
- Component naming conventions
- **Rule**: New components must follow existing design tokens

### Folder Structure ✅
- `src/app/(shell)/` for page routes
- `src/components/` for UI components
- `src/modules/` for business logic
- `src/server/` for infrastructure
- **Rule**: New features must follow established directory conventions

### Coding Standards ✅
- TypeScript strict mode
- Barrel exports
- Shared error handling (`handleRouteError`, `zodErrorResponse`)
- **Rule**: All new code must pass `pnpm typecheck`

### Naming Conventions ✅
- PascalCase for components and classes
- camelCase for functions and variables
- kebab-case for files
- `.service.ts` for services
- `.test.ts` for tests
- **Rule**: All new files must follow naming conventions

### Accessibility Standards ✅
- WCAG 2.1 AA compliance
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatibility
- **Rule**: All new UI must pass accessibility review

### Documentation Standards ✅
- Markdown in `docs/` directory
- AGENTS.md for architecture decisions
- Inline documentation for complex logic
- **Rule**: New features require documentation

### Domain Boundaries ✅
```
┌─────────────────────────────────────────────┐
│  Treasury          │  Banking              │
│  ─────────         │  ─────────            │
│  Cash Position     │  Accounts             │
│  Liquidity         │  Transactions         │
│  Forecast          │  Reconciliation       │
│  FX                │  Payments             │
│  Risk              │                       │
├─────────────────────────────────────────────┤
│  Governance        │  AI Intelligence      │
│  Compliance        │  Workflow             │
│  Audit             │  Automation           │
│  Security          │  Analytics            │
└─────────────────────────────────────────────┘
```
- **Rule**: Cross-domain operations must use service facade pattern

## Change Management

### Minor Version Changes (v1.x)
- New features within frozen architecture
- New Prisma models (no existing model changes)
- New repository implementations
- New service methods
- Documentation updates

### Major Version Changes (v2.0+)
Requires architecture review board approval:
- Repository pattern redesign
- New persistence providers
- Schema restructuring
- Breaking API changes
- Architecture pattern changes

## Review Board

Architecture decisions requiring freeze override must be submitted as an Architecture Decision Record (ADR) to:
- Engineering Lead
- Platform Architect
- Security Officer

## Sign-off

| Role | Name | Date |
|---|---|---|
| Engineering | — | 2026-07-09 |
| Architecture | — | 2026-07-09 |
| Security | — | 2026-07-09 |
