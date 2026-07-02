# PERIONYX — Glossary

## Navigation Terminology (Standardized)

| Route | Navigation Label | Page Header Title |
|-------|-----------------|-------------------|
| `/dashboard` | Executive Overview | Executive Overview |
| `/insights` | Executive Insights | Executive Insights |
| `/platform` | Platform Health | Platform Health |
| `/operations` | Operations | Operations Center |
| `/reports` | Reports | Reports |
| `/risk` | Risk Center | (risk overview) |
| `/risk-intelligence` | Risk Intelligence | Risk Intelligence |
| `/copilot` | Copilot | Copilot |
| `/developer` | Developer Portal | Developer Portal |
| `/integrations` | Integrations | Integration Hub |
| `/settings` | Settings | (varies) |
| `/admin/analytics` | Approval Analytics | Approval Analytics |
| `/audit-logs` | Audit Logs | (varies) |
| `/investigation` | Investigation | (varies) |

## Product Naming (Standardized)

| Context | Standard Usage |
|---------|---------------|
| Product category | Enterprise Treasury Operating System |
| AI assistant | PERIONYX Copilot (interface) / PERIONYX Intelligence (AI system) |
| Dashboard area | Executive Command Center |
| Sandbox environment | Sandbox (not "Demo" in internal contexts) |
| External directory | Developers (landing nav) |

---

**Version 2.0**  
**Last Updated: July 2026**

---

## A

**Account** — A treasury account representing an external bank account. Has balance, currency, routing info, and optional Plaid integration. Distinct from Wallet (see Wallet).

**Account Control** — A rule applied to a Treasury Account, such as spending limits, velocity limits, or debit/credit blocks.

**ADR** — Architectural Decision Record. A document recording a significant architectural decision, its context, alternatives considered, and consequences.

**AI Service** — The PERIONYX Intelligence module that processes user queries against platform data, optionally using an external LLM.

**API Key** — A scoped credential for programmatic API access. Keys have prefixes for identification, scopes for permission control, and optional expiration dates.

**Approval Analytics** — The administrative page for monitoring approval workflow metrics, bottlenecks, and rule usage. Located under Administration.

**Approval Authority** — A role-based configuration defining who can approve transactions, within what amount range, and under what scope.

**Approval Rule** — A configurable rule defining when an approval is required, who must approve, in what order, and under what conditions.

**Approval Step** — A single step in an approval chain, specifying the role required and how many approvers of that role are needed.

**Approval Thread** — A discussion thread attached to a transaction, containing comments and participants.

**Audit Log** — An immutable record of state changes, authentication events, and financial operations. Includes actor, action, resource, severity, and optional payload hash for tamper evidence.

---

## C

**Calendar Event** — A scheduled event on the financial calendar, such as approval deadlines, reconciliation runs, settlements, or audits.

**Command Palette** — The ⌘K-activated search and navigation interface. Provides fuzzy search across all pages and entities, grouped by category.

**Company** — A tenant in the multi-tenant architecture. Each company has its own users, wallets, transactions, policies, and settings.

**Company Membership** — The relationship between a user and a company, defining the user's role within that company.

**Confidence** — A rating (high/medium/low/simulated) attached to AI responses indicating the reliability of the information.

**Connector** — An integration with an external system (bank, service, ERP). Connectors have configurable settings, execution lifecycle, and event logging.

**Connector Event** — A log entry from a connector run, classified as INFO, WARNING, ERROR, or DEBUG.

**Connector Run** — A single execution of a connector, with input, output, status, and timing.

**Context Builder** — The module that assembles the full enterprise context for AI processing by executing 19 parallel database queries.

**Copilot** — The AI-powered enterprise intelligence interface. See "PERIONYX Intelligence".

---

## D

**Executive Insights** — The dedicated page for enterprise financial intelligence, KPIs, trends, and strategic treasury performance metrics.

**Executive Overview** — The main landing page (formerly Dashboard) providing executive-level visibility into treasury balances, pending approvals, risk exposure, audit activity, and key financial metrics.

**Double-Entry Ledger** — An accounting method where every transaction affects at least two accounts (DEBIT and CREDIT), ensuring the accounting equation balances.

---

## E

**Enterprise Time Machine** — The versioning system that tracks state changes on financial entities, providing version history and field-level diff comparison.

**Exchange Rate** — A currency conversion rate with source (manual, provider) and validity window. Rates are stored per-company for customization.

**Executive Briefing** — An AI-generated summary of the enterprise's financial state, available in daily, weekly, monthly, and quarterly variants.

---

## F

**FX** — Foreign Exchange. The module managing currency exchange rates and synchronization.

---

## G

**Global Search** — Cross-module search across 15 entity types, returning results with confidence scoring and module attribution.

**Guided Tour** — A 10-step onboarding walkthrough covering all major platform modules.

---

## I

**Idempotency** — The property that repeating the same request produces the same result. Enforced via idempotency keys to prevent duplicate financial transactions.

**Incident** — A risk incident grouping multiple related alerts with root cause analysis, resolution tracking, and timeline.

**Integration** — A third-party system connected to Perionyx via the integration framework (connectors, webhooks, Plaid).

**Internal Transfer** — A transfer of funds between two Treasury Accounts within the same company.

**Investigation Workspace** — A dedicated page for tracing a transaction through its complete lifecycle, with timeline view, relationship graph, trust indicators, and smart alerts.

