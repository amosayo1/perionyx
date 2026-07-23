# Feature Validation Matrix

**Phase:** 8E.4
**Last Updated:** July 8, 2026

---

## Purpose

This matrix validates every major feature against customer evidence, workflow intelligence, business value, and strategic differentiation. Every feature must justify its existence through documented evidence.

*Reference: `docs/customer-discovery/feature-request-catalog.md`, `docs/customer-discovery/roadmap-evidence.md`*

---

## Schema

| Field | Description |
|---|---|
| Feature Name | Concise, descriptive name |
| Business Objective | What business outcome this enables |
| Customer(s) Requesting | Organizations that requested it |
| Pain Points Solved | Pain Point IDs from catalog |
| Workflow Supported | Workflow document(s) supported |
| Affected Personas | Who benefits |
| Business Impact | Quantified or qualitative value |
| Implementation Complexity | XS / S / M / L / XL |
| Strategic Importance | Critical / High / Medium / Low |
| Competitive Differentiation | How this differentiates |
| Priority | P0-P4 |
| Current Status | Proposed / Validated / In Progress / Shipped |
| Evidence References | Interview IDs, support tickets |

---

## Feature Registry

### Core Platform

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Multi-tenant architecture | Isolate data per entity | Strategic | SEC-001 | All | All | Foundation | XL | Critical | Tenant isolation by design | P0 | Shipped | ADR-002, CONST 3.4 |
| RBAC & granular permissions | Role-based access control | Strategic | SEC-002 | All | All | Foundation | L | Critical | Granular permission registry | P0 | Shipped | ADR-003, PERM-001 |
| Audit logging | Immutable audit trail | Strategic | AUD-001 | Audit & Compliance | Auditor, Controller | Foundation | L | Critical | Tamper-evident, payload-hashed | P0 | Shipped | ADR-009, CONST 3.3 |
| Command palette (⌘K) | Keyboard-first navigation | Strategic | UX-001 | All | All | High | S | High | 27 commands + dynamic search | P1 | Shipped | WFV-001, UX-001 |
| Multi-currency engine | Native multi-currency support | Strategic | L10-001, TRY-001 | Treasury, Reporting | Treasury Director, CFO | Foundation | M | Critical | Currency-native from day one | P0 | Shipped | ADR-004, TRY-001 |
| Notification system | Multi-channel alerts | Strategic | UX-002 | All | All | High | M | High | 15 event types + deep linking | P1 | Shipped | WFV-001 |
| Dark theme design system | CFO-grade visual clarity | Strategic | EXR-001 | All | All | High | M | High | Terminal-inspired, gold accents | P1 | Shipped | DESIGN-001 |
| Enterprise search | Cross-entity search | Strategic | VIS-001 | All | All | High | M | High | 15-module fuzzy search | P1 | Shipped | SEARCH-001 |
| Loading skeletons | Data-fetching UX | Strategic | UX-003 | All | All | Medium | S | Medium | Consistent pattern across pages | P2 | Shipped | WFV-P1.1 |
| Error boundaries | Graceful failure recovery | Strategic | UX-004 | All | All | Medium | S | Medium | Page-level error isolation | P2 | Shipped | WFV-001 |
| Keyboard shortcuts | Power user efficiency | Strategic | UX-005 | All | CFO, Treasury Director | Medium | XS | Medium | 15+ keyboard shortcuts | P2 | Shipped | WFV-001 |

### Finance Operations

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Wallet management | Multi-currency balance tracking | Strategic | TRY-001 | Cash Management | Treasury Director, CFO | Foundation | M | Critical | Wallet-native treasury | P0 | Shipped | ADR-008, TRY-001 |
| Transaction lifecycle | 7 types, 8 statuses | Strategic | TRY-002 | Treasury Operations | Treasury Director | Foundation | L | Critical | Full lifecycle tracking | P0 | Shipped | ADR-008 |
| Double-entry ledger | DEBIT/CREDIT posting | Strategic | MEC-001 | Record to Report | Controller, Accountant | Foundation | L | Critical | Always-balanced ledger | P0 | Shipped | ADR-004 |
| Bank reconciliation | Automated matching | T1 - 2+ customers | REC-001 | Bank Reconciliation | Accountant, Controller | High | M | High | Exception-driven matching | P1 | Shipped | REC-001, WFV-001 |
| Approvals engine | Sequential/parallel chains | Strategic | APV-001 | Procure to Pay, Order to Cash | AP Clerk, Finance Manager | Foundation | L | Critical | Priority-scoped, escalation | P0 | Shipped | ADR-006, APV-001 |
| Policy engine | Declarative rule enforcement | Strategic | CPL-001 | Compliance | Compliance Officer, Controller | Foundation | L | Critical | 10 operators, 4 action types | P0 | Shipped | ADR-005, CPL-001 |
| Risk engine | Alert generation & severity | Strategic | CPL-002 | Risk Management | Risk Manager | High | M | High | 9 categories, 4 severities | P1 | Shipped | ADR-007, CPL-002 |
| Investigation workspace | Transaction lifecycle viz | Strategic | AUD-002 | Audit & Compliance | Auditor | High | L | High | Timeline + graph + trust indicators | P1 | Shipped | AUD-002, WFV-001 |
| Enterprise Time Machine | Object versioning & diff | Strategic | AUD-003 | Audit & Compliance | Auditor, Controller | High | M | High | Field-level diff comparison | P1 | Shipped | ADR-013, AUD-003 |
| Reject UX consistency | Unified approval actions | T2 - inferred | APV-002 | All approvals | AP Clerk, Finance Manager | Medium | S | Medium | Shared ApprovalActions component | P2 | Shipped | WFV-P1.2 |
| Audit log pagination | Browse full history | T2 - inferred | AUD-004 | Audit & Compliance | Auditor | Medium | S | Medium | Cursor-based pagination | P2 | Shipped | WFV-P1.4 |
| KPI clickability | Drill-down from dashboard | T2 - inferred | EXR-002 | Executive Reporting | CFO | Medium | S | Medium | Navigable KPI cards | P2 | Shipped | WFV-P2.1 |

