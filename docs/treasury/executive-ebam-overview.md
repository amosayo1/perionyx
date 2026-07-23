# Executive eBAM Overview

## Purpose

The executive eBAM overview provides CFOs, Treasurers, Controllers, and Compliance Officers with immediate visibility into enterprise bank account governance, relationship health, and compliance status.

## Key Questions Answered

1. **What accounts do we own?** — Complete registry with ownership, lifecycle, and status
2. **Who can authorize transactions?** — Signatory registry with authorities and limits
3. **Which mandates are valid?** — Mandate tracking with expiry monitoring
4. **What KYC is required?** — Document tracking with renewal cycles
5. **Which accounts need attention?** — Compliance issues, dormant accounts, expiring items
6. **Who are our banking partners?** — Relationship profiles with scores and reviews
7. **What is our compliance posture?** — Issues by category with severity tracking

## Executive Insights

The `ExecutiveBankAccountInsights` component surfaces 10 key observations:

| Insight | What It Tells |
|---|---|
| Largest Banking Partner | Bank with highest total balance |
| Highest Dormancy | Entity/region with most dormant accounts |
| Most Accounts by Region | Geographic concentration |
| Highest Compliance Risk | Entity with most compliance issues |
| Lowest Relationship Score | Bank with weakest relationship |
| Largest Currency Concentration | Currency with highest balance concentration |
| Most Active Entity | Entity managing most accounts |
| Biggest Consolidation Opportunity | Dormant/duplicate accounts to close |

## AI Recommendations

35 AI-generated recommendations (mock intelligence) across categories:
- **Close dormant accounts** — Reduce fees and simplify
- **Merge duplicate accounts** — Consolidate banking structure
- **Renew mandates** — Maintain authorization validity
- **Complete KYC** — Ensure regulatory compliance
- **Reduce banking relationships** — Optimize banking panel
- **Increase account controls** — Strengthen governance
- **Consolidate currencies** — Reduce FX complexity
- **Transfer balances** — Optimize liquidity distribution
- **Improve signatory coverage** — Ensure business continuity
- **Reduce compliance risk** — Address governance gaps

## Executive Actions

- **Refresh**: Update dashboard data
- **Export**: Download registry or report
- **Print**: Print-friendly view
- **Open Account**: Initiate new account request

## Accessibility

- All KPIs use `aria-label` for screen readers
- Severity indicated by both color and text
- Trend arrows have text equivalents
- Account numbers masked by default with "Reveal" interaction
- Tab panel relationships via `aria-controls`
- WCAG 2.1 AA compliant
