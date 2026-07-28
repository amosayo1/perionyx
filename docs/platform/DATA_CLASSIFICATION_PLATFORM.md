# Data Classification Platform

**Phase**: 24.0
**Status**: Complete
**Law Compliance**: Law 13 (Data Classification)

## Purpose

Centralized data classification, masking, access control, and audit for all data in the platform.

## Architecture

```
src/server/foundation/classification/
├── types.ts          — ClassificationLevel (11 levels), policy types
├── registry.ts       — ClassificationRegistry singleton
├── validation.ts     — Classification validation
└── index.ts          — Barrel export
```

## Classification Levels

| Level | Name | Sensitivity | Example |
|-------|------|-------------|---------|
| PUBLIC | Public | 0 | Marketing pages |
| INTERNAL | Internal | 1 | Feature flags, configs |
| CONFIDENTIAL | Confidential | 2 | Business data, contacts |
| RESTRICTED | Restricted | 3 | Financial records, invoices |
| HIGHLY_RESTRICTED | Highly Restricted | 4 | Payment data, bank accounts |
| PII | Personally Identifiable | 5 | Names, emails, SSN |
| PHI | Protected Health | 6 | Health records |
| PCI | Payment Card | 7 | Card numbers, CVV |
| SECRET | Secret | 8 | API keys, tokens, passwords |
| TOP_SECRET | Top Secret | 9 | Master encryption keys |

## Key Capabilities

1. **Field-level classification** — Every data field has a classification level
2. **Access control** — Check if a user/role can access data at a given level
3. **Masking** — Automatic masking of sensitive fields (last-4, hash, redact)
4. **Audit** — Every classification access is logged
5. **Policy registry** — Centralized policies for masking, encryption, retention

## Usage

```typescript
import { ClassificationRegistry } from "@/server/foundation/classification";

const registry = ClassificationRegistry.getInstance();

// Register a field classification
registry.registerField({
  field: "ProcurementVendorInvoice.bankAccountNumber",
  level: ClassificationLevel.HIGHLY_RESTRICTED,
  masking: MaskingType.LAST_4,
});

// Check access
const canAccess = registry.checkAccess(ClassificationLevel.RESTRICTED, ["FINANCE"]);

// Mask a value
const masked = registry.maskValue("1234567890", MaskingType.LAST_4);
// Returns "******7890"
```

## Default Policies

10 default policies registered on initialization:

1. `payment-data` — PCI level, encrypt + mask, 7-year retention
2. `bank-account` — Highly Restricted, mask last-4, 7-year retention
3. `ssn` — PCI, mask last-4, encrypted, 7-year retention
4. `email` — PII, mask domain, 3-year retention
5. `phone` — PII, mask last-4, 3-year retention
6. `address` — Confidential, no masking, 3-year retention
7. `financial-record` — Restricted, no masking, 7-year retention
8. `api-key` — Secret, full redact, rotate-90d
9. `auth-token` — Secret, full redact, rotate-30d
10. `config-value` — Internal, no masking, no retention
