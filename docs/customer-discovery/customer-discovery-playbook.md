# Customer Discovery Playbook

**Phase:** 8E.2
**Status:** Active
**Last Updated:** July 8, 2026

---

## 1. Interview Methodology

### 1.1 Participant Recruitment

**Target mix per quarter:**

| Segment | % of Interviews | Example Roles |
|---|---|---|
| Enterprise (1,000+ employees) | 40% | CFO, Treasurer, Controller |
| Mid-market (100-1,000) | 35% | Finance Manager, Director of Finance |
| SMB (<100) | 15% | Accountant, Finance Lead |
| Channel partners | 10% | Implementation consultants, VARs |

**Geographic distribution:** Align with market priorities. If launching in MENA, allocate 30%+ to regional interviews.

**Recruitment channels:**
- Existing customer base (support tickets, CSM relationships)
- LinkedIn outreach to target titles
- Industry events and conferences
- Partner referrals

### 1.2 Interview Format

| Type | Best For | Duration |
|---|---|---|
| Exploratory | Understanding workflows and pain points | 45 min |
| Validation | Testing specific hypotheses or prototypes | 30 min |
| Follow-up | Depth on specific topics or progress check | 20 min |
| Usability | Testing specific UI/UX with task scenarios | 45 min |

### 1.3 Interviewer Guidelines

**Do:**
- Ask "why" 3 times to reach root cause
- Let silence hang — participants often fill it with gold
- Listen for workarounds ("I built a spreadsheet for this")
- Capture exact quotes (use recording + transcript)
- Note emotional reactions (frustration, excitement, confusion)

**Do not:**
- Lead the witness ("Don't you think this is slow?")
- Pitch or demonstrate your solution during exploratory interviews
- Dismiss pain points that affect "only one person"
- Make promises about delivery dates

### 1.4 Evidence Quality Standards

| Quality | Criteria | Confidence |
|---|---|---|
| **A** | Direct quote + observed behavior + specific context | High |
| **B** | Participant description + interviewer notes | Medium |
| **C** | Secondhand report or inference | Low — validate |

---

## 2. Evidence Collection Process

### 2.1 Capture

```
Customer interaction occurs
    ↓
Interviewer completes interview template (within 24 hours)
    ↓
Recording uploaded, transcript generated
    ↓
Pain points extracted and classified
    ↓
Feature requests extracted and logged
    ↓
Workflow observations documented
```

### 2.2 Classification

Each finding is classified using the Pain Point Taxonomy (18 categories). Multi-classification is allowed — a single finding may span "Month-end Close" and "Reconciliation."

### 2.3 Validation

| Evidence Tier | Validation Required |
|---|---|
| Single interview | Flag as unvalidated |
| 2+ independent sources | Validated finding |
| 5+ independent sources | Confirmed pattern |
| 10+ independent sources | Industry norm |

---

## 3. Decision Process

### 3.1 Decision Workflow

```
Customer evidence collected
    ↓
Evidence reviewed (weekly product team sync)
    ↓
Hypothesis formed: "If we build X, customer segment Y will benefit"
    ↓
Hypothesis tested (follow-up interviews, prototype testing)
    ↓
Decision made and logged in decision-log.md
    ↓
Roadmap updated with evidence citation
    ↓
Feature built and shipped
    ↓
Post-ship validation: Did the feature resolve the pain point?
```

### 3.2 Decision Criteria

Each decision is evaluated on:

| Criterion | Weight | How to Evaluate |
|---|---|---|
| Business impact | 30% | Estimated $ value or time saved per customer |
| Affected users | 25% | Number of customers and users impacted |
| Evidence strength | 20% | T1 (direct) > T2 (inferred) > T3 (strategic) |
| Strategic alignment | 15% | Fits product vision and market direction |
| Implementation effort | 10% | Engineering cost relative to impact |

### 3.3 Decision Roles

| Role | Responsibility |
|---|---|
| Product Manager | Evidence collection, synthesis, recommendation |
| Engineering Lead | Effort estimation, technical feasibility |
| Design Lead | UX feasibility, user experience validation |
| Product Director | Final decision, priority arbitration |

---

## 4. Roadmap Linkage

### 4.1 Evidence → Roadmap Flow

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│ Customer        │────►│ Pain Point   │────►│ Feature      │
│ Interview       │     │ Catalog      │     │ Request      │
└─────────────────┘     └──────────────┘     └──────┬───────┘
                                                     │