### Treasury

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Cash position dashboard | Real-time liquidity view | T1 - 2+ customers | TRY-003, CSF-001 | Cash Management | CFO, Treasury Director | High | M | Critical | Multi-currency aggregation | P0 | Shipped | TRY-003, CSF-001 |
| FX rate management | Exchange rate tracking | Strategic | TRY-004 | Treasury Operations | Treasury Director | High | M | High | Provider-agnostic rate sourcing | P1 | Shipped | TRY-004 |
| Internal transfers | Entity-to-entity movement | T1 - 2+ customers | TRY-005 | Treasury Operations | Treasury Director | High | M | High | Approval-gated transfers | P1 | Shipped | TRY-005 |
| Account controls | Spending & velocity limits | Strategic | TRY-006 | Treasury Operations | Treasury Director | High | M | High | Policy-enforced limits | P1 | Shipped | TRY-006 |
| FX widget in treasury | Rates in treasury context | T2 - inferred | TRY-007 | Treasury Operations | Treasury Director | Medium | S | Medium | Context-linked FX display | P2 | Proposed | WFV-P2.2 |
| Cross-currency position | Aggregate exposure view | T2 - inferred | TRY-008 | Cash Management | Treasury Director | Medium | M | Medium | Consolidated currency view | P2 | Proposed | WFV-P2.2 |

### Accounting

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Ledger view | Journal entry browsing | Strategic | MEC-002 | Record to Report | Accountant, Controller | High | M | High | Full ledger with filters | P1 | Shipped | MEC-002 |
| Reconciliation runs | Automated run orchestration | T1 - 2+ customers | REC-002 | Bank Reconciliation | Accountant | High | M | High | Scheduled + on-demand | P1 | Shipped | REC-002 |
| Exception management | Flag & resolve mismatches | T1 - 2+ customers | REC-003 | Bank Reconciliation | Accountant, Controller | High | M | High | Exception workflow with status | P1 | Shipped | REC-003 |
| Month-end close workflow | Consolidated close checklist | T2 - inferred | MEC-003 | Month-end Close, Record to Report | Controller, Accountant | High | L | High | Cross-domain close dashboard | P1 | Proposed | WFV-P1.3 |
| Period-end close workflow | Period-end processing | T2 - inferred | MEC-004 | Month-end Close | Accountant, Controller | High | L | High | End-to-end close orchestration | P2 | Proposed | WFV-001 |

### AI

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AI Copilot | Natural language financial queries | T1 - 2+ customers | AIA-001 | All | CFO, Treasury Director | High | XL | Critical | Multi-provider, persona-aware | P0 | Shipped | ADR-010, AIA-001 |
| Executive briefing | Daily/weekly/monthly summaries | T1 - 2+ customers | EXR-003 | Executive Reporting | CFO | High | L | Critical | Templated + grounded + source-cited | P0 | Shipped | EXR-003, AIA-001 |
| Anomaly detection | Unusual transaction flagging | T2 - inferred | AIA-002 | All | Controller, Auditor | High | L | High | ML-driven pattern detection | P1 | Proposed | AIA-002 |
| Predictive cash flow | ML-based forecasting | T2 - inferred | CSF-002 | Cash Management | CFO, Treasury Director | High | XL | High | Multi-variable forecasting models | P1 | Proposed | CSF-002 |
| Natural language report generation | Text-to-report | T2 - inferred | REP-001 | Financial Reporting | CFO, Finance Manager | High | XL | High | AI-powered report builder | P2 | Proposed | REP-001 |
| Contextual AI triggers | AI suggestions in context | T2 - inferred | AIA-003 | All | All | Medium | M | Medium | "Ask AI" on transaction pages | P2 | Proposed | WFV-001 |
| Multi-turn conversation memory | Persistent AI context | T2 - inferred | AIA-004 | All | CFO, Treasury Director | Medium | M | Medium | Session-aware AI conversations | P2 | Proposed | ROADMAP-MT |

