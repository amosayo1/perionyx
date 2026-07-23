# Depreciation Engine

## Supported Methods
| Method | Formula | Use Case |
|---|---|---|
| Straight-Line | (Cost - Salvage) / Useful Life | Most common, predictable expense |
| Double-Declining Balance | 2 × SL Rate × Book Value | Accelerated depreciation |
| Sum-of-Years-Digits | (Remaining Life / SYD) × Depreciable Base | Accelerated, more gradual than DDB |
| Units of Production | (Cost - Salvage) × (Actual Output / Total Estimated Output) | Variable usage assets |
| MACRS | IRS-published tables | US tax depreciation |

## Calculation Flow
1. Determine capitalized cost (purchase + transportation + installation + other)
2. Subtract salvage value
3. Divide by useful life (or apply accelerated method)
4. Generate monthly depreciation entries
5. Post to General Ledger via journal entry

## Schedule Generation
The depreciation engine generates a complete amortization schedule at capitalization:
- Period-by-period entries
- Accumulated depreciation after each period
- Net book value after each period
- GL posting status tracking
- Year-to-date and life-to-date totals

## Mid-Period Convention
- Assets capitalized mid-month: half-month depreciation in first period
- Disposals mid-month: no depreciation in disposal month (or half depending on policy)
- Fully depreciated assets: no further entries, remain in register at NBV = salvage

## Integration with Financial Close
- Depreciation run is a standard close task
- Depreciation entries are reviewed and approved as part of journal review process
- Depreciation variance analysis compares actual vs expected
