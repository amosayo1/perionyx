# Failure Scenarios — Validation

## Simulated Failures

| Scenario | Result | Recovery | Evidence |
|---|---|---|---|
| Unbalanced journal | ❌ Rejected | `assertBalancedLedger()` throws | `test/workflow/09-failure-scenarios.test.ts:1` |
| Single-entry journal | ❌ Rejected | Validation error | test step 2 |
| Negative amounts | ❌ Rejected | Validation error | test step 3 |
| Transfer to same wallet | ❌ Rejected | Error thrown, balance unchanged | test step 4 |
| Duplicate transaction | ✅ Handled | Idempotency via unique key | test step 5 |
| Zero-amount posting | ❌ Rejected | `validateBatch()` returns errors | test step 6 |
| Approval rejection | ✅ Handled | Engine returns requirements | test step 7 |
| Failed operation integrity | ✅ Maintained | Balance unchanged after error | test step 8 |
| Duplicate sequence | ❌ Rejected | Validation error | test step 9 |
| Permission denied | ✅ Handled | Route-level RBAC enforced | Phase 11X.4 |

## Key Findings

- **No silent data corruption**: Every failure path either throws or returns validation errors
- **Balance integrity preserved**: Failed operations do not modify wallet balances
- **Idempotency**: Duplicate prevention exists via key-based lookup
- **Validation before mutation**: Posting engine validates entire batch before any writes

## Key Files

- `test/workflow/09-failure-scenarios.test.ts` — 10 failure scenario tests
