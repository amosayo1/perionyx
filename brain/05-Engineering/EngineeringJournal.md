# Engineering Journal

A chronological record of engineering work — what was built, what was decided, and what was learned during each phase.

---

## Phase 21A.2 — AP Application Layer

**Date**: July 21, 2026
**Duration**: ~2 hours
**Files Created**: 13 TypeScript files (~5,934 lines)

### What Was Built
- 7 application services with 51 command handlers
- In-process typed domain event bus (63 events)
- Unit of Work pattern via Prisma interactive transactions
- CommandResult type with events + audit entries
- 22 repository files (already existed from prior session)

### Key Technical Decisions
1. CQRS: Commands return CommandResult<T> with events and audit entries
2. Events: In-process typed function calls, not message queue
3. UoW: Prisma $transaction wraps all DB writes, events published post-commit
4. Financial precision: Prisma.Decimal at domain boundary, number at repository boundary

### Challenges
- Decimal type import from @prisma/client (use Prisma.Decimal, not direct import)
- Ensuring all 51 commands follow consistent patterns
- State machine validation inline (no separate state machine class)

### Metrics
- 51 commands implemented
- 63 domain events typed
- 7 application services
- 0 TypeScript errors
- 0 business logic in repositories
