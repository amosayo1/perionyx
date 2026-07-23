# Enterprise Bank Account Management (eBAM)

## Architecture

The eBAM platform provides complete governance over enterprise bank accounts, ownership, mandates, KYC, compliance, lifecycle management, and banking relationships. It consumes only Treasury Domain modules (Phase 9B.1) and Banking abstractions (Phase 9A), remaining fully provider-agnostic.

### System Context

```
Treasury Domain (Phase 9B.1)
  └── eBAM Platform (Phase 9B.5)
        ├── Account Registry & Lifecycle
        ├── Bank Relationship Management
        ├── Signatory & Mandate Governance
        ├── KYC & Compliance Center
        ├── Ownership Hierarchy
        ├── Dormancy Management
        ├── Compliance Monitoring
        └── Analytics & Recommendations
```

### Component Hierarchy

```
GlobalBankAccountDashboard
├── ExecutiveBankAccountHeader (14 KPI summary)
├── TreasuryAccountFilters (15-dimension filter)
├── BankAccountOverview (12 KPI cards)
├── EnterpriseAccountRegistry (420 accounts, 16 columns)
├── BankRelationshipCenter (16 banks, relationship cards)
├── AccountLifecycleBoard (10-stage pipeline)
├── AuthorizedSignatoriesGrid (180 signatories)
├── MandateManagementTable (220 mandates)
├── KYCComplianceCenter (90 profiles)
├── OwnershipHierarchy (50+ node tree)
├── DormantAccountPanel (42 dormant accounts)
├── AccountCompliancePanel (90 compliance issues)
├── Analytics Charts (10 chart components)
├── BankAccountRecommendationsPanel (35 recommendations)
├── BankAccountAlertsPanel (45 alerts)
└── ExecutiveBankAccountInsights (10 insights)
```

### Data Flow

1. **Mock data layer** (`data.ts`) provides 420 accounts, 180 signatories, 220 mandates, 350 KYC documents, 90 compliance issues, 35 recommendations, 45 alerts
2. **Client components** consume mock data directly — no API calls, no SDKs, no provider integrations
3. **Filter state** managed locally via `useState`
4. **Tab navigation** switches between 12 views, all rendering instantly

## Key Design Decisions

- **Provider-agnostic**: No banking providers, no SDKs, no external APIs
- **Account masking**: All account numbers displayed as masked (e.g., ****1234) by default
- **Enterprise scale**: 15 entities, 16 banks, 14 currencies, 10 regions, 14 countries
- **Governance focus**: Every component serves CFOs, Treasurers, Controllers, and Compliance Officers
- **Perionyx design**: Dark-only, ~95% charcoal, ~4% white, ~1% gold (#c9a84c)
