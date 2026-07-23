# Jurisdictions

## Overview

The jurisdiction model provides a hierarchical representation of tax authorities worldwide. It supports multi-level nesting (country → state → region → city), tax authority registration details, tax number management, and historical rule tracking across all active jurisdictions.

## Jurisdiction Hierarchy

```
Country (e.g., "US", "GB", "DE", "AE")
  ├── State / Province / Emirate
  │   ├── County / Department
  │   │   ├── City / Municipality
  │   │   │   └── Special District (school, transport, etc.)
  │   │   └── ...
  │   └── ...
  └── ...
```

### Hierarchy Model

```typescript
interface Jurisdiction {
  id: string;
  code: string;                    // ISO country code or state/region code
  name: string;
  level: "country" | "state" | "region" | "city" | "district";
  parentId: string | null;
  currency: string;                // Default currency
  timezone: string;                // IANA timezone
  taxYearStart: string;            // MM-DD format
  filingFrequency: FilingFrequency;
  defaultLanguage: string;
  active: boolean;
  effectiveFrom: string;           // ISO date
  effectiveTo: string | null;      // ISO date, null = currently active
  createdAt: string;
  updatedAt: string;
}

type FilingFrequency = "monthly" | "quarterly" | "semi-annual" | "annual";
```

## Tax Authority Registry

Each jurisdiction has one or more tax authorities responsible for tax collection and enforcement:

```typescript
interface TaxAuthority {
  id: string;
  jurisdictionId: string;
  name: string;                    // e.g., "IRS", "HMRC", "Finanzamt"
  type: "federal" | "state" | "local" | "customs";
  taxTypes: TaxType[];             // Tax types administered
  addresses: Address[];
  contactInfo: ContactInfo;
  registrationUrl: string;         // Portal URL
  filingPortalUrl: string;
  paymentInstructions: PaymentInstruction[];
  active: boolean;
}
```

### Authority Coverage by Tax Type

| Tax Type | Typical Authority Level |
|----------|------------------------|
| Corporate Income Tax | Federal / National |
| VAT / GST | Federal / National |
| Sales Tax | State / Provincial |
| Withholding Tax | Federal |
| Property Tax | Local / Municipal |
| Payroll Tax | State / Federal |
| Customs Duty | Federal / Customs Union |
| Excise Tax | Federal |

## Tax Number Management

```typescript
interface TaxNumber {
  id: string;
  jurisdictionId: string;
  entityId: string;                // Legal entity this number belongs to
  taxType: TaxType;
  number: string;                  // e.g., "GB123456789", "DE123456789"
  type: TaxNumberType;
  status: "active" | "suspended" | "cancelled";
  issuedDate: string;
  validFrom: string;
  validTo: string | null;
  registrationOffice: string;
  verifiedDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

type TaxNumberType =
  | "vat"           // VAT registration number
  | "ein"           // Employer Identification Number
  | "tin"           // Tax Identification Number
  | "uin"           // Unique Identification Number
  | "pan"           // Permanent Account Number
  | "gstin"         // GST Identification Number
  | "trn"           // Tax Registration Number
  | "cuit"          // CUIT (Argentina)
  | "cnpj"          // CNPJ (Brazil)
  | "other";
```

### Tax Number Validation Rules

| Rule | Description |
|------|-------------|
| Format validation | Jurisdiction-specific format check (e.g., GB VAT: 9 digits, DE VAT: 9 digits) |
| Checksum validation | Mod-97, Mod-11, or jurisdiction-specific checksum |
| Validity period | Must be within issued-to-expiry date range |
| Status check | Must be "active" for transactions |
| Entity match | Must belong to the correct legal entity |
| Jurisdiction match | Must be registered in the jurisdiction where tax is due |

## Effective Dating

All jurisdiction and rule changes are effective-dated:

```typescript
interface EffectiveDated {
  effectiveFrom: string;   // Inclusive start date
  effectiveTo: string | null;  // Inclusive end date, null = open-ended
}
```

Changes to jurisdictions, tax rates, and rules create new versions rather than modifying existing records. The resolution engine always queries by effective date:

```
Query: Get tax rate for Jurisdiction X, Tax Type Y on Date Z
  → Return rule where effectiveFrom ≤ Z ≤ effectiveTo
  → If multiple, return the most recently created
```

## Historical Rule Tracking

Every change to jurisdiction structure, tax rate, exemption, or rule is preserved:

| Event | What Is Stored |
|-------|----------------|
| Jurisdiction added | Full jurisdiction record with effective date |
| Tax rate change | Old rate archived, new rate created with new effective date |
| Authority change | Authority record versioned |
| Tax number change | Previous tax number marked inactive, new one created |
| Jurisdiction split | Old jurisdiction effective-to set; new jurisdictions created |

## Multi-Jurisdiction Scenarios

### Cross-Border Transactions

For transactions spanning multiple jurisdictions, the engine:

1. Determines the **supply jurisdiction** (where the supply is deemed to occur)
2. Determines the **customer jurisdiction** (where the customer is established)
3. Applies **place of supply rules** per jurisdiction tax law
4. Determines if **reverse charge** applies
5. Resolves **treaty rates** for withholding tax

### Permanent Establishments

```typescript
interface PermanentEstablishment {
  id: string;
  entityId: string;
  jurisdictionId: string;
  establishmentDate: string;
  activities: string[];
  taxNumber: TaxNumber | null;
  status: "active" | "closed";
}
```

PE tracking enables:
- Apportionment of taxable income across jurisdictions
- Separate VAT registration requirements
- Withholding tax obligations on payments to/from PE
- Transfer pricing compliance for PE transactions

### Jurisdiction Exposure Analysis

```typescript
interface JurisdictionExposure {
  jurisdictionId: string;
  jurisdictionName: string;
  revenueAmount: number;           // Revenue attributed to jurisdiction
  taxAmount: number;               // Tax payable in jurisdiction
  effectiveTaxRate: number;        // Tax / Revenue
  complianceScore: number;         // 0-100 compliance score
  riskLevel: "low" | "medium" | "high" | "critical";
  pendingReturns: number;
  overduePayments: number;
  openAudits: number;
}
```

The jurisdiction exposure analysis is a core data product for the executive dashboard and compliance heat map, enabling CFOs and Tax Directors to identify high-risk jurisdictions at a glance.
