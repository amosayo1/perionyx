# Financial Formatting Standard

> Phase 19.0 — Financial Core Consolidation
> Status: **Documentation Only** — no code changes

---

## 1. Current State

The codebase contains **100+ `formatCurrency` implementations** scattered across components, modules, and server services. Most are trivially duplicated — small private functions that format USD with no multi-currency support. This creates:

- **Inconsistent display**: Different decimal places, separators, and negative formatting across pages
- **Fragile maintenance**: Each local copy is independently maintained; a single formatting bug must be fixed in 100+ places
- **No locale awareness**: Almost all implementations hardcode `en-US` formatting
- **Currency blindness**: The majority are USD-only with no fallback for non-USD amounts

---

## 2. Cluster Analysis

### Cluster A — Investment Components (14 files)

**Pattern**: Identical USD-only formatting, 1 decimal place, `toLocaleString` fallback.

```typescript
// Representative implementation (repeated 14 times)
function formatCurrency(value: number): string {
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
}
```

**Affected components**: All investment detail/portfolio views — bucket cards, holding tables, performance charts, allocation breakdowns, restriction badges, maturity timelines.

**Issues**: No currency parameter, 1 decimal only, hardcode USD symbol.

### Cluster B — Financial Planning & Analysis (15 files)

**Pattern**: USD-only `Intl.NumberFormat`, 0 decimal places.

```typescript
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
```

**Affected components**: Budget variance, forecast vs actual, planning scenarios, sensitivity analysis, variance cards, trend indicators, allocation previews.

**Issues**: No currency parameter, 0 decimals truncates sub-dollar amounts.

### Cluster C — Consolidation Components (13 files)

**Pattern**: Identical to Cluster B — USD-only `Intl.NumberFormat`, 0 decimals.

**Affected components**: Intercompany elimination, consolidation journals, entity mapping, currency translation, minority interest, segment reporting, elimination entries.

### Cluster D — Treasury Components (35+ files)

**Pattern**: Mostly USD-only, but **2 files include multi-currency symbol maps**.

```typescript
// The 2 multi-currency outliers
const SYMBOL_MAP: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
```

**Affected components**: Cash position, balance summary, payment scheduling, bank connectivity, FX rates, risk alerts, liquidity dashboards, cash pooling, investment sweep, working capital.

**Issues**: Inconsistent between 33 USD-only and 2 multi-currency. The symbol map approach bypasses `Intl.NumberFormat` and cannot handle currencies with different decimal conventions (e.g., JPY = 0 decimals, BHD = 3 decimals).

### Cluster E — Cash Forecast Components (10 files)

**Pattern**: Identical `formatCash` function across all 10 forecast views.

```typescript
function formatCash(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
```

**Affected components**: 13-week forecast, daily forecast, weekly forecast, scenario comparison, variance analysis, cash flow waterfall, funding requirements, maturity schedule, concentration view, sensitivity chart.

**Issues**: This is essentially a compact formatter, not a currency formatter. Should use a canonical `formatCompact` function.

### Cluster F — Fixed Assets Components (5 files)

**Pattern**: Identical to Cluster B — USD-only `Intl.NumberFormat`, 0 decimals.

**Affected components**: Asset register, depreciation schedule, capital expenditure, asset disposal, impairment tracking.

### Cluster G — Treasury Command Center (6 files)

**Pattern**: Identical `formatCompact` function.

```typescript
function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
```

**Affected components**: Executive summary, cash position overview, risk dashboard, compliance overview, workflow health, alerts panel.

**Issues**: Uses `Intl.NumberFormat` correctly but is a standalone duplicate. No currency symbol prefix, no accounting for negative values in compact notation.

### Cluster H — Server Services (3 files)

**Pattern**: Private `formatCurrency` methods inside service classes.

- `investment-portfolio.service.ts` — private method, USD-only
- `cash-position.service.ts` — private method, USD-only  
- `liquidity-analytics.service.ts` — private method, USD-only

**Issues**: Server-side formatting is unusual (typically APIs return raw numbers, client formats). These should return raw `Decimal` values and let the client format.

### Cluster I — Enterprise Analytics (3 files)

**Pattern**: More duplicates of the same `Intl.NumberFormat` USD pattern.

- `executive-kpi-card.tsx`
- `variance-card.tsx`
- `cash-flow-timeline.tsx`

---

## 3. Canonical API Recommendations

### 3.1 `formatMoney(amount, currency?)`

Full currency formatting using `Intl.NumberFormat`. Default currency USD.

```typescript
function formatMoney(amount: number | string, currency?: string): string
// formatMoney(1234567.89, 'USD') → "$1,234,567.89"
// formatMoney(-1234567.89, 'EUR') → "-€1,234,567.89"
// formatMoney(1234, 'JPY') → "¥1,234"          // JPY = 0 decimals
// formatMoney(1234.5, 'BHD') → "BHD 1,234.500"  // BHD = 3 decimals
```

**Use case**: All currency displays that need exact precision — ledger entries, balances, transaction amounts, payment details.

### 3.2 `formatCompact(amount, currency?)`

