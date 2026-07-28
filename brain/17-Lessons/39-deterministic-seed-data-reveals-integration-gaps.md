# Lesson 39 — Deterministic Seed Data Reveals Integration Gaps

## Context
Phase 21B.2 created 28,000 seed records across 10 AP aggregates. During generation, the seed process itself surfaced 5 bugs in the generators: missing Prisma fields (`bankAccountId`, `timeLimit` as DateTime), invalid enum values (`SEPA`, `SWIFT`), missing function imports (`randFloat`, `randDecimal`), and Prisma type mismatches (`Infinity` in Decimal fields).

## Lesson
Seed data generation is not a throwaway task — it's a **type-level integration test**. When you write generators that must produce valid Prisma creates, every schema constraint, enum value, relation, and field type is exercised at scale. Bugs that slip past TypeScript's type checker (via `as any` casts) are caught by Prisma's runtime validation.

## Evidence
- `paymentGenerator.ts` used `SEPA`/`SWIFT` — not in `VendorPreferredPaymentMethod` enum
- `approvalGenerator.ts` used `timeLimit: 48` (number) — schema expects `DateTime?`
- `paymentBatch` creation missing `bankAccountId` — required field
- `approvalGenerator.ts` used `Infinity` — not valid for `Decimal(38,12)`
- `vendorGenerator.ts` called `randInt(10, 99)` without `rng` argument

## Principle
**Seed data generators are schema validators.** When writing a new Prisma model, write its seed generator immediately — it will catch every schema inconsistency before any API or UI code touches it.

## Application
- Every new Prisma model gets a seed generator in the same PR
- Generator code uses strict TypeScript (no `as any` in data mapping)
- Orchestrator validates relationships (foreign keys, unique constraints)
- Re-run idempotency is tested by running seed twice