---

## K

**Knowledge Index** — A summary of all data available in the platform, used by the AI to understand what information is accessible.

---

## L

**Ledger** — The double-entry accounting system recording DEBIT and CREDIT entries for every transaction.

**Ledger Entry** — A single DEBIT or CREDIT posting on a wallet as part of a transaction.

**License** — A per-company license defining available features, seat count, and expiration.

---

## M

**Mission** — An onboarding task in the Mission Panel, guiding new users through platform capabilities.

**Multi-Tenant** — The architecture where multiple companies share the same application instance with complete data isolation.

---

## N

**Notification** — An alert delivered to a user via configured channels (in-app, email, Slack) about platform events.

---

## O

**Operations Center** — The page for monitoring operational health, service status, queue processing, attention items, and incident resolution.

---

**Notification Channel** — A configured delivery method for notifications (IN_APP, EMAIL, SLACK).

**Notification Preference** — A user's preference for receiving notifications about specific event types on specific channels.

---

## O

**Object Version** — A snapshot of an entity at a point in time, used for the Enterprise Time Machine.

**Onboarding** — The guided experience for new users, including welcome modal, guided tour, mission panel, contextual hints, and smart recommendations.

---

## P

**PERIONYX Intelligence** — The AI-powered enterprise financial intelligence layer. Provides persona-aware answers, executive briefings, transaction investigations, and data discovery.

**PERIONYX Copilot** — The conversational interface for PERIONYX Intelligence. Accessed via the Copilot workspace.

**Permission** — A named capability in the RBAC system (e.g., `read:transactions`, `write:transfers`).

**Persona** — A role-based AI configuration (CEO, CFO, Treasurer, Risk Officer, Compliance Officer, Auditor, Developer, Finance Manager) that adapts AI responses.

**Policy** — A declarative rule evaluated during financial operations. Policies can BLOCK, FLAG, REQUIRE_APPROVAL, or NOTIFY.

**Platform Health** — The page for monitoring the health, availability, and operational status of platform services.

**Policy Rule** — A single condition in a policy, with field, operator, value, and optional negation.

**Policy Test** — A dry-run evaluation of a policy against sample data without executing the policy action.

---

## R

**Reconciliation** — The process of matching internal records (transactions, ledger entries) against external data to verify accuracy.

**Reports** — The module for creating, scheduling, and exporting enterprise treasury reports.

**Risk Center** — The module for managing risk alerts, incidents, and compliance monitoring at an operational level.

**Risk Intelligence** — The dedicated page for enterprise risk monitoring, heatmaps, policy analytics, vendor risk, geographic exposure, and strategic recommendations.

**Reconciliation Exception** — A discrepancy found during reconciliation, classified by type (BALANCE_MISMATCH, LEDGER_ORPHAN, etc.) with severity and resolution tracking.

**Risk Alert** — A notification about a potential risk event, categorized by type (BALANCE_ANOMALY, CONNECTOR_FAILURE, POLICY_VIOLATION, etc.).

**Risk Incident** — A collection of related risk alerts with investigation and resolution tracking.

**Role** — A named set of permissions within a company (OWNER, ADMIN, TREASURER, MEMBER, VIEWER).

**Role Permission** — The assignment of a permission to a role, optionally scoped to a specific entity (wallet, transaction type).

---

## S

**Sandbox** — A pre-populated enterprise environment (Atlas Manufacturing Group) for evaluation, demonstration, and testing.

**Scenario** — A pre-built business simulation (Treasury Surge, Compliance Breach, Audit Readiness, Liquidity Crisis, Connector Failure) that transforms sandbox data.

**Session** — An authenticated user session, managed via JWT tokens in HTTP-only cookies.

**Settlement** — The process of settling a transaction with an external system (bank, payment processor).

**Simulation** — The engine that executes business scenarios, creating or modifying sandbox data according to scenario definitions.

---

## T

**Tenant** — A company using the Perionyx platform. Each tenant has complete data isolation.

**Tenant Context** — The authentication and authorization context for a request, containing userId, companyId, and role.

**Timeline** — A visual representation of events in chronological order, used for transaction lifecycle tracing and investigation.

**Transaction** — A financial operation (credit, debit, transfer, adjustment, reversal) with a defined lifecycle and audit trail.

**Transaction Approval** — A record of an approval action on a transaction, with status, approver, and timestamp.

**Treasury Account** — An external bank account managed within the platform. May be linked via Plaid for balance syncing.

**Trust Indicator** — A visual badge indicating the trust level of displayed data: high (live), medium (cached), low (stale), or simulated (demo).

---

## U

**User Role** — The assignment of a role to a user within a specific company.

---

## V

**Version Diff** — A field-level comparison between two Object Versions, showing added, modified, and removed fields.

**Version History** — The chronological sequence of Object Versions for a given entity, used for auditing and rollback analysis.

---

## W

**Wallet** — An internal accounting construct holding a currency balance. STANDARD wallets cannot go negative. SYSTEM_CLEARING wallets are used for external flows.

**Webhook** — An HTTP callback triggered by platform events (transaction completed, risk alert created, reconciliation finished).

**Webhook Delivery** — A single delivery attempt of a webhook, with status, error tracking, and retry scheduling.

---

## Z

**Zod** — A TypeScript-first schema validation library used for API request validation and type generation.
