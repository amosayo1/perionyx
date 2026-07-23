# Enterprise Workflow Constitution

**Version:** 1.0
**Date:** July 2026
**Status:** Ratified
**Authority:** Subordinate to `GOVERNANCE_CONSTITUTION.md` and `PRODUCT_CONSTITUTION.md`. Supersedes all implementation-level workflow guidance.

---

## Preamble

Perionyx exists to improve how enterprise finance professionals work. This document defines how that work flows — not how screens render, not how components compose, not how APIs respond. How work moves through an organisation.

Every finance professional operates within constraints: regulatory deadlines, approval hierarchies, segregation of duties, audit requirements, fiduciary obligations. This constitution defines how Perionyx respects, enforces, and automates within those constraints.

The workflow must exist independently of UI implementation. A workflow that depends on a specific button placement is fragile. A workflow that depends on a specific page layout is obsolete the moment the layout changes. A workflow that depends on the sequence of financial reasoning is permanent.

This is that permanent workflow.

---

## Part I — Workflow Philosophy

### Why Workflows Exist

Finance is not a collection of independent tasks. It is a chain of dependent decisions where each link requires evidence from the previous link and produces evidence for the next link.

A journal entry requires a business justification. A business justification requires supporting transactions. Supporting transactions require bank feed data or manual entry. Bank feed data requires reconciliation. Reconciliation requires matching rules. Matching rules require policy approval. Policy approval requires governance oversight.

This chain is a workflow. Every link has a owner, a deadline, an approval gate, and an audit trail. Perionyx must make every link visible, every owner accountable, every deadline prominent, every approval auditable, and every trail immutable.

### The Workflow Contract

Every workflow in Perionyx satisfies five promises:

| # | Promise | Meaning |
|---|---------|---------|
| 1 | **Visible** | The current state of every workflow is always queryable. No workflow is hidden, stuck, or ambiguous. |
| 2 | **Auditable** | Every state transition produces an immutable record. An auditor can reconstruct the complete history of any workflow from its audit trail. |
| 3 | **Recoverable** | Every workflow handles failure gracefully. No workflow leaves the system in an inconsistent state when a step fails. |
| 4 | **Traceable** | Every output traces to its inputs. Every recommendation traces to its evidence. Every decision traces to its authoriser. |
| 5 | **Human-governed** | AI may assist, recommend, or coordinate. Only humans decide, approve, and commit financial actions. |

### Workflow Types

| Type | Description | Example |
|------|-------------|---------|
| **Operational** | Recurring daily/weekly/monthly work | Morning review, cash position, journal approval |
| **Periodic** | Scheduled cycle work (month-end, quarter-end, year-end) | Month-end close, quarterly reporting, annual audit |
| **Event-driven** | Triggered by a specific event | Anomaly detected, threshold breached, deadline approaching |
| **Investigative** | Triggered by a question or suspicion | Variance investigation, fraud investigation, policy exception |
| **Strategic** | Long-cycle, multi-stakeholder work | Budget approval, capital allocation, acquisition review |
| **Emergency** | Time-critical, high-stakes response | Cash crisis, compliance breach, system failure |

---

## Part II — Role Definitions

### 2.1 Chief Financial Officer (CFO)

**Mission:** Strategic financial leadership — capital allocation, risk management, stakeholder communication, and organisational financial health.

**Responsibilities:**
- Approve material financial commitments (>$100K or >5% of budget)
- Review and act on executive briefings daily
- Authorise policy exceptions and overrides
- Sign off on quarterly and annual financial statements
- Approve M&A financial terms and capital allocation decisions
- Escalate board-level concerns to the Board Secretary
- Monitor enterprise-wide risk exposure
- Authorise emergency treasury actions (emergency fund access, emergency credit draws)

**Daily Routine:**
| Time | Activity | Source | Output |
|------|----------|--------|--------|
| 07:00 | Review executive briefing (cash, liquidity, alerts, pending approvals) | Executive Command Center | Go/no-go on priorities |
| 07:15 | Review overnight alerts and anomalies | Intelligence Panel | Acknowledge, escalate, or dismiss |
| 07:30 | Approve pending financial commitments | Approval queue | Approve/reject/delegate |
| 08:00 | Morning standup with Controller and Treasury Manager | Calendar | Alignment on close status, cash position |
| Throughout | Respond to escalations from specialists | Escalation feed | Decision or delegation |

**Weekly Routine:**
- Review weekly cash position trend and liquidity forecast
- Review week-over-week variance report (FP&A)
- Review compliance status and any new violations
- Review audit findings and remediation progress
- 1:1 with each direct report (Controller, Treasury Manager, FP&A Manager, Compliance Officer)

**Month-End Routine:**
- Review preliminary close status 3 business days before close
- Review post-close financial statements within 2 business days of close
- Approve management report for board distribution
- Review reconciliation exceptions and material variances

**Quarter-End Routine:**
- Review quarterly financial package
- Approve board presentation financial sections
- Review tax provision estimates
- Approve quarterly forecasts and reforecast assumptions

**Year-End Routine:**
- Coordinate with external auditors
- Review annual financial statements
- Approve year-end adjustments
- Sign management representation letter

**Exception Handling:**
| Exception | Action | Escalation |
|-----------|--------|------------|
| Material misstatement detected | Halt close, investigate | Board Secretary + External Auditors |
| Cash position below covenant threshold | Activate emergency funding plan | Board + Lenders |
| Regulatory filing deadline within 48 hours | Prioritise filing above all else | Compliance Officer |
| Fraud suspicion | Activate fraud investigation protocol | Legal + Board Secretary |

**Approvals:** Material commitments (>$100K), policy overrides, emergency actions, financial statement sign-off, M&A terms, capital allocation changes

**Reports Consumed:** Executive Briefing, Cash Position, Liquidity Forecast, Variance Report, Compliance Dashboard, Audit Findings, Tax Position, Board Pack Status

**Reports Produced:** Management Report, Board Financial Package, Quarterly Earnings Summary, Annual Financial Statement, Capital Allocation Decision

**Decisions Made:** Capital allocation, policy exceptions, emergency treasury actions, material financial commitments, M&A financial terms, risk appetite adjustments

**Evidence Required:** Source documents for every figure, approval chain for every commitment, reconciliation status for every balance, audit trail for every adjustment

**KPIs:**
- Time from close completion to executive briefing: <2 hours
- Approval turnaround for material commitments: <4 hours
- Briefing accuracy (no corrections needed): >98%
- Emergency response time: <30 minutes

**Dependencies:** Controller (close status), Treasury Manager (cash position), FP&A Manager (variance analysis), Compliance Officer (regulatory status), Board Secretary (governance status)

**Typical Interruptions:** Escalation requests from specialists, urgent approval requests, ad-hoc financial questions from CEO/Board, regulatory deadline pressure

**Stress Points:** Unknown cash position, unverifiable numbers, incomplete audit trails, deadline pressure without complete data, conflicting information from different specialists

**Time-Sensitive Work:** Cash position (real-time), approval queues (same-day), regulatory filings (hard deadlines), board packages (meeting-date), emergency actions (immediate)

**Automation Opportunities:** Briefing generation, cash position aggregation, approval routing, variance alert threshold monitoring, compliance deadline tracking

**AI Assistance Opportunities:** Trend analysis, anomaly detection, risk scoring, scenario modelling, natural language queries on financial data

**Human-Only Decisions:** Material financial commitments, policy overrides, emergency actions, financial statement sign-off, M&A terms, risk appetite changes

---

### 2.2 Controller

**Mission:** Accuracy, completeness, and timeliness of financial reporting. The Controller ensures the books are right, the close is on track, and the financial statements are audit-ready.

**Responsibilities:**
- Manage month-end, quarter-end, and year-end close processes
- Review and approve journal entries
- Monitor reconciliation status across all accounts
- Assess financial statement readiness
- Track and resolve accounting exceptions
- Maintain chart of accounts integrity
- Ensure GAAP/IFRS compliance in reporting
- Coordinate with external auditors on evidence requests

**Daily Routine:**
| Time | Activity | Source | Output |
|------|----------|--------|--------|
| 07:00 | Review close status dashboard | Controller Dashboard | Status assessment |
| 07:15 | Review pending journal entries for risk | Journal review queue | Approve/reject/flag |
| 07:30 | Check reconciliation exceptions | Reconciliation status | Prioritise investigations |
| 08:00 | Morning standup with CFO | Calendar | Alignment |
| Throughout | Respond to accounting questions from team | Internal queue | Guidance or escalation |

**Weekly Routine:**
- Review account reconciliation completion rate
- Review journal entry aging (entries pending >3 days)
- Review intercompany balance reconciliation
- Review sub-ledger to GL reconciliation status
- 1:1 with accounting team leads

**Month-End Routine:**
| Phase | Timing | Activities | Completion Criteria |
|-------|--------|------------|-------------------|
| Pre-close | WD-5 to WD-3 | Sub-ledger close, accruals, prepayments | All sub-ledgers closed |
| Close | WD-2 to WD-1 | Journal posting, reconciliation, variance review | All reconciliations complete |
| Post-close | WD+0 to WD+1 | Statement preparation, review, approval | Statements approved by CFO |
| Reporting | WD+2 to WD+5 | Management report, board pack, filings | All reports distributed |

**Quarter-End Routine:** All month-end steps plus: tax provision, goodwill/intangible review, forecast update, board package preparation

**Year-End Routine:** All quarter-end steps plus: annual audit coordination, year-end adjustments, financial statement sign-off, statutory filings

**Exception Handling:**
| Exception | Action | Escalation |
|-----------|--------|------------|
| Journal entry risk score >80% | Manual review required before posting | CFO if material |
| Reconciliation exception >$10K | Investigation within 24 hours | CFO if unresolved after 48 hours |
| Close process behind schedule | Escalate with recovery plan | CFO |
| Material misstatement suspected | Halt reporting, investigate | CFO + Audit Committee |

**Approvals:** Journal entries (>$10K), period closes, reconciliation write-offs (>$1K), accounting policy application, estimated journal entries

**Reports Consumed:** GL trial balance, sub-ledger reports, reconciliation status, bank statements, accrual schedules, close checklist

**Reports Produced:** Financial statements, management report, close status, reconciliation summary, journal entry risk assessment, audit evidence packages

**Decisions Made:** Journal approval/rejection, close timing, accounting treatment, reconciliation methodology, exception resolution, accrual estimates

**Evidence Required:** Source documents for every journal, bank statements for every reconciliation, approval chain for every posting, supporting calculations for every estimate

**KPIs:**
- Close completion by WD+2: >95%
- Journal entry risk flag rate: <5%
- Reconciliation completion by WD+1: >90%
- Financial statement accuracy (no post-close adjustments): >99%
- Audit finding rate: <2 per period

**Dependencies:** Treasury Manager (bank data, cash positions), FP&A Manager (budget data, forecasts), Reconciliation Specialist (match results), External Auditors (findings, requests)

**Typical Interruptions:** Journal entry questions from accountants, reconciliation exceptions, close deadline pressure, auditor information requests, CFO ad-hoc requests

**Stress Points:** Close deadline pressure, unreconciled balances at close, unexpected material variances, auditor questions about incomplete evidence, system failures during close

**Time-Sensitive Work:** Close deadlines (hard), journal approvals (same-day), reconciliation exceptions (24-hour SLA), auditor requests (as-committed), period-end accruals (before close)

