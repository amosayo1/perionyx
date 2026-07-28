# Platform Ownership Matrix

**Document**: 2 of 5 — Governance Series
**Authority**: Platform Constitution v1.0 — Law 15 ("The Constitution Evolves Through Process")
**Version**: 1.0
**Ratified**: July 2026

---

## Purpose

This document defines ownership, accountability, and operational responsibility for every Platform in the Perionyx Enterprise Financial Operating System. Clear ownership prevents drift, accelerates decision-making, and ensures every Platform has a named human accountable for its health, evolution, and operational readiness.

**Ownership is not a title — it is a commitment to accountability.**

---

## Ownership Model

Every Platform has four ownership roles:

| Role | Responsibility | Accountability |
|---|---|---|
| **Engineering Owner** | Technical direction, architecture decisions, implementation quality, code review | Platform maturity level, technical debt, performance |
| **Product Owner** | Feature prioritization, requirements, stakeholder alignment, roadmap | Feature delivery, customer satisfaction, business value |
| **On-Call** | Incident response, production monitoring, operational runbooks, capacity planning | Uptime, MTTR, incident quality |
| **Review Board** | Architecture compliance, security review, cross-platform coordination, deprecation approval | Constitutional compliance, platform consistency |

---

## Platform Ownership Table

| # | Platform | Engineering Owner | Product Owner | On-Call | Review Board |
|---|---|---|---|---|---|
| 1 | **IntegrationPlatform** | TBD | TBD | TBD | Architecture Review Board |
| 2 | **BankingPlatform** | TBD | TBD | TBD | Architecture Review Board |
| 3 | **ERPPlatform** | TBD | TBD | TBD | Architecture Review Board |
| 4 | **PaymentsPlatform** | TBD | TBD | TBD | Architecture Review Board |
| 5 | **IdentityPlatform** | TBD | TBD | TBD | Security Review Board |
| 6 | **SecurityPlatform** | TBD | TBD | TBD | Security Review Board |
| 7 | **AIPlatform** | TBD | TBD | TBD | Architecture Review Board |
| 8 | **WorkflowPlatform** | TBD | TBD | TBD | Architecture Review Board |
| 9 | **AuditPlatform** | TBD | TBD | TBD | Compliance Review Board |
| 10 | **NotificationPlatform** | TBD | TBD | TBD | Architecture Review Board |
| 11 | **DocumentPlatform** | TBD | TBD | TBD | Architecture Review Board |
| 12 | **ObservabilityPlatform** | TBD | TBD | TBD | Architecture Review Board |
| 13 | **SearchPlatform** | TBD | TBD | TBD | Architecture Review Board |
| 14 | **StoragePlatform** | TBD | TBD | TBD | Architecture Review Board |
| 15 | **DeveloperPlatform** | TBD | TBD | TBD | Architecture Review Board |

> **Note**: All roles are currently `TBD`. The Architecture Review Board must appoint owners within 30 days of Constitution ratification. Interim owners may be assigned by the VP of Engineering.

---

## Platform Ownership Details

### 1. IntegrationPlatform

| Attribute | Value |
|---|---|
| **Contract** | `IntegrationContract` |
| **Maturity** | 2 (Functional) |
| **Location** | `src/modules/integration-platform/` (16 files) |
| **Domain Group** | Integration & Connectivity |
| **Criticality** | High — connects external systems to Perionyx |
| **Dependents** | BankingPlatform, ERPPlatform, WorkflowPlatform |

**SLA Targets**:
| Metric | Target |
|---|---|
| Availability | 99.9% |
| Sync latency (p95) | <5s |
| Error rate | <1% |
| Data freshness | <15 minutes |

**Change Management**:
- New provider adapters require ARB review
- Sync algorithm changes require load testing
- Credential handling changes require security review

**Escalation Path**: Engineering Owner → ARB Chair → VP Engineering

---

### 2. BankingPlatform

| Attribute | Value |
|---|---|
| **Contract** | `BankingContract` |
| **Maturity** | 3 (Production Ready) |
| **Location** | `src/server/banking/` (126 files) |
| **Domain Group** | Integration & Connectivity |
| **Criticality** | Critical — handles financial transactions |
| **Dependents** | PaymentsPlatform, WorkflowPlatform, all financial domains |

**SLA Targets**:
| Metric | Target |
|---|---|
| Availability | 99.99% |
| Transaction sync latency (p95) | <10s |
| Error rate | <0.1% |
| Data accuracy | 100% (financial data) |

**Change Management**:
- All changes require security review (financial data)
- Payment-related changes require two-person review
- Provider driver changes require contract test pass
- Schema changes require migration review

**Escalation Path**: Engineering Owner → ARB Chair → VP Engineering → CTO

---

### 3. ERPPlatform

