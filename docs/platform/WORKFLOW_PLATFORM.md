# Workflow Platform

**Platform**: WorkflowPlatform
**Contract**: `WorkflowContract`
**Mission**: Orchestrate business processes through state-machine-driven workflow execution with durable step instances, version snapshotting, real-time event emission, and approval integration.
**Status**: Partially Built
**Constitutional Authority**: PLATFORM_CONSTITUTION.md

---

## Responsibilities

1. **Workflow Definition Management** — CRUD for workflow definitions with versioning, activation, and deprecation lifecycle.
2. **Workflow Execution** — Execute workflow instances through a deterministic step pipeline with dependency resolution, parallel branching, and error handling.
3. **State Machine Enforcement** — Validate all status transitions against a defined state machine. No illegal transitions permitted.
4. **Step Orchestration** — Execute 11 step types via a pluggable step registry: approval, decision, policy_evaluation, notification, delay, conditional, connector_execution, ai_recommendation, human_task, report_generation, webhook, custom.
5. **Approval Integration** — Handle approval steps with role-based authorization, escalation, delegation, and history recording.
6. **Real-Time Events** — Emit workflow events (CREATED, STARTED, STEP_COMPLETED, APPROVAL_REQUESTED, etc.) to connected clients via WebSocket.
7. **Version Snapshotting** — Capture workflow definition snapshots before each update for audit trail and rollback capability.
8. **Automation Studio Integration** — Support business rules, approval matrix evaluation, scheduling, and template management.
9. **Metrics & Analytics** — Provide workflow performance metrics (success rate, average duration, bottleneck analysis).
10. **Scheduling** — Support cron-based and one-shot scheduled workflow instances.

---

## Public API (Capability Contract)

```typescript
interface WorkflowContract {
  // ── Definition CRUD ─────────────────────────────────────────
  createDefinition(ctx: TenantContext, input: CreateWorkflowInput): Promise<WorkflowDefinition>;
  getDefinition(ctx: TenantContext, definitionId: string): Promise<WorkflowDefinition | null>;
  listDefinitions(ctx: TenantContext, includeInactive?: boolean): Promise<WorkflowDefinitionSummary[]>;
  updateDefinition(ctx: TenantContext, definitionId: string, input: UpdateWorkflowInput): Promise<WorkflowDefinition>;

  // ── Instance Lifecycle ──────────────────────────────────────
  createInstance(ctx: TenantContext, definitionId: string, input?: Record<string, unknown>, options?: InstanceOptions): Promise<WorkflowInstance>;
  startInstance(ctx: TenantContext, instanceId: string): Promise<InstanceStartResult>;
  resumeInstance(ctx: TenantContext, instanceId: string, input?: Record<string, unknown>): Promise<InstanceStartResult>;
  cancelInstance(ctx: TenantContext, instanceId: string, reason?: string): Promise<InstanceCancelResult>;
  pauseInstance(ctx: TenantContext, instanceId: string): Promise<InstancePauseResult>;
  scheduleInstance(ctx: TenantContext, definitionId: string, input?: Record<string, unknown>, scheduledFor?: string): Promise<ScheduleResult>;

  // ── Instance Queries ────────────────────────────────────────
  getInstance(ctx: TenantContext, instanceId: string): Promise<WorkflowInstanceDetail | null>;
  listInstances(ctx: TenantContext, opts?: InstanceListOptions): Promise<WorkflowInstanceSummary[]>;
  getMetrics(ctx: TenantContext): Promise<WorkflowMetricsSummary>;
  getInstanceEvents(ctx: TenantContext, instanceId: string, limit?: number): Promise<WorkflowEvent[]>;

  // ── Approval & Task Response ────────────────────────────────
  respondToApproval(ctx: TenantContext, instanceId: string, stepId: string, approved: boolean, response?: string): Promise<ApprovalResult>;
  respondToTask(ctx: TenantContext, instanceId: string, stepId: string, input: Record<string, unknown>): Promise<TaskResult>;
}
```