**Automation Opportunities:** Routine journal posting (pre-approved, recurring), reconciliation matching, close checklist tracking, variance threshold alerts, statement generation

**AI Assistance Opportunities:** Journal risk scoring, anomaly detection in GL, automated reconciliation matching, close process optimization, predictive close timeline

**Human-Only Decisions:** Material journal approvals, accounting treatment judgments, close timing decisions, policy exception approvals, auditor response sign-off

---

### 2.3 Treasury Manager

**Mission:** Cash visibility, liquidity management, and financial risk control. The Treasurer knows where every dollar is, where it is going, and what risks it faces.

**Responsibilities:**
- Maintain real-time cash position across all accounts and entities
- Manage daily cash flow (inflows, outflows, transfers)
- Forecast cash position at 7/30/60/90-day horizons
- Monitor and manage FX exposure
- Manage bank account relationships and connectivity
- Approve treasury operations (transfers, investments, debt draws)
- Monitor counterparty risk
- Ensure compliance with cash management policies

**Daily Routine:**
| Time | Activity | Source | Output |
|------|----------|--------|--------|
| 06:30 | Review overnight bank feeds and positions | Bank feeds + Cash position | Cash status assessment |
| 07:00 | Review treasury dashboard (cash, FX, alerts) | Treasury Dashboard | Priority actions |
| 07:15 | Check pending payments and transfers | Payment queue | Approve/reject |
| 07:30 | Review cash forecast vs actual | Forecast dashboard | Adjust if needed |
| 08:00 | Morning standup with CFO | Calendar | Alignment |
| Throughout | Monitor intraday positions, execute transfers | Real-time feeds | Execution |

**Weekly Routine:**
- Review 7-day rolling forecast accuracy
- Review FX exposure and hedging positions
- Review counterparty risk scores
- Review bank fee analysis
- Reconcile intercompany balances
- 1:1 with treasury team

**Month-End Routine:**
- Finalise month-end cash position
- Reconcile all bank accounts
- Report month-end liquidity ratios
- Review and update 90-day forecast
- Submit treasury report to CFO

**Quarter-End Routine:** All month-end steps plus: bank covenant compliance check, investment portfolio review, debt maturity schedule review, hedge effectiveness testing

**Exception Handling:**
| Exception | Action | Escalation |
|-----------|--------|------------|
| Cash position below minimum threshold | Activate liquidity protocol | CFO (immediate) |
| Bank feed failure | Manual position estimate + investigation | IT + CFO |
| FX exposure exceeds limit | Hedging action required | CFO |
| Counterparty risk downgrade | Review exposure, reduce if needed | CFO |
| Unexpected large payment | Verify and approve/reject | CFO if >$100K |

**Approvals:** Treasury transfers (>$50K), investment changes, debt draws/repayments, FX hedging, bank account changes, counterparty exposure limits

**Reports Consumed:** Bank feeds, cash position, FX rates, payment queue, counterparty data, debt covenants, investment positions

**Reports Produced:** Cash position report, liquidity forecast, FX exposure report, treasury operations summary, bank reconciliation, counterparty risk assessment

**Decisions Made:** Transfer timing, investment allocation, FX hedging, counterparty exposure, cash pooling, funding strategy

**Evidence Required:** Bank confirmations for positions, rate sources for FX, approval chains for operations, counterparty ratings for risk, covenant calculations for compliance

**KPIs:**
- Cash position accuracy: 100% (verified daily)
- Forecast accuracy (7-day): >95%
- Transfer execution time: <2 hours from approval
- FX hedge effectiveness: >90%
- Bank reconciliation completion: same day

**Dependencies:** Controller (GL balances, reconciliation status), FP&A Manager (cash forecasts, budget), Compliance Officer (policy limits), external banks (feeds, confirmations)

**Typical Interruptions:** Bank feed issues, transfer requests, FX rate changes, payment exceptions, CFO cash position queries, bank relationship calls

**Stress Points:** Unknown cash position, bank feed failures, large unexpected outflows, FX volatility, covenant breach risk, weekend/holiday coverage

**Time-Sensitive Work:** Intraday cash position (real-time), payment processing (cut-off times), FX hedging (market hours), bank reconciliation (daily), forecast updates (as-needed)

**Automation Opportunities:** Cash position aggregation, bank reconciliation matching, payment routing, FX rate monitoring, covenant threshold alerts, forecast model updates

**AI Assistance Opportunities:** Cash flow prediction, anomaly detection in transactions, optimal payment timing, FX trend analysis, counterparty risk scoring

**Human-Only Decisions:** Large transfers (>$50K), investment strategy changes, hedging decisions, bank account changes, covenant waivers, emergency funding

---

### 2.4 FP&A Manager

**Mission:** Financial planning, analysis, and strategic decision support. The FP&A Manager transforms data into insight and insight into strategy.

**Responsibilities:**
- Manage budget vs actual variance analysis
- Produce rolling forecasts and reforecasts
- Build and maintain financial models and scenarios
- Prepare management reporting packages
- Analyse business performance by segment/product/region
- Support strategic planning and M&A analysis
- Track KPIs and performance metrics
- Provide decision support for capital allocation

**Daily Routine:**
| Time | Activity | Source | Output |
|------|----------|--------|--------|
| 07:00 | Review FP&A dashboard (variances, forecasts, alerts) | Planning Dashboard | Awareness |
| 07:15 | Check for material variance alerts | Variance monitor | Investigation priorities |
| 07:30 | Review latest forecast updates | Forecast system | Model validation |
| Throughout | Ad-hoc analysis requests from CFO and business leaders | Request queue | Analysis delivery |

**Weekly Routine:**
- Update rolling forecast with latest actuals
- Review variance explanations from business units
- Prepare weekly flash report for CFO
- Review scenario model outputs
- 1:1 with FP&A team

**Month-End Routine:**
- Produce detailed variance report (actual vs budget vs prior year)
- Update rolling forecast for next 12 months
- Prepare management report narratives
- Analyse material variances with root cause
- Submit analysis to Controller for statement integration

**Quarter-End Routine:** All month-end steps plus: reforecast for remainder of year, quarterly board analysis, M&A scenario updates, long-range plan review

**Exception Handling:**
| Exception | Action | Escalation |
|-----------|--------|------------|
| Variance >10% of budget | Deep-dive investigation | CFO |
| Forecast accuracy <80% | Model review and recalibration | CFO |
| Data quality issue in financials | Halt analysis, escalate to Controller | Controller |
| Strategic request from CEO | Priority analysis | CFO |

**Approvals:** Forecast assumptions, variance explanations, model methodology changes, report distribution lists

**Reports Consumed:** GL trial balance, sub-ledger data, budget data, prior year actuals, market data, industry benchmarks, operational metrics

**Reports Produced:** Variance report, rolling forecast, management report, scenario analysis, KPI dashboard, board analysis, ad-hoc analyses

**Decisions Made:** Forecast methodology, variance root cause, scenario assumptions, KPI targets, analysis priority, model changes

**Evidence Required:** Source data for every assumption, methodology documentation for every model, comparison data for every variance, confidence intervals for every forecast

**KPIs:**
- Forecast accuracy (12-month): >85%
- Variance report delivery: within 3 business days of close
- Ad-hoc analysis turnaround: <24 hours (standard), <4 hours (urgent)
- Model documentation currency: 100%
- Executive briefing accuracy: >95%

**Dependencies:** Controller (actuals, GL data), Treasury (cash forecasts, FX rates), Compliance (regulatory requirements), Business Units (operational drivers, assumptions)

**Typical Interruptions:** CFO ad-hoc analysis requests, business unit variance questions, model troubleshooting, forecast data quality issues, board preparation requests

**Stress Points:** Stale forecasts, unexplained material variances, data quality issues, model failures, last-minute board requests, conflicting assumptions from business units

**Time-Sensitive Work:** Variance report (3 WD after close), ad-hoc analysis (as-committed), forecast updates (monthly), board package (10 WD before meeting), strategic analysis (as-needed)

**Automation Opportunities:** Variance calculation, forecast data aggregation, report generation, KPI monitoring, data quality checks, scenario model execution

**AI Assistance Opportunities:** Anomaly detection in variances, natural language variance explanations, scenario suggestion, trend prediction, assumption sensitivity analysis

**Human-Only Decisions:** Forecast assumptions, variance root cause judgment, scenario methodology, model validation, strategic recommendations, board presentation sign-off

---

### 2.5 Auditor (Internal)

**Mission:** Independent assurance on the effectiveness of internal controls, the accuracy of financial reporting, and compliance with policies and regulations.

**Responsibilities:**
- Test internal controls for design and operating effectiveness
- Track and verify remediation of audit findings
- Maintain audit evidence packages
- Assess control design gaps
- Monitor audit trail completeness
- Prepare for and coordinate with external auditors
- Conduct special investigations as directed
- Report findings to Audit Committee

**Daily Routine:**
| Time | Activity | Source | Output |
|------|----------|--------|--------|
| 07:00 | Review audit dashboard (findings, controls, trail status) | Audit Dashboard | Awareness |
| 07:15 | Check audit trail completeness for critical flows | Audit trail system | Gap identification |
| 07:30 | Review open findings and remediation status | Finding tracker | Escalation if overdue |
| Throughout | Conduct tests, gather evidence, document findings | Various systems | Test results |

**Weekly Routine:**
- Review control test results for the week
- Update finding tracker and remediation status
- Review external auditor pending requests
- 1:1 with audit team members

**Month-End Routine:**
- Run automated control tests on month-end close process
- Verify reconciliation completeness for material accounts
- Review journal entry controls
- Update audit risk assessment
- Prepare monthly audit summary for CFO

**Quarter-End Routine:** All month-end steps plus: quarterly control testing cycle, external auditor coordination, Audit Committee presentation preparation, risk assessment refresh

**Exception Handling:**
| Exception | Action | Escalation |
|-----------|--------|------------|
| Material control deficiency | Immediate escalation | CFO + Audit Committee |
| Audit trail gap in critical flow | Investigation within 24 hours | Controller + CFO |
| Finding remediation overdue | Escalation with new deadline | Finding owner + CFO |
| Fraud indicator detected | Activate fraud protocol | CFO + Legal + Board Secretary |

**Approvals:** Audit plan changes, finding classifications, remediation acceptances, special investigation scope

**Reports Consumed:** Audit trail logs, control test results, finding tracker, reconciliation status, journal entry logs, system access logs, policy documents

**Reports Produced:** Audit findings, control assessments, remediation status, audit trail completeness report, risk assessment, Audit Committee report

**Decisions Made:** Finding severity, remediation adequacy, control design effectiveness, risk prioritisation, investigation scope, audit plan adjustments

**Evidence Required:** Test documentation, sample selections, trail screenshots, policy references, control walkthrough records, management responses

**KPIs:**
- Audit plan completion: >90% on schedule
- Finding remediation on time: >85%
- Audit trail completeness (critical flows): 100%
- External auditor requests fulfilled: <5 business days
- Control deficiency closure rate: >80% within 90 days

**Dependencies:** Controller (GL data, close process), Compliance Officer (policy documents, violation history), IT (system access, logs), all business units (evidence, access, responses)

**Typical Interruptions:** Evidence requests from external auditors, control test failures, finding remediation questions, special investigation requests, system access changes

