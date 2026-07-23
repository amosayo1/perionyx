# Customer Discovery Validation Framework

**Phase:** 8E.2
**Status:** Active
**Last Updated:** July 8, 2026
**Owner:** Product Team

---

## Purpose

This framework provides a structured system for recording, organizing, analyzing, and connecting customer discovery data to product decisions. It ensures that every roadmap item is backed by evidence, every pain point is classified and tracked, and every decision is auditable.

---

## Framework Components

```
docs/customer-discovery/
├── validation-framework.md          # This file — core framework
├── customer-discovery-playbook.md   # Methodology and process guide
├── interview-template.md            # Structured interview form
├── pain-point-catalog.md            # Classified pain point registry
├── feature-request-catalog.md       # Feature request tracking
├── workflow-observations.md         # Contextual workflow notes
├── decision-log.md                  # Evidence-backed decision records
└── roadmap-evidence.md              # Roadmap item → evidence mapping
```

---

## Data Model

### Interview Record

Each customer interaction produces an Interview Record with:

| Field | Type | Required |
|---|---|---|
| Interview ID | UUID | Yes |
| Date | ISO 8601 | Yes |
| Customer Name | String | Yes |
| Organization | String | Yes |
| Role | String | Yes |
| Industry | Taxonomy term | Yes |
| Country | ISO 3166-1 alpha-2 | Yes |
| Organization Size | Employees / Revenue range | Yes |
| ERP Experience | String[] | Yes |
| Problems Mentioned | PainPoint[] | Yes |
| Current Tools | String[] | Yes |
| Requested Improvements | FeatureRequest[] | Yes |
| Observed Workflows | WorkflowNote[] | Yes |
| Quotes | String[] | No |
| Follow-up Required | Boolean | Yes |
| Interviewer | Name | Yes |
| Confidence | High / Medium / Low | Yes |

### Pain Point Record

| Field | Type |
|---|---|
| ID | UUID |
| Category | Taxonomy term (see §2) |
| Title | String |
| Description | String |
| Severity | Critical / Major / Minor |
| Frequency | Always / Often / Sometimes / Rare |
| Persona Affected | Role string |
| Evidence Source | Interview ID or Observation ID |
| Workflow Context | String |
| Current Workaround | String |
| Business Impact | String |

### Feature Request Record

| Field | Type |
|---|---|
| ID | UUID |
| Title | String |
| Description | String |
| Requesting Customers | CustomerName[] |
| Pain Point Addressed | PainPointID[] |
| Expected Business Value | String |
| Effort Estimate | T-shirt size (XS/S/M/L/XL) |
| Priority | P0–P4 |
| Status | Proposed / Validated / In Progress / Shipped / Rejected |
| Evidence Source | Interview ID |
| Dependencies | FeatureRequestID[] |

### Decision Record

| Field | Type |
|---|---|
| ID | UUID |
| Date | ISO 8601 |
| Decision | String |
| Options Considered | String[] |
| Rationale | String |
| Customer Evidence | InterviewID[] or PainPointID[] |
| Rejected Alternatives | String[] |
| Impacted Roadmap Items | RoadmapItemID[] |
| Decided By | Name |
| Revisitable | Boolean |

---

## Pain Point Taxonomy

### Top-Level Categories