### Key Types

```typescript
type WorkflowStatus = "PENDING" | "VALIDATED" | "RUNNING" | "WAITING" | "PAUSED" | "COMPLETED" | "FAILED" | "CANCELLED" | "ARCHIVED";

type StepType = "approval" | "decision" | "policy_evaluation" | "notification" | "delay" | "conditional" | "parallel" | "connector_execution" | "report_generation" | "human_task" | "ai_recommendation" | "webhook" | "custom";

type StepStatus = "PENDING" | "READY" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED" | "WAITING_APPROVAL" | "WAITING_INPUT";

interface StepDefinition {
  id: string;
  type: StepType;
  label: string;
  config?: Record<string, unknown>;
  dependsOn?: string[];
  timeoutMinutes?: number;
  retryCount?: number;
  retryDelayMs?: number;
  condition?: string;
}

interface StepExecutor {
  readonly type: StepType;
  execute(ctx: WorkflowExecutionContext, step: StepDefinition): Promise<StepResult>;
}

interface StepResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  transitionTo?: string;
  waitFor?: "approval" | "input";
  skipRemaining?: boolean;
}

type WorkflowEventType = "CREATED" | "STARTED" | "STEP_STARTED" | "STEP_COMPLETED" | "STEP_FAILED" | "STEP_SKIPPED" | "APPROVAL_REQUESTED" | "APPROVAL_GRANTED" | "APPROVAL_REJECTED" | "NOTIFICATION_SENT" | "RETRY_TRIGGERED" | "COMPLETED" | "CANCELLED" | "FAILED" | "TIMEOUT" | "ESCALATED" | "PAUSED" | "RESUMED" | "ARCHIVED";
```

---

## Internal API

```typescript
interface WorkflowInternalApi {
  // Called by automation-studio for rule evaluation
  evaluateCondition(condition: string, variables: Record<string, unknown>): boolean;

  // Called by approval-matrix for threshold routing
  getApprovalConfig(stepDef: StepDefinition, input?: Record<string, unknown>): Promise<Record<string, unknown> | null>;

  // Called by scheduler for cron triggers
  triggerScheduledInstance(definitionId: string, input?: Record<string, unknown>): Promise<void>;

  // Called by onboarding for setup workflow validation
  validateWorkflowDefinition(steps: StepDefinition[]): ValidationResult;

  // Approval history bridge
  recordApprovalHistory(instanceId: string, stepId: string, approverId: string, approverRole: string, action: string, comment?: string, delegatedTo?: string): Promise<void>;
}
```

---

## Events

```typescript
interface WorkflowPlatformEvents {
  // Instance lifecycle
  "workflow.created": { instanceId: string; definitionId: string; companyId: string; definitionName: string };
  "workflow.started": { instanceId: string; companyId: string };
  "workflow.completed": { instanceId: string; companyId: string; durationMs: number };
  "workflow.failed": { instanceId: string; companyId: string; error: string; stepId: string };
  "workflow.cancelled": { instanceId: string; companyId: string; reason?: string };
  "workflow.paused": { instanceId: string; companyId: string };
  "workflow.resumed": { instanceId: string; companyId: string };

  // Step lifecycle
  "workflow.step.started": { instanceId: string; stepId: string; companyId: string; stepType: string };
  "workflow.step.completed": { instanceId: string; stepId: string; companyId: string; output: Record<string, unknown> };
  "workflow.step.failed": { instanceId: string; stepId: string; companyId: string; error: string };

  // Approval events
  "workflow.approval.requested": { instanceId: string; stepId: string; companyId: string; label: string };
  "workflow.approval.granted": { instanceId: string; stepId: string; companyId: string; approvedBy: string };
  "workflow.approval.rejected": { instanceId: string; stepId: string; companyId: string; rejectedBy: string; reason?: string };

  // Definition events
  "workflow.definition.created": { definitionId: string; companyId: string; name: string };
  "workflow.definition.updated": { definitionId: string; companyId: string; changes: string[] };
  "workflow.definition.version.captured": { definitionId: string; companyId: string; version: number };
}
```

