# ADR-025: Domain-Driven Modular Architecture

**Status**: Ratified
**Date**: July 2026
**Author**: Architecture Team

## Context

The platform spans 11 business domains (Treasury, Ledger, Banking, Risk, Governance, Intelligence, Integrations, Workflow, Notifications, IAM, Platform Experience). Each domain has distinct business logic, data models, and lifecycle. Without clear domain boundaries, the codebase becomes tightly coupled, difficult to test, and impossible to develop in parallel.

## Decision

Organize the codebase into **56 independent business modules** within `src/modules/`, each with explicit domain boundaries, service facades, and shared infrastructure patterns.

### Module Structure

Each module follows a consistent structure:

```
src/modules/<domain>/
├── <domain>.service.ts   # Public facade — single entry point
├── types.ts              # Domain types and interfaces
├── index.ts              # Barrel export
├── sub-module/           # Internal sub-modules
│   ├── types.ts
│   └── ...
└── __tests__/            # Unit tests
```

### Module Inventory (56 Total)

| Domain | Modules | Key Files |
|--------|---------|-----------|
| **Automation Studio** (11) | business-rules-builder, approval-matrix-evaluator, automation-scheduler, workflow-analytics, template-library, automation-registry, automation-studio.service, enterprise-readiness, onboarding, condition-evaluator, types | `src/modules/automation-studio/` |
| **Intelligence Platform** (14) | anomaly-detection, cash-forecasting, recommendation-engine, trend-engine, explain-engine, kpi-framework, scorecard-service, intelligence.service, (6 engine files) | `src/modules/intelligence-platform/` |
| **Notifications** (3) | notifications.service, delivery, templates | `src/modules/notifications/` |
| **Queue** (3) | queue.service, job-types, job handlers | `src/modules/queue/` |
| **CRM** (3) | types, service, seed | `src/modules/crm/` |
| **Onboarding** (10) | onboarding-state-machine, setup-registry, validators, validators, company-setup, organization-structure, steps (base, integrations, governance, ai) | `src/modules/onboarding/` |

*Note: Ledger, Treasury, Risk, Reporting, and other core financial modules live in their respective src/modules/ subdirectories following the same pattern.*

### Cross-Module Communication

Modules communicate through service facades, never directly accessing each other's internals:

```typescript
// Correct: Facade-to-facade
class AutomationStudioService {
  constructor(
    private workflowEngine: WorkflowEngine,
    private governanceService: GovernanceService,
  ) {}

  async evaluateRule(rule: BusinessRuleDefinition): Promise<void> {
    const healthScore = await this.governanceService.getMetrics();
    // ...
  }
}

// Incorrect: Direct module access
// governanceService.getMetrics() should not access intelligence-platform internals
```

### Integration Points

| Integration | Interface | Module |
|-------------|-----------|--------|
| WorkflowEngine | `WorkflowEngine.getInstance()` | Orchestration |
| GovernanceService | `getMetrics()`, `getViolations()` | Governance |
| DecisionService | `getTopDecisions()`, `evaluateAll()` | Intelligence |
| ConnectorPlatform | `ConnectorLifecycle.validate()`, `healthCheck()` | Integrations |
| AI Platform | `aiProviderRegistry.getActiveProviders()` | AI |
| Queue Service | `enqueue()`, `scheduleCron()`, `unscheduleCron()` | Queue |

## Alternatives Considered

1. **Monolithic single-file architecture**: Rejected — impossible to parallelize development; coupling makes testing fragile
2. **Microservices per domain**: Rejected — operational complexity for 56 services is unsustainable; network calls add latency for dashboards that aggregate across domains
3. **Shared-nothing modules**: Rejected — impossible for modules like Ledger that need Treasury and Risk context

## Consequences

- **Positive**: Clear domain boundaries enable parallel development
- **Positive**: Modules can be tested in isolation
- **Positive**: Cross-module integration points are explicitly documented and versioned
- **Positive**: New domains can be added without modifying existing modules
- **Negative**: Facade boilerplate for cross-module communication
- **Negative**: Some modules inevitably develop intimate knowledge of others (mitigated by code review)
- **Negative**: Module boundaries may shift as domain understanding evolves

## Future Considerations

- Extract high-traffic modules into separate deployment units if load demands
- Event bus for fully decoupled cross-module communication (see ADR-030)
- Module versioning for API stability
