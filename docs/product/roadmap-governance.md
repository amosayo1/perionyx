# Roadmap Governance

**Phase:** 8E.4
**Last Updated:** July 8, 2026

---

## Purpose

This document defines the governance process for proposing, validating, prioritizing, approving, building, and deprecating features on the Perionyx platform. Every significant roadmap decision must be traceable to customer evidence, workflow intelligence, business value, and strategic differentiation.

*Reference: Product Constitution §3, `docs/customer-discovery/validation-framework.md`*

---

## 1. Feature Proposal

### Who Can Propose

| Source | Process |
|---|---|
| Customer interview | Product Manager extracts feature request; logged in `feature-request-catalog.md` |
| Internal team | Engineering, Design, or Product proposes via standardized template |
| Executive leadership | Strategic initiative with documented rationale |
| Support ticket | Support team triages; escalates to Product if meets threshold (3+ tickets) |

### Proposal Requirements

Every feature proposal must include:

| Field | Required | Description |
|---|---|---|
| Feature name | Yes | Concise, descriptive name |
| Business objective | Yes | What business outcome this enables |
| Pain point(s) addressed | Yes | Links to Pain Point IDs from catalog |
| Workflow supported | Yes | Links to Workflow document(s) |
| Affected personas | Yes | Which personas benefit |
| Business impact | Yes | Quantified or qualitative value estimate |
| Evidence references | Yes | Interview IDs, support tickets, or strategic rationale |
| Requesting customers | Yes | Count of distinct organizations requesting |

### Proposal Template

```
## Feature: {Feature Name}
**Business Objective:** {What business outcome this enables}
**Customer(s) Requesting:** {Organizations}
**Pain Points Solved:** {PainPointID[]}
**Workflow Supported:** {Workflow doc reference}
**Affected Personas:** {Persona list}
**Business Impact:** {Quantified or qualitative}
**Implementation Complexity:** {XS/S/M/L/XL}
**Strategic Importance:** {Critical / High / Medium / Low}
**Competitive Differentiation:** {How this differentiates}
**Evidence References:** {InterviewID[], SupportTicket[], WorkflowDoc[]}
```

*Reference: `docs/customer-discovery/feature-request-catalog.md`*

---

## 2. Evidence Collection

### Evidence Tiers

| Tier | Definition | Valid Sources |
|---|---|---|
| **T1 — Direct** | ≥2 customers explicitly requested or demonstrated the need | Interview quote, session recording, support ticket |
| **T2 — Inferred** | ≥3 indirect signals (surveys, analytics, competitive analysis) | Survey trends, analytics data, competitor gaps |
| **T3 — Strategic** | Market research, leadership directive, compliance requirement | Industry reports, regulatory mandates, product vision |

### Evidence Collection Process

```
1. Capture  → Record raw observation (interview, ticket, session)
2. Classify → Assign taxonomy category and severity
3. Verify   → Cross-reference with other customers or data sources
4. Prioritize → Rank by business impact × affected users × effort
5. Decide   → Product decision with evidence citation
6. Track    → Monitor shipped feature against original pain point
```

### Evidence Quality Standards

| Quality | Criteria | Confidence |
|---|---|---|
| **A** | Direct quote + observed behavior + specific context | High |
| **B** | Participant description + interviewer notes | Medium |
| **C** | Secondhand report or inference | Low — validate |

*Reference: `docs/customer-discovery/validation-framework.md`, `docs/customer-discovery/customer-discovery-playbook.md`*

---

## 3. Validation Criteria

### Minimum Evidence Requirements by Feature Tier

| Feature Tier | Description | Minimum Evidence |
|---|---|---|
| **P0 — Critical** | Launch blocker, security, compliance | T1 + ≥2 customers or regulatory mandate |
| **P1 — High** | Major capability, multiple personas | T1 + ≥1 customer or T2 + ≥5 signals |
| **P2 — Medium** | Important improvement, core experience | T2 + ≥3 signals or T3 + strategic alignment |
| **P3 — Low** | Nice-to-have, enhancement | T2 + ≥1 signal or validated internal hypothesis |
| **P4 — Future** | Exploration, low signal | Any evidence tier accepted for investigation |

### Validation Workflow

