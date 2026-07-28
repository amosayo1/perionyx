# EDP 21B.2 — Enterprise AP Seed Data System

## Decision: Deterministic Seed Data for Enterprise AP

### Context
Phase 21B.2 requires comprehensive seed data to demonstrate the full AP workflow in the investor pitch demo. Without realistic data, dashboards show zeros, reports are empty, and workflows have nothing to operate on.

### Decision
Build a deterministic seed data system with 10 generators producing ~28,000 records across all AP aggregates, using a mulberry32 PRNG for reproducibility.

### Alternatives Considered

1. **Manual SQL inserts** — Fast for small data but not reproducible, hard to maintain, no type safety
2. **Faker.js with random seed** — Good randomness but not deterministic, different results each run
3. **Deterministic generators with mulberry32** (chosen) — Reproducible, type-safe, auditable, zero external dependencies
4. **Copy production data** — Realistic but violates privacy, hard to anonymize, non-deterministic

### Trade-offs

| Factor | Chosen (Deterministic Generators) | Faker.js | Manual SQL |
|--------|-----------------------------------|----------|------------|
| Reproducibility | ✅ Identical every run | ❌ Random | ❌ Random |
| Type safety | ✅ Full TypeScript | ✅ Partial | ❌ None |
| Maintenance | ✅ Generator functions | ✅ Good | ❌ Schema drift |
| Realism | ⚠️ Pattern-based | ✅ Better names/text | ⚠️ Manual |
| Performance | ✅ Batch inserts | ✅ Good | ❌ Slow |
| Dependencies | ✅ Zero | ❌ +1 package | ✅ None |

### Consequences
- Seed data is identical across environments (dev, staging, demo)
- PRNG seeds per generator prevent correlation between entity types
- `skipDuplicates` + count thresholds make re-runs safe
- Deterministic UUIDs from seed strings enable cross-run ID stability

### Risk Mitigation
- Each generator has its own seed range to avoid correlation
- Orchestrator queries DB between steps to collect actual IDs
- Individual create calls catch P2002 (unique constraint) errors
- Count thresholds prevent duplicate generation on re-run

## Files Created/Modified

| File | Lines | Purpose |
|------|-------|---------|
| `seed-utils.ts` | 149 | PRNG, UUID, date/string/number helpers |
| `vendor-generator.ts` | 433 | ~150 vendors with bank details, performance |
| `invoice-generator.ts` | 440 | 3,500 invoices with line items, duplicates |
| `approval-generator.ts` | 218 | 600+ approvals with delegation/escalation |
| `exception-generator.ts` | 250 | 350+ exceptions with SLA tracking |
| `payment-generator.ts` | 315 | 250 proposals + 120 batches + 650 records |
| `credit-generator.ts` | 100 | 130 credits with lifecycle states |
| `reconciliation-generator.ts` | 160 | 40 statements with lines and results |
| `audit-generator.ts` | 215 | 22K+ audit records |
| `ap-seed.ts` | 170 | Orchestrator with dependency ordering |

### Total: ~2,450 lines of seed generation code