| Attribute | Value |
|---|---|
| **Contract** | `ERPContract` |
| **Maturity** | 1 (Scaffolded) |
| **Location** | `src/modules/integration-platform/erp-framework/` |
| **Domain Group** | Integration & Connectivity |
| **Criticality** | Medium — planned for enterprise customers |
| **Dependents** | None yet |

**SLA Targets**: Not applicable until Level 2.

**Change Management**: Standard ARB review.

**Escalation Path**: Engineering Owner → ARB Chair

---

### 4. PaymentsPlatform

| Attribute | Value |
|---|---|
| **Contract** | `PaymentsContract` |
| **Maturity** | 1 (Scaffolded) |
| **Location** | `src/server/banking/payments/` |
| **Domain Group** | Integration & Connectivity |
| **Criticality** | Critical — handles outgoing/incoming payments |
| **Dependents** | BankingPlatform (payment processing) |

**SLA Targets**: Not applicable until Level 2. Will inherit BankingPlatform SLAs when operational.

**Change Management**: Will require same rigor as BankingPlatform (financial data).

**Escalation Path**: Engineering Owner → BankingPlatform Owner → ARB Chair

---

### 5. IdentityPlatform

| Attribute | Value |
|---|---|
| **Contract** | `IdentityContract` |
| **Maturity** | 2 (Functional) |
| **Location** | `src/server/identity/` (13 files) + `src/server/iam/` (9 files) |
| **Domain Group** | Identity & Security |
| **Criticality** | Critical — controls all access |
| **Dependents** | All Platforms (authentication, authorization) |

**SLA Targets**:
| Metric | Target |
|---|---|
| Availability | 99.99% |
| Auth latency (p95) | <200ms |
| Session validation (p95) | <50ms |
| MFA verification (p95) | <500ms |

**Change Management**:
- All changes require security review
- Permission model changes require RBAC audit
- Session management changes require load testing
- SSO changes require compatibility testing with all identity providers

**Escalation Path**: Engineering Owner → Security Review Board → VP Engineering → CTO

---

### 6. SecurityPlatform

| Attribute | Value |
|---|---|
| **Contract** | `SecurityContract` |
| **Maturity** | 2 (Functional) |
| **Location** | `src/server/security/` (14 files) |
| **Domain Group** | Identity & Security |
| **Criticality** | Critical — protects the entire platform |
| **Dependents** | All Platforms (encryption, rate limiting, CSRF) |

**SLA Targets**:
| Metric | Target |
|---|---|
| Encryption availability | 99.99% |
| Rate limiter response | <10ms |
| CSRF validation | <5ms |
| Security scan completion | <5 minutes |

**Change Management**:
- All changes require security review board approval
- Encryption changes require cryptographic review
- Rate limiting changes require load testing
- No emergency changes without post-hoc review within 24 hours

**Escalation Path**: Engineering Owner → Security Review Board → CTO

---

### 7. AIPlatform

| Attribute | Value |
|---|---|
| **Contract** | `AIContract` |
| **Maturity** | 2 (Functional) |
| **Location** | `src/modules/ai-provider/` (18 files) |
| **Domain Group** | Intelligence & Automation |
| **Criticality** | Medium — enhances workflows, not core financial |
| **Dependents** | WorkflowPlatform (AI recommendation steps) |

**SLA Targets**:
| Metric | Target |
|---|---|
| Provider availability | 99.5% (degraded gracefully) |
| Chat latency (p95) | <5s |
| Streaming first token | <1s |
| Provider failover | <10s |

**Change Management**:
- New provider additions require ARB review
- Cost tracking changes require product review
- Prompt execution changes require security review (prompt injection)

**Escalation Path**: Engineering Owner → ARB Chair

---

### 8. WorkflowPlatform

| Attribute | Value |
|---|---|
| **Contract** | `WorkflowContract` |
| **Maturity** | 2 (Functional) |
| **Location** | `src/modules/workflow/` (18 files) + `src/modules/automation-studio/` |
| **Domain Group** | Intelligence & Automation |
| **Criticality** | High — orchestrates business processes |
| **Dependents** | AutomationStudio, all domain workflows |

**SLA Targets**:
| Metric | Target |
|---|---|
| Workflow execution start | <1s |
| Step execution (p95) | <10s |
| Approval routing (p95) | <2s |
| Scheduler accuracy | 100% (within 1 minute) |

**Change Management**:
- Step type additions require ARB review
- State machine changes require full regression
- Approval logic changes require security review
- Scheduler changes require cron expression validation

**Escalation Path**: Engineering Owner → ARB Chair

---

### 9. AuditPlatform

| Attribute | Value |
|---|---|
| **Contract** | `AuditContract` |
| **Maturity** | 2 (Functional) |
| **Location** | `src/modules/audit/` + `src/modules/audit-specialist/` |
| **Domain Group** | Intelligence & Automation |
| **Criticality** | High — required for compliance |
| **Dependents** | All financial domains (audit trail) |

