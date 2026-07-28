---
type: threat-model
title: "{{title}}"
date: {{date}}
system: ""
tags: []
related_notes: []
summary: ""
open_questions: []
lessons_learned: []
future_work: []
---

<!-- Use this template to model threats for a system, subsystem, or feature.
     Follow STRIDE or a similar framework. Update as the system evolves.
     Copy into 04-Security/ and name after the system being modeled. -->

# Threat Model: {{system_name}}

## System Under Review

| Field | Value |
|---|---|
| **System** | {{system_name}} |
| **Scope** | {{scope}} |
| **Last Updated** | {{date}} |
| **Owner** | {{owner}} |

## Trust Boundaries

<!-- Where does trust change? Network boundaries, user roles, tenant isolation
     boundaries, third-party integrations, etc. -->

| Boundary | Description |
|---|---|
| {{boundary_1}} | {{boundary_1_description}} |
| {{boundary_2}} | {{boundary_2_description}} |

## Assets

<!-- What valuable data or resources does this system handle? -->

| Asset | Classification | Location | Owners |
|---|---|---|---|
| {{asset_1}} | public / internal / confidential / restricted | {{location_1}} | {{owner_1}} |
| {{asset_2}} | {{classification_2}} | {{location_2}} | {{owner_2}} |

## Threats (STRIDE)

<!-- Enumerate threats using the STRIDE taxonomy. For each threat, note
     the affected asset and boundary. -->

| # | STRIDE | Threat | Affected Asset | Boundary | Likelihood | Impact |
|---|---|---|---|---|---|---|
| T1 | {{stride_1}} | {{threat_1}} | {{asset_1}} | {{boundary_1}} | high / medium / low | high / medium / low |
| T2 | {{stride_2}} | {{threat_2}} | {{asset_2}} | {{boundary_2}} | {{likelihood_2}} | {{impact_2}} |

## Mitigations

<!-- How are each of the threats mitigated? Link to ADRs, security findings,
     or implementation code. -->

| Threat | Mitigation | Status | Evidence |
|---|---|---|---|
| T1 | {{mitigation_1}} | implemented / planned / accepted | {{evidence_1}} |
| T2 | {{mitigation_2}} | {{status_2}} | {{evidence_2}} |

## Residual Risk

<!-- After mitigations, what risk remains? Is it acceptable? -->

| Threat | Residual Risk | Acceptance Rationale |
|---|---|---|
| T1 | high / medium / low | {{rationale_1}} |
| T2 | {{residual_2}} | {{rationale_2}} |

## Related Security Findings

- [Finding: {{finding_title}}]({{finding_link}})
- [Finding: {{finding_title_2}}]({{finding_link_2}})

## Open Questions

- {{open_question_1}}
- {{open_question_2}}

## Lessons Learned

- {{lesson_1}}

## Future Work

- {{future_work_1}}
