# Compliance Module Architecture

## Overview
The Enterprise Compliance Management module provides a comprehensive framework for managing regulatory compliance across multiple frameworks (SOX, GDPR, PCI-DSS, ISO 27001, Basel III, etc.).

## Layer Architecture

### Server Layer (`src/server/compliance/`)
- **Types** (`types/index.ts`): 15+ interfaces and 8+ type aliases covering the full compliance domain
- **Domain Services** (`domain/*/`): 9 domain service classes, each with Map-backed CRUD operations and query methods
- **Facade** (`services/compliance-service.ts`): `ComplianceService` composes all 9 domain services
- **Seed** (`compliance-seed.ts`): Deterministic seed data (5 frameworks, 20 obligations, 10 policies, etc.)

### Domain Model
```
RegulatoryFramework (1) ──→ (N) Obligation
RegulatoryFramework (1) ──→ (N) ComplianceAudit
CompliancePolicy   (1) ──→ (N) Control
Control            (1) ──→ (N) ControlTest
ComplianceAudit    (1) ──→ (N) Remediation
ControlTest        (1) ──→ (N) Remediation
```

### UI Layer (`src/components/compliance/`)
15 "use client" components following the dark theme MetricCard pattern established in the Tax module.

### Pages (`src/app/(shell)/compliance/`)
11 server component pages, each composing one or more client components.

## Design Principles
- **Clarity**: Each component answers one question; no visual noise
- **Confidence**: Status badges, color-coded severity indicators, progress bars
- **Speed**: All data is pre-fetched in server components; client components are pure renders
- **Trust**: Every metric has traceable source; all states are explained
