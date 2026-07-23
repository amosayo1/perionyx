# Domain Model — EPIP

## Core Entity Types

### Person
A contributor of knowledge. Can be a customer, prospect, design partner, strategic advisor, SME, investor, partner, or team member.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Full name |
| role | string | Job title |
| seniority | PersonSeniority | CFO → Accountant |
| personType | PersonType | Customer → Team Member |
| relationshipStage | RelationshipStage | Identified → Partner |
| financeSpecializations | FinanceSpecialization[] | AP, AR, Treasury, etc. |
| erpExperience | ErpSystem[] | SAP, Odoo, Dynamics, etc. |
| accountingStandards | AccountingStandard[] | IFRS, GAAP, SOCPA |

### Organization
A company or institution. Links to persons for employer tracking.

### Conversation
Any communication with a person. Supports LinkedIn, WhatsApp, Email, Zoom, Teams, in-person, conferences, and support tickets.

### ResearchSession
A structured research activity. Supports discovery calls, customer interviews, meetings, conferences, and usability tests.

### Contribution
A person's contribution of knowledge. Types: problem identification, solution suggestion, feature request, workflow insight, pain point, improvement idea, validation, use case, integration idea.

### Evidence
Structured proof of a problem. Captures current workflow, workaround, business impact, frequency, severity, and suggested improvement. Links to all supporting persons, organizations, industries, countries, and ERP systems.

### Problem
A validated business problem. Links to evidence and contributions that support it.

### FeatureRequest
A requested product feature. Tracks who requested, validated, and rejected it. Links to evidence, modules, and roadmap items.

### Workflow
A business workflow. Captures steps, systems, pain points, and improvements.

### WorkflowPainPoint
A specific pain point within a workflow. Tracks severity, frequency, and automation potential.

### WorkflowImprovement
A suggested improvement for a pain point. Tracks effort, impact, and implementation status.

### BusinessImpact
The quantified business value of solving a problem or building a feature. Tracks annual savings, revenue impact, efficiency gains, and risk reduction.

### Recommendation
A recommended action. Prioritized by effort vs impact. Links to evidence and contributions.

### RoadmapItem
A scheduled or proposed roadmap entry. Tracks priority (P0-P3), status, release version, dependencies, and blockers.

### Validation
A validation record for a feature request. Tracks who validated it, the outcome, and conditions.

### AdvisoryProfile
A person's role in the Perionyx advisory network. Tracks engagement, contribution, and expertise scores.

## Type Constraints

All constrained string fields use union types for type safety:

- **Industry**: agriculture, construction, education, energy, financial-services, healthcare, hospitality, logistics, manufacturing, pharmaceuticals, real-estate, retail, technology, telecommunications, transportation
- **Country**: saudi-arabia, uae, egypt, usa, uk, germany
- **FinanceSpecialization**: accounts-payable, accounts-receivable, cost-accounting, financial-analysis, financial-reporting, fpna, general-ledger, inventory-accounting, payroll, procurement, reconciliation, tax-compliance, treasury, vat, zatca, audit, compliance, risk
- **ErpSystem**: sap, odoo, microsoft-dynamics, oracle, oracle-netsuite, daftra, aryyaf, tally, quickbooks, xero, sage, zoho
- **EvidenceLevel**: anecdotal, single-source, multiple-sources, validated, statistically-significant
- **Confidence**: very-low, low, medium, high, very-high
- **ImplementationStatus**: not-started, in-discovery, in-design, in-development, in-testing, shipped, deferred, rejected