```
Proposed
    ↓
Evidence reviewed (weekly product sync)
    ↓
Validation needed?
    ├── Yes → Schedule follow-up interviews or prototype testing
    │         ↓
    │         Validated (≥2 independent sources) → Prioritize
    │         ↓
    │         Rejected (insufficient evidence) → Log with rationale
    │
    └── No → Proceed to prioritization
```

*Reference: `docs/customer-discovery/decision-log.md`*

---

## 4. Approval Process

### Decision Roles

| Role | Responsibility |
|---|---|
| Product Manager | Evidence collection, synthesis, recommendation, proposal authoring |
| Engineering Lead | Effort estimation, technical feasibility, risk assessment |
| Design Lead | UX feasibility, user experience validation, accessibility review |
| Product Director | Final decision, priority arbitration, strategic alignment check |
| Security Lead | Security review (mandatory for P0/P1 features affecting data) |

### Approval Gates

| Gate | Participants | Criteria |
|---|---|---|
| **Gate 1 — Discovery** | PM + Engineering Lead | Evidence sufficient? Feasible? Aligns with strategy? |
| **Gate 2 — Validation** | PM + Design Lead | User research confirms need? UX approach validated? |
| **Gate 3 — Planning** | PM + Engineering + Design | Spec complete? Effort estimated? Security reviewed? |
| **Gate 4 — Launch** | Product Director | Meets quality bar? Documentation complete? Post-ship plan? |

### Approval Workflow

```
Feature proposed (PM)
    ↓
Gate 1: Discovery Review (weekly sync)
    ↓
Gate 2: Validation (if needed — follow-up interviews)
    ↓
Gate 3: Planning Review (bi-weekly sprint planning)
    ↓
Gate 4: Launch Review (release sign-off)
```

### Expedited Path

For P0/P1 security fixes, compliance mandates, or launch-blocking bugs:

```
Feature proposed → Emergency review (within 24h) → Immediate sprint
```

---

## 5. Prioritization Rules

### Weighted Scoring Model

Features are scored across 10 dimensions. Each dimension is scored 1-10.

| Dimension | Weight | Scoring Criteria |
|---|---|---|
| Customer Demand | 15% | Number of requesting customers × evidence tier |
| Business Value | 15% | Estimated $ impact or time saved per customer |
| Revenue Potential | 10% | Direct revenue, upsell, or retention impact |
| Strategic Differentiation | 15% | How uniquely Perionyx can deliver vs competitors |
| Workflow Impact | 10% | Number of workflows improved × friction reduction |
| AI Enablement | 5% | Does this enable or leverage AI capabilities? |
| Implementation Effort | -10% | Inverted — lower effort = higher score |
| Technical Risk | -5% | Inverted — lower risk = higher score |
| Enterprise Readiness | 10% | Impact on audit, compliance, security, or scale |
| Platform Leverage | 5% | Reusability across multiple features or domains |

### Scoring Formula

```
Score = Σ(Dimension Score × Weight)
```

Features ranked by total score. Ties broken by strategic alignment vote.

*Reference: `docs/product/feature-prioritization-framework.md`*

### Priority Levels

| Priority | Score Range | Action |
|---|---|---|
| **P0** | 8.0-10.0 | Immediate sprint; launch blocker |
| **P1** | 6.0-7.9 | Next 1-2 sprints |
| **P2** | 4.0-5.9 | This quarter |
| **P3** | 2.0-3.9 | This half |
| **P4** | 0.0-1.9 | Revisit annually |

### Override Rules

- Security and compliance features can be elevated +1 priority tier regardless of score
- Features with zero customer evidence cannot exceed P3
- Platform infrastructure (no direct customer impact) scored by engineering team

---

## 6. Review Cadence

| Activity | Frequency | Owner |
|---|---|---|
| Interview results review | Weekly during active research | Product Manager |
| Pain point catalog update | Bi-weekly | Product Manager |
| Feature request triage | Bi-weekly | PM + Engineering Lead |
| Decision log review | Monthly | Product Director |
| Evidence gap analysis | Quarterly | Product Team |
| Roadmap evidence refresh | Quarterly | Product Director |
| Full roadmap review | Quarterly | Product Director + Leadership |
| Post-ship validation | Per release | Product Manager |
| Priority recalibration | Quarterly | Product Team |
| Deprecation review | Quarterly | Product Team |