**Stress Points:** Finding remediation delays, incomplete audit trails, external auditor pressure, fraud indicators, access limitations during testing, tight reporting deadlines

**Time-Sensitive Work:** External auditor requests (as-committed), fraud indicators (immediate), control test deadlines (planned), Audit Committee materials (10 WD before meeting), remediation tracking (ongoing)

**Automation Opportunities:** Automated control testing, audit trail monitoring, finding tracking, risk score calculation, evidence package assembly, compliance checking

**AI Assistance Opportunities:** Risk-based audit planning, anomaly detection in transactions, natural language finding summaries, control design gap analysis, trend detection in findings

**Human-Only Decisions:** Finding severity judgment, control design assessment, fraud investigation conclusions, audit plan priorities, Audit Committee communications

---

### 2.6 Compliance Officer

**Mission:** Regulatory compliance, policy adherence, and violation management. The Compliance Officer ensures Perionyx operates within all applicable laws, regulations, and internal policies.

**Responsibilities:**
- Monitor compliance with all applicable regulations
- Track and manage policy violations
- Manage regulatory filing deadlines
- Review and approve policy exceptions
- Maintain compliance documentation
- Monitor regulatory changes
- Coordinate with legal counsel on regulatory interpretation
- Report compliance status to CFO and Board

**Daily Routine:**
| Time | Activity | Source | Output |
|------|----------|--------|--------|
| 07:00 | Review compliance dashboard (score, violations, deadlines) | Compliance Dashboard | Status assessment |
| 07:15 | Check new violations detected overnight | Violation monitor | Triage and assign |
| 07:30 | Review upcoming deadlines (7-day view) | Deadline tracker | Preparation |
| Throughout | Investigate violations, review policy exceptions | Various systems | Resolution |

**Weekly Routine:**
- Review violation trend analysis
- Check regulatory update feeds for new requirements
- Review pending policy exception requests
- Update compliance risk assessment
- 1:1 with compliance team

**Month-End Routine:**
- Compile monthly compliance report
- Review all open violations and remediation status
- Update compliance scorecard
- Submit report to CFO

**Quarter-End Routine:** All month-end steps plus: regulatory filing preparation, policy review cycle, compliance training review, Board compliance report

**Exception Handling:**
| Exception | Action | Escalation |
|-----------|--------|------------|
| Critical violation detected | Immediate containment | CFO + Legal |
| Regulatory deadline within 48 hours | Priority processing | CFO |
| Policy exception request >$500K | Review and recommend | CFO for approval |
| Regulatory change affecting operations | Impact assessment within 5 business days | CFO + Controller |

**Approvals:** Policy exceptions (within authority), violation remediation plans, compliance report distribution, regulatory filing submissions

**Reports Consumed:** Violation database, policy registry, regulatory feeds, audit findings, control test results, transaction monitoring alerts

**Reports Produced:** Compliance scorecard, violation report, regulatory filing status, policy exception register, compliance training status, Board compliance report

**Decisions Made:** Violation severity, remediation adequacy, policy interpretation, exception approval/rejection, filing priority, regulatory response strategy

**Evidence Required:** Policy documents, regulatory references, violation evidence, remediation documentation, training records, filing confirmations

**KPIs:**
- Compliance score: >95%
- Violation resolution within SLA: >90%
- Regulatory filing on time: 100%
- Policy exception turnaround: <3 business days
- Regulatory change impact assessment: within 10 business days

**Dependencies:** Controller (financial data, GL), Audit (control findings), Legal (regulatory interpretation), HR (training records), IT (system controls)

**Typical Interruptions:** New violation alerts, deadline pressure, policy exception requests, regulatory change notifications, audit finding responses, employee compliance questions

**Stress Points:** Unknown violations, regulatory changes without notice, deadline pressure, policy ambiguity, incomplete violation evidence, conflicting regulatory requirements across jurisdictions

**Time-Sensitive Work:** Regulatory filings (hard deadlines), critical violations (immediate), policy exceptions (3 WD), regulatory change assessment (10 WD), compliance training (quarterly)

**Automation Opportunities:** Violation detection, deadline tracking, policy exception routing, compliance score calculation, regulatory change monitoring, training tracking

**AI Assistance Opportunities:** Regulatory change summarization, violation pattern detection, policy gap analysis, risk-based prioritization, natural language compliance queries

**Human-Only Decisions:** Violation severity judgment, policy interpretation, exception approval, regulatory response strategy, Board communications, training content decisions

---

### 2.7 Tax Manager

**Mission:** Tax compliance, tax planning, and tax risk management across all jurisdictions.

**Responsibilities:**
- Track tax filing deadlines across all jurisdictions
- Prepare and review tax provisions
- Manage transfer pricing documentation
- Coordinate with external tax advisors
- Monitor tax law changes and assess impact
- Prepare tax returns and filings
- Manage tax audit responses
- Optimise tax position within legal boundaries

**Daily Routine:**
| Time | Activity | Source | Output |
|------|----------|--------|--------|
| 07:00 | Review tax dashboard (deadlines, positions, alerts) | Tax Dashboard | Status assessment |
| 07:15 | Check filing deadline calendar (next 30 days) | Deadline tracker | Preparation priorities |
| 07:30 | Review new tax law alerts | Tax feed | Impact assessment |
| Throughout | Prepare filings, respond to queries | Various systems | Filing deliverables |

**Weekly Routine:**
- Review tax position by jurisdiction
- Check transfer pricing documentation currency
- Review pending tax authority correspondence
- Update tax provision estimates
- 1:1 with tax team

**Month-End Routine:**
- Update tax provision estimates
- Reconcile tax accounts
- Review withholding tax compliance
- Prepare tax cash flow forecast

**Quarter-End Routine:** All month-end steps plus: quarterly estimated tax payments, transfer pricing adjustments, tax provision review, Board tax summary

**Exception Handling:**
| Exception | Action | Escalation |
|-----------|--------|------------|
| Filing deadline within 72 hours | Priority processing | CFO |
| Tax authority audit notice | Activate response protocol | CFO + Legal |
| Transfer pricing adjustment >$100K | Review and approve | CFO |
| Tax law change affecting position | Impact assessment within 10 business days | CFO |

**Approvals:** Tax provisions, filing submissions, transfer pricing documentation, tax authority responses, advisor engagements

**Reports Consumed:** GL data, payroll data, intercompany transactions, jurisdiction data, tax law updates, prior filings, authority correspondence

**Reports Produced:** Tax provisions, tax returns, transfer pricing documentation, tax cash flow forecast, tax risk assessment, Board tax summary

**Decisions Made:** Tax treatment, provision methodology, filing strategy, transfer pricing methodology, audit response, planning recommendations

**Evidence Required:** Source calculations, jurisdiction-specific documentation, authority references, prior filing records, advisor opinions, supporting transactions

**KPIs:**
- Filing on time: 100%
- Tax provision accuracy: >98%
- Transfer pricing documentation currency: 100%
- Tax audit adjustment rate: <2% of total provision
- Advisor cost management: within budget

**Dependencies:** Controller (GL data, intercompany), FP&A (forecasts, budgets), Treasury (cash positions, payments), Legal (regulatory interpretation), External advisors (specialist guidance)

**Typical Interruptions:** Filing deadline pressure, tax authority correspondence, GL data quality questions, advisor coordination, employee tax questions, law change notifications

**Stress Points:** Filing deadlines, ambiguous tax positions, law changes, audit exposure, multi-jurisdiction complexity, data quality from other systems

**Time-Sensitive Work:** Filing deadlines (hard), estimated payments (hard), authority responses (statutory), provision updates (period-end), law change assessment (10 WD)

**Automation Opportunities:** Provision calculation, withholding tax tracking, deadline monitoring, filing status tracking, transfer pricing data collection, law change monitoring

**AI Assistance Opportunities:** Tax law summarisation, provision anomaly detection, jurisdiction comparison, risk-based filing prioritisation, planning scenario modelling

**Human-Only Decisions:** Tax treatment judgment, provision methodology, audit response strategy, planning recommendations, authority negotiation, advisor selection

---

### 2.8 Board Secretary

**Mission:** Board governance — meeting preparation, resolution tracking, governance compliance, and fiduciary documentation.

**Responsibilities:**
- Prepare and distribute board packs
- Track board resolutions and actions
- Maintain governance documentation
- Coordinate board meeting logistics
- Ensure regulatory governance compliance
- Manage delegation of authority records
- Prepare governance reports for CFO
- Coordinate with legal on governance matters

**Daily Routine:**
| Time | Activity | Source | Output |
|------|----------|--------|--------|
| 07:00 | Review board dashboard (meetings, resolutions, governance) | Board Dashboard | Status assessment |
| 07:15 | Check resolution action items due | Action tracker | Follow-up |
| 07:30 | Review board pack completeness for next meeting | Pack builder | Gap identification |
| Throughout | Prepare materials, track actions | Various systems | Governance deliverables |

**Weekly Routine:**
- Review upcoming meeting preparation status
- Check resolution action completion
- Update governance compliance scorecard
- Review delegation of authority register

**Month-End Routine:**
- Compile governance compliance report
- Review all open resolution actions
- Update board calendar for next quarter
- Submit governance report to CFO

**Quarter-End Routine:** All month-end steps plus: quarterly board meeting preparation, annual governance review, committee report compilation, regulatory governance filing

**Exception Handling:**
| Exception | Action | Escalation |
|-----------|--------|------------|
| Board pack incomplete 5 WD before meeting | Escalate to content owners | CFO |
| Resolution action overdue >30 days | Escalate to action owner and CFO | CFO |
| Governance compliance gap identified | Immediate remediation plan | CFO + Legal |
| Regulatory governance deadline within 48 hours | Priority processing | CFO |

**Approvals:** Board pack distribution, resolution drafts, governance report content, delegation changes

**Reports Consumed:** Board pack documents, resolution register, governance policies, delegation of authority, regulatory requirements, meeting minutes

**Reports Produced:** Board packs, resolution register, governance compliance report, delegation of authority register, meeting minutes, governance risk assessment

**Decisions Made:** Pack completeness, resolution classification, governance compliance status, delegation adequacy, meeting agenda priority

**Evidence Required:** Board documents, resolution records, delegation records, governance policies, regulatory references, meeting attendance

**KPIs:**
- Board pack delivery: >5 WD before meeting
- Resolution action completion: >90% on time
- Governance compliance score: >95%
- Meeting minutes distribution: within 3 WD
- Regulatory governance filing: 100% on time

**Dependencies:** CFO (content approval, strategic direction), Controller (financial data for packs), Compliance (regulatory governance), Legal (governance interpretation), all business units (content for packs)

**Typical Interruptions:** Last-minute content changes, resolution action follow-ups, meeting scheduling conflicts, regulatory governance queries, director questions

**Stress Points:** Tight meeting deadlines, incomplete content from business units, regulatory governance requirements, resolution action tracking across organisation, confidential material handling

**Time-Sensitive Work:** Board pack distribution (5 WD before meeting), meeting minutes (3 WD after meeting), resolution actions (as-committed), regulatory filings (hard deadlines), governance reports (quarterly)

**Automation Opportunities:** Pack assembly, resolution tracking, compliance score calculation, deadline monitoring, action item routing, attendance tracking

**AI Assistance Opportunities:** Pack completeness analysis, resolution trend detection, governance gap identification, natural language minutes summarisation, regulatory change impact

