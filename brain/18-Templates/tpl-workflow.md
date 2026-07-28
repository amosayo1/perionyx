---
type: workflow
title: "{{title}}"
date: {{date}}
workflow_name: ""
trigger: ""
tags: []
related_notes: []
summary: ""
open_questions: []
lessons_learned: []
future_work: []
---

<!-- Use this template to document an enterprise workflow: its trigger, steps,
     approval chain, error handling, and audit trail. This is the single source
     of truth for how a workflow behaves in production.
     Copy into 07-Enterprise-Workflows/. -->

# Workflow: {{workflow_name}}

## Overview

| Field | Value |
|---|---|
| **Workflow Name** | {{workflow_name}} |
| **Trigger** | {{trigger}} |
| **Owner** | {{owner}} |
| **Status** | {{status}} — draft / active / deprecated |
| **Last Updated** | {{date}} |

## Trigger

<!-- What initiates this workflow? Be specific: API call, schedule, event,
     manual action, threshold breach, etc. -->

{{trigger_description}}

**Trigger Conditions:**
- {{condition_1}}
- {{condition_2}}

## Steps

<!-- Number each step. Note whether it is automated or human, and whether
     it is blocking or non-blocking. -->

| Step | Name | Type | Owner | SLA | Blocking |
|---|---|---|---|---|---|
| 1 | {{step_1_name}} | automated / manual | {{step_1_owner}} | {{sla_1}} | yes / no |
| 2 | {{step_2_name}} | {{type_2}} | {{owner_2}} | {{sla_2}} | {{blocking_2}} |
| 3 | {{step_3_name}} | {{type_3}} | {{owner_3}} | {{sla_3}} | {{blocking_3}} |

### Step Details

**Step 1: {{step_1_name}}**

{{step_1_description}}

**Step 2: {{step_2_name}}**

{{step_2_description}}

**Step 3: {{step_3_name}}**

{{step_3_description}}

## Approval Chain

<!-- Who must approve, in what order, and what happens if they don't? -->

| Level | Approver Role | Timeout | Escalation |
|---|---|---|---|
| 1 | {{approver_1}} | {{timeout_1}} | {{escalation_1}} |
| 2 | {{approver_2}} | {{timeout_2}} | {{escalation_2}} |

**Delegation Rules:** {{delegation_rules}}

## Error Handling

<!-- What happens when a step fails? Retry policy, dead-letter, manual
     intervention triggers. -->

| Failure Scenario | Handling | Retry Policy | Alert |
|---|---|---|---|
| {{failure_1}} | {{handling_1}} | {{retry_1}} | {{alert_1}} |
| {{failure_2}} | {{handling_2}} | {{retry_2}} | {{alert_2}} |

**Dead Letter Queue:** {{dlq_description}}

## Audit Trail

<!-- What is logged, where, and for how long? Who can view audit records? -->

| Event | What Is Logged | Storage | Retention |
|---|---|---|---|
| workflow.started | {{log_1}} | {{storage_1}} | {{retention_1}} |
| step.completed | {{log_2}} | {{storage_2}} | {{retention_2}} |
| approval.granted | {{log_3}} | {{storage_3}} | {{retention_3}} |

## Related Modules

<!-- Which Perionyx modules does this workflow interact with? -->

- [Module: {{module_1}}]({{module_1_link}})
- [Module: {{module_2}}]({{module_2_link}})

## Summary

{{summary}}

## Open Questions

- {{open_question_1}}
- {{open_question_2}}

## Lessons Learned

- {{lesson_1}}

## Future Work

- {{future_work_1}}
