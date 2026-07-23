# Executive Cash Overview

## Purpose

The Global Cash Position dashboard is designed for **CFOs, Treasurers, and Controllers** who need instant financial visibility, drill-down trust, and audit-ready clarity.

## Design Principles

| Principle | Implementation |
|---|---|
| **Clarity** | Every section answers one question (total cash, where, who, which currency, which bank) |
| **Confidence** | All data is labeled with timestamp; stale data would be flagged (future-ready) |
| **Speed** | KPI values render first (text), charts render second (visual) |
| **Beauty** | Charcoal surfaces, gold accents, generous whitespace, consistent rhythm |
| **Trust** | Every number has a source (region, entity, institution drill-down) |

## Visual Identity

- **~95% charcoal**: backgrounds, cards, sidebars — `bg-zinc-900/50`, `bg-zinc-800`, `border-white/[0.06]`
- **~4% white/off-white**: text — `text-white`, `text-zinc-300`, `text-zinc-400`
- **~1% gold**: `#c9a84c` for active states, key metrics, closing balances
- **Semantic color**: emerald (positive), red (negative/restricted), amber (warning/idle), blue (treasury/treasury)

## Accessible Design

- All interactive elements have `aria-label`
- All progress bars have `role="progressbar"` with `aria-valuenow/min/max`
- Tab sections use `role="tablist"` and `role="tab"` with `aria-selected`
- Select inputs have `aria-label` matching visible labels
- Color is never the sole differentiator — text labels accompany all indicators

## Responsive Behavior

| Breakpoint | Layout |
|---|---|
| **<640px** | Single column, stacked KPIs, collapsible filters, horizontal scroll for tables |
| **640-1023px** | 2-column grids, inline filters, summary stats in 3-col |
| **1024-1279px** | 3-column grids, full filter bar, expanded tables |
| **1280px+** | Full layout with 5-6 column KPI grid, all sections visible |

## RTL Compatibility

- All layout uses `cn()` utility which supports RTL-safe Tailwind classes
- No hardcoded `left`/`right` directional values
- Flex layouts use `gap` instead of `margin` for directional safety

## Executive Insights

The dashboard surfaces 6 key insights automatically:

1. **Largest Cash Concentration** — identifies the single largest currency exposure
2. **Highest FX Exposure** — flags currencies exceeding policy limits
3. **Most Idle Cash** — quantifies unproductive cash with yield opportunity
4. **Most Restricted Cash** — identifies highest restricted-to-total ratio
5. **Liquidity Warning** — flags lowest-scoring region with remediation
6. **Funding Recommendation** — suggests intercompany funding based on burn rate

## AI Future Metadata

The dashboard is structured for future AI enhancements:

| Feature | Data Source | Future Use |
|---|---|---|
| Cash Prediction | Trend data, historical patterns | ML-based 30-day forecast |
| Cash Optimization | Idle cash, composition | Optimal cash deployment |
| Liquidity Recommendation | Liquidity ratios, buffers | Buffer target adjustment |
| Funding Recommendation | Burn rate, entity positions | Automated funding suggestions |
| Investment Recommendation | Idle cash, yield opportunities | Short-term investment allocation |
| FX Recommendation | Exposure, rate trends | Hedge timing and sizing |

## Export & Print

- **Export**: CSV/Excel via download button (future: wire to export-utils)
- **Print**: Print-optimized layout via CSS `@media print`
- **Refresh**: Manual refresh button (future: auto-polling with WebSocket)

## Navigation

The page is accessible from the treasury section of the main navigation. Component tabs allow CFOs to switch between overview, regions, entities, currencies, institutions, analytics, and alerts without page reloads.
