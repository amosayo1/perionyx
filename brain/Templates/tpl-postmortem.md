---
type: postmortem
title: "{{title}}"
date: {{date}}
incident: ""
severity: ""
status: complete
tags: []
related_notes: []
summary: ""
open_questions: []
lessons_learned: []
future_work: []
---

<!-- Use this template after any incident, outage, or significant system failure.
     Focus on systemic causes and preventive actions, not blame.
     Blameless postmortems produce better outcomes.
     Copy into 05-Engineering/Postmortems/ and prefix with the date. -->

# Postmortem: {{incident_name}}

## Incident Summary

| Field | Value |
|---|---|
| **Incident** | {{incident_name}} |
| **Date** | {{date}} |
| **Duration** | {{duration}} |
| **Severity** | {{severity}} — SEV1 / SEV2 / SEV3 / SEV4 |
| **Status** | {{status}} — investigating / identified / monitoring / complete |
| **Incident Commander** | {{incident_commander}} |
| **Author** | {{author}} |

## Timeline

<!-- Chronological timeline in UTC. Be precise. -->

| Time (UTC) | Event |
|---|---|
| {{time_1}} | {{event_1}} — first indicator |
| {{time_2}} | {{event_2}} — escalation |
| {{time_3}} | {{event_3}} — mitigation started |
| {{time_4}} | {{event_4}} — resolved |
| {{time_5}} | {{event_5}} — all-clear |

## Root Impact

<!-- Quantify the impact. Be concrete. -->

- **Users Affected:** {{users_affected}}
- **Duration of Impact:** {{impact_duration}}
- **Data Loss:** {{data_loss}} — none / partial / full
- **Revenue Impact:** {{revenue_impact}}
- **SLA Breach:** {{sla_breach}} — yes / no
- **Downstream Systems:** {{downstream_systems}}

## Root Cause

<!-- What actually caused the incident? Go beyond the immediate trigger to
     find the systemic cause. Use "5 Whys" or similar technique. -->

### Immediate Cause

{{immediate_cause}}

### Contributing Factors

1. {{contributing_factor_1}}
2. {{contributing_factor_2}}

### Root Cause

{{root_cause}}

## Resolution

<!-- How was the incident resolved? Was it a fix or a workaround? -->

{{resolution_description}}

**Resolution Type:** {{resolution_type}} — code fix / config change / rollback / manual intervention / data fix

## Lessons Learned

### What Went Well

- {{went_well_1}}
- {{went_well_2}}

### What Went Poorly

- {{went_poorly_1}}
- {{went_poorly_2}}

### Where We Got Lucky

- {{lucky_1}}

## Preventive Actions

| # | Action | Owner | Due Date | Status |
|---|---|---|---|---|
| 1 | {{action_1}} | {{owner_1}} | {{due_1}} | pending / in-progress / done |
| 2 | {{action_2}} | {{owner_2}} | {{due_2}} | {{status_2}} |
| 3 | {{action_3}} | {{owner_3}} | {{due_3}} | {{status_3}} |

## Related Security Findings

- [Finding: {{finding_name}}]({{finding_link}})

## Related Notes

- [Note: {{note_1}}]({{note_1_link}})

## Open Questions

- {{open_question_1}}
- {{open_question_2}}

## Future Work

- {{future_work_1}}
