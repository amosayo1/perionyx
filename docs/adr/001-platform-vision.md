# ADR-001: Platform Vision & Scope

**Status**: Ratified  
**Date**: January 2024  
**Author**: Architecture Team  

## Context

The financial technology landscape is fragmented. Companies use separate tools for treasury management, payment processing, approval workflows, compliance monitoring, risk detection, reconciliation, audit, and reporting. This fragmentation creates integration overhead, data inconsistency, security gaps, and operational inefficiency.

## Decision

Build Perionyx as an **enterprise financial operating system** — a unified platform covering treasury, payments, approvals, governance, reconciliation, audit, risk intelligence, reporting, and AI-powered insights.

### In Scope
- Treasury management (wallets, accounts, transfers)
- Payment processing and transaction lifecycle
- Approval workflows with configurable rules
- Policy engine for financial governance
- Risk detection and incident management
- Reconciliation and exception handling
- Audit trail with tamper evidence
- AI-powered financial intelligence
- Multi-currency support
- Multi-tenant architecture

### Out of Scope
- Consumer banking or personal finance
- Cryptocurrency or blockchain-based assets
- Payment card processing (PCI scope)
- General ledger or ERP (Perionyx feeds into these)
- Tax calculation or filing
- Payroll processing

## Consequences

- **Positive**: Unified data model eliminates integration overhead across financial operations
- **Positive**: Consistent security, audit, and governance across all modules
- **Positive**: AI has complete context across all financial domains
- **Negative**: Higher complexity than single-purpose tools
- **Negative**: Longer initial build time than building a single feature

## Alternatives Considered

1. **Build a payments-only platform**: Rejected — insufficient differentiation in a crowded market
2. **Build an AI-only analytics layer**: Rejected — AI without transactional capabilities cannot take action
3. **Build on an existing ERP**: Rejected — existing ERPs have architectural constraints that limit innovation
