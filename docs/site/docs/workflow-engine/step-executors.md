---
id: step-executors
title: Step Executors
sidebar_label: Step Executors
description: Step type executors for module actions, conditions, notifications, delays, and sub-workflow dispatch.
---

# Step Executors

## Step Types

The workflow engine dispatches each step to a specialized executor based on its type:

| Type | Behavior |
|---|---|
| `module_action` | Dispatches to a named module (treasury, ledger, reporting, integration, intelligence, approval, notification) |
| `condition` | Evaluates a configurable condition; can halt on failure |
| `notification` | Sends notifications via the event bus on completion/failure |
| `delay` | Waits for a configurable timeout |
| `sub_workflow` | Executes a child workflow |

## Dispatch Flow

`WorkflowEngine.execute(ctx, workflowId, trigger, input?)`:

1. Loads the `WorkflowDefinition` from Prisma (must be ACTIVE and same company)
2. Creates a `WorkflowExecution` record with status `running`
3. Iterates steps sequentially by `index`, executing each via `executeStep()`
4. Returns `ExecutionResult` with execution ID, status, step records, and metrics

## Error Handling

If any step fails, the execution status is set to `failed` and remaining steps are skipped.

## Execution Flow

```mermaid
graph TD
    A[Trigger: Manual/Event/Schedule/Automation] --> B[WorkflowEngine.execute]
    B --> C[Load Definition]
    C --> D[Create Execution record]
    D --> E[For each step by index]
    E --> F{Step Type}
    F -->|module_action| G[Dispatch to Module]
    F -->|condition| H[Evaluate Condition]
    F -->|notification| I[Emit Notification event]
    F -->|delay| J[Wait timeout]
    F -->|sub_workflow| K[Execute child workflow]
    G --> L{Success?}
    H --> L
    I --> L
    J --> L
    K --> L
    L -->|Yes| E
    L -->|No| M[Set status = failed]
    M --> N[Update Execution record]
    E -->|All complete| O[Set status = completed]
    O --> N
    N --> P[Emit workflow.completed / workflow.failed]
```

## Internal Event Bus

Step executors interact with the event bus for notification dispatch:

```typescript
on(eventType, handler)  // register handler
off(eventType, handler) // unregister handler
emit(ctx, eventType, source, payload?, correlationId?) // publish event
```

Events carry: `id`, `companyId`, `eventType`, `source`, `payload`, `correlationId`, `timestamp`. Handlers run via `Promise.allSettled` for isolation.
