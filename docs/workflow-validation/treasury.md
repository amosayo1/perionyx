# Treasury — Workflow Validation

## Workflow Steps

| Step | Status | Module | Evidence |
|---|---|---|---|
| Cash Position | ✅ Implemented | `TreasuryService.listAccounts()`, `getAccount()` | `test/workflow/03-treasury.test.ts:1` |
| Forecast | ✅ Implemented | `TreasuryService.getLiquiditySummary()` | test step 3 |
| Liquidity Planning | ✅ Implemented | Treasury accounts + `getLiquiditySummary()` | test step 3 |
| Payment | ✅ Implemented | `TreasuryService.transfer()`, `LedgerService` | test step 2 |
| Bank Account | ✅ Implemented | Treasury account model | `prisma/schema.prisma:1075` |
| FX | ✅ Implemented | Multi-currency account support | test step 4 |
| Investment | ✅ Implemented | Treasury transfer between accounts | test step 2 |
| Reconciliation | ✅ Implemented | `ReconciliationService.initiateRun()` | `src/modules/reconciliation/` |
| General Ledger | ✅ Implemented | `LedgerService.recordTransfer()` | test step 5 |

## Validated Properties

- **Account creation**: Multi-currency accounts created correctly (test step 1)
- **Deposit/Transfer**: Balance updates are accurate (test step 2)
- **Liquidity summary**: Aggregates positions (test step 3)
- **FX exposure**: Multi-currency tracked (test step 4)
- **Journal integrity**: Treasury → GL postings are balanced (test step 5)

## Key Files

- `src/modules/treasury/treasury.service.ts` — Account management, transfers, deposits
- `test/workflow/03-treasury.test.ts` — 6 validation tests
