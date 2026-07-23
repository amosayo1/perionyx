# Currency Translation

## Functional vs Presentation Currency
- **Functional currency** — Currency of the primary economic environment where an entity operates
- **Presentation currency** — Currency in which consolidated financial statements are reported
- Entities with different functional and presentation currencies require translation

## Translation Methods
| Method | Application | Rate Source |
|---|---|---|
| Average | Income statement items | Period average rate |
| Closing | Balance sheet monetary items | Period-end spot rate |
| Historical | Non-monetary items (equity, fixed assets) | Rate at transaction date |

## CTA (Cumulative Translation Adjustment)
The CTA represents the exchange difference arising from translating financial statements from functional to presentation currency.

### Calculation
```
CTA = Source Amount × (Closing Rate - Average Rate)
```

For income statement items translated at average rates and balance sheet items at closing rates, the difference accumulates in the CTA reserve within equity.

### CTA Tracking
- Per-translation-run CTA amount tracked on `CurrencyTranslationRun.ctaAmount`
- Aggregate CTA available via `currencyTranslation.getTotalCTA()`
- CTA impacts equity section of consolidated balance sheet

## Multi-Currency Reporting
Entities may report in different functional currencies. The consolidation engine:
1. Translates each entity's functional currency to group presentation currency
2. Applies appropriate translation method per account category
3. Calculates and tracks CTA for each translation run
4. Aggregates translated amounts into consolidated statements

## Rate Management
Historical rates are tracked per account category via `HistoricalRate`:
- `accountCategory` — Identifies which account group the rate applies to
- `rate` — Exchange rate value
- `rateType` — average, closing, or historical
- `effectiveDate` — Date the rate is effective

Translation runs store:
- `averageRate` — Period average rate for income statement items
- `closingRate` — Period-end spot rate for balance sheet items
- `historicalRates` — Array of category-specific historical rates