┌─────────────────┐     ┌──────────────┐     ┌──────▼───────┐
│ Product         │◄────│ Decision Log │◄────│ Prioritized  │
│ Roadmap         │     │              │     │ Feature      │
└─────────────────┘     └──────────────┘     └──────────────┘
```

### 4.2 Roadmap Entry Requirements

Every roadmap item must include:

- **Evidence citation** — at least one Interview ID or Pain Point ID
- **Expected business value** — quantified where possible
- **Success metric** — how we'll know it worked
- **Risks** — validation gaps, technical challenges, adoption barriers

### 4.3 Post-Ship Validation

After a feature ships, the product team must:

1. Return to the originating customers within 2 sprints
2. Confirm the feature resolves the documented pain point
3. Capture any new friction introduced
4. Update the pain point status to `Resolved` or `Addressed`

---

## 5. Tooling & Workflow

### 5.1 Current (Phase 1) — Static Files

All records live in `docs/customer-discovery/` as markdown files. Team members edit via pull request.

### 5.2 Future (Phase 2+) — Database-Backed

| Phase | Tooling | Capabilities |
|---|---|---|
| Phase 1 | Markdown files in repo | Manual tracking, PR-based collaboration |
| Phase 2 | Database + CRUD API | Structured queries, linking, deduplication |
| Phase 3 | Internal UI dashboard | Charts, recurring theme detection, evidence explorer |
| Phase 4 | Perionyx module | Role-gated, integrated with customer data |
| Phase 5 | AI-powered | Sentiment analysis, theme clustering, recommendation scoring |

---

## 6. Quarterly Review Cadence

| Activity | Frequency | Owner |
|---|---|---|
| Interview results review | Weekly during active research | Product Manager |
| Pain point catalog update | Bi-weekly | Product Manager |
| Feature request triage | Bi-weekly | Product Manager + Engineering Lead |
| Decision log review | Monthly | Product Director |
| Evidence gap analysis | Quarterly | Product Team |
| Roadmap evidence refresh | Quarterly | Product Director |
| Post-ship validation report | Per release | Product Manager |
| Customer discovery metrics | Quarterly | Product Team |

---

## 7. Metrics Dashboard

### Quarterly Metrics

| Metric | Current | Target | Trend |
|---|---|---|---|
| Number of interviews | | | |
| Unique organizations | | | |
| Countries represented | | | |
| Industries represented | | | |
| Recurring themes (≥3 sources) | | | |
| Validated assumptions | | | |
| Rejected assumptions | | | |
| Roadmap items with ≥T2 evidence | | | |
| Pain points resolved | | | |

---

## 8. Appendices

### A. Taxonomy Reference

| Code | Category | Typical Personas |
|---|---|---|
| MEC | Month-end Close | Controller, Accountant |
| TRY | Treasury | Treasury Director, CFO |
| REC | Reconciliation | Accountant, Controller |
| CSF | Cash Flow | CFO, Treasury Director |
| REP | Financial Reporting | CFO, Finance Manager |
| APV | Approvals | AP Clerk, Finance Manager |
| CPL | Compliance | Compliance Officer, Auditor |
| AUD | Audit | Auditor, Controller |
| ERP | ERP Integration | IT Manager, Controller |
| L10 | Localization | CFO (MENA), Treasury Director |
| EXR | Executive Reporting | CFO, Executive Viewer |
| AIA | AI Assistance | CFO, Treasury Director |
| PER | Performance | All |
| UX | User Experience | All |
| TRA | Training & Adoption | All |
| VIS | Data Visibility | CFO, Controller, Auditor |
| SEC | Security | CISO, IT Manager |
| WFA | Workflow Automation | Finance Manager, Controller |

### B. Interview Checklist

```
☐ Review participant profile
☐ Prepare interview guide (tailor sections to role)
☐ Set up recording (consent confirmed)
☐ Complete interview template during session
☐ Write raw notes within 2 hours
☐ Extract pain points and add to catalog
☐ Extract feature requests and add to catalog
☐ Log any workflow observations
☐ Schedule follow-up if needed
☐ Share findings in weekly product sync
```

### C. Templates

- Interview template: `docs/customer-discovery/interview-template.md`
- Pain point catalog: `docs/customer-discovery/pain-point-catalog.md`
- Feature request catalog: `docs/customer-discovery/feature-request-catalog.md`
- Decision log: `docs/customer-discovery/decision-log.md`
- Roadmap evidence: `docs/customer-discovery/roadmap-evidence.md`
