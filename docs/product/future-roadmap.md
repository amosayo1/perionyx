# Future Roadmap

**Phase:** 8E.4
**Last Updated:** July 8, 2026

---

## Purpose

This document defines Perionyx's product roadmap across five horizons: 12 months, 24 months, 36 months, 5 years, and 10 years. Every item is linked to customer evidence, workflow intelligence, or strategic rationale.

*Reference: `docs/product/product-strategy.md`, `docs/product/roadmap-governance.md`, `docs/ROADMAP.md`*

---

## Roadmap Categories

| Category | Description |
|---|---|
| Core Platform | Foundational platform capabilities (auth, multi-tenancy, RBAC, audit, API) |
| Finance Operations | Treasury, accounting, reconciliation, close, reporting |
| AI | AI-powered features (Copilot, analytics, predictions, recommendations) |
| Analytics | Dashboards, variance analysis, drill-down, insights |
| Compliance | Regulatory compliance, audit automation, policy enforcement |
| Developer Platform | API, SDK, developer portal, integrations |
| Enterprise Administration | User management, onboarding, settings, sandbox |
| Integrations | Connectors, webhooks, ERP sync, marketplace |
| Mobile | Mobile apps, offline, push notifications, widgets |
| Future Platform | Long-term platform evolution (CQRS, plugins, white-label) |

---

## 12-Month Horizon (Now — July 2027)

### Core Platform

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Error boundaries on all 86 pages | P1 | WFV-001 | Page-level React error boundaries for graceful failure |
| Loading skeletons on all data pages | P1 | WFV-P1.1 | Consistent skeleton loader pattern across all pages |
| Localization adoption sprint | P1 | CERT-001 | Wire 1,236 remaining files through i18n system |
| cnRTL adoption in shell layout | P1 | CERT-002 | Use RTL utilities in production layout |
| Enterprise wrapper consolidation | P2 | CERT-003 | Adopt enterprise-button, enterprise-card, enterprise-dialog |
| Surface token consolidation | P2 | CERT-004 | Single source of truth for design tokens |
| SmartSelect portal rendering fix | P2 | CERT-005 | Fix dropdown clipping in dialogs |

### Finance Operations

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Month-end close dashboard | P1 | WFV-P1.3, MEC-003 | Consolidated close checklist linking reconciliation, journal posting, reports, audit |
| Period-end close workflow | P2 | WFV-001, MEC-004 | End-to-end period close orchestration |
| FX rates widget in treasury context | P2 | WFV-P2.2, TRY-007 | Display FX rates in treasury dashboard |
| Cross-currency position view | P2 | WFV-P2.2, TRY-008 | Aggregate currency exposure dashboard |
| Reconciliation exception linking | P2 | WFV-P2.4, REC-003 | Link exceptions to source transactions |
| KPI clickability for drill-down | P2 | WFV-P2.1, EXR-002 | Navigable KPI cards on dashboard |
| Data freshness indicators | P2 | WFV-P2.6 | "Last updated Xm ago" on aggregate views |
| InspectorPanel typed formatters | P2 | WFV-P2.3, AUD-002 | Formatted metadata display instead of raw JSON |

### AI

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Anomaly detection engine | P1 | AIA-002, ROADMAP-MT | ML-based transaction anomaly flagging |
| Predictive cash flow modeling | P1 | CSF-002, CSF-004 | Multi-variable ML cash flow forecasting |
| Contextual AI triggers | P2 | AIA-003, WFV-001 | "Ask AI" entry points on transaction/reconciliation pages |
| Multi-turn conversation memory | P2 | AIA-004, ROADMAP-MT | Session-aware AI conversation persistence |

### Analytics

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Report builder UI (drag-and-drop) | P1 | REP-001, ROADMAP-DEV | Self-service report builder with template gallery |
| Report scheduling and distribution | P2 | ROADMAP-SHORT | Scheduled report delivery via email/Slack |
| Export engine (PDF, PPT) | P2 | ROADMAP-SHORT | PDF with company branding, PowerPoint for board presentations |

### Compliance

