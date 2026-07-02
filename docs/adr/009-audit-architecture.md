# ADR-009: Audit Architecture

**Status**: Ratified  
**Date**: May 2024  
**Author**: Architecture Team  

## Context

Enterprise financial software must maintain a complete, tamper-evident audit trail of all state changes. Auditors, regulators, and internal compliance teams rely on this trail.

## Decision

Implement a **comprehensive audit logging system** with:

- **AuditLog model**: Records every significant state change with actor, action, resource type/id, severity, metadata, and timestamp
- **Payload hashing**: Optional `payloadHash` field stores a hash of the action's metadata for tamper evidence
- **Severity classification**: INFO (routine operations), WARNING (unusual but not failure), CRITICAL (security or integrity events)
- **Coverage**: All authentication events, authorization decisions, financial state changes, configuration changes, and user management operations
- **Queryability**: Full search and filtering by company, actor, action, resource type, date range, and severity

## Consequences

- **Positive**: Complete audit trail suitable for regulatory compliance
- **Positive**: Payload hashing provides tamper-evident properties
- **Positive**: Severity classification enables focused review of critical events
- **Negative**: Audit log grows large over time (retention policies and archiving needed)
- **Negative**: No blockchain-style chaining yet (planned improvement)

## Alternatives Considered

1. **Immutable database (Amazon QLDB)**: Rejected — vendor lock-in, additional infrastructure
2. **Blockchain-based audit**: Rejected — overengineering, performance overhead
3. **Database triggers for audit**: Rejected — less flexible than application-level logging
