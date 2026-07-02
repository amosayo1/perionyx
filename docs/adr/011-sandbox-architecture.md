# ADR-011: Sandbox Architecture

**Status**: Ratified  
**Date**: June 2025  
**Author**: Architecture Team  

## Context

Prospective customers and evaluators need to experience the full platform without needing to integrate with their real financial data. Developers need a reproducible test environment.

## Decision

Create a **single pre-seeded enterprise sandbox tenant** (Atlas Manufacturing Group) with the following characteristics:

- **One-click login**: `POST /api/auth/sandbox-login` creates or accesses the sandbox tenant
- **Programmatic seed data**: `generateEnterpriseData()` creates 1600+ lines of realistic data programmatically
- **Idempotent seeding**: License record serves as sentinel — if it exists, seeding is skipped
- **No data isolation**: All sandbox users share the same company (single sandbox tenant)
- **Reset capability**: `/api/v1/sandbox/reset` clears and re-seeds all data

### Seed Data Includes
- 1 company with KYC verification
- 31 employees across 20 departments and 18 offices
- 12 wallets across 4 currencies
- 10+ treasury accounts
- 60+ transactions over 12 months
- Policies, risk alerts, incidents, calendar events, audit logs
- Pre-seeded AI conversations

## Consequences

- **Positive**: Instant evaluation experience — no setup required
- **Positive**: Programmatic seeds are version-controlled and reproducible
- **Positive**: Idempotent seeding handles partial failures gracefully
- **Negative**: Single sandbox tenant — all users share the same data
- **Negative**: Seed data generation takes ~2-3 seconds on first access
- **Negative**: Reset deletes all sandbox data including user-specific changes

## Alternatives Considered

1. **SQL dump**: Rejected — not version-controlled, hard to maintain
2. **Multi-tenant sandbox (per-user company)**: Rejected — operational complexity, database growth
3. **Demo video only**: Rejected — not interactive, insufficient for evaluation