---

## Commands

| Command | Description | Auth | Audit |
|---|---|---|---|
| `CreateWorkflowDefinition` | Define a new workflow | `workflows.create` | Yes |
| `UpdateWorkflowDefinition` | Modify workflow (creates version snapshot) | `workflows.update` | Yes |
| `CreateWorkflowInstance` | Start a new instance | `workflows.execute` | Yes |
| `StartWorkflowInstance` | Begin execution | `workflows.execute` | Yes |
| `ResumeWorkflowInstance` | Resume after wait/approval | `workflows.execute` | Yes |
| `CancelWorkflowInstance` | Cancel running workflow | `workflows.cancel` | Yes |
| `PauseWorkflowInstance` | Pause execution | `workflows.execute` | Yes |
| `RespondToApproval` | Approve or reject a step | `workflows.approve` | Yes |
| `RespondToTask` | Complete a human task | `workflows.execute` | Yes |

---

## Queries

| Query | Description | Auth |
|---|---|---|
| `GetWorkflowDefinition` | Fetch workflow definition | `workflows.read` |
| `ListWorkflowDefinitions` | List all definitions | `workflows.read` |
| `GetWorkflowInstance` | Fetch instance with steps + events | `workflows.read` |
| `ListWorkflowInstances` | List instances with filters | `workflows.read` |
| `GetWorkflowMetrics` | Aggregate performance metrics | `workflows.read` |
| `GetInstanceEvents` | Event log for an instance | `workflows.read` |

---

## Errors

| Error Code | Description | HTTP Status | Retryable |
|---|---|---|---|
| `WORKFLOW_NOT_FOUND` | Definition or instance not found | 404 | No |
| `WORKFLOW_ALREADY_EXISTS` | Duplicate definition name | 409 | No |
| `WORKFLOW_INVALID_TRANSITION` | Illegal state transition | 409 | No |
| `WORKFLOW_DEFINITION_INACTIVE` | Cannot create instance from inactive def | 400 | No |
| `WORKFLOW_INSTANCE_NOT_ACTIVE` | Cannot start/completed/failed instance | 409 | No |
| `WORKFLOW_STEP_NO_EXECUTOR` | No executor for step type | 500 | No |
| `WORKFLOW_STEP_FAILED` | Step execution error | 500 | Yes |
| `WORKFLOW_APPROVAL_UNAUTHORIZED` | User lacks approval role | 403 | No |
| `WORKFLOW_APPROVAL_NOT_AWAITING` | Step not in WAITING_APPROVAL state | 409 | No |
| `WORKFLOW_CONCURRENT_MODIFICATION` | Optimistic locking conflict | 409 | Yes |
| `WORKFLOW_DEFINITION_NOT_ACTIVE` | Cannot update inactive definition | 400 | No |

---

## Security Model

- **Tenant Isolation**: Every query and mutation is scoped to `companyId`. Cross-tenant access is blocked at every layer (`companyId: ctx.companyId` in all Prisma queries).
- **Role-Based Approval**: Approval steps enforce `requiredApprovers` roles. Only users holding the specified role can approve.
- **Audit Trail**: Every definition change, instance creation, approval, and cancellation is recorded via `recordAudit()` with full context.
- **State Machine Integrity** (Constitution Law 6): All state transitions are validated by `WorkflowStateMachine`. No transition is possible that is not in the allowed set.
- **Real-Time Event Scoping**: WebSocket events are emitted only to the tenant's channel, never cross-tenant.

---

## Permission Model

| Permission | Scope | Description |
|---|---|---|
| `workflows.read` | Company | View definitions, instances, metrics |
| `workflows.create` | Company | Create workflow definitions |
| `workflows.update` | Company | Update definitions (triggers version snapshot) |
| `workflows.execute` | Company | Create/start/resume/pause instances |
| `workflows.cancel` | Company | Cancel running instances |
| `workflows.approve` | Company | Respond to approval steps |
| `workflows.admin` | Platform | System workflows, bulk operations |