| Item | Priority | Evidence | Description |
|---|---|---|---|
| SOC 2 evidence automation | P2 | CPL-005 | Automated compliance evidence collection |
| SOX compliance workflows | P2 | CPL-006 | Control testing framework + deficiency tracking |

### Developer Platform

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Developer portal | P2 | ERP-003, ROADMAP-DEV | Interactive API reference documentation |
| SDK for TypeScript | P3 | ERP-004, ROADMAP-DEV | First-party TypeScript SDK |

### Enterprise Administration

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Role-based settings visibility | P2 | WFV-001 | Hide irrelevant settings based on user role |
| Team workload view in approvals | P2 | WFV-P2.5 | Per-team-member approval load breakdown |

### Integrations

| Item | Priority | Evidence | Description |
|---|---|---|---|
| SAP ERP connector | P1 | ERP-007 | Bi-directional sync with SAP |
| NetSuite ERP connector | P1 | ERP-007 | Bi-directional sync with NetSuite |
| Oracle Fusion connector | P2 | ERP-007 | Bi-directional sync with Oracle Fusion |
| Additional bank connectors (5+) | P1 | TRY-001, ERP-005 | Corporate banking API integrations |

### Mobile

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Push notifications (native) | P1 | EXR-005 | Native push with deep linking for approvals |
| Offline action queue | P2 | PER-001 | Queue approvals when offline, sync on reconnect |

---

## 24-Month Horizon (July 2027 — July 2028)

### Core Platform

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Redis caching for frequent queries | P1 | ROADMAP-SHORT, PER-002 | In-memory cache for dashboard and wallet queries |
| Virtual scrolling for 10k+ rows | P1 | ROADMAP-SHORT | High-performance table rendering |
| Read replicas for analytics | P2 | ROADMAP-LONG | Separate read path for heavy analytics queries |
| Event sourcing architecture | P3 | ROADMAP-LONG | Event-sourced state for complete audit traceability |

### Finance Operations

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Multi-entity consolidation | P1 | ROADMAP-MEDIUM | Consolidated financial views across legal entities |
| Inter-company reconciliation | P1 | ROADMAP-MEDIUM | Automated inter-company matching and netting |
| Currency translation for consolidation | P2 | ROADMAP-MEDIUM | Multi-currency consolidation with FX translation |
| Procure-to-pay workflow | P2 | P2P-WORKFLOW | Full P2P with approval routing, payment execution |
| Order-to-cash workflow | P2 | O2C-WORKFLOW | Full O2C with invoice management, collections |

### AI

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Natural language report generation | P1 | REP-001, ROADMAP-MT | Text-to-report: describe what you want, AI builds it |
| Proactive alerting and recommendations | P1 | ROADMAP-MT | AI monitors metrics and alerts on anomalies |
| AI-powered policy suggestion | P2 | ROADMAP-MT | Suggest policy rules based on transaction patterns |
| Predictive vendor risk scoring | P2 | ROADMAP-LONG | ML-based vendor risk assessment |

### Compliance

| Item | Priority | Evidence | Description |
|---|---|---|---|
| GDPR data management tools | P2 | ROADMAP-MEDIUM | Data subject request workflows, data mapping |
| Regulatory filing support | P2 | ROADMAP-MEDIUM | Filing templates for common regulatory reports |
| Compliance calendar with auto-reminders | P2 | ROADMAP-MEDIUM | Automated deadline tracking for filings |

### Developer Platform

| Item | Priority | Evidence | Description |
|---|---|---|---|
| SDK for Python and Go | P2 | ERP-004 | First-party Python and Go SDKs |
| Rate limit usage headers | P2 | ROADMAP-SHORT | Transparent rate limit status on all API responses |
| API changelog and deprecation policy | P2 | ROADMAP-SHORT | Developer communication for API changes |

### Integrations

| Item | Priority | Evidence | Description |
|---|---|---|---|
| QuickBooks Online connector | P1 | ERP-007 | Accounting data sync |
| Xero connector | P2 | ERP-007 | Accounting data sync |
| ERP connector marketplace | P2 | ERP-008 | Partner-built connector ecosystem |

### Mobile

