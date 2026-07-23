---
id: scheduling
title: Scheduling
sidebar_label: Scheduling
description: Cron-based scheduling with timezone support, due execution, and schedule management.
---

# Scheduling

## Scheduler Service

`SchedulerService` manages cron-based scheduling:

- `create(ctx, data)` — creates a schedule with cron expression and timezone (default UTC)
- `update(ctx, id, data)` — updates cron/timezone/active status
- `delete(ctx, id)` — removes schedule
- `executeDue(ctx)` — queries for due schedules and executes their workflows

## Execution Flow

Scheduled workflows follow the same execution path as manual triggers:

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

## Data Models

- `WorkflowSchedule` — cron expression, timezone, next/last run
- `WorkflowExecution` — per-run state, status, trigger, retry count
