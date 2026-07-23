# Pilot Customer Readiness

**Phase:** 8E.5
**Last Updated:** July 8, 2026

---

## 1. Pilot Program Overview

### Objectives

| Objective | Success Criteria |
|---|---|
| Validate treasury operations workflow end-to-end | Pilot customer completes 10+ treasury operations (transfers, reconciliation, approval) without blockers |
| Validate executive dashboard usefulness | CFO/Treasury Director uses dashboard daily for 2+ weeks |
| Validate AI Copilot value for financial queries | Pilot customer asks 20+ financial questions via Copilot with ≥80% satisfaction |
| Validate approval workflow reliability | 50+ approvals processed with zero data integrity issues |
| Validate mobile experience | Approvals performed from mobile device |
| Collect structured feedback for prioritization | Complete post-pilot survey and 2+ follow-up interviews |

### Pilot Scope

| Area | Included | Not Included |
|---|---|---|
| Treasury | Wallets, transfers, FX rates, cash position | SWIFT integration, hedging |
| Approvals | Sequential/parallel chains, escalation, delegation | Complex routing rules |
| Reconciliation | Bank reconciliation runs, exceptions | Auto-matching suggestions |
| AI | Copilot, executive briefings, anomaly detection | Predictive cash flow, natural language reports |
| Dashboard | Executive dashboard, variance analysis, insights | Custom dashboard builder |
| Mobile | Dashboard, approvals, notification center | Full treasury operations on mobile |
| Integrations | Plaid bank connectivity | ERP connectors (SAP/Oracle/NetSuite) |

---

## 2. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Platform uptime | ≥99.5% | Uptime monitoring |
| API P95 latency | <2s for financial operations | APM or access logs |
| Critical bugs found | 0 in first 2 weeks | Bug tracker |
| Serious bugs found | <5 in pilot duration | Bug tracker |
| User satisfaction (CSAT) | ≥4/5 | Post-pilot survey |
| NPS | ≥30 | Post-pilot survey |
| Time-to-first-transaction | <2 hours from onboarding | Analytics |
| Daily active users (pilot entity) | ≥3 | Analytics |
| Support ticket response time | <4 hours business hours | Support tool |
| Feature request satisfaction | ≥80% acknowledged within 1 week | Feature request tracker |

---

## 3. Customer Responsibilities

| Responsibility | Description |
|---|---|
| Designate a pilot coordinator | Single point of contact for scheduling, feedback, issue escalation |
| Provide test accounts | 3-5 user accounts with defined roles (CFO, Treasury Director, Controller, Accountant, AP Clerk) |
| Configure bank connections | Provide bank account credentials or test bank credentials for Plaid linking |
| Define approval rules | Document approval thresholds, chains, and escalation rules for their organization |
| Participate in weekly reviews | 30-minute weekly sync to review progress, issues, and feedback |
| Complete post-pilot survey | Structured survey covering all pilot objectives |
| Provide 2+ reference calls | Agree to be a reference for future prospects (optional, highly appreciated) |

---

## 4. Perionyx Responsibilities

| Responsibility | Description |
|---|---|
| Dedicated pilot engineer | Named engineering contact for technical issues and configuration |
| Dedicated pilot PM | Named product contact for feedback, feature requests, and prioritization |
| Onboarding session | 2-hour guided setup and training session |
| Documentation access | Pilot-specific documentation covering all in-scope features |
| Weekly progress reviews | 30-minute weekly sync with agenda and action items |
| <4 hour response SLA | Business hours response for P1 issues |
| 1-hour emergency response | 24/7 response for P0 (system down) issues |
| Post-pilot summary | Written summary of pilot outcomes, feedback, and recommendations |

---

## 5. Support Expectations

| Severity | Response Time | Resolution Target | Communication |
|---|---|---|---|
| **P0 — System Down** | 1 hour (24/7) | 4 hours | Phone + Slack + Email |
| **P1 — Critical Feature Broken** | 4 hours (business hours) | 24 hours | Slack + Email |
| **P2 — Minor Feature Issue** | 24 hours (business hours) | 5 business days | Email + Ticket |
| **P3 — Question / Feature Request** | 48 hours (business hours) | — | Email + Ticket |