---

## Observability

### Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `workflow.definitions.total` | Gauge | `status` | Total workflow definitions |
| `workflow.instances.total` | Counter | `status` | Total instances by status |
| `workflow.instances.running` | Gauge | — | Currently running instances |
| `workflow.instances.waiting` | Gauge | — | Instances waiting for approval/input |
| `workflow.instances.failed` | Counter | `step_type` | Failed instances |
| `workflow.instances.completed` | Counter | — | Completed instances |
| `workflow.instances.duration_ms` | Histogram | `definition_id` | Instance completion duration |
| `workflow.instances.success_rate` | Gauge | — | Success rate percentage |
| `workflow.steps.executed` | Counter | `step_type`, `status` | Step executions |
| `workflow.steps.duration_ms` | Histogram | `step_type` | Step execution duration |
| `workflow.approvals.requested` | Counter | `step_type` | Approval requests sent |
| `workflow.approvals.approved` | Counter | `role` | Approvals granted |
| `workflow.approvals.rejected` | Counter | `role` | Approvals rejected |
| `workflow.approvals.avg_response_time_ms` | Histogram | — | Time to approval response |
| `workflow.errors.total` | Counter | `error_type` | Workflow errors |
| `workflow.version_snapshots.total` | Counter | — | Version snapshots captured |

### Tracing

Workflow operations emit spans: `workflow.create_instance`, `workflow.start_instance`, `workflow.execute_step`, `workflow.respond_approval`. Span attributes: `workflow.instance_id`, `workflow.definition_id`, `workflow.step_type`, `workflow.status`, `company_id`.

### Logging

Structured logs for: instance lifecycle changes, step execution (start/complete/fail), approval decisions, state machine transitions, version snapshots. All logs include `instanceId`, `stepId`, `companyId`, `userId`, and `traceId`.

---

## Rate Limiting

| Operation | Limit | Window | Scope |
|---|---|---|---|
| Instance creation | 100/hr | Sliding | Per company |
| Instance start/resume | 200/hr | Sliding | Per company |
| Approval response | 500/hr | Sliding | Per user |
| Definition creation/update | 20/hr | Sliding | Per company |
| Query (list/get) | 1000/hr | Sliding | Per company |

---

## Retry Policy

| Operation | Max Retries | Base Delay | Retryable Errors |
|---|---|---|---|
| Step execution | Per step `retryCount` (default 0) | Per step `retryDelayMs` | Step-specific |
| Database write | 2 | 1s | Transient DB errors |
| Real-time event emission | 2 | 500ms | Connection errors |

---

## Circuit Breakers

| Circuit | Threshold | Recovery | Fallback |
|---|---|---|---|
| Database | 5 failures / 60s | 30s | Queue for retry |
| Real-time emit | 3 failures / 30s | 15s | Log only, skip real-time |

---

## Caching

| Cache | TTL | Scope | Invalidation |
|---|---|---|---|
| Workflow definitions | 5min | Per definition ID | On update |
| Metrics summary | 60s | Per company | On instance change |
| Step registry | Static (session) | Global | On init |

---

## Versioning

| Aspect | Strategy |
|---|---|
| Definition versioning | Auto-incrementing integer per definition |
| Snapshot capture | Before every update via `WorkflowVersionSnapshotService` |
| API versioning | URL path prefix |
| Backward compatibility | New step types are additive; deprecated types get 90-day grace |

---

## Lifecycle

### Workflow Instance State Machine

```
PENDING → VALIDATED → RUNNING → COMPLETED
                    ↓           ↓
                  WAITING    FAILED
                    ↓
                  RUNNING (after approval/input)
                    ↓
                  PAUSED → RUNNING (resume)

Any active state → CANCELLED → ARCHIVED
COMPLETED → ARCHIVED
FAILED → PENDING (retry) or ARCHIVED
```