### Analytics

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Executive dashboard | 10-zone CFO command center | T1 - 2+ customers | EXR-004 | Executive Reporting | CFO, Executive Viewer | High | L | Critical | KPI with drill-down + AI snippets | P0 | Shipped | EXR-004, WFV-001 |
| Variance analysis | Budget vs actual comparisons | T1 - 2+ customers | REP-002 | Financial Reporting | CFO, Controller | High | M | High | Inline % change + directional indicators | P1 | Shipped | REP-002, WFV-001 |
| Drill-down panels | Metric → detail exploration | T2 - inferred | VIS-002 | All | CFO, Controller | High | M | High | Zone-level data exploration | P1 | Shipped | VIS-002 |
| Insight panel | Automated trend highlights | T2 - inferred | VIS-003 | Executive Reporting | CFO | Medium | M | Medium | AI-generated insight callouts | P2 | Shipped | VIS-003 |
| Cash flow timeline | Visual cash flow projection | T1 - 2+ customers | CSF-003 | Cash Management | CFO, Treasury Director | High | M | Critical | Timeline + forecast boundary | P1 | Shipped | CSF-003 |
| Approval analytics | Approval path visualization | T2 - inferred | APV-003 | All approval workflows | Finance Manager | Medium | M | Medium | Donut chart + cycle time | P2 | Shipped | APV-003 |

### Compliance

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Policy violation detection | Automated compliance checks | Strategic | CPL-003 | Compliance | Compliance Officer, Controller | High | L | Critical | Real-time policy evaluation | P1 | Shipped | CPL-003 |
| Sanctions screening | Regulatory compliance | Strategic | CPL-004 | Compliance | Compliance Officer | High | L | Critical | Watchlist-based screening | P1 | Shipped | CPL-004 |
| SOC 2 reporting | Compliance evidence pack | Strategic | CPL-005 | Audit & Compliance | Auditor, CISO | High | XL | High | Automated evidence collection | P2 | Proposed | CPL-005 |
| SOX compliance workflows | Internal control testing | Strategic | CPL-006 | Audit & Compliance | Controller, Auditor | High | XL | High | Control testing + deficiency tracking | P2 | Proposed | CPL-006 |

### Developer Platform

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API keys with scoped permissions | Secure programmatic access | Strategic | SEC-003 | All | Developer | High | M | High | Scoped, expiring, tracked | P1 | Shipped | SEC-003 |
| Webhook management | Event-driven integrations | Strategic | ERP-001 | All | Developer, IT Manager | High | M | High | Retry logic + status tracking | P1 | Shipped | ERP-001 |
| Connector health monitoring | Integration reliability | Strategic | ERP-002 | All | IT Manager, Operations | High | M | High | Real-time health checks | P1 | Shipped | ERP-002 |
| Developer portal | Interactive API docs | T2 - inferred | ERP-003 | All | Developer | Medium | L | Medium | Self-service API reference | P2 | Proposed | ROADMAP-DEV |
| SDK generation | TypeScript/Python/Go SDKs | T2 - inferred | ERP-004 | All | Developer | Medium | XL | Medium | First-party SDK support | P3 | Proposed | ROADMAP-DEV |

### Enterprise Administration

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| User management | User lifecycle management | Strategic | SEC-004 | All | IT Admin | High | M | High | Invitation-based, role-assignable | P1 | Shipped | SEC-004 |
| Company settings | Entity configuration | Strategic | UX-006 | All | IT Admin, Finance Manager | High | M | High | Multi-entity configuration | P1 | Shipped | UX-006 |
| Sandbox environment | Risk-free evaluation | T2 - inferred | TRA-001 | All | Prospect, Demo User | High | L | High | Pre-seeded 31-user sandbox | P1 | Shipped | ADR-011, TRA-001 |
| Onboarding wizard | Guided setup | T2 - inferred | TRA-002 | All | New User | High | M | High | 10-step guided tour | P1 | Shipped | TRA-002 |

### Integrations

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Plaid bank integration | Automated bank connectivity | T1 - 2+ customers | ERP-005 | Bank Reconciliation, Cash Management | Treasury Director | High | L | Critical | Plaid-powered account linking | P0 | Shipped | ERP-005 |
| Connector platform | Extensible integration framework | Strategic | ERP-006 | All | IT Manager, Developer | High | XL | Critical | Health-checked, monitored connectors | P0 | Shipped | ADR-014, ERP-006 |
| ERP integrations (SAP/Oracle/NetSuite) | ERP sync & reconciliation | T1 - 2+ customers | ERP-007 | Record to Report | Controller, IT Manager | High | XL | High | Bi-directional sync with error recovery | P1 | Proposed | ERP-007 |