**SLA Targets**:
| Metric | Target |
|---|---|
| Audit record write | <100ms |
| Audit trail integrity | 100% (tamper-evident) |
| Report generation | <30s |
| Finding creation | <5s |

**Change Management**:
- Audit record schema changes require compliance review
- Audit trail integrity changes require security review
- Report format changes require auditor approval

**Escalation Path**: Engineering Owner → Compliance Review Board → VP Engineering

---

### 10. NotificationPlatform

| Attribute | Value |
|---|---|
| **Contract** | `NotificationContract` |
| **Maturity** | 2 (Functional) |
| **Location** | `src/modules/notifications/` |
| **Domain Group** | Communication & Documents |
| **Criticality** | Medium — operational communication |
| **Dependents** | All Platforms (alerting, user notifications) |

**SLA Targets**:
| Metric | Target |
|---|---|
| Delivery latency (p95) | <30s (email), <5s (Slack) |
| Delivery success rate | >99% |
| Queue processing | <60s backlog |

**Change Management**:
- New channel additions require ARB review
- Delivery algorithm changes require load testing
- Template changes require product review

**Escalation Path**: Engineering Owner → ARB Chair

---

### 11. DocumentPlatform

| Attribute | Value |
|---|---|
| **Contract** | `DocumentContract` |
| **Maturity** | 0 (Not Started) |
| **Location** | — |
| **Domain Group** | Communication & Documents |
| **Criticality** | Medium — planned for financial document management |
| **Dependents** | None yet |

**SLA Targets**: Not applicable until Level 1.

**Change Management**: TBD during design phase.

**Escalation Path**: TBD.

---

### 12. ObservabilityPlatform

| Attribute | Value |
|---|---|
| **Contract** | `ObservabilityContract` |
| **Maturity** | 2 (Functional) |
| **Location** | `src/server/observability/` (13 files) |
| **Domain Group** | Infrastructure |
| **Criticality** | Critical — monitors the entire platform |
| **Dependents** | All Platforms (metrics, logs, traces, health) |

**SLA Targets**:
| Metric | Target |
|---|---|
| Metric ingestion | <100ms |
| Log shipping | <5s |
| Trace export | <1s |
| Health check | <50ms |
| Dashboard load | <3s |

**Change Management**:
- Metric schema changes require ARB review
- Alert rule changes require on-call review
- Dashboard changes require product review
- Retention policy changes require compliance review

**Escalation Path**: Engineering Owner → ARB Chair

---

### 13. SearchPlatform

| Attribute | Value |
|---|---|
| **Contract** | `SearchContract` |
| **Maturity** | 2 (Functional) |
| **Location** | `src/server/search/` (13 files) |
| **Domain Group** | Infrastructure |
| **Criticality** | Low — search is enhancement, not core |
| **Dependents** | None critical |

**SLA Targets**:
| Metric | Target |
|---|---|
| Search latency (p95) | <500ms |
| Index freshness | <5 minutes |
| Result relevance | >80% (top 10) |

**Change Management**: Standard ARB review.

**Escalation Path**: Engineering Owner → ARB Chair

---

### 14. StoragePlatform

| Attribute | Value |
|---|---|
| **Contract** | `StorageContract` |
| **Maturity** | 0 (Not Started) |
| **Location** | — |
| **Domain Group** | Infrastructure |
| **Criticality** | High — required for document management |
| **Dependents** | DocumentPlatform (planned) |

**SLA Targets**: Not applicable until Level 1.

**Change Management**: TBD during design phase.

**Escalation Path**: TBD.

---

### 15. DeveloperPlatform

| Attribute | Value |
|---|---|
| **Contract** | `DeveloperContract` |
| **Maturity** | 0 (Not Started) |
| **Location** | — |
| **Domain Group** | Infrastructure |
| **Criticality** | Low — developer experience, not customer-facing |
| **Dependents** | None |

**SLA Targets**: Not applicable until Level 1.

**Change Management**: TBD during design phase.

**Escalation Path**: TBD.

---

## RACI Matrix for Common Activities

| Activity | Engineering Owner | Product Owner | On-Call | ARB | Security Board | Compliance Board | VP Engineering |
|---|---|---|---|---|---|---|---|
| **New Feature** | R/A | C/I | I | C | C (if security) | C (if compliance) | I |
| **Breaking Change** | R/A | C | I | A | C | C | I |
| **Security Patch** | R | I | C | I | A | I | I |
| **Provider Migration** | R/A | C | C | A | C | I | I |
| **Schema Change** | R | I | I | A | C | C | I |
| **On-Call Escalation** | C | I | R/A | I | C | I | A (P0/P1) |
| **Deprecation** | R | A | I | A | C | I | I |
| **Incident Response** | C | I | R/A | I | C | I | A (P0/P1) |
| **Performance Issue** | R/A | I | C | C | I | I | I |
| **Compliance Change** | C | I | I | C | C | A | I |
| **Cost Optimization** | R | A | C | C | I | I | I |
| **Documentation Update** | R | C | C | I | I | I | I |

