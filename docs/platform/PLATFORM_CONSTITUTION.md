# Perionyx Platform Constitution

**Version**: 1.0
**Ratified**: July 2026
**Authority**: Highest engineering authority for all Perionyx code
**Scope**: Every platform, integration, module, deployment, and future capability

---

## Preamble

Perionyx has evolved beyond a financial application.

It is now an **Enterprise Financial Operating System** — a platform that hosts financial domains, integrates with external providers, orchestrates workflows, and serves CFOs, Treasurers, Controllers, Finance Managers, and Auditors across every financial operation.

This Constitution defines the engineering laws that every future line of code must obey.

---

## First Principle

> **Platforms outlive products.**
> **Architecture outlives implementations.**
> **Constitutions outlive architectures.**

Every future implementation must inherit from this Constitution.
Nothing may contradict it.

---

## Constitutional Authority

This document is the **highest engineering authority** in Perionyx.

| Authority Level | Document | Scope |
|---|---|---|
| **Constitutional** | This document | Permanent laws, cannot be overridden |
| **Architectural** | Platform architecture docs | Design decisions, can be amended with review |
| **Implementation** | Module docs, ADRs | Code decisions, can be superseded |

No implementation may contradict an architectural decision.
No architectural decision may contradict this Constitution.

---

## Architectural Laws

These are permanent, immutable laws. No code may violate them.

### Law 1: Business Domains Never Import Provider SDKs

Business logic (ledger, treasury, AP, AR, compliance) must never directly import SDKs from Plaid, QuickBooks, SAP, NetSuite, or any external provider. All external communication flows through Platform capability contracts.

**Rationale**: Provider SDKs change without notice. Business logic must be provider-agnostic. Replaceability requires isolation.

### Law 2: Vendor Terminology Never Enters the Domain Model

The domain model uses Perionyx's own canonical financial language (see `CANONICAL_FINANCIAL_MODEL.md`). External provider terminology (Plaid accounts, QuickBooks vendors, SAP business partners) is translated at the Provider Driver boundary, never propagated into the domain.

**Rationale**: Vendor terminology locks you to a vendor. Canonical terminology keeps the domain portable.

### Law 3: Every Platform Exposes Capability Contracts

Every Platform publishes a stable, versioned interface (see `CAPABILITY_CONTRACTS.md`). Business domains depend ONLY on these contracts, never on internal implementation details.

**Rationale**: Contracts are the API of the platform. They enable independent evolution.

### Law 4: Provider Drivers Are Replaceable

Provider drivers are thin adapters that translate between Provider SDKs and Platform capability contracts. They contain authentication, retries, pagination, rate limiting, error translation, and telemetry. They contain zero business logic. They can be replaced without affecting any business domain.

**Rationale**: Providers fail, change pricing, deprecate APIs. Replaceability is a survival trait.

### Law 5: Every External Dependency Is Observable

Every call to an external provider, every database query, every queue operation, and every cache access must be instrumented with metrics, structured logs, and distributed traces. Unobservable dependencies are unmanageable.

**Rationale**: You cannot fix what you cannot see.

### Law 6: Financial Integrity Is Never Compromised

All monetary calculations use `Decimal(38,12)` precision. All financial operations are idempotent. All state transitions are auditable. All approvals are non-repudiable. No exceptions.

**Rationale**: Financial systems lose trust when numbers are wrong. Precision is non-negotiable.

### Law 7: Architecture Is Governed Through Automation

Design rules are enforced through tooling (ESLint, CI pipelines, automated audits), not documentation alone. If a rule can be automated, it must be.

**Rationale**: Documentation decays. Tooling enforces.

### Law 8: Every Platform Is Measurable

Every Platform must emit metrics that answer: Is it healthy? Is it fast? Is it used? Is it secure? Is it cost-effective? If you cannot measure it, you cannot manage it.

### Law 9: Every Platform Is Testable

Every Platform must have unit tests, integration tests, contract tests, and failure mode tests. Coverage thresholds are enforced. Untested code is untrusted code.

### Law 10: Every Platform Is Replaceable

No Platform is permanent. Every capability contract can be fulfilled by a different implementation. No business domain is coupled to a specific Platform implementation beyond its contract.

### Law 11: Tenant Isolation Is Absolute

Every data access, every API call, every background job must be scoped to a tenant. Cross-tenant access is never permitted. Tenant context flows through every layer.

### Law 12: Zero Trust Is the Default

Every request is authenticated. Every action is authorized. Every access is logged. Trust is never assumed — it is verified.

### Law 13: Data Classification Governs Handling

Every piece of data has a classification level (Public, Internal, Confidential, Restricted, Regulated). Handling rules (encryption, access control, retention, deletion) are determined by classification, not by convenience.

### Law 14: Events Are Vendor-Neutral

No vendor webhook leaves the Integration Platform directly. Every external event is normalized into canonical Perionyx events before propagating. Business domains consume only canonical events.

