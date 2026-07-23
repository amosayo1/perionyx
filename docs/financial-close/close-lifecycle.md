# Close Lifecycle

## Close Types
- **Month-End Close** — Monthly financial close (standard)
- **Quarter-End Close** — Quarterly close with additional reporting
- **Year-End Close** — Annual close with audit, tax, and statutory reporting
- **Soft Close** — Internal management close before hard close
- **Hard Close** — Final period close with all adjustments posted
- **Reopen Period** — Controlled period reopening for corrections

## Period States
```
notStarted → inProgress → review → approved → locked → archived
                                  ↑                    ↓
                              reopened ←────────────────
```

## Key Phases
1. **Pre-Close** (days -5 to -1)
   - Subledger close (AR, AP, inventory)
   - Bank reconciliations
   - Accrual calculations
   - Prepaid amortization

2. **Core Close** (days 0 to +3)
   - Intercompany reconciliations
   - FX revaluation
   - Consolidation entries
   - Tax provisions

3. **Review** (days +3 to +5)
   - Variance analysis
   - Journal review and approval
   - Balance sheet reviews
   - P&L review

4. **Finalization** (days +5 to +7)
   - Financial statement preparation
   - Management review
   - External reporting
   - Period lock

## Close Calendar
- Fixed deadlines for each close phase
- Recurring events per period
- Meeting schedules for reviews
- Approval deadlines
