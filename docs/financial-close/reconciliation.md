# Reconciliation

## Types
| Type | Description | Source | Target |
|---|---|---|---|
| Bank Reconciliation | Match bank statements to GL | Bank Statement | GL Cash Account |
| GL Reconciliation | Verify GL balances | GL Account | GL Account (prior period) |
| AR vs GL | Match AR subledger to GL | AR Subledger | GL AR Account |
| AP vs GL | Match AP subledger to GL | AP Subledger | GL AP Account |
| Treasury vs GL | Match treasury records to GL | Treasury System | GL Cash Accounts |
| Tax vs GL | Match tax accounts to GL | Tax Module | GL Tax Accounts |
| Intercompany | Match across entities | Entity A | Entity B |

## Reconciliation Process
1. **Data Collection** — Gather balances from source and target
2. **Matching** — Automatic matching by reference, amount, date
3. **Difference Analysis** — Identify and quantify discrepancies
4. **Adjustment** — Propose and approve correcting entries
5. **Approval** — Reviewed and approved by authorized personnel
6. **Sign-off** — Electronic sign-off with audit trail

## Key Metrics
- Reconciliation rate (% of accounts completed)
- Unmatched items count and value
- Average resolution time
- Adjustment volume and value