| Item | Priority | Evidence | Description |
|---|---|---|---|
| iOS/Android home screen widgets | P2 | EXR-005 | Cash position widget for quick glance |
| Full mobile treasury module | P1 | TRY-001, EXR-005 | Complete treasury operations on mobile |
| Mobile AI briefings | P1 | EXR-003, AIA-001 | Daily briefing available on mobile |

### Future Platform

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Visual workflow designer (drag-and-drop) | P1 | WFA-005 | Complete visual workflow builder with zoom/pan/minimap |
| Visual condition editor (AND/OR nesting) | P2 | WFA-006 | Drag-and-drop condition group builder |

---

## 36-Month Horizon (July 2028 — July 2029)

### Core Platform

| Item | Priority | Evidence | Description |
|---|---|---|---|
| CQRS for complex queries | P2 | ROADMAP-LONG | Command Query Responsibility Segregation |
| Sub-millisecond P99 API response | P2 | ROADMAP-LONG | Performance target for all read endpoints |
| Multi-region deployment support | P3 | ROADMAP-LONG | Geographic distribution for global enterprises |

### Finance Operations

| Item | Priority | Evidence | Description |
|---|---|---|---|
| SWIFT integration | P2 | ROADMAP-LONG | Global bank connectivity via SWIFT network |
| Automated hedging recommendations | P2 | ROADMAP-LONG | ML-based FX hedging suggestions |
| Bank relationship management | P2 | ROADMAP-LONG | Bank account lifecycle, relationship scoring |

### AI

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Autonomous treasury operations | P2 | ROADMAP-LONG | AI recommends + executes under policy guardrails |
| Continuous audit engine | P2 | ROADMAP-LONG | Real-time audit testing instead of periodic |
| Fraud detection ML models | P2 | SEC-005, ROADMAP-LONG | ML-powered fraud detection across all transactions |

### Platform Ecosystem

| Item | Priority | Evidence | Description |
|---|---|---|---|
| Plugin marketplace | P2 | ERP-008, ROADMAP-LONG | Third-party plugin distribution platform |
| Partner connector SDK | P2 | ROADMAP-LONG | SDK for partners to build connectors |
| Low-code policy builder | P2 | ROADMAP-LONG | Visual policy creation without code |
| Embeddable widgets | P3 | ROADMAP-LONG | Embed Perionyx widgets in third-party apps |

---

## 5-Year Horizon (July 2029 — July 2031)

### Platform Evolution

| Milestone | Description |
|---|---|
| **The Treasury Operating System Standard** | Perionyx becomes the default choice for enterprise treasury operations |
| **10,000+ enterprise entities** | Platform scale serving mid-market and enterprise globally |
| **Global multi-region infrastructure** | Active-active deployment across 3+ geographic regions |
| **Full financial OS** | Treasury + accounting + procurement + reporting + compliance on one platform |
| **Industry-specific verticals** | Specialized workflows for financial services, healthcare, manufacturing, tech |
| **AI-powered autonomous operations** | 50%+ of routine financial operations handled autonomously under policy |
| **Partner ecosystem of 100+ integrations** | Marketplace with diverse connector and plugin ecosystem |

### Market Position

| Dimension | Target |
|---|---|
| Primary competitor | SAP Treasury, Kyriba |
| Market segment | Mid-market enterprises expanding to enterprise |
| Brand recognition | "The treasury OS" — known in finance circles |
| Revenue | Series B to Series C trajectory |
| Team size | 100-200 employees |

---

## 10-Year Horizon (July 2031 — July 2036)

### Platform Vision

| Milestone | Description |
|---|---|
| **Financial infrastructure standard** | Perionyx is the operating system for global financial operations |
| **100,000+ enterprise entities** | Serving enterprises across all major markets |
| **Universal financial API gateway** | Every bank, ERP, and financial tool connects through Perionyx |
| **Continuous compliance** | Real-time compliance monitoring replaces periodic audits |
| **Autonomous finance** | 80%+ of financial operations are policy-governed and AI-executed |
| **Embedded finance infrastructure** | Perionyx powers financial operations inside other platforms |

### Long-Term Mission

