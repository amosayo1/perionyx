# Perionyx — Product Roadmap

**Last Updated: July 2026**

---

This roadmap reflects the current state of the platform and planned发展方向. It is a living document updated as priorities evolve.

---

## Legend

- ✅ **Completed** — Shipped and available in the current codebase
- 🔄 **In Progress** — Active development
- 📋 **Short Term** — Next 1-2 quarters
- 🔭 **Medium Term** — Next 2-4 quarters
- 🌟 **Long Term** — Next 4-8 quarters
- 🚀 **Future Vision** — Beyond 8 quarters

---

## ✅ Phase 1: Platform Foundation (Completed)

### Core Infrastructure
- [x] Next.js 16 App Router setup with TypeScript strict mode
- [x] PostgreSQL database with Prisma ORM (46 models)
- [x] NextAuth v5 authentication (JWT, credentials provider)
- [x] Multi-tenant architecture via `companyId` on all entities
- [x] Dark theme design system with gold accent (#d4af37)
- [x] Error handling framework (`handleRouteError`, `zodErrorResponse`)
- [x] Rate limiting infrastructure
- [x] Idempotency key support

### Financial Core
- [x] Wallet management (STANDARD/SYSTEM_CLEARING)
- [x] Transaction lifecycle (7 types, 8 statuses)
- [x] Double-entry ledger (DEBIT/CREDIT posting)
- [x] Multi-currency support with exchange rates
- [x] Treasury account management
- [x] Internal transfers between treasury accounts
- [x] Account controls (spending limits, velocity limits)

### Approval Workflows
- [x] Approval rule engine (priority, scope, thresholds)
- [x] Sequential and parallel approval chains
- [x] Dual approval requirement
- [x] Escalation paths with timeouts
- [x] Approval authority management
- [x] Approval discussion threads

### Policy Engine
- [x] Declarative policy rules with 10 operators
- [x] Policy types: APPROVAL, TRANSACTION_LIMIT, COMPLIANCE, RISK, CUSTOM
- [x] Policy actions: BLOCK, FLAG, REQUIRE_APPROVAL, NOTIFY
- [x] Dry-run policy testing
- [x] Policy evaluation on transactions

### Risk Management
- [x] Risk alert generation and management (9 categories)
- [x] Risk severity classification (LOW/MEDIUM/HIGH/CRITICAL)
- [x] Risk incident tracking with linked alerts
- [x] Risk summary dashboard

### Reconciliation
- [x] Reconciliation run orchestration
- [x] Exception detection and management
- [x] Reconciliation reporting

### RBAC
- [x] Role-based access control
- [x] Permission catalog with scope types
- [x] User-role assignment per company
- [x] Permission checking in API routes

### Audit
- [x] Comprehensive audit logging
- [x] Audit trail querying and export
- [x] Severity classification (INFO/WARNING/CRITICAL)
- [x] Payload hashing for tamper evidence

---

## ✅ Phase 2: Integration & Connectivity (Completed)

### Connectors
- [x] Connector configuration and management
- [x] Connector run execution and event logging
- [x] Connector health monitoring

### Webhooks
- [x] Webhook subscription management
- [x] Event-triggered webhook delivery
- [x] Delivery retry logic
- [x] Delivery status tracking

### Plaid Integration
- [x] Bank account linking via Plaid
- [x] Account sync and balance updates
- [x] Account unlinking

### API Keys
- [x] API key generation with scoped permissions
- [x] Key prefix and last-chars identification
- [x] Expiration and usage tracking

---

## ✅ Phase 3: Enterprise Intelligence (Completed)

### Search & Discovery
- [x] Global search across 15 modules
- [x] Fuzzy matching with confidence scoring
- [x] Cross-module result aggregation
- [x] ⌘K Command palette with 30+ commands

### System Health
- [x] Multi-service health monitoring (8 services)
- [x] Webhook and connector health tracking
- [x] Queue depth monitoring
- [x] Database connection status

### Copilot AI
- [x] Knowledge index querying all 19+ modules
- [x] Context builder with 19 parallel queries
- [x] 8 persona profiles with custom priorities
- [x] Transaction timeline tracing
- [x] Executive briefing generation (daily/weekly/monthly/quarterly)
- [x] Offline fallback (no AI key required)
- [x] Smart intent detection (briefing, investigation, data query)
- [x] Follow-up question generation
- [x] Source citation and confidence scoring
- [x] Three-panel UI (CommandCenter + Workspace + KnowledgeIndex)

### Investigation Workspace
- [x] Transaction lifecycle visualization
- [x] Relationship graph view
- [x] Timeline view with step mode
- [x] Trust indicators (high/medium/low/simulated)
- [x] Smart alerts panel

### Enterprise Time Machine
- [x] Object versioning for 6 entity types
- [x] Field-level diff comparison
- [x] Side-by-side state comparison UI
- [x] Version history timeline
- [x] Integrated into transaction, account, approval pages

---

## ✅ Phase 4: Sandbox & Onboarding (Completed)

### Sandbox
- [x] Pre-seeded enterprise tenant (Atlas Manufacturing Group)
- [x] 31 users, 18 offices, 12 months of data
- [x] 5 business scenarios
- [x] Scenario orchestration engine
- [x] Sandbox reset capability
- [x] Simulation mode flag

### Onboarding
- [x] Welcome modal with company stats
- [x] 10-step guided tour
- [x] Mission panel with 10 tasks
- [x] Contextual hints (8 module-specific)
- [x] Smart recommendations
- [x] State persistence via localStorage

---

## ✅ Phase 5: Notifications & Calendar (Completed)

### Notifications
- [x] Multi-channel notifications (IN_APP, EMAIL, SLACK)
- [x] Notification preference management
- [x] 15 notification event types
- [x] Read tracking and deep linking

### Calendar
- [x] Calendar event management (6 types)
- [x] Date-range based events
- [x] Reference linking to transactions, reconciliations, connectors
- [x] Status tracking (SCHEDULED/COMPLETED/CANCELLED)

---

## 📋 Short Term (Next 1-2 Quarters)

### Developer Experience
- [ ] Developer portal with interactive API documentation
- [ ] SDK generation for TypeScript, Python, and Go
- [ ] Rate limit usage headers on all API responses
- [ ] API changelog and deprecation policy

### Export Engine
- [ ] PDF export with company branding
- [ ] CSV/Excel export for all list views
- [ ] PowerPoint export for board presentations
- [ ] JSON export for API consumers
- [ ] Scheduled export with delivery

### Reporting Engine
- [ ] Report builder UI (drag-and-drop)
- [ ] Report templates (Treasury, Risk, Compliance, Audit)
- [ ] Report scheduling and distribution
- [ ] Custom metric definitions

### Performance
- [ ] Virtual scrolling for large tables (10k+ rows)
- [ ] Lazy loading for dashboard widgets
- [ ] Redis caching for frequent queries
- [ ] Database query optimization pass

---

## 🔭 Medium Term (Next 2-4 Quarters)

### Advanced AI
- [ ] Multi-turn conversation memory
- [ ] Proactive alerting and recommendations
- [ ] Natural language report generation
- [ ] Anomaly detection engine
- [ ] Predictive cash flow modeling
- [ ] AI-powered policy suggestion

### Enterprise Compliance
- [ ] SOC 2 compliance reporting
- [ ] GDPR data management
- [ ] SOX compliance workflows
- [ ] Regulatory filing support
- [ ] Compliance calendar with automatic reminders

### Multi-Entity Consolidation
- [ ] Consolidated financial views across companies
- [ ] Inter-company reconciliation
- [ ] Currency translation for consolidation
- [ ] Group-level policy management

### Integration Marketplace
- [ ] Partner connector SDK
- [ ] ERP integrations (SAP, Oracle, NetSuite)
- [ ] Banking integrations (corporate banking APIs)
- [ ] Accounting software integrations (QuickBooks, Xero, Sage)

---

## 🌟 Long Term (Next 4-8 Quarters)

### Advanced Treasury
- [ ] Cash flow forecasting with ML
- [ ] Automated hedging recommendations
- [ ] Bank relationship management
- [ ] SWIFT integration
- [ ] Real-time payment status tracking

### Advanced Risk
- [ ] Fraud detection ML models
- [ ] Vendor risk scoring
- [ ] Counterparty risk assessment
- [ ] Portfolio risk analytics
- [ ] Regulatory capital calculation

### Platform Ecosystem
- [ ] Plugin marketplace
- [ ] Custom workflow builder
- [ ] Low-code policy builder
- [ ] Embeddable widgets for third-party apps
- [ ] White-label deployment option

### Enterprise Scale
- [ ] Read replicas for analytics queries
- [ ] Sharding for multi-region deployment
- [ ] Event sourcing architecture
- [ ] CQRS for complex queries
- [ ] Sub-millisecond P99 API response times

---

## 🚀 Future Vision (Beyond 8 Quarters)

### The Treasury Operating System Standard
PERIONYX aims to become the standard enterprise treasury operating system, analogous to what Salesforce is for CRM or Workday is for HR. The platform will be:

- **The single source of truth** for all enterprise financial operations
- **The intelligence layer** that surfaces insights no human could find
- **The control plane** that enforces financial governance across the organization
- **The integration hub** that connects every financial tool in the enterprise stack
- **The audit foundation** that makes financial audits instantaneous and continuous

---

## How We Prioritize

Features are prioritized based on:

1. **Customer Impact** — How many users benefit and how significantly
2. **Architectural Fit** — Does it leverage existing capabilities?
3. **Strategic Value** — Does it advance the platform vision?
4. **Implementation Complexity** — Can it be delivered efficiently?
5. **Risk Reduction** — Does it reduce technical or business risk?

## Roadmap Governance

The roadmap is reviewed quarterly. Major changes are documented in ADRs. Feature requests are tracked through the standard contribution process.
