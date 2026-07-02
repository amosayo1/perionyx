# ADR-004: Double-Entry Ledger

**Status**: Ratified  
**Date**: February 2024  
**Author**: Architecture Team  

## Context

All financial transactions must be recorded in a way that maintains accounting integrity. The system must support auditing, reconciliation, and balance verification.

## Decision

Implement a **traditional double-entry ledger** with DEBIT and CREDIT entries. Every transaction produces at least two ledger entries that sum to zero. Wallet balances are computed from ledger entries and cached with optimistic locking.

### Key Design Points
- `LedgerEntry` has side (DEBIT/CREDIT), amount (positive Decimal), currency, and sequence
- Wallet balance is a cached value updated optimistically (version field)
- No negative balances allowed for STANDARD wallets
- Ledger entries are immutable once created
- Wallet updates use optimistic locking (compare-and-swap on version)

## Consequences

- **Positive**: Auditable, verifiable accounting — every transaction balances
- **Positive**: Familiar to accountants and auditors
- **Positive**: Wallet version field prevents concurrent overwrites
- **Negative**: Optimistic locking means transactions can fail under high concurrency (retry logic required)
- **Negative**: Balance queries must sum ledger entries for absolute accuracy (cached balance may lag)
- **Negative**: More complex transaction creation code

## Alternatives Considered

1. **Event sourcing**: Rejected — overengineering for current requirements, query complexity
2. **Single-entry (balance tracking only)**: Rejected — no audit trail, not suitable for financial software
3. **Materialized ledger with periodic snapshots**: Considered for future performance optimization
