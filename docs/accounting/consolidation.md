# Consolidation

## Overview

The Consolidation module enables multi-company, multi-entity, multi-currency financial consolidation. It supports full consolidation, equity method, proportionate consolidation, with ownership tracking, minority interest, eliminations, and translation adjustments.

## Consolidation Methods

| Method | Description |
|--------|-------------|
| Full | 100% consolidation with minority interest (ownership > 80%) |
| Equity | Investment recorded at equity method (ownership 20-80%) |
| Proportionate | Proportional consolidation for joint ventures |

## Consolidation Process

1. **Ownership Calculation** — Determine consolidation method based on ownership percentage
2. **Trial Balance Collection** — Collect TB from each entity
3. **Currency Translation** — Convert foreign entity balances to reporting currency
4. **Elimination Entries** — Eliminate intercompany transactions and balances
5. **Minority Interest Calculation** — Calculate minority interest share
6. **Adjustment Entries** — Post consolidation adjustments
7. **Consolidated Statements** — Generate consolidated financial statements

## Elimination Entries

Standard eliminations include:
- Intercompany revenue and expense elimination
- Intercompany receivable/payable elimination
- Intercompany dividend elimination
- Intercompany profit elimination (unrealized)

## Translation Adjustments

For multi-currency consolidations:
- Balance sheet items translated at closing rate
- Income statement items translated at average rate
- Translation gains/losses recorded in Other Comprehensive Income (OCI)
- Cumulative translation adjustment tracked in equity

## Minority Interest

Minority interest (non-controlling interest) is calculated as:
- Share of subsidiary net assets not owned by parent
- Presented separately in consolidated equity
- Share of subsidiary net income allocated to minority

## ConsolidationService

| Method | Description |
|--------|-------------|
| `addConsolidation()` | Create consolidation record |
| `getConsolidation()` | Get by ID |
| `getAllConsolidations()` | List all |
| `getByParent()` | Filter by parent company |
| `getByPeriod()` | Filter by period |
| `getByStatus()` | Filter by status |
