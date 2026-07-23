# Tax — Workflow Validation

## Workflow Steps

| Step | Status | Module | Evidence |
|---|---|---|---|
| Transaction | ✅ Implemented | Prism `Transaction` model | `test/workflow/06-tax.test.ts:1` |
| Tax Calculation | ✅ Implemented | Posting engine batch posts with VAT split | test step 1 |
| Tax Liability | ✅ Implemented | Dedicated tax wallet tracks liability | test step 2 |
| Payment | ✅ Implemented | Tax → Ops transfer for payment to authority | test step 3 |
| Compliance | ⚠️ Wallet-based tracking | No dedicated compliance engine | Manual tracking |
| Audit | ✅ Implemented | Ledger entries for all tax transactions | test step 4 |

## Validated Properties

- **VAT splitting**: Posting engine handles net + VAT split (test step 1)
- **Liability tracking**: Tax wallet accumulates VAT across transactions (test step 2)
- **Tax payment**: Liability cleared to zero on payment (test step 3)
- **Balanced entries**: All tax transactions pass balance check (test step 4)

## Gaps

- No dedicated `Tax` Prisma model or service
- No jurisdiction-specific tax calculation engine
- No VAT return generation
- No withholding tax automation

## Key Files

- `test/workflow/06-tax.test.ts` — 4 validation tests
