# ADR-021: PostgreSQL as Primary Database

**Status**: Ratified
**Date**: July 2026
**Author**: Architecture Team

## Context

The platform requires a relational database that supports complex financial transactions (double-entry ledger), JSON flexibility for connector configurations and policy rules, multi-tenant data isolation, and enterprise-grade reliability. The database must handle append-only ledger tables with high write throughput, support for complex joins across treasury/risk/reporting modules, and provide a mature ecosystem for hosted/managed deployments.

## Decision

Use **PostgreSQL** as the primary database.

### Rationale

| Factor | Assessment |
|--------|------------|
| **Relational integrity** | ACID compliance, foreign keys, check constraints — critical for double-entry ledger |
| **JSONB support** | Flexible schema for connector configs, report templates, policy rules |
| **Maturity** | 30+ years, largest open-source relational database ecosystem |
| **Hosted options** | AWS RDS, Aurora, GCP Cloud SQL, Azure Database for PostgreSQL, Supabase |
| **Indexing** | B-tree, GiST, GIN, BRIN — supports the 18 performance indexes applied |
| **Extensions** | pgcrypto (encryption), pg_stat_statements (query monitoring) |
| **Replication** | Streaming replication for future read replicas |
| **Ecosystem** | Prisma, pgBoss (queue), pgvector (future AI embeddings) |
| **Community** | Largest open-source relational database community |

### PostgreSQL Version

- **Deployed**: PostgreSQL 16 (primary) per `docker-compose.yml`
- **Alpine image**: `postgres:16-alpine` for development

## Alternatives Considered

1. **MySQL 8**: Rejected — weaker JSONB support, less mature replication, no pgBoss equivalent
2. **CockroachDB**: Rejected — operational complexity exceeds benefits for current single-region deployment; reconsider for multi-region
3. **SQLite**: Used for development and test ephemeral instances, not production
4. **MongoDB**: Rejected — document store lacks relational integrity required for double-entry ledger; no transaction isolation across collections
5. **PlanetScale (Vitess)**: Rejected — incompatible with Prisma's foreign key constraints and relation-based query generation

## Consequences

- **Positive**: Strong ACID guarantees for financial transactions
- **Positive**: JSONB provides schema flexibility where needed
- **Positive**: Mature ecosystem with excellent Prisma support
- **Positive**: PostgreSQL 16 brings performance improvements for parallel queries and vacuuming
- **Negative**: Vertical scaling ceiling — future read replicas and sharding required for hyper-growth
- **Negative**: Connection pool management required for serverless edge (mitigated by PgBouncer via Prisma connection pool)

## Future Considerations

- Read replicas for GET endpoint offloading
- Schema-based sharding by companyId for multi-region deployments
- TimescaleDB extension for time-series financial data
- pgvector extension for AI embedding similarity search
