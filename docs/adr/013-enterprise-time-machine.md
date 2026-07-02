# ADR-013: Enterprise Time Machine

**Status**: Ratified  
**Date**: July 2026  
**Author**: Architecture Team  

## Context

Financial systems need to track state changes over time. Understanding what changed, when, and by whom is critical for audit, debugging, and analysis. Traditional approaches (audit logs only) provide event records but not full state snapshots.

## Decision

Implement an **object versioning system** with:

- **Dedicated `ObjectVersion` model**: Stores full state snapshots at each change
- **6 initial entity types**: Transaction, LedgerEntry, TransactionApproval, Policy, RiskIncident, TreasuryAccount
- **Version numbering**: Monotonic per (entityType, entityId), auto-incremented
- **Change types**: CREATE, UPDATE, DELETE
- **Previous version linking**: `previousVersionId` enables chain traversal
- **Field-level diff**: `diffVersions()` computes changes between any two versions
- **UI components**: `VersionHistoryPanel` (timeline) + `StateComparison` (side-by-side diff)

### Design Decisions
- Full snapshots stored as JSON (not deltas) — simpler querying at the cost of storage
- No automatic versioning — services call `recordVersion()` explicitly
- Versions are scoped to companyId for tenant isolation

## Consequences

- **Positive**: Complete state history for audited entities
- **Positive**: Side-by-side diff provides clear visibility into changes
- **Positive**: Full snapshots make querying any historical state trivial
- **Negative**: Storage grows with each version (mitigated by JSON compression)
- **Negative**: Services must explicitly record versions (not automatic)
- **Negative**: Coverage limited to 6 entity types initially

## Alternatives Considered

1. **Audit log only (no snapshots)**: Rejected — reconstructing state from event logs is complex and error-prone
2. **Database triggers for automatic versioning**: Rejected — less control, harder to maintain
3. **Differential storage (deltas only)**: Rejected — query complexity outweighs storage savings