**Human-Only Decisions:** Pack content judgment, resolution interpretation, governance compliance assessment, delegation decisions, Board communications, regulatory response

---

### 2.9 Finance Operations Manager

**Mission:** Operational efficiency of financial processes — transaction processing, payment operations, accounts payable/receivable, and shared service delivery.

**Responsibilities:**
- Oversee daily transaction processing
- Manage payment operations and approval workflows
- Monitor accounts payable and receivable ageing
- Coordinate shared service delivery
- Track operational KPIs and SLAs
- Manage vendor and customer queries
- Oversee data quality and reconciliation
- Support month-end and year-end processes

**Daily Routine:**
| Time | Activity | Source | Output |
|------|----------|--------|--------|
| 07:00 | Review operations dashboard (transactions, payments, ageing) | Operations Dashboard | Status assessment |
| 07:15 | Check payment queue for approvals | Payment queue | Approve/reject |
| 07:30 | Review transaction exceptions | Exception queue | Triage |
| Throughout | Process transactions, resolve exceptions | Various systems | Operational completion |

**Weekly Routine:**
- Review AP/AR ageing trends
- Check payment run status
- Review vendor/customer dispute queue
- Update operational KPI dashboard
- 1:1 with operations team leads

**Month-End Routine:**
- Support Controller with sub-ledger close
- Finalise AP/AR ageing
- Complete vendor/customer reconciliations
- Prepare operations report for Controller

**Exception Handling:**
| Exception | Action | Escalation |
|-----------|--------|------------|
| Payment processing failure | Investigate and retry or escalate | Treasury Manager |
| Duplicate payment detected | Halt and investigate | Controller |
| Vendor dispute >$10K | Escalate to resolution team | Controller |
| Data quality issue affecting close | Immediate investigation | Controller |

**Approvals:** Payment batches (within limits), vendor setup changes, customer credit adjustments, write-offs (within limits), operational procedure changes

**Reports Consumed:** Transaction queue, payment queue, AP/AR ageing, vendor data, customer data, bank feeds, GL data

**Reports Produced:** Operations dashboard, payment status, AP/AR ageing, exception report, operational KPI report, data quality report

**Decisions Made:** Payment timing, exception resolution, process improvements, vendor/customer terms, data quality fixes, staffing allocation

**Evidence Required:** Transaction records, approval chains, bank confirmations, vendor/customer documentation, reconciliation records, audit trails

**KPIs:**
- Transaction processing accuracy: >99.9%
- Payment processing time: <24 hours from approval
- AP/AR ageing: <30 days average
- Exception resolution: <48 hours
- Data quality score: >98%

**Dependencies:** Treasury Manager (bank feeds, payment execution), Controller (GL data, close requirements), Compliance (regulatory requirements), IT (system availability)

**Typical Interruptions:** Payment failures, transaction exceptions, vendor/customer queries, system outages, close support requests, process improvement requests

**Stress Points:** Payment deadlines, transaction volumes during close, system failures, data quality issues, vendor/customer escalations, staffing gaps

**Time-Sensitive Work:** Payment processing (cut-off times), transaction processing (daily), close support (period-end), exception resolution (24-hour SLA), vendor payments (as-committed)

**Automation Opportunities:** Transaction matching, payment routing, ageing calculations, exception detection, reconciliation, report generation

**AI Assistance Opportunities:** Anomaly detection in transactions, predictive payment timing, vendor/customer risk scoring, process optimisation, natural language query support

**Human-Only Decisions:** Payment approval (material), exception judgment, vendor/customer relationship, process design, dispute resolution, write-off decisions

---

### 2.10 Shared Services Coordinator

**Mission:** Cross-functional coordination, standardisation, and efficiency of shared financial services across business units and entities.

**Responsibilities:**
- Coordinate cross-entity financial processes
- Standardise financial procedures across business units
- Manage shared service SLAs and performance
- Facilitate intercompany transactions and reconciliation
- Support multi-entity reporting and consolidation
- Coordinate cross-functional projects
- Monitor shared service quality and efficiency
- Drive process improvement initiatives

**Daily Routine:**
| Time | Activity | Source | Output |
|------|----------|--------|--------|
| 07:00 | Review shared services dashboard | SS Dashboard | Status assessment |
| 07:15 | Check intercompany transaction queue | IC queue | Process/review |
| 07:30 | Review cross-entity reconciliation status | Recon status | Triage exceptions |
| Throughout | Coordinate across entities, resolve conflicts | Various systems | Resolution |

**Weekly Routine:**
- Review shared service SLA performance
- Check intercompany balance positions
- Review cross-entity process exceptions
- Update standardisation roadmap
- 1:1 with shared services team

**Month-End Routine:**
- Coordinate intercompany elimination entries
- Support consolidation process
- Review cross-entity reconciliation completion
- Prepare shared services performance report

**Exception Handling:**
| Exception | Action | Escalation |
|-----------|--------|------------|
| Intercompany imbalance >$10K | Investigate and resolve within 24 hours | Controller |
| SLA breach on shared service | Root cause analysis | CFO |
| Cross-entity process failure | Activate backup process | Controller |
| Consolidation data quality issue | Halt consolidation, investigate | Controller |

**Approvals:** Intercompany transactions (within limits), process standardisation changes, SLA adjustments, shared service scope changes

**Reports Consumed:** Intercompany transactions, entity data, SLA metrics, process documentation, consolidation data, operational metrics

**Reports Produced:** Shared services dashboard, intercompany reconciliation, consolidation support, performance report, process improvement recommendations, standardisation status

**Decisions Made:** Process standardisation, SLA management, intercompany resolution, consolidation methodology, resource allocation, improvement priorities

**Evidence Required:** Transaction records across entities, reconciliation documentation, SLA evidence, process documentation, improvement metrics, audit trails

**KPIs:**
- Intercompany reconciliation: 100% within 24 hours of period end
- SLA compliance: >95%
- Process standardisation coverage: >80%
- Consolidation accuracy: >99%
- Shared service cost efficiency: improving quarter-over-quarter

**Dependencies:** Controller (close coordination, GL data), Treasury Manager (intercompany payments), Compliance Officer (regulatory requirements across entities), all entity controllers (data, reconciliation)

**Typical Interruptions:** Intercompany disputes, entity-level exceptions, consolidation questions, process standardisation requests, SLA negotiations, cross-entity coordination

**Stress Points:** Intercompany imbalances at close, consolidation failures, cross-entity data quality, conflicting entity-level requirements, resource constraints across entities

**Time-Sensitive Work:** Intercompany reconciliation (period-end), consolidation (post-close), SLA reporting (monthly), process changes (as-approved), cross-entity coordination (daily)

**Automation Opportunities:** Intercompany matching, consolidation calculations, SLA monitoring, process compliance checking, performance reporting, standardisation tracking

**AI Assistance Opportunities:** Intercompany pattern detection, process optimisation suggestions, anomaly detection across entities, natural language consolidation queries, predictive resource needs

**Human-Only Decisions:** Process design, SLA negotiations, intercompany dispute resolution, consolidation methodology, standardisation priorities, resource allocation

---

## Part III — Enterprise Workflow Catalog

### 3.1 Month-End Close Workflow

**Type:** Periodic (Monthly)
**Trigger:** Calendar — last business day of month
**Participants:** Controller, Accountants, Treasury Manager, FP&A Manager, Reconciliation Specialist
**Duration:** 5 business days (WD-5 to WD+2)

| Phase | Days | Owner | Activities | Gate Criteria |
|-------|------|-------|------------|---------------|
| **Pre-close** | WD-5 to WD-3 | Controller | Sub-ledger close, accrual calculations, prepayment schedules, depreciation runs | All sub-ledgers closed, all accruals posted |
| **Journal review** | WD-3 to WD-2 | Controller + Accountants | Journal entry creation, review, risk scoring, approval | All material journals approved |
| **Reconciliation** | WD-2 to WD-1 | Accountants + Recon Specialist | Balance reconciliation, exception investigation, write-off approval | All material balances reconciled |
| **Variance review** | WD-1 | FP&A Manager + Controller | Budget vs actual analysis, material variance identification, explanation gathering | All material variances explained |
| **Statement preparation** | WD+0 | Controller | Trial balance review, financial statement preparation, disclosure checklist | Statements draft-complete |
| **Statement review** | WD+1 | Controller + CFO | CFO review, question resolution, adjustments if needed | CFO approved |
| **Reporting** | WD+2 | Controller + FP&A | Management report finalisation, board pack preparation, filing preparation | Reports distributed |

**Inputs:** GL trial balance, sub-ledger reports, bank reconciliations, accrual schedules, budget data, prior year actuals

**Evidence:** Every journal has source document. Every reconciliation has bank statement or supporting evidence. Every variance has explanation. Every adjustment has approval.

**Approvals:** Journal entries (Controller), period close (Controller), financial statements (CFO), management report (CFO)

**Decision Points:** Journal risk assessment (automated + human review), variance materiality judgment, reconciliation exception resolution, statement adjustment decisions

**Automation:** Sub-ledger close triggers, journal risk scoring, reconciliation matching, variance calculation, statement generation, checklist tracking

**Outputs:** Closed GL, reconciled balances, financial statements, management report, variance report, audit trail

**Audit Trail:** Every phase completion timestamped with actor. Every journal entry has creation → risk score → approval → posting history. Every reconciliation has matching → exception → resolution history. Every variance has identification → explanation → sign-off history.

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Sub-ledger fails to close | IT investigation + manual close option | 4 hours |
| Journal approval delayed | Escalation to Controller → CFO | 24 hours |
| Reconciliation exception unresolved | Escalation with investigation plan | 48 hours |
| Statement material adjustment needed | Restart from affected phase | None |
| System failure during close | Resume from last checkpoint | None |

**Success Criteria:** All phases complete by WD+2. All material balances reconciled. All material variances explained. CFO approved statements. Management report distributed.

---

### 3.2 Journal Approval Workflow

**Type:** Operational (Daily)
**Trigger:** Journal entry submitted
**Participants:** Accountant (submitter), Controller (approver), CFO (escalation)
**Duration:** Same day (standard), 24 hours (material)

| Step | Actor | Activity | Gate |
|------|-------|----------|------|
| **1. Create** | Accountant | Enter journal with description, accounts, amounts, supporting evidence | All required fields present |
| **2. Risk score** | System | Automated risk assessment (amount, account, frequency, timing, pattern) | Score computed |
| **3. Route** | System | Route based on risk score and amount thresholds | Correct approver selected |
| **4. Review** | Approver | Review journal, evidence, risk score, supporting documents | Review complete |
| **5. Decision** | Approver | Approve, reject, or request revision | Decision recorded |
| **6. Post** | System | Post to GL if approved, record posting timestamp | Posted + audit trail |

**Inputs:** Journal request with accounts, amounts, description, supporting documents, business justification

**Evidence:** Source document (invoice, contract, calculation), business justification, risk score with factors, approval decision with timestamp and comments

**Approvals:** Standard (Controller), Material (>$50K: CFO), Policy exception (CFO + Compliance)

**Decision Points:** Risk assessment (automated), materiality judgment (threshold-based), accounting treatment (human judgment), approval decision (human)

**Automation:** Risk scoring, routing, duplicate detection, posting, GL update, audit trail creation

**Outputs:** Posted journal entry, GL update, audit trail record, notification to submitter

