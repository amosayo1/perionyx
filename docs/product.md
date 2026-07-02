# Perionyx — Product

## What Perionyx is

Perionyx is a **multi-tenant treasury and financial operations infrastructure platform**. It provides the core primitives required to build and operate a ledger-backed wallet system: wallets, double-entry accounting, transaction processing, and an investigation-ready audit trail.

Perionyx is designed to feel like institutional fintech software: calm, operationally clear, and oriented around correctness and traceability.

## Who it is for

- **SaaS platforms** that need embedded balances, internal credits, transfers, and a verifiable ledger
- **Fintech and marketplace teams** building money movement infrastructure with multi-tenant requirements
- **Business operations and finance teams** who need visibility into transaction activity, exceptions, and an audit trail

## Core use cases

- **Embedded wallet infrastructure**: maintain per-company wallets and balances across currencies
- **Double-entry ledger operations**: investigate debits/credits and validate balancing per transaction
- **Operational money movement**: issue wallet credits and move funds internally between wallets
- **Compliance and incident response**: review an audit trail of security-sensitive and mutating events
- **Multi-tenant SaaS operations**: run the same system across many companies with strict isolation

## System overview (high level)

Perionyx is organized around four system layers:

- **Identity and tenancy**: authentication plus an active company context that scopes all reads/writes
- **Wallets**: company-scoped accounts with balances and currency
- **Transactions + ledger**: each transaction posts a set of ledger lines (DEBIT/CREDIT) that must balance
- **Audit logs**: event records that capture action, severity, actor, resource context, and metadata for investigations

## Value proposition

- **Ledger-backed correctness**: operational balances are derived from a double-entry ledger model.
- **Multi-tenant by design**: tenant isolation is a first-class constraint, not an afterthought.
- **Investigation-ready**: transactions, ledger lines, and audit events are presented in workflows designed for operators.
- **Production-oriented foundations**: clear lifecycle states, idempotent operations, and consistent validation patterns.