### Law 15: The Constitution Evolves Through Process

Amendments to this Constitution require: (1) documented rationale, (2) impact analysis on existing code, (3) migration plan for violations, (4) unanimous engineering review. Emergency amendments require post-hoc ratification within 48 hours.

---

## Platform Registry

Perionyx is composed of Platforms. Each Platform is a bounded capability with a stable contract.

| Platform | Contract | Status |
|---|---|---|
| [IntegrationPlatform](INTEGRATION_PLATFORM.md) | `IntegrationContract` | Partially built |
| [BankingPlatform](BANKING_PLATFORM.md) | `BankingContract` | Partially built |
| [ERPPlatform](ERP_PLATFORM.md) | `ERPContract` | Scaffolded |
| [PaymentsPlatform](PAYMENTS_PLATFORM.md) | `PaymentsContract` | Not started |
| [IdentityPlatform](IDENTITY_PLATFORM.md) | `IdentityContract` | Partially built |
| [NotificationPlatform](NOTIFICATION_PLATFORM.md) | `NotificationContract` | Partially built |
| [DocumentPlatform](DOCUMENT_PLATFORM.md) | `DocumentContract` | Not started |
| [AIPlatform](AI_PLATFORM.md) | `AIContract` | Partially built |
| [WorkflowPlatform](WORKFLOW_PLATFORM.md) | `WorkflowContract` | Partially built |
| [AuditPlatform](AUDIT_PLATFORM.md) | `AuditContract` | Partially built |
| [ObservabilityPlatform](OBSERVABILITY_PLATFORM.md) | `ObservabilityContract` | Partially built |
| [SearchPlatform](SEARCH_PLATFORM.md) | `SearchContract` | Partially built |
| [StoragePlatform](STORAGE_PLATFORM.md) | `StorageContract` | Not started |
| [SecurityPlatform](SECURITY_PLATFORM.md) | `SecurityContract` | Partially built |
| [DeveloperPlatform](DEVELOPER_PLATFORM.md) | `DeveloperContract` | Not started |

---

## Cross-Cutting Architecture

| Document | Scope |
|---|---|
| [EnterprisePlatformArchitecture](ENTERPRISE_PLATFORM_ARCHITECTURE.md) | System-wide architecture |
| [PlatformCapabilities](PLATFORM_CAPABILITIES.md) | All capabilities in one view |
| [CanonicalFinancialModel](CANONICAL_FINANCIAL_MODEL.md) | Perionyx financial language |
| [ProviderDriverModel](PROVIDER_DRIVER_MODEL.md) | How providers integrate |
| [DeploymentArchitecture](DEPLOYMENT_ARCHITECTURE.md) | SaaS, private cloud, on-prem |
| [MultiTenancyModel](MULTI_TENANCY_MODEL.md) | Tenant isolation architecture |
| [EventArchitecture](EVENT_ARCHITECTURE.md) | Canonical event system |
| [ErrorArchitecture](ERROR_ARCHITECTURE.md) | Error handling standards |
| [DataArchitecture](DATA_ARCHITECTURE.md) | Data lifecycle, retention, classification |

---

## Governance

| Document | Scope |
|---|---|
| [PlatformMaturityModel](PLATFORM_MATURITY_MODEL.md) | Maturity levels (0-4) |
| [PlatformOwnershipMatrix](PLATFORM_OWNERSHIP_MATRIX.md) | Who owns what |
| [PlatformExtensionGuide](PLATFORM_EXTENSION_GUIDE.md) | How to add new capabilities |
| [ProviderCertificationGuide](PROVIDER_CERTIFICATION_GUIDE.md) | How to certify a provider |
| [EnterpriseReadinessChecklist](ENTERPRISE_READINESS_CHECKLIST.md) | Production readiness |
| [EDP_23_0](EDP_23_0.md) | Engineering decision packet |

---

## Amendment History

| Version | Date | Change | Authority |
|---|---|---|---|
| 1.0 | July 2026 | Initial ratification — 15 Laws, 15 Platforms, governance | Phase 23.0 |
| 1.1 | 2026-07-24 | Validation — corrected maturity levels, added 9 validation docs, debt register | Phase 23.1 |

---

## Validation

Conducted in Phase 23.1. Results:

| Dimension | Score |
|---|---|
| Constitutional Compliance (15 Laws) | 7.0 / 10 |
| Platform Maturity (15 Platforms) | 3.5 / 10 |
| AP Reference Implementation | 7.4 / 10 (CONDITIONAL) |
| Overall Platform Score | 6.4 / 10 |

**Verdict**: Constitution is architecturally sound. 7 Laws PASS, 7 PARTIAL, 1 FAIL (Law 13: Data Classification). 17 debt items registered. See `PLATFORM_CONSTITUTION_VALIDATION.md` for full evidence.

---

*The Perionyx Platform Constitution is the highest engineering authority.*
*Every implementation must conform to it.*