Perionyx's 10-year mission is to make enterprise financial operations **reliable, transparent, and intelligent** to the point where financial audits become continuous, fraud becomes detectable in real-time, and CFOs can trust their financial data absolutely.

The platform will be:

- **The single source of truth** for all enterprise financial operations
- **The intelligence layer** that surfaces insights no human could find
- **The control plane** that enforces financial governance across the organization
- **The integration hub** that connects every financial tool in the enterprise stack
- **The audit foundation** that makes financial audits instantaneous and continuous

*Reference: `docs/ROADMAP.md` — Future Vision, `docs/PRODUCT_CONSTITUTION.md` — Section 11*

---

## Horizon Dependency Map

```
12 Months (Foundation)
    ├── Localization adoption → enables MENA market entry
    ├── ERP connectors (SAP/NetSuite/Oracle) → removes #1 purchase barrier
    ├── Month-end close → addresses #1 workflow gap
    ├── Anomaly detection → enables predictive models
    └── Error boundaries + skeletons → matches consumer UX quality bar
            ↓
24 Months (Growth)
    ├── Multi-entity consolidation → enterprise deals
    ├── Predictive cash flow → treasury differentiation
    ├── Visual workflow designer → automation leadership
    ├── Natural language reports → AI leadership
    └── Push notifications → mobile parity with consumer apps
            ↓
36 Months (Scale)
    ├── SWIFT integration → global enterprise
    ├── Plugin marketplace → platform defensibility
    ├── CQRS + multi-region → infrastructure scale
    └── Autonomous treasury → industry defining
            ↓
5 Years (Dominance)
    └── Treasury OS standard → market leadership
            ↓
10 Years (Infrastructure)
    └── Universal financial API gateway → platform permanence
```

---

## Evidence Sources

| Reference | Document |
|---|---|
| WFV-001 | `docs/product/workflow-validation.md` — Workflow validation findings |
| WFV-P1.1-P2.7 | Specific workflow validation recommendations |
| ROADMAP-SHORT | `docs/ROADMAP.md` — Short term (1-2 quarters) |
| ROADMAP-MEDIUM | `docs/ROADMAP.md` — Medium term (2-4 quarters) |
| ROADMAP-LONG | `docs/ROADMAP.md` — Long term (4-8 quarters) |
| ROADMAP-DEV | `docs/ROADMAP.md` — Developer experience items |
| ROADMAP-MT | `docs/ROADMAP.md` — Medium term AI items |
| ROADMAP-ECO | `docs/ROADMAP.md` — Ecosystem items |
| ROADMAP-SCALE | `docs/ROADMAP.md` — Enterprise scale items |
| CERT-001 through CERT-005 | `docs/certification/final-enterprise-certification.md` |
| MEC-003, MEC-004 | Month-end close pain points |
| REC-003 | Reconciliation pain points |
| TRY-001, TRY-007, TRY-008 | Treasury pain points |
| EXR-002, EXR-003, EXR-005 | Executive reporting pain points |
| AIA-001 through AIA-004 | AI assistance pain points |
| ERP-003 through ERP-008 | ERP integration pain points |
| CSF-002, CSF-004 | Cash flow pain points |
| SEC-005 | Security pain points |
| PER-001, PER-002 | Performance pain points |
| REP-001 | Financial reporting pain points |
| AGENTS-NEXT | `AGENTS.md` — Next steps section |
| P2P-WORKFLOW | `docs/workflows/procure-to-pay.md` |
| O2C-WORKFLOW | `docs/workflows/order-to-cash.md` |

---

## References

- `docs/product/product-strategy.md` — Strategic vision
- `docs/product/roadmap-governance.md` — Governance process
- `docs/product/feature-validation-matrix.md` — Feature validation
- `docs/product/feature-prioritization-framework.md` — Prioritization model
- `docs/product/strategic-differentiators.md` — Differentiators
- `docs/product/competitive-positioning.md` — Competitive analysis
- `docs/product/product-principles.md` — Enterprise product principles
- `docs/ROADMAP.md` — Current product roadmap
- `docs/workflows/README.md` — Workflow intelligence index
- `docs/customer-discovery/roadmap-evidence.md` — Evidence mapping
