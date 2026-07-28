---
type: experiment
title: "{{title}}"
date: {{date}}
hypothesis: ""
status: planned
tags: []
related_notes: []
summary: ""
open_questions: []
lessons_learned: []
future_work: []
---

<!-- Use this template when running a time-boxed experiment: A/B test,
     proof of concept, prototype evaluation, performance benchmark, or
     process change trial. Define success criteria before starting.
     Copy into 10-Research/Experiments/. -->

# Experiment: {{experiment_name}}

## Overview

| Field | Value |
|---|---|
| **Experiment** | {{experiment_name}} |
| **Status** | {{status}} — planned / running / analyzing / concluded / abandoned |
| **Owner** | {{owner}} |
| **Start Date** | {{start_date}} |
| **End Date** | {{end_date}} |
| **Duration** | {{duration}} |

## Hypothesis

<!-- State the hypothesis clearly. What do you believe will happen and why?
     Use the format: "If we [change], then [outcome], because [reason]." -->

{{hypothesis}}

**Null Hypothesis:** {{null_hypothesis}}

## Method

<!-- How will you test this hypothesis? Be specific about the experiment
     setup, sample size, controls, and measurement. -->

### Setup

{{setup_description}}

### Sample / Scope

{{sample_description}}

### Controls

{{controls_description}}

### Measurement

| Metric | How Measured | Sample Size | Duration |
|---|---|---|---|
| {{metric_1}} | {{measurement_method_1}} | {{sample_size_1}} | {{duration_1}} |
| {{metric_2}} | {{measurement_method_2}} | {{sample_size_2}} | {{duration_2}} |

### Success Criteria

<!-- Define what "conclusive" looks like BEFORE running the experiment. -->

- **Primary:** {{success_criteria_1}}
- **Secondary:** {{success_criteria_2}}
- **Minimum Detectable Effect:** {{mde}}

## Results

<!-- Raw data and observations. Be objective — save interpretation for
     the Analysis section. -->

### Data

| Metric | Control | Variant | Difference | p-value |
|---|---|---|---|---|
| {{metric_1}} | {{control_1}} | {{variant_1}} | {{difference_1}} | {{pvalue_1}} |
| {{metric_2}} | {{control_2}} | {{variant_2}} | {{difference_2}} | {{pvalue_2}} |

### Observations

{{observations}}

### Unexpected Findings

- {{unexpected_1}}
- {{unexpected_2}}

## Analysis

<!-- Interpret the results. What do they mean? Are the results statistically
     significant? Practically significant? -->

{{analysis}}

## Conclusion

<!-- What did we learn? Should we adopt, iterate, or abandon? -->

**Verdict:** {{verdict}} — adopt / iterate / abandon / inconclusive

{{conclusion}}

## Related Research

- [Research: {{research_name}}]({{research_link}})
- [Research: {{research_name_2}}]({{research_link_2}})

## Open Questions

- {{open_question_1}}
- {{open_question_2}}

## Lessons Learned

- {{lesson_1}}
- {{lesson_2}}

## Next Steps

- [ ] {{next_step_1}}
- [ ] {{next_step_2}}
