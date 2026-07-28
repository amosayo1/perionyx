---
type: security-finding
title: "{{title}}"
date: {{date}}
severity: critical
status: open
owasp_category: ""
tags: []
related_notes: []
summary: ""
open_questions: []
lessons_learned: []
future_work: []
---

<!-- Use this template to document a security finding from audits, pentests,
     code reviews, or incident investigations. Severity must be one of:
     critical / high / medium / low / informational.
     Copy into 04-Security/ with a unique identifier. -->

# Security Finding: {{title}}

## Metadata

| Field | Value |
|---|---|
| **Finding ID** | {{finding_id}} |
| **Severity** | {{severity}} |
| **Status** | {{status}} — open / in-progress / mitigated / accepted / closed |
| **OWASP Category** | {{owasp_category}} |
| **CWE** | {{cwe_id}} |
| **Discovered By** | {{discovered_by}} |
| **Discovery Date** | {{date}} |
| **Environment** | {{environment}} |

## Description

<!-- Clear, technical description of the vulnerability. What is the flaw? -->

{{description}}

## Impact

<!-- What is the worst-case impact? Who is affected? What data or systems
     are at risk? Use concrete scenarios, not abstract risk language. -->

- **Confidentiality:** {{confidentiality_impact}}
- **Integrity:** {{integrity_impact}}
- **Availability:** {{availability_impact}}
- **Business Impact:** {{business_impact}}

## Proof of Concept

<!-- Steps to reproduce, code snippets, or evidence. Make it reproducible. -->

```
{{reproduction_steps}}
```

## Remediation

<!-- How should this be fixed? Include specific code changes, config changes,
     or architectural adjustments. -->

### Recommended Fix

{{recommended_fix}}

### Implementation

```typescript
// {{code_example_description}}
{{code_example}}
```

### Timeline

- **Fix Target:** {{fix_target_date}}
- **Verified:** {{verification_date}}

## Related Threats

- [Threat Model: {{threat_model_name}}]({{threat_model_link}})
- [Security Finding: {{related_finding}}]({{related_finding_link}})

## Evidence

<!-- Links to screenshots, logs, scan reports, or other supporting evidence. -->

- [Evidence 1]({{evidence_1_url}})

## Lessons Learned

- {{lesson_1}}
- {{lesson_2}}

## Open Questions

- {{open_question_1}}
