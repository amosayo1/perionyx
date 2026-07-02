# ADR-008: Treasury Architecture

**Status**: Ratified  
**Date**: April 2024  
**Author**: Architecture Team  

## Context

Treasury management involves managing bank accounts, tracking balances, moving money between accounts, and enforcing controls. The treasury subsystem must integrate with external banking systems while maintaining accurate internal records.

## Decision

Model treasury with **two distinct entity types**:

- **TreasuryAccount**: Represents an external bank account with routing info, Plaid integration, and account controls
- **Wallet**: Internal accounting construct for balance tracking within the platform

Key design decisions:
- Treasury accounts can be linked to bank accounts via Plaid for automated balance syncing
- Treasury accounts have controls (spending limits, velocity limits, block rules)
- Internal transfers between treasury accounts have their own status lifecycle
- Wallets are used for internal accounting; treasury accounts are used for external relationships

## Consequences

- **Positive**: Clear separation between internal accounting and external banking
- **Positive**: Plaid integration automates balance reconciliation
- **Positive**: Account controls enforce spending policies at the bank account level
- **Negative**: Two entity models add conceptual complexity
- **Negative**: Balance may differ between Plaid-reported and internal values (reconciliation handles this)

## Alternatives Considered

1. **Single entity model**: Rejected — conflates internal accounting with external banking
2. **No Plaid integration**: Rejected — manual balance entry is error-prone for enterprises
3. **Treasury accounts as wallets**: Rejected — wallets have different semantics (no negative balances, different lifecycle)