**Audit Trail:** Creation (actor, timestamp, fields) → Risk score (score, factors) → Routing (approver, timestamp) → Review (actor, timestamp) → Decision (action, actor, timestamp, comments) → Posting (timestamp, GL reference)

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Risk scoring fails | Route to Controller for manual review | None |
| Approver unavailable | Auto-delegate per delegation rules | 24 hours |
| GL posting fails | Retry + escalate to IT | 1 hour |
| Duplicate detected | Block + notify submitter | None |

**Success Criteria:** Journal posted to GL within SLA. Audit trail complete. No unreviewed material entries.

---

### 3.3 Treasury Review Workflow

**Type:** Operational (Daily)
**Trigger:** Market open (06:30 local time)
**Participants:** Treasury Manager, Treasury Analyst, CFO (escalation)
**Duration:** 30 minutes (standard), immediate (crisis)

| Step | Actor | Activity | Output |
|------|-------|----------|--------|
| **1. Position aggregation** | System | Collect all bank feeds, compute consolidated cash position | Cash position report |
| **2. Alert review** | Treasury Manager | Review overnight alerts, FX movements, payment failures | Alert disposition |
| **3. Forecast check** | Treasury Manager | Compare actual position to forecast, identify deviations | Variance assessment |
| **4. Action planning** | Treasury Manager | Plan intraday actions (transfers, investments, hedging) | Action list |
| **5. Execution** | Treasury Analyst | Execute approved actions | Execution confirmations |
| **6. Reporting** | Treasury Manager | Update treasury dashboard, notify CFO if material | Status update |

**Inputs:** Bank feeds, FX rates, payment queue, forecast data, counterparty data, policy limits

**Evidence:** Bank confirmations for positions, rate sources for FX, approval chains for actions, forecast comparison data

**Approvals:** Transfers >$50K (CFO), Investment changes (CFO), FX hedging (CFO), Policy exceptions (CFO)

**Decision Points:** Action priority, transfer timing, hedging decisions, counterparty actions, escalation triggers

**Automation:** Position aggregation, alert generation, forecast comparison, action routing, execution processing, status updates

**Outputs:** Updated cash position, executed actions, treasury status report, CFO notification if material

**Audit Trail:** Position computation (timestamp, sources) → Alert review (actor, disposition) → Forecast comparison (variance, assessment) → Action plan (actor, timestamp) → Execution (action, timestamp, confirmation) → Reporting (timestamp, distribution)

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Bank feed failure | Manual estimate + investigation | 2 hours |
| Execution failure | Retry + escalate | 30 minutes |
| Position computation error | Manual verification | 1 hour |
| FX rate source unavailable | Use alternative source | 15 minutes |

**Success Criteria:** Cash position verified by 07:00. All alerts reviewed by 07:30. All planned actions executed by market close. Dashboard updated.

---

### 3.4 Cash Forecast Workflow

**Type:** Operational (Weekly) + Periodic (Monthly refresh)
**Trigger:** Weekly: every Monday. Monthly: WD+3 after close.
**Participants:** Treasury Manager, FP&A Manager, Treasury Analyst
**Duration:** 2 hours (weekly), 1 day (monthly)

| Step | Actor | Activity | Output |
|------|-------|----------|--------|
| **1. Data collection** | System | Gather actual cash flows, pending payments, known inflows | Raw data set |
| **2. Model update** | System | Update forecast model with latest actuals | Updated model |
| **3. Assumption review** | FP&A Manager | Review and validate forecast assumptions | Validated assumptions |
| **4. Forecast generation** | System | Generate 7/30/60/90-day cash forecasts | Forecast output |
| **5. Review** | Treasury Manager | Review forecast, compare to prior, assess reasonableness | Reviewed forecast |
| **6. Sign-off** | Treasury Manager | Approve forecast for distribution | Approved forecast |
| **7. Distribution** | System | Distribute to CFO, Controller, FP&A | Distributed |

**Inputs:** Actual cash flows, pending payments, known inflows/outflows, budget data, AR/AP ageing, historical patterns, assumption inputs

**Evidence:** Model documentation, assumption sources, comparison to actuals, confidence ranges, methodology disclosure

**Approvals:** Monthly forecast assumptions (FP&A Manager), final forecast (Treasury Manager)

**Decision Points:** Assumption validation, model adjustment, methodology changes, confidence disclosure

**Automation:** Data collection, model computation, distribution, variance tracking

**Outputs:** 7/30/60/90-day cash forecasts, assumption documentation, variance analysis vs prior forecast, confidence ranges

**Audit Trail:** Data sources (timestamp, completeness) → Model update (timestamp, version) → Assumption review (actor, timestamp, changes) → Forecast (timestamp, values) → Review (actor, timestamp) → Sign-off (actor, timestamp) → Distribution (timestamp, recipients)

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Data feed incomplete | Use available data + document gap | None |
| Model computation error | Manual review + fix | 2 hours |
| Assumption conflict | Escalate to CFO | None |

**Success Criteria:** Forecast delivered within SLA. Assumptions documented. Confidence ranges included. Comparison to prior forecast included.

---

### 3.5 Budget Approval Workflow

**Type:** Strategic (Annual)
**Trigger:** Annual planning cycle (typically Q4 for following year)
**Participants:** Business Unit Leaders, FP&A Manager, Controller, CFO, Board (if material)
**Duration:** 4-6 weeks

| Phase | Duration | Activities | Gate |
|-------|----------|------------|------|
| **1. Planning** | Week 1-2 | Business units prepare budget requests with assumptions | Requests submitted |
| **2. Review** | Week 2-3 | FP&A reviews, challenges, consolidates | Consolidated budget draft |
| **3. Negotiation** | Week 3-4 | FP&A + CFO negotiate with business units | Agreed budget |
| **4. Approval** | Week 4-5 | CFO reviews, makes final adjustments | CFO approved |
| **5. Board** | Week 5-6 | Board review (if material, >10% of revenue) | Board approved |
| **6. Load** | Week 6 | Load approved budget into system | Budget loaded |

**Inputs:** Business unit requests, prior year actuals, strategic plan, market assumptions, capital requirements, headcount plans

**Evidence:** Business unit justifications, FP&A analysis, comparison to benchmarks, sensitivity analysis, board presentation

**Approvals:** Business unit level (BU leaders), consolidated (CFO), material changes (>10% of revenue: Board)

**Decision Points:** Resource allocation, priority ranking, assumption validation, materiality assessment

**Automation:** Consolidation, variance analysis, scenario modelling, loading, tracking

**Outputs:** Approved annual budget, loaded in system, budget vs actual tracking enabled, board resolution if material

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Business unit late submission | Escalate to CFO, extend deadline once | 5 business days |
| Material disagreement | CFO mediation | 1 week |
| Board not convened | Continue with CFO-approved budget | Board next meeting |

**Success Criteria:** Budget loaded before period start. All business units covered. Board approved if material. Assumptions documented.

---

### 3.6 Variance Investigation Workflow

**Type:** Investigative (Triggered)
**Trigger:** Variance exceeds threshold (>10% of budget or >$50K)
**Participants:** FP&A Manager, Business Unit, Controller, CFO (if material)
**Duration:** 1-5 business days depending on complexity

| Step | Actor | Activity | Output |
|------|-------|----------|--------|
| **1. Detection** | System | Automated variance detection, threshold alert | Variance alert |
| **2. Triage** | FP&A Manager | Assess materiality, assign investigation | Investigation assigned |
| **3. Investigation** | Analyst + Business Unit | Identify root cause, gather evidence | Root cause analysis |
| **4. Explanation** | FP&A Manager | Document explanation with evidence | Documented explanation |
| **5. Review** | Controller | Review explanation, verify data accuracy | Reviewed explanation |
| **6. Disposition** | FP&A Manager | Close or escalate based on materiality | Disposition recorded |
| **7. Action** | Business Unit | Implement corrective action if needed | Action completed |

**Inputs:** Variance report, budget data, actual data, business unit context, prior period data

**Evidence:** Variance calculation, root cause analysis, supporting evidence, corrective action plan, management response

**Approvals:** Standard (FP&A Manager), Material (>$200K: CFO)

**Decision Points:** Materiality assessment, root cause judgment, corrective action need, escalation decision

**Automation:** Detection, alerting, calculation, tracking, reporting

**Outputs:** Documented explanation, corrective action plan, updated forecast if needed, audit trail

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Root cause unclear | Escalate with available evidence | 48 hours |
| Business unit unresponsive | Escalate to CFO | 24 hours |
| Data quality issue | Escalate to Controller | 24 hours |

**Success Criteria:** Investigation complete within SLA. Root cause identified. Explanation documented with evidence. Corrective action assigned if needed.

---

### 3.7 Audit Preparation Workflow

**Type:** Periodic (Quarterly) + Event-driven (External audit)
**Trigger:** Audit plan schedule or external auditor request
**Participants:** Auditor, Controller, all business units, CFO
**Duration:** 2-4 weeks (quarterly), 6-12 weeks (annual external)

| Phase | Activities | Owner | Gate |
|-------|-----------|-------|------|
| **1. Planning** | Scope definition, risk assessment, team assignment | Auditor | Audit plan approved |
| **2. Fieldwork** | Control testing, transaction testing, evidence gathering | Auditor + Business Units | Testing complete |
| **3. Analysis** | Finding identification, severity assessment, root cause | Auditor | Draft findings ready |
| **4. Reporting** | Finding documentation, management discussion | Auditor | Report draft complete |
| **5. Response** | Management response, remediation plan | Business Units | Responses received |
| **6. Follow-up** | Remediation tracking, validation testing | Auditor | Findings closed |

**Inputs:** Audit plan, control documentation, transaction data, system access, prior findings, regulatory requirements

**Evidence:** Test results, sample documentation, control walkthroughs, management responses, remediation evidence

**Approvals:** Audit plan (CFO), findings (Auditor), management response (business unit + Controller), remediation (CFO if material)

**Decision Points:** Risk prioritisation, finding severity, remediation adequacy, follow-up timing

**Automation:** Control test automation, evidence collection, finding tracking, status reporting, follow-up scheduling

**Outputs:** Audit report, finding register, remediation plans, control assessment, audit evidence packages

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Evidence unavailable | Escalate to Controller + CFO | 48 hours |
| Management response delayed | Escalate to CFO | 5 business days |
| Remediation overdue | Escalate to CFO + Audit Committee | 30 days |

**Success Criteria:** Audit plan completed on schedule. All findings documented with evidence. Management responses received. Remediation plans approved.

---

### 3.8 Compliance Investigation Workflow

**Type:** Investigative (Triggered)
**Trigger:** Violation detected, regulatory inquiry, policy exception request
**Participants:** Compliance Officer, Controller, Legal, CFO
**Duration:** 1-10 business days depending on severity

| Step | Actor | Activity | Output |
|------|-------|----------|--------|
| **1. Detection** | System/Human | Violation detected or reported | Investigation trigger |
| **2. Triage** | Compliance Officer | Assess severity, assign investigation priority | Priority assigned |
| **3. Investigation** | Compliance Officer | Gather evidence, interview parties, analyse impact | Investigation report |
| **4. Assessment** | Compliance Officer + Legal | Determine root cause, regulatory impact, corrective need | Assessment |
| **5. Decision** | CFO | Approve remediation plan, report to regulators if required | Decision recorded |
| **6. Remediation** | Business Unit | Implement corrective actions | Actions completed |
| **7. Closure** | Compliance Officer | Verify remediation, close investigation | Investigation closed |

