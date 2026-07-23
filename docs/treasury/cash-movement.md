# Cash Movement Model

## Waterfall Structure

The cash movement timeline visualizes enterprise cash flow as a waterfall chart showing how opening balance transforms into closing balance through inflows and outflows.

```
Opening Balance: $842.75M
  + Customer Collections:   +$185.00M
  - Vendor Payments:         -$98.00M
  - Payroll:                 -$42.50M
  - Taxes:                   -$28.50M
  ± Intercompany:            +$10.00M
  + Funding:                 +$45.00M
  ± Investments:             -$70.00M
  ± FX Conversions:           -$3.00M
  - Fees:                     -$3.20M
= Closing Balance: $837.55M
```

## Movement Categories

| Category | Direction | Typical Frequency |
|---|---|---|
| Customer Collections | Inflow | Daily |
| Vendor Payments | Outflow | Weekly |
| Payroll | Outflow | Bi-weekly/Monthly |
| Taxes | Outflow | Quarterly |
| Intercompany | Both | Weekly |
| Funding | Inflow | As needed |
| Investments | Both | Monthly |
| FX | Both | As needed |
| Fees | Outflow | Monthly |

## Running Balance Calculation

Each step updates the running balance:
```
new_balance = previous_balance + inflow - outflow
```

The waterfall shows cumulative impact of each cash movement category on total enterprise liquidity.

## Treasury Interaction

Cash movement data feeds into:
- **Liquidity Center** (Phase 9B.3): Coverage ratios, runway calculations
- **Cash Position** (Phase 9B.2): Available/restricted balance breakdown
- **Forecasting**: Expected future cash positions
- **Reconciliation**: Matching expected vs actual movements

## Responsive Behavior

- Desktop: Full table with bars, running balance column
- Tablet: Condensed table, bars hidden
- Mobile: Simplified list view with net change only
