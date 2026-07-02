# ADR-012: Simulation Engine

**Status**: Ratified  
**Date**: June 2025  
**Author**: Architecture Team  

## Context

The sandbox needs to demonstrate different business scenarios — treasury surges, compliance breaches, audit readiness, liquidity crises, and connector failures. Each scenario transforms the base seed data to highlight specific platform capabilities.

## Decision

Build a **scenario-based simulation engine** with:

- **Scenario definitions**: TypeScript types defining scenario structure, actions, and events
- **Orchestration**: Sequential and parallel action execution with timing
- **Timeline**: Event scheduling with relative timestamps
- **Domain adapters**: Specific handlers for creating transactions, alerts, incidents, and audit events
- **5 initial scenarios**: Treasury Surge, Compliance Breach, Audit Readiness, Liquidity Crisis, Connector Failure

### Technical Design
- Scenarios are defined in `src/modules/sandbox/scenario/`
- Each scenario is a structured object with `actions[]` that execute in sequence
- Domain adapters translate scenario actions into database operations
- Scenarios are applied on top of existing sandbox data (not replacing it)

## Consequences

- **Positive**: Demonstrates platform capabilities in realistic contexts
- **Positive**: Extensible — new scenarios can be added without code changes to the engine
- **Positive**: Scenarios are repeatable and testable
- **Negative**: Scenarios modify sandbox data — reset required to return to baseline
- **Negative**: Scenario results depend on current sandbox state (ordering matters)

## Alternatives Considered

1. **Static demo data per scenario**: Rejected — data duplication, maintenance overhead
2. **Scripted UI walkthroughs**: Rejected — not interactive, limited demonstration depth
3. **No scenarios (flat demo data)**: Rejected — insufficient to demonstrate platform depth