**Inputs:** Violation alert, regulatory inquiry, policy exception request, transaction data, policy documentation

**Evidence:** Violation evidence, investigation findings, regulatory references, impact analysis, remediation documentation

**Approvals:** Standard (Compliance Officer), Material (CFO), Regulatory (CFO + Legal)

**Decision Points:** Severity assessment, regulatory reporting need, corrective action scope, closure criteria

**Automation:** Detection, tracking, evidence collection, reporting, status monitoring

**Outputs:** Investigation report, remediation plan, regulatory filing if required, compliance scorecard update, audit trail

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Evidence tampered | Activate forensic protocol | Immediate |
| Regulatory deadline imminent | Prioritise filing, investigate in parallel | Regulatory deadline |
| Cross-jurisdictional complexity | Engage external counsel | 48 hours |

**Success Criteria:** Investigation complete within SLA. Root cause identified. Remediation implemented. Regulatory obligations fulfilled. Audit trail complete.

---

### 3.9 Tax Filing Workflow

**Type:** Periodic (Monthly/Quarterly/Annual)
**Trigger:** Calendar — filing deadline minus lead time
**Participants:** Tax Manager, Controller, CFO, External advisors (if needed)
**Duration:** 1-4 weeks depending on filing type

| Phase | Activities | Owner | Gate |
|-------|-----------|-------|------|
| **1. Data gathering** | Collect required data from GL, payroll, intercompany | Tax Manager | Data complete |
| **2. Preparation** | Calculate tax position, prepare return | Tax Manager | Draft return ready |
| **3. Review** | Internal review, advisor review if needed | Tax Manager + Advisor | Review complete |
| **4. Approval** | CFO approval of filing and payment | CFO | Approved |
| **5. Filing** | Submit filing, make payment | Tax Manager | Filed + paid |
| **6. Confirmation** | Receive authority confirmation, archive | Tax Manager | Confirmed |

**Inputs:** GL data, payroll data, intercompany transactions, jurisdiction-specific rules, prior filings, authority guidance

**Evidence:** Calculation workpapers, jurisdiction-specific documentation, authority references, filing confirmations, payment records

**Approvals:** Filing (CFO), payment (CFO), advisor engagement (CFO), position change (CFO)

**Decision Points:** Tax treatment, provision methodology, filing strategy, audit response, planning recommendation

**Automation:** Data collection, calculation, filing status tracking, payment processing, deadline monitoring

**Outputs:** Filed return, payment confirmation, updated tax position, filing archive, audit trail

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Data incomplete | Escalate to Controller | Filing deadline minus 5 days |
| Calculation error | Correct and refile | As soon as discovered |
| Filing system down | Manual filing alternative | Filing deadline |

**Success Criteria:** Filed on time. Payment made on time. Confirmation received. Archive complete. Position updated.

---

### 3.10 Board Preparation Workflow

**Type:** Periodic (Quarterly)
**Trigger:** Board meeting calendar (typically 10 WD before meeting)
**Participants:** Board Secretary, CFO, all business unit leaders, Legal
**Duration:** 2 weeks

| Phase | Days Before | Activities | Owner |
|-------|-------------|------------|-------|
| **1. Content request** | WD-15 | Request content from all business units | Board Secretary |
| **2. Content collection** | WD-12 to WD-8 | Collect and review all submitted content | Board Secretary |
| **3. Assembly** | WD-8 to WD-6 | Assemble board pack, create agenda, prepare resolutions | Board Secretary |
| **4. CFO review** | WD-6 to WD-5 | CFO reviews complete pack, makes adjustments | CFO |
| **5. Legal review** | WD-5 to WD-4 | Legal reviews for regulatory compliance | Legal |
| **6. Finalisation** | WD-4 to WD-3 | Finalise pack, prepare distribution | Board Secretary |
| **7. Distribution** | WD-3 | Distribute to board members | Board Secretary |
| **8. Meeting** | WD-0 | Board meeting, minute taking | Board Secretary |
| **9. Follow-up** | WD+1 to WD+5 | Distribute minutes, track action items | Board Secretary |

**Inputs:** Financial statements, business unit reports, governance documents, regulatory updates, prior meeting minutes, action items

**Evidence:** All board pack documents, resolution records, attendance records, voting records, minute records

**Approvals:** Pack content (CFO), resolution language (Legal), distribution (Board Secretary), minutes (Chair)

**Decision Points:** Content inclusion, resolution language, agenda priority, confidentiality classification

**Automation:** Pack assembly, distribution, attendance tracking, action item routing, calendar management

**Outputs:** Board pack, agenda, resolutions, minutes, action items, governance record

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Content late from business unit | Escalate to CFO | WD-8 |
| Material issue found in pack | Pause distribution, investigate | WD-3 |
| Board member absent | Reschedule affected items | WD-0 |

**Success Criteria:** Pack distributed 3 WD before meeting. All resolutions prepared. Minutes distributed within 3 WD. All action items tracked.

---

### 3.11 Fraud Investigation Workflow

**Type:** Emergency (Triggered)
**Trigger:** Fraud indicator detected (anomaly, tip, control failure)
**Participants:** Auditor, CFO, Legal, Board Secretary, external forensics (if needed)
**Duration:** Variable (days to weeks)

| Step | Actor | Activity | Output |
|------|-------|----------|--------|
| **1. Alert** | System/Human | Fraud indicator detected | Investigation trigger |
| **2. Containment** | CFO + IT | Immediate containment (access restriction, transaction halt) | Containment actions |
| **3. Assessment** | Auditor + CFO | Assess scope, materiality, regulatory obligation | Assessment |
| **4. Investigation** | Auditor + External forensics | Detailed investigation, evidence gathering | Investigation report |
| **5. Legal review** | Legal | Legal implications, reporting obligations | Legal assessment |
| **6. Board notification** | CFO + Board Secretary | Notify Board per governance requirements | Board informed |
| **7. Remediation** | CFO | Corrective actions, control improvements | Remediation complete |
| **8. Closure** | Auditor | Validate remediation, close investigation | Investigation closed |

**Inputs:** Anomaly alert, tip, control failure report, transaction data, access logs

**Evidence:** Forensic evidence, access logs, transaction records, interview records, control documentation

**Approvals:** Containment (CFO), investigation scope (CFO + Legal), Board notification (CFO), remediation (CFO), closure (CFO + Auditor)

**Decision Points:** Containment scope, regulatory reporting need, investigation scope, materiality, Board notification timing

**Automation:** Anomaly detection, access restriction, evidence preservation, status tracking

**Outputs:** Containment actions, investigation report, legal assessment, Board notification, remediation plan, audit trail

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Evidence destruction risk | Immediate preservation + legal hold | Immediate |
| Scope expanding | Engage additional forensics | 24 hours |
| Regulatory reporting required | File within statutory deadline | Statutory deadline |

**Success Criteria:** Containment effective. Investigation thorough. Legal obligations met. Board informed. Remediation implemented. Controls improved.

---

### 3.12 Policy Exception Workflow

**Type:** Investigative (Triggered)
**Trigger:** Request to deviate from established policy
**Participants:** Requester, Compliance Officer, Policy Owner, CFO
**Duration:** 1-5 business days

| Step | Actor | Activity | Output |
|------|-------|----------|--------|
| **1. Request** | Requester | Submit exception request with justification | Request received |
| **2. Assessment** | Compliance Officer | Evaluate against policy, risk, regulatory impact | Risk assessment |
| **3. Recommendation** | Compliance Officer | Approve/deny with conditions | Recommendation |
| **4. Approval** | Policy Owner / CFO | Make approval decision | Decision recorded |
| **5. Conditions** | Compliance Officer | Set conditions, monitoring, expiry | Conditions documented |
| **6. Monitoring** | System | Track compliance with conditions | Monitoring active |
| **7. Closure** | Compliance Officer | Review outcome, close or extend | Exception closed |

**Inputs:** Exception request, justification, policy document, risk assessment, regulatory analysis

**Evidence:** Request documentation, risk assessment, regulatory analysis, approval decision, monitoring results

**Approvals:** Standard policy exception (Policy Owner), Material (>$500K or regulatory impact: CFO), Emergency (CFO immediate)

**Decision Points:** Risk acceptability, condition adequacy, monitoring need, expiry timing

**Automation:** Risk assessment, routing, monitoring, expiry tracking, renewal reminders

**Outputs:** Approval/denial decision, conditions document, monitoring plan, audit trail

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Condition violated | Immediate escalation to CFO | Immediate |
| Exception expires without renewal | Auto-revert to policy | Expiry date |
| Regulatory concern identified | Pause exception, consult Legal | 24 hours |

**Success Criteria:** Decision within SLA. Conditions documented. Monitoring active. Outcome recorded. Audit trail complete.

---

### 3.13 Capital Allocation Workflow

**Type:** Strategic (Event-driven)
**Trigger:** Capital request from business unit or strategic initiative
**Participants:** Requester, FP&A Manager, Treasury Manager, CFO, Board (if material)
**Duration:** 2-8 weeks depending on materiality

| Phase | Activities | Owner | Gate |
|-------|-----------|-------|------|
| **1. Request** | Business unit submits capital request with justification | Requester | Request complete |
| **2. Analysis** | FP&A analyses ROI, risk, opportunity cost | FP&A Manager | Analysis complete |
| **3. Treasury review** | Treasury assesses funding availability and impact | Treasury Manager | Funding confirmed |
| **4. CFO review** | CFO evaluates strategic fit and return | CFO | CFO recommendation |
| **5. Board** | Board approval if >$1M or strategic | Board | Board approved |
| **6. Execution** | Treasury executes approved allocation | Treasury Manager | Allocation executed |
| **7. Tracking** | Monitor against business case | FP&A Manager | Tracking active |

**Inputs:** Capital request, business case, financial projections, funding availability, strategic plan, risk assessment

**Evidence:** Business case documentation, ROI analysis, funding analysis, Board resolution (if material), execution records

**Approvals:** <$100K (CFO), $100K-$1M (CFO + Board notification), >$1M (Board)

**Decision Points:** Investment priority, funding source, risk acceptability, return threshold, strategic alignment

**Automation:** Analysis computation, funding availability check, tracking, reporting

**Outputs:** Approval decision, execution records, tracking dashboard, audit trail

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Funding unavailable | Defer allocation, revise plan | None |
| Business case flawed | Return for revision | 2 weeks |
| Board not available | CFO interim decision with ratification | Board next meeting |

**Success Criteria:** Decision within SLA. Business case documented. Execution tracked. Board approval if required.

---

### 3.14 Acquisition Review Workflow

**Type:** Strategic (Event-driven)
**Trigger:** Acquisition opportunity identified
**Participants:** CFO, FP&A Manager, Legal, Board Secretary, external advisors
**Duration:** 4-12 weeks

| Phase | Activities | Owner | Gate |
|-------|-----------|-------|------|
| **1. Screening** | Initial assessment of strategic fit and financial impact | FP&A Manager | Screen passed |
| **2. Due diligence** | Detailed financial, legal, operational due diligence | All + External advisors | DD complete |
| **3. Valuation** | Financial modelling, valuation, deal structure | FP&A Manager + CFO | Valuation agreed |
| **4. Negotiation** | Term negotiation, SPA drafting | CFO + Legal | Terms agreed |
| **5. Board approval** | Board review and approval | Board Secretary + Board | Board approved |
| **6. Closing** | Execute closing conditions, fund transfer | CFO + Treasury | Closed |
| **7. Integration** | Post-acquisition financial integration | Controller + CFO | Integration complete |