### Escalation Path

```
P0/P1 Issue Detected
    ↓
Pilot engineer notified (Slack + Phone)
    ↓
Engineering triage within 30 minutes
    ↓
If unplanned work > 4 hours → Escalate to Engineering Lead
    ↓
If customer satisfaction at risk → Escalate to Product Director
```

---

## 6. Feedback Collection

| Method | Frequency | Owner |
|---|---|---|
| Weekly sync | Weekly | Pilot PM |
| In-app feedback widget | Ongoing | Product Team |
| Bug reports | As needed | Pilot Engineer |
| Feature requests | As needed | Pilot PM |
| Post-pilot survey | End of pilot | Product Team |
| Follow-up interview | 1 week post-pilot | Product Team |

### Feedback Template (Weekly Sync)

```
## Weekly Pilot Sync — Week {N}

### Progress Since Last Week
- {What worked well}
- {What was completed}

### Issues & Blockers
- {P0/P1 issues encountered and resolution}
- {P2/P3 issues still open}

### Feature Requests
- {New requests this week}

### Satisfaction Pulse
- Overall satisfaction (1-5): {score}
- Primary frustration: {what}

### Action Items
- [ ] {Action} — {Owner} — {Due date}
```

---

## 7. Escalation Process

| Level | Trigger | Action | Responder |
|---|---|---|---|
| **L1** | General question, minor bug | Respond via email/ticket within 48 hours | Pilot PM |
| **L2** | Feature not working, workflow blocked | Assign engineer, 24-hour fix target | Pilot Engineer |
| **L3** | System unavailable, data integrity concern | Immediate triage, 4-hour fix target | Engineering Lead |
| **L4** | Security incident, data breach | Isolate, investigate, notify customer within 1 hour | Security Lead + Engineering Lead |

---

## 8. Weekly Review Process

### Agenda (30 minutes)

1. **Progress check** (5 min) — Review completed items, metrics
2. **Issues review** (10 min) — Open bugs, P1/P2 status
3. **Feature requests** (5 min) — New requests, prioritization discussion
4. **Satisfaction pulse** (5 min) — Verbal check on overall sentiment
5. **Action items** (5 min) — Next steps, owners, due dates

### Artifacts

| Artifact | Location | Owner |
|---|---|---|
| Meeting notes | Shared document | Pilot PM |
| Bug tracker | Issues board | Pilot Engineer |
| Feature request log | Feature request catalog | Pilot PM |
| Post-pilot survey | Survey tool | Product Team |

---

## 9. Pilot Exit Criteria

The pilot is complete when ALL of the following are met:

- [ ] All pilot objectives have been evaluated
- [ ] Post-pilot survey completed by customer
- [ ] Follow-up interview completed
- [ ] All P0/P1 bugs identified during pilot are fixed or have a documented workaround
- [ ] Feature requests from pilot are logged in the feature request catalog with evidence tier
- [ ] Pilot summary report delivered to customer
- [ ] Go/No-Go decision documented for broader launch

---

## 10. Pilot Timeline

| Phase | Duration | Activities |
|---|---|---|
| Pre-pilot setup | 1 week | Environment provisioning, configuration, data seeding, Plaid setup |
| Onboarding | 1 day | 2-hour guided session, user account creation, approval rules config |
| Active pilot | 4 weeks | Daily usage, weekly syncs, feedback collection |
| Close-out | 1 week | Post-pilot survey, interview, summary report |
| **Total** | **6 weeks** | |

---

## References

- `docs/launch/support-model.md` — Support model details
- `docs/launch/incident-response.md` — Incident response procedures
- `docs/launch/enterprise-launch-certification.md` — Launch certification
- `docs/product/feature-validation-matrix.md` — Feature validation
- `docs/customer-discovery/interview-template.md` — Interview template
- `docs/customer-discovery/feature-request-catalog.md` — Feature request tracking
- `docs/customer-discovery/decision-log.md` — Decision log
