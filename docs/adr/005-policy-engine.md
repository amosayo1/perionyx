# ADR-005: Policy Engine

**Status**: Ratified  
**Date**: March 2024  
**Author**: Architecture Team  

## Context

Enterprises need configurable rules to govern financial operations. Rules must be evaluated at transaction time and can result in blocking, flagging, requiring approval, or generating notifications.

## Decision

Implement a **declarative policy engine** with the following characteristics:

- **Evaluation timing**: Policies are evaluated during transaction creation, before ledger posting
- **Match strategy**: First-match-wins, ordered by priority (lower number = higher priority)
- **Policy types**: APPROVAL, TRANSACTION_LIMIT, COMPLIANCE, RISK, CUSTOM
- **Actions**: BLOCK (prevent transaction), FLAG (create risk alert), REQUIRE_APPROVAL (route to approval workflow), NOTIFY (send notification)
- **Rules**: Field + operator + value conditions with optional negation
- **Testing**: Dry-run evaluation via `/api/v1/policies/test`

## Consequences

- **Positive**: Flexible governance — rules can be changed without code changes
- **Positive**: Dry-run testing allows safe policy experimentation
- **Positive**: Policies are stored in the database and auditable
- **Negative**: Policy evaluation adds latency to transaction creation
- **Negative**: First-match-wins means policy ordering is critical
- **Negative**: Complex policies may be harder to debug

## Alternatives Considered

1. **Hardcoded rules in service code**: Rejected — not configurable by administrators
2. **Open Policy Agent (OPA)**: Considered but rejected — additional infrastructure dependency
3. **All-matches (not first-match)**: Rejected — conflicting policy results would be ambiguous
