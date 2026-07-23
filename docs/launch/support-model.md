# Support Model

**Phase:** 8E.5
**Last Updated:** July 8, 2026

---

## 1. Issue Severity Levels

| Severity | Label | Definition | Response Time | Resolution Target |
|---|---|---|---|---|
| **P0** | Critical | System unavailable, data integrity risk, security incident | 15 minutes (24/7) | 4 hours |
| **P1** | High | Major feature broken, no workaround, blocked workflow | 1 hour (business) | 24 hours |
| **P2** | Medium | Feature broken with workaround | 4 hours (business) | 5 business days |
| **P3** | Low | Minor issue, no workflow impact | 24 hours (business) | Next release |
| **P4** | Informational | Question, feature request, documentation | 48 hours (business) | Triage queue |

---

## 2. Bug Reporting Process

### How to Report a Bug

1. **Check known issues** — Review `docs/launch/known-limitations.md` for existing issues
2. **Check workarounds** — Known issues may have documented workarounds
3. **Submit bug report** — Include the following information:

```
### Bug Report

**Severity:** P0 / P1 / P2 / P3
**Component:** {Dashboard / API / Mobile / AI / etc.}
**Environment:** {Production / Staging / Development}
**Browser/Device:** {Chrome 126 / iOS 18 / etc.}

**Description:**
{Clear description of the issue}

**Steps to Reproduce:**
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Expected Behavior:**
{What should happen}

**Actual Behavior:**
{What actually happens}

**Screenshots/Logs:**
{Attach or link}

**Workaround:**
{If known}
```

### Bug Lifecycle

```
Reported → Triage → Reproduced → Prioritized → Fixed → Verified → Closed
    ↑                                                        |
    └─────────────── Not Reproducible ───────────────────────┘
```

### Bug Tracking

| Tool | Purpose |
|---|---|
| GitHub Issues | Bug tracking, feature requests |
| Label taxonomy | `bug`, `enhancement`, `p0`, `p1`, `p2`, `p3`, `needs-triage`, `confirmed`, `in-progress`, `fixed` |

---

## 3. Feature Request Process

### How to Submit a Feature Request

1. **Check existing requests** — Review `docs/customer-discovery/feature-request-catalog.md`
2. **Describe the need** — Focus on the problem, not the solution

```
### Feature Request

**Pain Point:**
{What problem does this solve?}

**Current Workaround:**
{How are you handling this today?}

**Desired Outcome:**
{What would success look like?}

**Business Impact:**
{How much time/money/risk would this save?}
```

### Feature Request Lifecycle

```
Submitted → Triage → Evidence Collection → Prioritized (per framework) → Roadmap → Built → Shipped
```

*Reference: `docs/product/roadmap-governance.md`, `docs/product/feature-prioritization-framework.md`*

---

## 4. Customer Communication Process

### Communication Channels

| Channel | Purpose | Availability |
|---|---|---|
| Email (`support@perionyx.com`) | Bug reports, feature requests, questions | Business hours |
| In-app feedback widget | Quick feedback, bug reports | During platform usage |
| Slack (dedicated pilot channel) | Real-time communication during pilot | Business hours (P0: 24/7) |
| Phone (P0 only) | Critical incident escalation | 24/7 |

### Communication SLAs

| Type | Response Target |
|---|---|
| Bug report acknowledgment | 4 business hours |
| Feature request acknowledgment | 48 business hours |
| Status update on reported issue | Weekly |
| Release notes | With each deployment |
| Scheduled maintenance notice | 5 business days in advance |

---

## 5. Release Notes Process

### Release Notes Template

```
# Perionyx v{major}.{minor}.{patch}

**Release Date:** {Date}

### New Features
- {Feature} — {Brief description} — {Reference to feature validation}

### Improvements
- {Improvement} — {Brief description}

### Bug Fixes
- {Bug} — {Brief description} — {Issue reference}

### Known Issues
- {Issue} — {Workaround} — {Target fix version}

### Breaking Changes
- {Change} — {Migration instructions}

### Migration Steps
1. {Step 1}
2. {Step 2}
```

### Release Notes Distribution

| Channel | Audience | Timing |
|---|---|---|
| Email | All customers and stakeholders | On release |
| In-app notification | All users | On first login after release |
| Slack (#releases) | Internal team | On release |
| Public changelog | Prospects and community | On release |

---

## 6. Support Team Structure

| Role | Responsibility |
|---|---|
| **L1 Support** | Initial triage, known issues, workarounds, FAQ responses |
| **L2 Engineering Support** | Bug diagnosis, hotfixes, complex issue resolution |
| **L3 Engineering Lead** | Architecture-level issues, cross-team coordination |
| **Customer Success Manager** | Customer relationship, satisfaction, retention |
| **Product Manager** | Feature request triage, roadmap alignment |

### Support Coverage

| Period | Coverage | Channels |
|---|---|---|
| Business hours (9am-6pm ET) | L1 + L2 | Email, Slack, in-app |
| After hours | L1 only | Email (respond next business day) |
| 24/7 (P0 only) | L2 on-call | Phone, Slack |

---

## 7. Escalation Matrix

| Issue Type | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| Login/authentication | ✅ Triage | ✅ Fix | — | — |
| API error | ✅ Triage | ✅ Fix | — | — |
| Data discrepancy | ✅ Triage | ✅ Investigate | ✅ Resolve | — |
| Performance degradation | ✅ Triage | ✅ Investigate | ✅ Resolve | — |
| Security incident | ✅ Isolate | ✅ Contain | ✅ Investigate | ✅ Approve |
| Feature request | ✅ Log | — | — | ✅ Prioritize |
| Customer complaint | ✅ Listen | — | ✅ Address | ✅ Escalate |

---

## 8. Support Hours

| Day | Hours | Coverage |
|---|---|---|
| Monday — Friday | 9:00 AM — 6:00 PM ET | Full support team |
| Saturday | 10:00 AM — 2:00 PM ET | L1 only |
| Sunday | Not staffed | Email response within 24 hours |
| Holidays | Not staffed | Email response within 24 hours |

---

## 9. Support Metrics (Targets)

| Metric | Target |
|---|---|
| First response time (P0) | <15 minutes |
| First response time (P1) | <1 hour |
| First response time (P2-P4) | <24 hours |
| Resolution time (P0) | <4 hours |
| Resolution time (P1) | <24 hours |
| Customer satisfaction (CSAT) | ≥90% |
| Ticket backlog (P2+) | <50 |
| Feature requests acknowledged | Within 1 week |

---

## References

- `docs/launch/incident-response.md` — Incident response procedures
- `docs/launch/pilot-readiness.md` — Pilot customer support expectations
- `docs/launch/known-limitations.md` — Known issues and workarounds
- `docs/product/feature-validation-matrix.md` — Feature validation
- `docs/product/roadmap-governance.md` — Roadmap governance
- `docs/customer-discovery/feature-request-catalog.md` — Feature request tracking
- `docs/customer-discovery/decision-log.md` — Decision log