### Workflow Definition Lifecycle

```
DRAFT → ACTIVE → DEPRECATED → ARCHIVED
```

---

## Extension Model

- **Custom Step Types**: Implement `StepExecutor` interface and register via `stepRegistry.register(executor)`. Current 9 built-in executors.
- **Approval Config Enrichers**: Plug in custom approval configuration logic via `workflowEngine.setApprovalConfigEnricher(enricher)`.
- **Approval History Recorders**: Plug in custom approval history recording via `workflowEngine.setApprovalHistoryRecorder(recorder)`.
- **Event Listeners**: Subscribe to workflow events via the real-time event system.
- **Templates**: Workflow templates registered via `TemplateLibrary` for reusable patterns.

---

## Known Issues (Phase 18.0)

### Duplicate Engine

The codebase contains **two workflow engines**:

1. **Primary** (`src/modules/workflow/engine.ts`): `WorkflowEngine` singleton. Uses `WorkflowDefinition` / `WorkflowInstance` / `WorkflowStepInstance` / `WorkflowEvent` Prisma models. 847 lines. Full-featured: step registry, state machine, approval integration, real-time events.

2. **Orchestration** (`src/modules/orchestration/workflow-engine.ts`): `OrchestrationExecutionEngine` static class. Uses `WorkflowExecution` / `WorkflowStepExecution` Prisma models. 281 lines. Simpler: sequential steps, module action dispatch, sub-workflow support.

**Recommendation**: The Orchestration engine should be deprecated (Phase 18.0 recommendation). The Workflow Engine is the authoritative implementation.

---

## Testing Strategy

| Test Type | Scope | Coverage Target |
|---|---|---|
| Unit tests | State machine transitions, step registry, condition evaluator | 95% |
| Integration tests | Full instance lifecycle (create → start → complete) | 90% |
| Contract tests | `StepExecutor` interface compliance | 100% |
| E2E tests | Multi-step workflow with approvals + real-time events | 85% |
| Failure mode tests | Step failure, timeout, cancel mid-execution | 100% |
| Concurrency tests | Concurrent approval responses, optimistic locking | 90% |
| Performance tests | 1000 concurrent instances, step throughput | Baseline |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| Step executor missing | Step hangs | `failStep()` called with descriptive error |
| DB write failure | Instance state lost | Optimistic retry, fail instance |
| Approval timeout | Instance stuck in WAITING | Timeout configuration per step |
| Real-time emit failure | Client stale | Persisted events for catch-up |
| Concurrent approval | Race condition | Optimistic locking + role check |
| Step crash | Instance fails | Error captured, errorCount incremented |
| Scheduler failure | Scheduled instances missed | PgBoss persistence, retry |

---

## Recovery Strategy

| Scenario | Recovery |
|---|---|
| Instance stuck in WAITING | Admin override or timeout resolution |
| Instance FAILED | Retry from failed step or restart from beginning |
| DB corruption | Restore from backup; replay events |
| Scheduler downtime | PgBoss durable jobs survive restart |
| Definition inconsistency | Version snapshots enable rollback |

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/modules/workflow/engine.ts` | Primary workflow engine (847 lines) |
| `src/modules/workflow/state-machine.ts` | State transition validation |
| `src/modules/workflow/types.ts` | All workflow types |
| `src/modules/workflow/step-registry.ts` | Step executor registry |
| `src/modules/workflow/version-snapshot.service.ts` | Definition versioning |
| `src/modules/workflow/condition-evaluator.ts` | Condition evaluation |
| `src/modules/workflow/steps/*.ts` | 9 step executors |
| `src/modules/workflow/jobs/*.ts` | Background jobs |
| `src/modules/orchestration/workflow-engine.ts` | Deprecated orchestration engine |
| `src/modules/automation-studio/` | Business rules, approval matrix, scheduler |

---

*The Workflow Platform orchestrates all business processes through a durable, auditable, and observable execution engine.*
