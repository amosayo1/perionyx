# General Ledger — Workflow Validation

## Workflow Steps

| Step | Status | Module | Evidence |
|---|---|---|---|
| Journal Creation | ✅ Implemented | `LedgerService.recordTransfer()` + `PostingEngine` | `test/workflow/04-general-ledger.test.ts:4` |
| Approval | ✅ Implemented | `ApprovalWorkflowEngine` | `src/modules/ledger/approval-workflow.ts` |
| Posting | ✅ Implemented | `PostingEngine.postBatch()` | test step 7 |
| Trial Balance | ✅ Implemented | `PostingEngine.computeWalletBalance()` | test step 8 |
| Period Close | ✅ Verified | Wallet reconciliation + no orphans | `test/workflow/07-financial-close.test.ts` |

## Validated Properties

- **Debits equal credits**: Core assertion validated (test step 1)
- **Minimum two entries**: Single-entry rejected (test step 2)
- **Positive amounts**: Negative amounts rejected (test step 3)
- **Posting validation**: `PostingEngine.validateBatch()` checks all rules (test steps 5, 6)
- **Batch posting**: Balances update correctly after post (test step 7)
- **Computed vs stored**: `computeWalletBalance()` matches stored (test step 8)
- **Multi-currency**: Cross-currency transfers work (test step 9)
- **Audit trail**: Every entry linked to transaction + wallet (test step 10)

## Key Files

- `src/modules/ledger/ledger.service.ts` — `recordTransfer()`, `assertBalancedLedger()`
- `src/modules/ledger/posting-engine.ts` — `postBatch()`, `validateBatch()`, `computeWalletBalance()`
- `test/workflow/04-general-ledger.test.ts` — 10 validation tests