**Legend**: R = Responsible, A = Accountable, C = Consulted, I = Informed

---

## Cross-Platform Coordination

### Dependency Coordination

When Platform A depends on Platform B:

1. **Change Notification**: Platform B must notify Platform A of breaking changes at least 2 minor versions in advance
2. **Testing**: Platform A must test against Platform B's staging environment before any Platform B release
3. **Rollback**: Platform B must provide rollback path for any breaking change
4. **Monitoring**: Platform A's health check must include dependency health for Platform B

### Cross-Platform Changes

Changes affecting multiple Platforms require:

1. **Joint Design Review**: All affected Engineering Owners review the design
2. **Coordinated Testing**: Integration tests run across all affected Platforms
3. **Staged Rollout**: Deploy to one Platform, verify, then propagate
4. **Rollback Plan**: Each Platform must be independently rollbackable

### Shared Infrastructure

Some capabilities are shared across Platforms:

| Capability | Owner | Consumers |
|---|---|---|
| Queue Service (PgBoss) | ObservabilityPlatform | All Platforms |
| Cache Layer | ObservabilityPlatform | All Platforms |
| Persistence Layer | ObservabilityPlatform | All Platforms |
| Security (encryption, rate limiting) | SecurityPlatform | All Platforms |
| Identity (auth, session) | IdentityPlatform | All Platforms |
| Observability (metrics, logs, traces) | ObservabilityPlatform | All Platforms |

Shared infrastructure changes follow the same coordination process as cross-platform changes.

---

## Architecture Review Board

### Composition

| Role | Responsibility |
|---|---|
| **ARB Chair** | Facilitates reviews, maintains architecture standards |
| **Platform Engineering Owners** (15) | Represent their Platforms |
| **Security Review Board Chair** | Security compliance review |
| **VP Engineering** | Executive sponsor, final escalation |

### Meeting Cadence

| Meeting | Frequency | Purpose |
|---|---|---|
| **Architecture Review** | Weekly | Review new designs, breaking changes, platform extensions |
| **Maturity Review** | Semi-annually | Review maturity assessments, progression requests |
| **Deprecation Review** | On demand | Review deprecation requests, migration plans |
| **Incident Post-Mortem** | After every P0/P1 | Review root cause, action items, prevention |

### Decision Authority

| Decision Type | Authority |
|---|---|
| New Platform creation | ARB + VP Engineering |
| Platform deprecation | ARB + VP Engineering |
| Breaking change approval | ARB |
| Level 3/4 progression | ARB |
| Security exception | Security Review Board |
| Compliance exception | Compliance Review Board |
| SLA change | ARB + VP Engineering |

---

## Deprecation Process

When a Platform (or capability within a Platform) must be deprecated:

### Step 1: Proposal (Week 0)
- Engineering Owner submits deprecation proposal to ARB
- Proposal includes: rationale, impact analysis, affected consumers, migration path, timeline

### Step 2: Review (Week 1)
- ARB reviews proposal
- Affected Platform Owners consulted
- Security and compliance implications assessed

### Step 3: Announcement (Week 2)
- Deprecation notice published to all affected teams
- Migration guide published
- Deprecation timeline confirmed (minimum 3 months for Level 3+ Platforms)

### Step 4: Migration (Weeks 3–12)
- Migration support provided to affected consumers
- Deprecation warnings added to codebase
- Monitoring for remaining consumers

### Step 5: Removal (Week 13+)
- Code removed after migration deadline
- Documentation updated
- Deprecation confirmed with ARB

### Emergency Deprecation
For security-critical deprecations:
- VP Engineering may approve emergency deprecation
- 48-hour migration window minimum
- Post-hoc ARB review within 1 week

---

## Ownership Transfers

When an Engineering Owner leaves or changes teams:

1. **Handoff Period**: Minimum 2 weeks overlap with replacement
2. **Knowledge Transfer**: Architecture walkthrough, code review, incident history
3. **Documentation**: Updated ownership in this document
4. **ARB Notification**: ARB Chair notified of ownership change
5. **On-Call Transition**: On-call rotation updated within 1 week

---

## Amendment History

| Version | Date | Change | Authority |
|---|---|---|---|
| 1.0 | July 2026 | Initial definition | Phase 23.0 |

---

*This document is part of the Perionyx Platform Constitution governance series.*
*Authority: Platform Constitution v1.0*
