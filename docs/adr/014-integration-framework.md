# ADR-014: Integration Framework

**Status**: Draft  
**Date**: March 2025  
**Author**: Architecture Team  

## Context

Enterprises use many financial tools — banks, ERPs, accounting software, payment processors. Perionyx must integrate with these systems to provide a unified financial operations platform.

## Decision

Build a **connector abstraction** with:

- **ConnectorConfig**: Typed configuration per integration (type, credentials, endpoints)
- **ConnectorRun**: Execution lifecycle with input/output tracking
- **ConnectorEvent**: Structured event logging (INFO/WARNING/ERROR/DEBUG)
- **Webhook delivery**: Event-triggered outbound notifications
- **Plaid as reference integration**: First-class support for bank account linking and balance syncing

### Connector Lifecycle
```
CONFIGURE → TEST → ACTIVATE → RUN (recurring/triggered) → MONITOR → DEACTIVATE
```

## Consequences

- **Positive**: Consistent integration pattern across all external systems
- **Positive**: Plaid integration provides real-world reference implementation
- **Positive**: Webhook delivery enables event-driven integrations
- **Negative**: Each connector requires custom adapter code
- **Negative**: Connector failures require monitoring and alerting

## Alternatives Considered

1. **No formal integration framework**: Rejected — ad-hoc integrations are not scalable
2. **iPaaS (Integration Platform as a Service)**: Considered but rejected — additional cost, vendor lock-in
3. **GraphQL for integrations**: Rejected — REST is more universal for third-party integrations
