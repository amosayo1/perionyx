# ADR-006: Approval Engine

**Status**: Ratified  
**Date**: March 2024  
**Author**: Architecture Team  

## Context

Enterprise financial transactions often require approval from one or more people before execution. Approval requirements vary by transaction amount, type, currency, and other factors.

## Decision

Implement a **configurable approval workflow engine** with:

- **Approval rules**: Defined with priority, scope (GLOBAL, WALLET, TRANSACTION_TYPE, CONNECTOR_TYPE), amount thresholds
- **Approval steps**: Ordered chains with role requirements and approver counts
- **Approval modes**: Sequential (each step in order), dual (two concurrent approvals), parallel (any of N)
- **Escalation**: Timeout-based escalation to higher authorities
- **Conditions**: Field-level rules for when approvals apply
- **Per-transaction records**: `TransactionApproval` tracks each approval action

## Consequences

- **Positive**: Flexible approval workflows adaptable to any enterprise structure
- **Positive**: Escalation prevents stalled transactions
- **Positive**: Complete audit trail of approval actions
- **Negative**: Complex rule matching for each transaction
- **Negative**: Approval delays can block transaction processing

## Alternatives Considered

1. **Fixed approval hierarchy**: Rejected — not flexible enough for diverse enterprise structures
2. **External workflow engine (Temporal, Camunda)**: Rejected — additional infrastructure, overengineering for current needs
3. **AI-based approval routing**: Considered but deferred — rule-based is more predictable for financial controls
