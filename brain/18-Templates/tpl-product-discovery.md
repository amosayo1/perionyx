---
type: product-discovery
title: "{{title}}"
date: {{date}}
feature: ""
status: discovery
tags: []
related_notes: []
summary: ""
open_questions: []
lessons_learned: []
future_work: []
---

<!-- Use this template when exploring a new feature or product opportunity.
     This is where you move from raw idea to validated, scoped work.
     Complete each section before moving to engineering.
     Copy into 02-Product/Discovery/. -->

# Product Discovery: {{feature_name}}

## Overview

| Field | Value |
|---|---|
| **Feature** | {{feature_name}} |
| **Status** | {{status}} — discovery / validating / validated / ready-for-dev / building / shipped |
| **Owner** | {{owner}} |
| **Target Release** | {{target_release}} |
| **Last Updated** | {{date}} |

## User Story

<!-- Write the user story in standard format. Include acceptance criteria. -->

**As a** {{user_role}},
**I want to** {{action}},
**So that** {{benefit}}.

### Acceptance Criteria

- [ ] {{criterion_1}}
- [ ] {{criterion_2}}
- [ ] {{criterion_3}}

## Pain Point

<!-- What is the user's current experience? How do they work around the
     absence of this feature today? Quantify the pain if possible. -->

{{pain_point_description}}

**Current Workaround:** {{current_workaround}}
**Frequency:** {{frequency}} — daily / weekly / monthly / ad-hoc
**Users Affected:** {{users_affected}}

## Proposed Solution

<!-- Describe the solution at a feature level. Include wireframes, mockups,
     or flow diagrams if available. -->

{{solution_description}}

### User Flow

1. {{flow_step_1}}
2. {{flow_step_2}}
3. {{flow_step_3}}

## Validation

<!-- How did/will we validate this feature? Customer interviews, prototypes,
     data analysis, A/B tests? -->

| Method | Date | Result | Confidence |
|---|---|---|---|
| {{method_1}} | {{date_1}} | {{result_1}} | high / medium / low |
| {{method_2}} | {{date_2}} | {{result_2}} | {{confidence_2}} |

## Metrics

<!-- How will we know this feature is successful? Define before building. -->

| Metric | Baseline | Target | Measurement |
|---|---|---|---|
| {{metric_1}} | {{baseline_1}} | {{target_1}} | {{measurement_1}} |
| {{metric_2}} | {{baseline_2}} | {{target_2}} | {{measurement_2}} |

## Dependencies

<!-- What must exist before this feature can ship? Other features, integrations,
     infrastructure, data migrations, etc. -->

| Dependency | Type | Owner | Status |
|---|---|---|---|
| {{dependency_1}} | feature / infra / data / integration | {{owner_1}} | ready / not-started / blocked |
| {{dependency_2}} | {{type_2}} | {{owner_2}} | {{status_2}} |

## Scope

<!-- What's in and what's out for this release? Be explicit about exclusions
     to prevent scope creep. -->

**In Scope:**
- {{in_scope_1}}
- {{in_scope_2}}

**Out of Scope:**
- {{out_of_scope_1}}
- {{out_of_scope_2}}

## Related Notes

- [Idea: {{idea_name}}]({{idea_link}})
- [Research: {{research_name}}]({{research_link}})

## Open Questions

- [ ] {{open_question_1}}
- [ ] {{open_question_2}}

## Lessons Learned

- {{lesson_1}}

## Future Work

- {{future_work_1}}
