---
id: bank-reconciliation
title: Bank Reconciliation
sidebar_label: Bank Reconciliation
description: Comprehensive account reconciliation — bank, ledger, intercompany, account, and suspense reconciliation with exception handling and approval workflow.
---

# Bank Reconciliation

## Overview

The Reconciliation module provides comprehensive account reconciliation capabilities supporting bank reconciliation, ledger reconciliation, intercompany reconciliation, account reconciliation, and suspense account management.

## Reconciliation Types

| Type | Description |
|------|-------------|
| Bank | Match bank statements against general ledger cash accounts |
| Ledger | Verify sub-ledger balances match general ledger control accounts |
| Intercompany | Confirm intercompany balances match between entities |
| Account | General account balance verification |
| Suspense | Clear and resolve suspense account items |

## Reconciliation Process

1. **Statement Import** — Record statement balance and date
2. **Balance Compare** — Compare statement balance to ledger balance
3. **Item Matching** — Match individual transactions (deposits, withdrawals, fees, adjustments)
4. **Discrepancy Resolution** — Identify and resolve unmatched items
5. **Exception Handling** — Flag significant discrepancies for review
6. **Approval** — Review and approve completed reconciliation

## Reconciliation Engine (`reconciliation-engine.ts`)

The reconciliation engine matches ledger entries to external statements (bank statements, payment processor reports):

- Matches ledger entries to external transactions by reference ID, amount, and date
- Flags unmatched entries for investigation
- Supports partial reconciliation (multi-match)
- Produces reconciliation reports for audit

## Reconciliation Statuses

- **In Progress** — Reconciliation in process
- **Completed** — All items matched and balanced
- **Exception** — Significant discrepancy flagged
- **Approved** — Reviewed and signed off

## Exception Handling

Items are classified by source:
- Statement items not in ledger (uncleared deposits, bank fees)
- Ledger items not on statement (outstanding checks, deposits in transit)
- Amount discrepancies between sources

## ReconciliationService

| Method | Description |
|--------|-------------|
| `addReconciliation()` | Create a reconciliation record |
| `getReconciliation()` | Get by ID |
| `getAllReconciliations()` | List all |
| `getByAccount()` | Filter by account |
| `getByPeriod()` | Filter by period |
| `getByStatus()` | Filter by status |
| `getExceptions()` | Get all exception reconciliations |