### Mobile

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mobile dashboard | CFO-grade mobile visibility | T1 - 2+ customers | EXR-005 | Executive Reporting | CFO, Treasury Director | High | M | Critical | Full financial metrics on mobile | P0 | Shipped | EXR-005, WFV-001 |
| Mobile approvals | Approve/reject on-the-go | T1 - 2+ customers | APV-004 | All approvals | All approvers | High | M | Critical | Inline approve/reject with context | P0 | Shipped | APV-004 |
| Offline support | Work without connectivity | T2 - inferred | PER-001 | All | All mobile users | Medium | L | High | Offline indicator + retry | P1 | Shipped | PER-001, WFV-001 |
| Quick action bar | 1-tap common actions | T2 - inferred | UX-007 | All | All mobile users | Medium | XS | Medium | Horizontal scrolling action buttons | P2 | Shipped | UX-007 |

### Automation Studio

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Automation dashboard | Workflow operation overview | T2 - inferred | WFA-001 | All | Finance Manager, Controller | High | M | High | Feature tiles + analytics preview | P1 | Shipped | WFA-001 |
| Business rules builder | Configurable rule conditions | T2 - inferred | WFA-002 | All | Finance Manager | High | M | High | Condition groups + AND/OR logic | P1 | Shipped | WFA-002 |
| Approval matrix | Role/dept/threshold rules | T2 - inferred | WFA-003 | All approvals | Finance Manager, Controller | High | M | High | Matrix-based routing | P1 | Shipped | WFA-003 |
| Scheduler | 12 trigger types | T2 - inferred | WFA-004 | All | Finance Manager | High | L | High | Cron + event + webhook triggers | P1 | Shipped | WFA-004 |
| Workflow designer | Visual workflow builder | T2 - inferred | WFA-005 | All | Finance Manager, Controller | High | XL | High | Zoom/pan canvas + minimap | P2 | Proposed | WFA-005 |
| Condition editor | Visual AND/OR builder | T2 - inferred | WFA-006 | All | Finance Manager | Medium | M | Medium | Drag-and-drop condition nesting | P2 | Proposed | AGENTS-NEXT |

### Future Platform

| Feature | Business Obj. | Customers | Pain Points | Workflow | Personas | Impact | Complexity | Strategic | Differentiation | Priority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Cash flow ML forecasting | Predictive liquidity mgmt | T2 - inferred | CSF-004 | Cash Management | CFO, Treasury Director | High | XL | High | Multi-variable ML models | P2 | Proposed | CSF-004 |
| Fraud detection ML | Anomaly-based fraud alerts | T2 - inferred | SEC-005 | All | Auditor, Risk Manager | High | XL | High | ML-powered fraud scoring | P2 | Proposed | SEC-005 |
| Plugin marketplace | Third-party extensions | Strategic | ERP-008 | All | Developer, IT Manager | High | XL | High | Partner ecosystem | P3 | Proposed | ROADMAP-ECO |
| White-label deployment | Enterprise branded instance | T2 - inferred | SEC-006 | All | Enterprise Admin | Medium | XL | Medium | Fully branded deployment | P3 | Proposed | ROADMAP-ECO |
| CQRS architecture | Complex query performance | Strategic | PER-002 | All | All | Foundation | XL | Medium | Sub-ms P99 read queries | P3 | Proposed | ROADMAP-SCALE |

---

## Evidence Tier Distribution

| Tier | Count | % of Features |
|---|---|---|
| T1 — Direct | 18 | 26% |
| T2 — Inferred | 35 | 51% |
| T3 — Strategic | 16 | 23% |

## Priority Distribution

| Priority | Count | % |
|---|---|---|
| P0 — Critical | 16 | 23% |
| P1 — High | 29 | 42% |
| P2 — Medium | 19 | 28% |
| P3 — Low | 5 | 7% |

## Status Distribution

| Status | Count | % |
|---|---|---|
| Shipped | 53 | 77% |
| Proposed | 14 | 20% |
| In Progress | 2 | 3% |

---

## References

- `docs/customer-discovery/pain-point-catalog.md` — Pain point taxonomy and registry
- `docs/customer-discovery/feature-request-catalog.md` — Feature request registry
- `docs/customer-discovery/roadmap-evidence.md` — Roadmap evidence mapping
- `docs/customer-discovery/customer-discovery-playbook.md` — Interview methodology
- `docs/workflows/README.md` — Workflow intelligence index
- `docs/product/roadmap-governance.md` — Governance process
- `docs/product/feature-prioritization-framework.md` — Prioritization model