---

## 7. Deprecation Process

### When to Deprecate

A feature may be deprecated when:

1. **Usage below threshold** — <5% of active entities use the feature for 2+ quarters
2. **Replaced by superior alternative** — new feature supersedes old capability
3. **Evidence reversal** — customer evidence no longer supports the investment
4. **Strategic pivot** — platform direction no longer aligns with the feature
5. **Technical debt** — maintenance cost exceeds business value

### Deprecation Phases

| Phase | Duration | Actions |
|---|---|---|
| **Notice** | 1 quarter | Announce deprecation on changelog; notify affected customers |
| **Maintenance** | 1 quarter | Bug fixes only; no new features |
| **Sunset** | 1 quarter | Feature disabled; migration path provided |
| **Removal** | — | Code removed; documentation archived |

### Migration Requirements

Every deprecation must include:

- Migration path to alternative solution
- Data export capability for customer data
- Documentation update removing references
- Decision log entry with rationale

*Reference: `docs/customer-discovery/decision-log.md`*

---

## 8. Customer Evidence Mapping

Every roadmap item must reference:

| Evidence Type | Source Document | ID Format |
|---|---|---|
| Interview | `docs/customer-discovery/interview-template.md` | `I-{YYYYMMDD}-{NNN}` |
| Pain Point | `docs/customer-discovery/pain-point-catalog.md` | `{CATEGORY}-{NNN}` |
| Feature Request | `docs/customer-discovery/feature-request-catalog.md` | `FR-{YYYYMMDD}-{NNN}` |
| Decision Record | `docs/customer-discovery/decision-log.md` | `DEC-{YYYYMMDD}-{NNN}` |
| Workflow Document | `docs/workflows/{name}.md` | Workflow filename |
| Support Ticket | Support system | Ticket ID |

*Reference: `docs/customer-discovery/roadmap-evidence.md`*

---

## 9. Roadmap Entry Requirements

Every roadmap entry must include:

- **Evidence citation** — at least one Interview ID, Pain Point ID, or Workflow reference
- **Expected business value** — quantified where possible
- **Success metric** — how we will know it worked
- **Risks** — validation gaps, technical challenges, adoption barriers
- **Approval date** — date of Gate 3 approval

### Roadmap Entry Format

```
## Feature: {Name}
**Phase:** {Phase ID}
**Evidence:** {InterviewID[], PainPointID[], WorkflowRef[]}
**Business Value:** {Quantified impact}
**Success Metric:** {Measurable outcome}
**Risks:** {Risk list}
**Priority:** {P0-P4}
**Status:** {Proposed / Validated / In Progress / Shipped / Deprecated}
```

---

## 10. Quarterly Governance Review Template

### Evidence Summary

| Metric | This Quarter | Previous Quarter | Delta |
|---|---|---|---|
| Interviews completed | | | |
| Unique organizations | | | |
| Pain points identified | | | |
| Feature requests received | | | |
| Decisions made | | | |

### Pipeline Health

| Priority | Proposed | Validated | In Progress | Shipped |
|---|---|---|---|---|
| P0 | | | | |
| P1 | | | | |
| P2 | | | | |
| P3 | | | | |
| P4 | | | | |

### Evidence Gap Analysis

| Roadmap Item | Current Tier | Target Tier | Gap | Action |
|---|---|---|---|---|
| | | | | |

### Deprecation Review

| Feature | Current Usage | Replacement | Timeline | Status |
|---|---|---|---|---|
| | | | | |

---

## References

- `docs/product/product-strategy.md` — Strategic vision and market positioning
- `docs/product/feature-validation-matrix.md` — Feature validation records
- `docs/product/feature-prioritization-framework.md` — Weighted scoring model
- `docs/product/product-principles.md` — Enterprise product principles
- `docs/customer-discovery/validation-framework.md` — Evidence framework
- `docs/customer-discovery/customer-discovery-playbook.md` — Interview methodology
- `docs/customer-discovery/decision-log.md` — Decision records
- `docs/customer-discovery/roadmap-evidence.md` — Roadmap-to-evidence mapping
- `docs/workflows/README.md` — Workflow intelligence index
- `docs/PRODUCT_CONSTITUTION.md` — Permanent product principles