Abbreviated format for large numbers.

```typescript
function formatCompact(amount: number | string, currency?: string): string
// formatCompact(1_234_567, 'USD') → "$1.2M"
// formatCompact(34_500, 'USD') → "$34.5K"
// formatCompact(-1_200_000, 'USD') → "-$1.2M"
```

**Use case**: Dashboard KPIs, summary cards, chart axis labels, executive views — anywhere where full precision is visual noise.

### 3.3 `formatPercent(value, decimals?)`

Percentage formatting with optional sign.

```typescript
function formatPercent(value: number, decimals?: number): string
// formatPercent(0.1234) → "12.3%"
// formatPercent(-0.05, 2) → "-5.00%"
// formatPercent(0) → "0.0%"
```

**Use case**: Growth rates, variance percentages, budget utilization, allocation weights.

### 3.4 `formatNumber(value, decimals?)`

Plain number formatting with locale-aware separators.

```typescript
function formatNumber(value: number, decimals?: number): string
// formatNumber(1234567) → "1,234,567"
// formatNumber(1234567.89, 2) → "1,234,567.89"
```

**Use case**: Counts, quantities, ratios, non-monetary numeric displays.

### 3.5 `formatAccounting(amount, currency?)`

Accounting-style formatting — negatives in parentheses.

```typescript
function formatAccounting(amount: number | string, currency?: string): string
// formatAccounting(1234567.89, 'USD') → "$1,234,567.89"
// formatAccounting(-1234567.89, 'USD') → "($1,234,567.89)"
```

**Use case**: Financial statements, GL trial balance, income statements, balance sheets — anywhere auditors expect accounting convention.

---

## 4. Implementation Rules

| Rule | Description |
|------|-------------|
| **Always use `Intl.NumberFormat`** | Never hand-roll number formatting with `toFixed()` or `toLocaleString()` for currency |
| **Never hardcode `$`** | Always accept a currency parameter; default to `USD` only at the call site |
| **Use currency metadata for decimals** | Each currency defines its own decimal places (USD=2, JPY=0, BHD=3) — the formatter must respect this |
| **Server returns raw numbers** | APIs must return `number` or `string` — never pre-formatted currency strings |
| **Client formats for display** | Only React components (or CLI output formatters) should call `formatMoney`/`formatCompact` |
| **Compact is not a currency formatter** | `formatCompact` is for readability, not accounting. Use `formatMoney` for exact amounts |
| **Accounting format is opt-in** | `formatAccounting` is only for financial statements and audit views — not general UI |

---

## 5. Migration Strategy

### Phase 1 — Create Canonical Functions

Create `src/lib/format.ts` with all 5 canonical functions. Each function:
- Accepts `number | string` input (handles Prisma.Decimal serialized strings)
- Uses `Intl.NumberFormat` with BCP 47 locale tag
- Reads decimal places from currency metadata
- Handles negative values correctly (accounting parentheses for `formatAccounting`)
- Is fully typed with TypeScript

### Phase 2 — Migrate Clusters (per cluster)

| Order | Cluster | Files | Effort | Notes |
|-------|---------|-------|--------|-------|
| 1 | H (Server Services) | 3 | Low | Remove private methods; return raw numbers |
| 2 | E (Cash Forecast) | 10 | Low | Replace `formatCash` with `formatCompact` |
| 3 | G (Treasury Command) | 6 | Low | Replace `formatCompact` with canonical |
| 4 | I (Enterprise Analytics) | 3 | Low | Direct replacement |
| 5 | F (Fixed Assets) | 5 | Medium | Add currency parameter to call sites |
| 6 | A (Investment) | 14 | Medium | Add currency parameter, fix decimals |
| 7 | B (FPA) | 15 | Medium | Add currency parameter, fix decimals |
| 8 | C (Consolidation) | 13 | Medium | Add currency parameter, fix decimals |
| 9 | D (Treasury) | 35+ | High | 33 need currency parameter; 2 need symbol map removal |

### Phase 3 — Delete Local Copies

After all clusters are migrated:
- Delete every local `formatCurrency` / `formatCash` / `formatCompact` function
- Grep the codebase to confirm zero remaining local formatting functions
- Add a lint rule or comment convention: "Use `formatMoney` from `@/lib/format`"

### Preserving Useful Functionality

Do **not** simplify by removing useful formatting capabilities:

- **Compact notation** (`$1.2M`, `$3.4K`) — keep; used in dashboards and executive views
- **Accounting parentheses** (`($1,234)`) — keep; required for financial statements
- **Locale-aware formatting** — keep; required for international deployments
- **Currency-specific decimal places** — keep; BHD needs 3 decimals, JPY needs 0
- **Negative sign handling** — keep; different contexts need different sign placement

---

## 6. Related Documents

- `FINANCIAL_PRIMITIVES.md` — Financial primitive definitions
- `FINANCIAL_CONSOLIDATION_PLAN.md` — Full consolidation roadmap
- `docs/design/enterprise-table-system.md` — Table formatting patterns
- `docs/design/enterprise-forms.md` — Form input formatting patterns