**Inputs:** Target information, financial data, market data, legal documents, due diligence reports, valuation models

**Evidence:** Due diligence reports, valuation workpapers, legal opinions, Board resolution, closing documents, integration plan

**Approvals:** Due diligence scope (CFO), valuation (CFO + Board), deal terms (CFO + Board), closing (CFO + Board)

**Decision Points:** Go/no-go at each phase, valuation range, deal structure, risk acceptability, integration approach

**Automation:** Financial modelling, data room management, document tracking, integration checklist

**Outputs:** Due diligence report, valuation, deal terms, Board resolution, closing documents, integration plan

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Due diligence reveals material issue | Renegotiate or walk away | None |
| Financing falls through | Seek alternative financing or defer | 2 weeks |
| Regulatory approval delayed | Engage regulatory counsel | As needed |

**Success Criteria:** Due diligence complete. Valuation justified. Board approved. Closing executed. Integration on track.

---

### 3.15 Executive Briefing Workflow

**Type:** Operational (Daily)
**Trigger:** Market open or specified time (07:00)
**Participants:** CFO, Intelligence Platform, all specialists
**Duration:** 15 minutes generation, 30 minutes review

| Step | Actor | Activity | Output |
|------|-------|----------|--------|
| **1. Collection** | System | Gather overnight data from all specialists | Raw data |
| **2. Synthesis** | System + AI | Synthesise into executive summary | Briefing draft |
| **3. Validation** | System | Cross-check figures, verify freshness, flag stale data | Validated briefing |
| **4. Delivery** | System | Deliver to CFO via dashboard and notification | Briefing delivered |
| **5. Review** | CFO | Review, drill-down, acknowledge, escalate | CFO actions |
| **6. Feedback** | CFO | Rate briefing usefulness, suggest improvements | Feedback loop |

**Inputs:** Cash position, close status, compliance score, audit findings, FP&A alerts, exception queue, pending approvals, market data

**Evidence:** Source specialist data, freshness timestamps, confidence ratings, trend indicators, anomaly flags

**Approvals:** None (informational), but CFO actions on items may require separate approvals

**Decision Points:** Priority ranking, anomaly severity, action assignment, escalation triggers

**Automation:** Data collection, synthesis, validation, delivery, feedback collection

**Outputs:** Executive briefing, priority list, anomaly summary, trend indicators, recommended actions

**Failure States:**
| Failure | Recovery | Timeout |
|---------|----------|---------|
| Specialist data unavailable | Include stale data notice | None |
| Synthesis produces low-confidence items | Flag as unverified | None |
| Delivery fails | Retry + alternative delivery | 5 minutes |

**Success Criteria:** Briefing delivered by 07:00. All figures verified. All sources cited. All stale data flagged. CFO reviews within 30 minutes.

---

## Part IV — Cross-Role Collaboration

### 4.1 Controller ↔ Treasury

| Direction | Information | Trigger | Format |
|-----------|-------------|---------|--------|
| Treasury → Controller | Daily cash position | 07:00 daily | Position report |
| Treasury → Controller | Bank reconciliation data | Period-end | Reconciliation file |
| Treasury → Controller | FX rate changes | As they occur | Rate notification |
| Controller → Treasury | GL balance for reconciliation | Period-end | Trial balance extract |
| Controller → Treasury | Payment approval status | Real-time | Status update |
| Controller → Treasury | Period close notification | Close completion | Notification |

**Handoff Protocol:** Treasury provides bank data; Controller reconciles against GL. Discrepancies flagged for joint investigation. Both sign off on reconciled position.

**Evidence Flow:** Bank feeds → Treasury validates → Controller reconciles → Both sign off → Audit trail records

### 4.2 Treasury ↔ FP&A

| Direction | Information | Trigger | Format |
|-----------|-------------|---------|--------|
| Treasury → FP&A | Actual cash flows | Daily/weekly | Cash flow data |
| Treasury → FP&A | Forecast assumptions (rates, counterparties) | Forecast cycle | Assumption document |
| FP&A → Treasury | Budget cash flows | Budget cycle | Budget extract |
| FP&A → Treasury | Revenue/expense forecasts | Forecast cycle | Forecast data |
| FP&A → Treasury | Scenario assumptions | Ad-hoc | Scenario document |

**Handoff Protocol:** Treasury provides actual cash data; FP&A uses in forecast models. FP&A provides budget/forecast context; Treasury incorporates in cash planning.

### 4.3 Compliance ↔ Audit

| Direction | Information | Trigger | Format |
|-----------|-------------|---------|--------|
| Compliance → Audit | Violation findings | As detected | Finding report |
| Compliance → Audit | Policy changes | As enacted | Policy update |
| Audit → Compliance | Control deficiencies | Audit completion | Finding report |
| Audit → Compliance | Control test results | Testing cycle | Test results |
| Both → CFO | Combined compliance/risk status | Monthly | Status report |

**Handoff Protocol:** Compliance manages policy; Audit tests control effectiveness. Findings cross-reference: Audit findings may trigger Compliance investigation; Compliance violations trigger Audit control review.

### 4.4 Tax ↔ Controller

| Direction | Information | Trigger | Format |
|-----------|-------------|---------|--------|
| Tax → Controller | Tax provision estimates | Period-end | Provision workpapers |
| Tax → Controller | Deferred tax calculations | Period-end | Calculation workpapers |
| Controller → Tax | GL data for tax calculations | Period-end | Trial balance extract |
| Controller → Tax | Intercompany data | Period-end | IC reconciliation |
| Controller → Tax | Depreciation schedule | Period-end | Fixed asset register |

**Handoff Protocol:** Controller provides accounting data; Tax calculates provision. Controller posts tax entries based on Tax output. Both sign off on tax accounts.

### 4.5 Board Secretary ↔ CFO

| Direction | Information | Trigger | Format |
|-----------|-------------|---------|--------|
| CFO → Board Secretary | Financial summary for board pack | Board meeting cycle | Financial summary |
| CFO → Board Secretary | Strategic decisions requiring board approval | As needed | Decision memorandum |
| Board Secretary → CFO | Board questions and feedback | Post-meeting | Minutes extract |
| Board Secretary → CFO | Resolution action items | Post-meeting | Action tracker |
| Board Secretary → CFO | Governance compliance status | Quarterly | Governance report |

**Handoff Protocol:** CFO provides financial content; Board Secretary assembles pack. Board Secretary tracks actions; CFO ensures completion. Both coordinate on governance matters.

### 4.6 Executive Command Center → All Specialists

The Executive Command Center serves as the coordination layer for all specialists. It does not replace specialist expertise — it synthesises specialist outputs into executive-level visibility.

| Specialist | Contribution | Frequency | Format |
|------------|-------------|-----------|--------|
| Controller | Close status, journal risks, accounting health | Daily | Dashboard metrics |
| Treasury | Cash position, liquidity, FX exposure | Real-time | Dashboard metrics |
| FP&A | Variance alerts, forecast updates, scenario status | Daily | Dashboard metrics |
| Compliance | Compliance score, violations, deadlines | Daily | Dashboard metrics |
| Audit | Audit trail completeness, finding status, control health | Daily | Dashboard metrics |
| Tax | Filing status, provision estimates, deadline alerts | Weekly | Dashboard metrics |

**Coordination Rules:**
1. Every specialist pushes status updates to the Command Center on a defined schedule
2. The Command Center never modifies specialist data — it only aggregates and displays
3. Conflicts between specialist recommendations are flagged for CFO resolution
4. The Command Center preserves the complete evidence chain from each specialist

---

## Part V — Approval Matrices

### 5.1 Financial Approval Matrix

| Action | Threshold | Approver | Escalation | SLA |
|--------|-----------|----------|------------|-----|
| Journal entry | <$10K | Accountant (self-approve) | Controller | Same day |
| Journal entry | $10K-$50K | Controller | CFO | Same day |
| Journal entry | >$50K | CFO | Board (if >$500K) | 4 hours |
| Payment | <$10K | Operations Manager | Controller | Same day |
| Payment | $10K-$50K | Controller | CFO | Same day |
| Payment | $50K-$100K | CFO | — | 4 hours |
| Payment | >$100K | CFO + Treasury Manager | Board (if >$1M) | Same day |
| Treasury transfer | <$50K | Treasury Manager | CFO | 2 hours |
| Treasury transfer | >$50K | CFO | — | 4 hours |
| Budget allocation | <$100K | CFO | — | 5 business days |
| Budget allocation | $100K-$1M | CFO + Board notification | Board | 10 business days |
| Budget allocation | >$1M | Board | — | Board meeting |
| Policy exception | Standard | Policy Owner | Compliance Officer | 3 business days |
| Policy exception | Material (>$500K) | CFO | Board (if strategic) | 5 business days |
| Accounting treatment | Standard | Controller | CFO | Same day |
| Accounting treatment | Non-standard/material | CFO | External advisor | 5 business days |
| Tax filing | Any | Tax Manager + CFO | — | Filing deadline |

### 5.2 System Approval Matrix

| Action | Authority | Approver | SLA |
|--------|-----------|----------|-----|
| User creation | RBAC | Admin | Same day |
| Role change | RBAC + Governance | Admin + Compliance | 2 business days |
| Permission escalation | Governance | CFO | 1 business days |
| Policy change | Governance | Compliance + CFO | 5 business days |
| System configuration | Operations | IT + Controller | 2 business days |
| Data export (financial) | RBAC + Audit | Controller + Auditor | 2 business days |
| Integration activation | Operations + Security | IT + CFO | 5 business days |

---

## Part VI — Evidence Matrices

### 6.1 Evidence Requirements by Workflow

| Workflow | Evidence Required | Retention | Accessibility |
|----------|------------------|-----------|---------------|
| Month-end close | All reconciliations, journal approvals, statement sign-offs | 7 years | Audit trail |
| Journal approval | Source document, approval chain, posting record | 7 years | GL drill-down |
| Treasury review | Bank confirmations, FX rates, action approvals | 7 years | Treasury audit trail |
| Cash forecast | Model assumptions, actual vs forecast, methodology | 5 years | Forecast archive |
| Budget approval | Business cases, Board resolution, loading confirmation | 10 years | Budget system |
| Variance investigation | Root cause analysis, corrective action, management response | 5 years | Investigation archive |
| Audit preparation | Test results, findings, management responses, remediation | 10 years | Audit archive |
| Compliance investigation | Investigation report, legal assessment, remediation | 10 years | Compliance archive |
| Tax filing | Calculations, filings, confirmations, authority correspondence | 10 years | Tax archive |
| Board preparation | Pack documents, minutes, resolutions, action items | Permanent | Governance archive |
| Fraud investigation | Forensic evidence, legal assessment, Board notification | Permanent | Legal hold |
| Policy exception | Request, risk assessment, approval, conditions, monitoring | 5 years | Compliance archive |
| Capital allocation | Business case, Board resolution, execution records | 10 years | Capital archive |
| Acquisition review | Due diligence, valuation, legal documents, integration plan | Permanent | Legal archive |
| Executive briefing | Source data, synthesis logic, CFO actions | 2 years | Briefing archive |