| # | Category | Sub-categories |
|---|---|---|
| 1 | Month-end Close | Journal posting, reconciliation status, period-end checklist, close calendar, variance approval |
| 2 | Treasury | Cash positioning, liquidity forecasting, FX exposure, bank connectivity, multi-currency |
| 3 | Reconciliation | Bank matching, exception handling, run scheduling, threshold rules, auto-suggest |
| 4 | Cash Flow | Forecasting, scenario modeling, burn rate, runway, working capital |
| 5 | Financial Reporting | Report builder, template gallery, scheduled delivery, drill-down, variance analysis |
| 6 | Approvals | Routing rules, delegation, escalation, dual control, approval chains, batch operations |
| 7 | Compliance | Policy enforcement, regulatory filing, threshold monitoring, sanctions screening |
| 8 | Audit | Audit trail, investigation, evidence export, chronological integrity, tamper evidence |
| 9 | ERP Integration | Sync reliability, field mapping, error recovery, connector health, reconciliation |
| 10 | Localization | Multi-currency, multi-language, RTL, fiscal periods, tax regimes, locale formatting |
| 11 | Executive Reporting | Dashboard KPIs, variance callouts, AI briefings, trend analysis, drill-down paths |
| 12 | AI Assistance | Anomaly detection, natural language query, recommendation quality, explainability |
| 13 | Performance | Page load time, table render, export speed, dashboard hydration, mobile response |
| 14 | User Experience | Navigation clarity, terminology, onboarding, error messages, empty states, consistency |
| 15 | Training & Adoption | Learning curve, documentation quality, guided tours, feature discovery, shortcuts |
| 16 | Data Visibility | Cross-entity search, drill-down depth, data freshness, stale indicators, aggregation |
| 17 | Security | Role granularity, audit coverage, session management, API key scoping, data isolation |
| 18 | Workflow Automation | Rule builder, condition editor, approval matrix, scheduler, trigger types |

---

## Evidence Standards

### Evidence Tiers

| Tier | Definition | Valid Sources |
|---|---|---|
| **T1 — Direct** | Explicit customer request or observed pain point | Interview quote, session recording, support ticket |
| **T2 — Inferred** | Pattern derived from multiple indirect signals | Survey trends, analytics data, competitive analysis |
| **T3 — Strategic** | Product vision or market opportunity | Industry research, advisory reports, leadership directive |

### Validation Workflow

```
1. Capture  →  Record raw observation (interview, ticket, session)
2. Classify  →  Assign taxonomy category and severity
3. Verify    →  Cross-reference with other customers or data sources
4. Prioritize →  Rank by business impact × affected users × effort
5. Decide    →  Product decision with evidence citation
6. Track     →  Monitor shipped feature against original pain point
```

---

## Metrics & Reporting

### Quarterly Metrics

| Metric | Description |
|---|---|
| Interview count | Number of structured interviews completed |
| Unique organizations | Distinct companies represented |
| Countries represented | Count of distinct countries |
| Industries represented | Count of distinct industry verticals |
| Recurring themes | Pain points mentioned by ≥3 organizations |
| Validated assumptions | Hypotheses confirmed by customer evidence |
| Rejected assumptions | Hypotheses disproven by customer evidence |
| Evidence-backed roadmap items | Roadmap items with ≥T2 evidence |
| Pain point resolution rate | Pain points with shipped solutions ÷ total identified |

### Recurring Theme Detection

Generate quarterly summary with:

- **Most common pain points** (by frequency × severity)
- **Most requested capabilities** (by requesting organizations)
- **Highest business impact** (by estimated value × affected users)
- **Most affected personas** (by pain point count per role)
- **Frequently mentioned workflows** (by workflow observation count)

---

## Integration Path

### Future: Product Intelligence Module

This framework is designed for future integration into Perionyx itself as an internal Product Intelligence module:

| Phase | Scope |
|---|---|
| **Phase 1** (current) | Static markdown files in `docs/customer-discovery/` |
| **Phase 2** | Database-backed registry with CRUD API |
| **Phase 3** | UI dashboard with charts, filters, recurring theme detection |
| **Phase 4** | Internal route within Perionyx, role-gated for product team |
| **Phase 5** | AI-powered theme clustering, sentiment analysis, recommendation scoring |

### Data Schema for Phase 2+

```typescript
interface ProductIntelligenceCustomer {
  id: string;
  organization: string;
  industry: TaxonomyTerm;
  country: string;
  size: OrgSize;
  erpExperience: string[];
  interviews: InterviewRecord[];
}

interface InterviewRecord {
  id: string;
  customerId: string;
  date: string;
  participantRole: string;
  problems: PainPoint[];
  requests: FeatureRequest[];
  workflows: WorkflowObservation[];
  quotes: string[];
  interviewer: string;
  confidence: "high" | "medium" | "low";
}
```
