# ADR-027: Workflow Orchestration Engine

**Status**: Ratified
**Date**: July 2026
**Author**: Architecture Team

## Context

Enterprise financial operations require automated workflows: approval routing, conditional branching, notification triggers, scheduled reconciliations, and multi-step processes that span modules. These workflows must be configurable by finance managers (not engineers), auditable, and support both synchronous and asynchronous step execution.

## Decision

Build a **workflow orchestration engine** with sequential step execution, event-driven triggers, and module integration via step executors.

### Architecture

```typescript
class WorkflowEngine {
  // Singleton shared across modules
  static getInstance(): WorkflowEngine;
  
  // Lifecycle
  async instantiate(workflow: WorkflowDefinition, context: WorkflowContext): Promise<WorkflowRun>;
  async executeStep(runId: string, stepIndex: number): Promise<StepResult>;
  async complete(runId: string): Promise<WorkflowResult>;
  
  // Query
  async getMetrics(): Promise<WorkflowMetrics>;
}
```

### Trigger Types

All 12 trigger types supported by `AutomationScheduler`:

| Type | Description | Source |
|------|-------------|--------|
| `manual` | User-initiated | UI button |
| `event` | Module event emitted | Internal event bus |
| `cron` | Scheduled time | Cron expression |
| `webhook` | External HTTP call | API endpoint |
| `transaction` | Transaction created/updated | Ledger module |
| `approval` | Approval status change | Approval engine |
| `reconciliation` | Reconciliation status | Reconciliation module |
| `risk_alert` | Risk threshold breach | Risk engine |
| `schedule` | Calendar date | Schedule module |
| `condition` | Conditional trigger | Condition evaluator |
| `batch` | Batch processing time | Queue system |
| `notification` | Notification event | Notifications module |

### Step Executors

Each workflow step is executed by a dedicated executor:

```typescript
interface IStepExecutor {
  type: StepType;
  execute(context: ExecutionContext, config: StepConfig): Promise<StepResult>;
}

// Available executors:
// - ConditionStepExecutor (branching)
// - ApprovalStepExecutor (approval routing)
// - ActionStepExecutor (module action)
// - NotificationStepExecutor (send notification)
// - DelayStepExecutor (wait and resume)
// - WebhookStepExecutor (call external API)
```

### Step Types

| Step | Executor | Behavior |
|------|----------|----------|
| **Condition** | `ConditionEvaluator` | Evaluate condition group → route to next step |
| **Approval** | `ApprovalStepExecutor` | Route to approver via approval matrix |
| **Action** | `ActionStepExecutor` | Call module API (create journal, sync data, etc.) |
| **Notification** | `NotificationStepExecutor` | Send email, Slack, in-app notification |
| **Delay** | `DelayStepExecutor` | Wait N minutes/hours, then resume |
| **Webhook** | `WebhookStepExecutor` | Call external HTTP endpoint |

### Business Rules Integration

The `BusinessRulesBuilder` defines condition groups evaluated by the shared `ConditionEvaluator`:

```typescript
interface BusinessRuleDefinition {
  id: string;
  name: string;
  conditions: ConditionGroup; // AND/OR groups of conditions
  actions: RuleAction[];      // Actions to execute when conditions match
  priority: number;
  enabled: boolean;
}
```

The shared `OPERATOR_MAP` in `condition-evaluator.ts` is the single source of truth for all condition evaluation across business rules, approval matrix, and workflow conditions.

### Approval Matrix Integration

The `ApprovalMatrixEvaluator` determines the approval path:

```typescript
interface ApprovalMatrixRule {
  id: string;
  role: string;
  department?: string;
  threshold?: number; // Amount threshold
  minApprovers: number;
  escalationTimeout?: number; // Hours before escalation
  parallel: boolean; // Parallel or sequential approval
}
```

## Alternatives Considered

1. **Temporal.io**: Rejected — operational complexity of running Temporal Server; over-engineered for current workflow volume
2. **BullMQ + custom engine**: Rejected — queue-only, no built-in step orchestration, branching, or condition evaluation
3. **n8n / Zapier**: Rejected — cannot meet financial audit requirements; no tenant isolation

## Consequences

- **Positive**: Configurable workflows empower finance managers without engineering
- **Positive**: Shared condition evaluator ensures consistent rule evaluation across the platform
- **Positive**: Step executors are isolated and testable independently
- **Positive**: Approval matrix integration provides enterprise-grade routing with escalation
- **Negative**: Sequential execution limits throughput for long-running workflows
- **Negative**: Complex branching logic can make workflow debugging difficult
- **Negative**: Workflow state stored in-memory (ephemeral) — DB persistence planned

## Future Considerations

- Parallel step execution for fork-join patterns
- Workflow versioning for in-flight vs. new runs
- Visual workflow canvas for non-technical configuration
- Workflow analytics for bottleneck identification