### 6.2 Evidence Quality Standards

| Standard | Requirement |
|----------|-------------|
| **Sourcing** | Every financial figure cites its source system, record, and field |
| **Freshness** | Every data point shows collection timestamp; stale data flagged |
| **Completeness** | Every evidence package includes all 12 required elements (see Autonomous Finance Workforce §Evidence Standards) |
| **Independence** | Evidence from at least two independent sources where material |
| **Auditability** | Every evidence reference independently verifiable by a human auditor |
| **Immutability** | Evidence records cannot be modified after creation; corrections create new records |

---

## Part VII — Decision Matrices

### 7.1 Decision Authority by Type

| Decision Type | Authority Level | Input Required | Timeframe |
|---------------|----------------|----------------|-----------|
| Operational (daily) | Specialist/Manager | Dashboard data, alerts | Same day |
| Tactical (weekly) | Manager/Director | Analysis, trends | 1 week |
| Strategic (quarterly) | CFO/Board | Full analysis, scenarios | 1 quarter |
| Emergency (immediate) | CFO (or delegate) | Available data | Immediate |
| Regulatory (deadline-driven) | Compliance + CFO | Regulatory analysis | Per deadline |
| Governance (Board-level) | Board | Board pack, recommendation | Board meeting |

### 7.2 Decision Quality Requirements

| Requirement | Standard |
|-------------|----------|
| **Evidence basis** | Every decision cites at least one source of evidence |
| **Confidence disclosure** | Every recommendation includes confidence level |
| **Risk assessment** | Every material decision includes risk evaluation |
| **Alternative consideration** | Strategic decisions document alternatives considered |
| **Audit trail** | Every decision records actor, timestamp, rationale, outcome |
| **Reversibility assessment** | Every decision classifies as reversible or irreversible |

---

## Part VIII — Escalation Matrices

### 8.1 Escalation Chains

| Originator | Level 1 | Level 2 | Level 3 | Emergency |
|------------|---------|---------|---------|-----------|
| Accountant | Controller | CFO | Board Secretary | CEO |
| Treasury Analyst | Treasury Manager | CFO | Board | CEO |
| Compliance Analyst | Compliance Officer | CFO | Board Secretary | Legal + CEO |
| Auditor | Audit Director | CFO | Audit Committee | Board Chair |
| FP&A Analyst | FP&A Manager | Controller | CFO | CEO |
| Tax Analyst | Tax Manager | CFO | Legal | CEO |
| Operations Analyst | Operations Manager | Controller | CFO | CEO |
| Board Secretary | CFO | Board Chair | Legal | Board emergency session |

### 8.2 Escalation Triggers

| Trigger | Severity | Escalation Time | Actions Required |
|---------|----------|-----------------|-----------------|
| Cash position below covenant | Critical | Immediate | CFO + Board + Lenders |
| Fraud indicator detected | Critical | Immediate | CFO + Legal + Board |
| Regulatory filing deadline <48h | Critical | 4 hours | CFO + Compliance |
| Material misstatement detected | Critical | Immediate | CFO + Controller + Auditor |
| Close process >1 day behind | High | Same day | CFO |
| Forecast accuracy <80% | High | 24 hours | FP&A + CFO |
| Compliance violation >$100K | High | 4 hours | CFO + Legal |
| Audit finding overdue >30 days | High | 24 hours | Finding owner + CFO |
| Bank feed failure >4 hours | Medium | 4 hours | Treasury + IT |
| Reconciliation exception >$50K | Medium | 24 hours | Controller |
| System outage >30 minutes | Medium | 30 minutes | IT + affected specialist |
| Vendor dispute >$50K | Low | 48 hours | Operations + Controller |

### 8.3 Escalation Quality Standards

Every escalation must include:
1. **Trigger** — what happened and when
2. **Impact** — financial, operational, and regulatory consequences
3. **Evidence** — supporting data, audit trail references
4. **Recommendation** — what the escalation originator recommends
5. **Deadline** — when resolution is needed
6. **Escalation path** — who has been notified and who needs to decide

---

## Part IX — Workflow Design Principles

### 9.1 Principles (in order of precedence)

| # | Principle | Meaning |
|---|-----------|---------|
| 1 | **Evidence before recommendation** | No recommendation without supporting data. No data without source attribution. |
| 2 | **Human authority** | AI recommends. Humans decide. Every financial action requires explicit human approval. |
| 3 | **Deterministic calculations** | Financial figures come from deterministic systems (GL, bank feeds, approved journals). Never from AI inference alone. |
| 4 | **Auditability** | Every workflow state change produces an immutable audit record. No exceptions. |
| 5 | **Least privilege** | Each participant accesses only what their role requires. Cross-role access requires explicit governance approval. |
| 6 | **Segregation of duties** | The person who initiates a transaction is not the person who approves it. The person who records it is not the person who reconciles it. |
| 7 | **No hidden automation** | Every automated action is logged, explainable, and auditable. No silent system actions. |
| 8 | **No irreversible actions without approval** | Every irreversible financial action requires explicit human approval through the approval engine. |
| 9 | **Explainability** | Every recommendation explains why. Every risk assessment explains contributing factors. Every forecast explains assumptions. |
| 10 | **Trust** | The workflow earns trust through transparency. Every number has a source. Every decision has a rationale. Every action has a record. |

### 9.2 Workflow Quality Checklist

For every workflow, verify:

| # | Question | Standard |
|---|----------|----------|
| 1 | Can a first-time enterprise user understand it? | Workflow steps are clear, sequential, and self-explanatory |
| 2 | Can an auditor reconstruct it? | Complete audit trail with timestamps, actors, decisions, and evidence |
| 3 | Can a CFO explain it? | No "black box" steps — every automated action is explainable |
| 4 | Can every decision be traced? | Decision record with actor, timestamp, rationale, and outcome |
| 5 | Can every recommendation be justified? | Evidence reference, confidence level, and source citation |
| 6 | Can every approval be audited? | Approval record with actor, timestamp, conditions, and delegation chain |
| 7 | Can the workflow survive failure? | Failure states documented with recovery procedures and timeouts |

---

## Part X — Workflow Anti-Patterns

### 10.1 Permanent Prohibitions

| # | Anti-Pattern | Why It Fails | Constitutional Reference |
|---|-------------|-------------|-------------------------|
| 1 | **Silent automation** | Users cannot trust what they cannot see | §Autonomous Finance Workforce Principle 5 (Auditability) |
| 2 | **Auto-approval** | Financial actions require human judgment | §Product Constitution 6.5 (No Autonomous Action) |
| 3 | **Black box decisions** | Without explanation, trust is impossible | §Experience Constitution 9 (Explainable) |
| 4 | **Skipped approvals** | Segregation of duties violated | §Governance Constitution (Security) |
| 5 | **Missing evidence** | Recommendations without evidence are guesses | §Experience Constitution Principle 4 (Evidence before recommendation) |
| 6 | **Stale data as current** | Unreliable data is worse than no data | §Experience Constitution Principle 11 (Stale data worse than no data) |
| 7 | **Irreversible without confirmation** | Destructive actions need safety nets | §Experience Constitution Principle 19 (Undo safer than confirmation) |
| 8 | **Cross-tenant access** | Security incident, not a bug | §Product Constitution 3.4 (Tenant Isolation) |
| 9 | **Audit trail gaps** | Incompleteness = non-compliance | §Product Constitution 3.3 (Auditability by Default) |
| 10 | **Unattributed financial figures** | Numbers without source are rumours | §Experience Constitution Principle 27 (Every figure has timestamp) |

### 10.2 Design Smells

| # | Smell | Diagnosis | Fix |
|---|-------|-----------|-----|
| 1 | "We need a meeting to figure out what this number means" | Missing evidence/explainability | Add source attribution and drill-down |
| 2 | "Just approve it, it's always been right" | Approval fatigue or missing automation | Automate low-risk, keep human for material |
| 3 | "I can't tell if this data is fresh" | Missing freshness timestamp | Add fetch timestamp to every data display |
| 4 | "The system said it's fine, but I don't trust it" | Missing confidence disclosure | Add confidence rating and methodology |
| 5 | "Who approved this?" | Missing approval visibility | Show approval chain on every action |
| 6 | "I had to check three different places to find this" | Missing cross-navigation | Wire drill-down from every data point |
| 7 | "The error message just said 'Error'" | Missing error recovery guidance | Add "what to do next" to every error |
| 8 | "I did it manually because the system couldn't" | Workflow gap | Design workflow for the manual workaround |

---

## Part XI — Immutable Workflow Principles

These principles may not be amended. They are permanent constraints on every workflow in Perionyx.

| # | Principle | Source |
|---|-----------|--------|
| 1 | **Every financial action has an audit trail** | Product Constitution §3.3 |
| 2 | **AI never executes financial actions autonomously** | Product Constitution §6.5 |
| 3 | **Every recommendation cites its evidence** | Experience Constitution §12 P4, P9 |
| 4 | **Every decision is attributable to a human** | Autonomous Finance Workforce §Principle 5 |
| 5 | **Tenant isolation is absolute** | Product Constitution §3.4 |
| 6 | **Segregation of duties is enforced** | Governance Constitution (Security) |
| 7 | **Destructive actions require confirmation** | Experience Constitution §8 |
| 8 | **Every number has a source and timestamp** | Experience Constitution §12 P11, P27 |
| 9 | **Workflows survive failure** | Product Constitution §3.5 (Offline First) |
| 10 | **The human decides, the system recommends** | Experience Constitution §12 P26 |

---

## Part XII — Future Evolution

### 12.1 Permanent (may not be amended)
- Evidence before recommendation
- Human authority over AI
- Deterministic financial calculations
- Auditability by default
- Segregation of duties
- No hidden automation
- No irreversible actions without approval
- Every number has a source and timestamp
- Workflows survive failure
- Tenant isolation

### 12.2 Evolvable (may be amended through ADR process)
- Workflow step sequences
- Approval thresholds
- Escalation timeframes
- Automation rules
- Notification preferences
- Dashboard composition within workflows
- Report formats
- SLA targets

### 12.3 Amendment Process
1. **Proposal** — written with change, rationale, impact on existing workflows
2. **Review** — Architecture Review Board evaluates against immutable principles
3. **Impact analysis** — identify all workflows affected
4. **Decision** — approval documented as ADR in `DECISIONS.md`
5. **Versioning** — document version incremented, change recorded in changelog

---

## Cross-References

| Document | Relationship |
|----------|-------------|
| `GOVERNANCE_CONSTITUTION.md` | Supreme authority — this document is subordinate |
| `PRODUCT_CONSTITUTION.md` | Product principles — this document defines workflow |
| `AUTONOMOUS_FINANCE_WORKFORCE.md` | Specialist behaviour — this document defines how specialists participate in workflows |
| `PERIONYX_EXPERIENCE_CONSTITUTION.md` | Experience philosophy — this document defines work patterns that UI must serve |
| `ARCHITECTURE.md` | System architecture — this document defines workflow orchestration |
| `SECURITY.md` | Security — this document defines approval and access control workflows |
| `GLOSSARY.md` | Terminology — this document uses standardised workflow language |

---

*This constitution is permanent. It may only be amended through the Architecture Review Board process defined in `CONTRIBUTING.md §2`, with explicit approval recorded as an ADR in `DECISIONS.md`.*
