# Accounting Integration

## Journal Entry Generation

### Asset Acquisition
```
Dr. Asset (capitalized cost)
    Cr. Vendor Liability / Cash
```

### Capitalization
```
Dr. Asset-in-Service
    Cr. Asset-under-Construction (if applicable)
```

### Monthly Depreciation
```
Dr. Depreciation Expense
    Cr. Accumulated Depreciation
```

### Impairment
```
Dr. Impairment Loss (P&L)
    Cr. Accumulated Impairment / Asset
```

### Revaluation (Upward)
```
Dr. Asset
    Cr. Revaluation Surplus (OCI)
```

### Revaluation (Downward)
```
Dr. Revaluation Loss (P&L)
    Cr. Asset
```

### Disposal
```
Dr. Cash / Receivable (proceeds)
Dr. Accumulated Depreciation
Dr./Cr. Gain/Loss on Disposal
    Cr. Asset (original cost)
```

### Retirement
```
Dr. Accumulated Depreciation
Dr. Loss on Retirement
    Cr. Asset (original cost)
```

## GL Account Mapping
| Event | Debit Account | Credit Account |
|---|---|---|
| Acquisition | Fixed Asset by Category | Vendor Payable / Cash |
| Depreciation | Depreciation Expense | Accumulated Depreciation |
| Impairment | Impairment Loss | Accumulated Impairment |
| Upward Revaluation | Fixed Asset | Revaluation Surplus |
| Downward Revaluation | Revaluation Loss | Fixed Asset |
| Disposal Gain | Accumulated Depreciation | Fixed Asset, Gain on Disposal |
| Disposal Loss | Accumulated Depreciation, Loss on Disposal | Fixed Asset |

## Financial Close Integration
- Depreciation entries are generated as part of the close process
- Asset subledger reconciliation against GL balances
- Capital expenditure vs budget reporting
- Asset aging for financial statement disclosures
