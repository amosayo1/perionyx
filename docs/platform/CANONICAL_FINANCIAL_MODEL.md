# Canonical Financial Model

**Document**: 3 of 3 — Platform Constitution Architecture Series
**Authority**: Platform Constitution (highest engineering authority)
**Version**: 1.0
**Ratified**: July 2026

---

## Preamble

Perionyx owns its financial vocabulary.

External provider terminology (Plaid accounts, QuickBooks vendors, SAP business partners, NetSuite entities) is translated at the Provider Driver boundary — never propagated into the domain model.

This document defines the **canonical financial language** that all business domains consume. Every Platform, every module, every API, and every database model uses these terms. External provider terms are aliases that map to this canonical model, never the reverse.

**Constitutional Authority**: Law 2 — Vendor Terminology Never Enters the Domain Model.

---

## 1. Core Entities

### 1.1 Company

**Purpose**: The legal entity and multi-tenant root. Every piece of data belongs to a Company.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `name` | `String` | Display name |
| `slug` | `String` (unique) | URL-safe identifier |
| `sandbox` | `Boolean` | Whether this is a sandbox environment |
| `legalName` | `String?` | Legal entity name |
| `ein` | `String?` | Employer Identification Number |
| `jurisdiction` | `String?` | Legal jurisdiction |
| `entityType` | `String?` | LLC, Corporation, etc. |
| `incorporationDate` | `DateTime?` | Date of incorporation |
| `address` | `String?` | Registered address |
| `verificationStatus` | `String` | UNVERIFIED → VERIFIED |
| `industry` | `String?` | Industry classification |
| `baseCurrency` | `String?` | Default currency (ISO 4217) |
| `fiscalYearStart` | `String?` | Fiscal year start month |
| `timezone` | `String?` | Default timezone |

**Relationships**:
- Has many `CompanyMembership` (users)
- Has many `Wallet` (treasury accounts)
- Has many `Transaction` (financial events)
- Has many `LedgerEntry` (accounting records)
- Has many `AuditLog` (audit trail)
- Has many `Role` (authorization roles)
- Has many `ConnectorConfig` (external integrations)
- Has many `Policy` (governance policies)
- Has many `WorkflowDefinition` (automated processes)
- Has many `GLAccount` (chart of accounts)
- Has many `ProcurementVendor` (AP vendors)
- Has many `IntegrationInstance` (platform integrations)
- Has many `AgentDefinition` (AI agents)

**Lifecycle**: Created during onboarding → Verified (KYC) → Active → Suspended → Deactivated

**Prisma Model**: `Company` (line 128, `prisma/schema.prisma`)

---

### 1.2 BusinessUnit

**Purpose**: Organizational subdivision within a company (subsidiary, department, branch, cost center).

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Parent company |
| `parentId` | `String?` | Parent unit (hierarchy) |
| `type` | `OrganizationUnitType` | SUBSIDIARY, LEGAL_ENTITY, BUSINESS_UNIT, DEPARTMENT, BRANCH, COST_CENTER |
| `name` | `String` | Display name |
| `code` | `String?` | Short code |
| `currency` | `String?` | Unit-specific currency |
| `country` | `String?` | Country code |
| `isActive` | `Boolean` | Active status |

**Relationships**:
- Belongs to `Company`
- Has parent/children `OrganizationUnit` (hierarchy)

**Lifecycle**: Created → Active → Inactive → Dissolved

**Prisma Model**: `OrganizationUnit` (line 551, `prisma/schema.prisma`)

---

### 1.3 User

**Purpose**: An authenticated person with roles, permissions, and multi-tenant memberships.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `email` | `String?` (unique) | Email address |
| `name` | `String?` | Display name |
| `passwordHash` | `String?` | Bcrypt hash (credentials sign-in) |
| `failedLoginAttempts` | `Int` | Consecutive failed logins |
| `lockedUntil` | `DateTime?` | Account lockout expiry |
| `tokenVersion` | `Int` | Session version (increment to invalidate) |
| `mfaEnabled` | `Boolean` | Whether MFA is enabled |
| `mfaSecret` | `String?` | TOTP secret (hashed) |
| `mfaRecoveryCodes` | `String?` | JSON array of hashed recovery codes |
| `mfaEnrolledAt` | `DateTime?` | MFA enrollment timestamp |
| `mfaLastVerifiedAt` | `DateTime?` | Last MFA verification |
| `mfaRequired` | `Boolean` | Org-level MFA enforcement |

**Relationships**:
- Has many `CompanyMembership` (multi-tenant)
- Has many `Account` (OAuth providers)
- Has many `Session` (active sessions)
- Has many `Authenticator` (WebAuthn/FIDO2)
- Has many `UserRole` (role assignments)
- Has many `AuditLog` (as actor)
- Has many `Transaction` (as creator)
- Has many `NotificationPreference` (channel preferences)

**Lifecycle**: Created (provisioned) → Active → Locked (failed attempts) → Deactivated

**Prisma Model**: `User` (line 15, `prisma/schema.prisma`)

---

### 1.4 Role

**Purpose**: A named collection of permissions that can be assigned to users within a company.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Company scope |
| `name` | `String` | Role name (OWNER, ADMIN, MANAGER, VIEWER, etc.) |
| `description` | `String?` | Role description |

**Built-in Roles** (from `CompanyRole` enum):
| Role | Description |
|---|---|
| `OWNER` | Full access, company settings, billing |
| `ADMIN` | Administrative access, user management |
| `TREASURER` | Treasury operations, payments, transfers |
| `MEMBER` | Standard operational access |
| `VIEWER` | Read-only access |

**Relationships**:
- Belongs to `Company`
- Has many `UserRole` (assignments)

**Prisma Model**: `Role` + `CompanyRole` enum (line 534, `prisma/schema.prisma`)

---

### 1.5 Permission

**Purpose**: An atomic capability that can be granted or denied. Permissions are the building blocks of authorization.

**Key Attributes** (from `src/server/iam/permissions.ts`):
| Attribute | Type | Description |
|---|---|---|
| `name` | `GranularPermission` | Dot-notation permission identifier |
| `category` | `PermissionCategory` | Functional area |
| `description` | `String` | Human-readable description |
| `scopes` | `String[]` | Applicable scopes (global, company, resource) |
| `requiresMfa` | `Boolean` | Whether MFA is required |

**Permission Format**: `{domain}.{resource}.{action}`

**Examples**:
| Permission | Category | MFA Required |
|---|---|---|
| `ap.invoices.create` | AP | No |
| `ap.payments.approve` | AP | Yes |
| `treasury.transfer` | Treasury | Yes |
| `gl.journals.create` | GL | No |
| `workflow.execute` | Workflow | Yes |
| `admin.users.manage` | Admin | Yes |
| `ai.agents.manage` | AI | Yes |

**Permission Categories** (10):
| Category | Count | Scope |
|---|---|---|
| `workflow` | 8 | Workflow lifecycle |
| `treasury` | 6 | Cash and transfers |
| `approval` | 4 | Approval actions |
| `admin` | 8 | Administration |
| `ap` | 6 | Accounts payable |
| `ar` | 4 | Accounts receivable |
| `gl` | 4 | General ledger |
| `ai` | 4 | AI capabilities |
| `connector` | 4 | Integration management |
| `system` | 4 | System operations |

**Total**: 64 granular permissions

**Prisma Models**: `Role`, `UserRole`, `GranularPermission` (IAM types)

---

## 2. Financial Entities

### 2.1 Vendor

**Purpose**: An external party providing goods or services to the company. The central entity in Accounts Payable.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `name` | `String` | Vendor display name |
| `legalName` | `String?` | Legal entity name |
| `vendorCode` | `String?` | Internal vendor code |
| `taxId` | `String?` | Tax identification number |
| `status` | `VendorStatus` | ACTIVE, INACTIVE, BLOCKED, PENDING_REVIEW |
| `paymentTerms` | `String?` | NET_30, NET_60, etc. |
| `currency` | `String?` | Default payment currency |
| `category` | `String?` | Vendor category |
| `riskRating` | `String?` | LOW, MEDIUM, HIGH, CRITICAL |
| `creditLimit` | `Decimal?` | Credit limit |
| `creditUsed` | `Decimal?` | Current credit usage |

**Relationships**:
- Belongs to `Company`
- Has many `ProcurementVendorInvoice`
- Has many `ProcurementVendorBankDetail`
- Has many `ProcurementVendorPerformance`
- Has many `ProcurementVendorDocument`
- Has many `ProcurementVendorCredit`

**Lifecycle**: Created (onboarding) → Pending Review → Active → Suspended → Blocked → Deactivated

**Prisma Model**: `ProcurementVendor` (line 504, `prisma/schema.prisma`)

---

### 2.2 Customer

**Purpose**: An external party purchasing goods or services from the company. The central entity in Accounts Receivable.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `name` | `String` | Customer display name |
| `legalName` | `String?` | Legal entity name |
| `customerCode` | `String?` | Internal customer code |
| `taxId` | `String?` | Tax identification number |
| `status` | `String` | ACTIVE, INACTIVE, CREDIT_HOLD |
| `creditLimit` | `Decimal?` | Credit limit |
| `paymentTerms` | `String?` | Payment terms |

**Relationships**:
- Belongs to `Company`
- Has many `AccountingCustomer`

**Prisma Model**: `AccountingCustomer` (line 212, `prisma/schema.prisma`)

---

### 2.3 Invoice

**Purpose**: A request for payment (AP) or a bill for goods/services (AR). The central transactional entity in both AP and AR.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `vendorId` | `String?` | AP: vendor reference |
| `customerId` | `String?` | AR: customer reference |
| `invoiceNumber` | `String` | Unique invoice number |
| `invoiceDate` | `DateTime` | Invoice date |
| `dueDate` | `DateTime` | Payment due date |
| `status` | `InvoiceStatus` | DRAFT, PENDING_VALIDATION, PENDING_MATCH, MATCHED, PENDING_APPROVAL, APPROVED, REJECTED, PAID, VOIDED |
| `subtotal` | `Decimal(38,12)` | Pre-tax amount |
| `taxAmount` | `Decimal(38,12)` | Tax amount |
| `total` | `Decimal(38,12)` | Total amount |
| `currency` | `String` | ISO 4217 currency code |
| `paymentTerms` | `String?` | Payment terms |
| `reference` | `String?` | External reference number |
| `poNumber` | `String?` | Purchase order reference |

**Relationships**:
- Belongs to `Company`
- AP: Belongs to `ProcurementVendor`
- AR: Belongs to `AccountingCustomer`
- Has many `ProcurementInvoiceLineItem`
- Has many `ProcurementThreeWayMatch`
- Has many `ProcurementApprovalRecord`
- Has many `ProcurementPaymentRecord`
- Has many `ProcurementInvoiceException`

**Lifecycle (AP)**:
```
DRAFT → PENDING_VALIDATION → PENDING_MATCH → MATCHED → PENDING_APPROVAL → APPROVED → PAID
                                  ↓                        ↓
                            MATCH_FAILED              REJECTED
                                  ↓
                          PENDING_REVIEW
```

**Lifecycle (AR)**:
```
DRAFT → SENT → VIEWED → PARTIAL_PAID → PAID → OVERDUE → WRITTEN_OFF
```

**Prisma Models**: `ProcurementVendorInvoice` (line 514), `AccountingInvoice` (line 213)

---

### 2.4 CreditMemo

**Purpose**: An adjustment to an invoice — reduces the amount owed or owed to the company.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `vendorId` | `String?` | AP: vendor reference |
| `invoiceId` | `String?` | Related invoice |
| `creditNumber` | `String` | Unique credit memo number |
| `amount` | `Decimal(38,12)` | Credit amount |
| `currency` | `String` | ISO 4217 |
| `status` | `String` | PENDING, APPLIED, VOIDED |
| `reason` | `String?` | Credit reason |

**Relationships**:
- Belongs to `Company`
- AP: Belongs to `ProcurementVendor`
- Applied against `ProcurementVendorInvoice`

**Lifecycle**: Created → Pending → Applied → Voided

**Prisma Model**: `ProcurementVendorCredit` (line 508)

---

### 2.5 PurchaseOrder

**Purpose**: A commitment to purchase goods or services from a vendor. References only — the canonical entity is the PO Reference.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `vendorId` | `String` | Vendor reference |
| `poNumber` | `String` | PO number |
| `status` | `String` | DRAFT, SUBMITTED, APPROVED, RECEIVED, CLOSED, CANCELLED |
| `total` | `Decimal(38,12)` | Total committed amount |
| `currency` | `String` | ISO 4217 |

**Relationships**:
- Belongs to `Company`
- Belongs to `ProcurementVendor`
- Has many `ProcurementPOReferenceLineItem`
- Referenced by `ProcurementThreeWayMatch`

**Prisma Model**: `ProcurementPOReference` (line 509)

---

### 2.6 Payment

**Purpose**: A transfer of funds — either outgoing (AP payment to vendor) or incoming (AR receipt from customer).

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `paymentNumber` | `String` | Unique payment number |
| `amount` | `Decimal(38,12)` | Payment amount |
| `currency` | `String` | ISO 4217 |
| `status` | `PaymentStatus` | PROPOSED, PENDING_APPROVAL, APPROVED, PROCESSING, COMPLETED, FAILED, VOIDED |
| `paymentMethod` | `PaymentMethod` | ACH, WIRE, CHECK, EFT, CARD |
| `bankAccountId` | `String?` | Source/target bank account |
| `payee` | `String?` | Payment recipient |
| `reference` | `String?` | External reference |

**Relationships**:
- Belongs to `Company`
- AP: Linked to `ProcurementVendorInvoice`
- AR: Linked to `AccountingCustomer`
- May belong to `ProcurementPaymentBatch`

**Lifecycle (AP Payment)**:
```
PROPOSED → PENDING_APPROVAL → APPROVED → PROCESSING → COMPLETED
                                  ↓            ↓
                              REJECTED     FAILED → RETRY → PROCESSING
```

**Prisma Models**: `ProcurementPaymentRecord` (line 524), `SettlementRecord`

---

### 2.7 PaymentBatch

**Purpose**: A group of payments processed together for efficiency. Enables batch approval and execution.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `batchNumber` | `String` | Unique batch number |
| `status` | `String` | DRAFT, SUBMITTED, APPROVED, PROCESSING, COMPLETED, PARTIAL |
| `totalAmount` | `Decimal(38,12)` | Sum of all payments |
| `paymentCount` | `Int` | Number of payments in batch |
| `paymentMethod` | `PaymentMethod` | Batch payment method |

**Relationships**:
- Belongs to `Company`
- Has many `ProcurementPaymentProposalItem`
- Has many `ProcurementPaymentRecord`

**Lifecycle**: Draft → Submitted → Approved → Processing → Completed (or Partial)

**Prisma Model**: `ProcurementPaymentBatch` (line 523)

---

## 3. Accounting Entities

### 3.1 Journal

**Purpose**: A collection of related journal entries. Journals group entries that belong to the same transaction or adjustment.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `journalNumber` | `String` | Unique journal number |
| `description` | `String` | Journal description |
| `status` | `String` | DRAFT, POSTED, REVERSED |
| `postingDate` | `DateTime` | Date posted to GL |
| `source` | `String?` | Originating system |

**Relationships**:
- Belongs to `Company`
- Has many `GLJournalEntry`

**Prisma Model**: `GLJournal` (line 255, `prisma/schema.prisma`)

---

### 3.2 JournalEntry

**Purpose**: A debit/credit pair recording a financial transaction. The atomic unit of double-entry accounting.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `journalId` | `String` | Parent journal |
| `accountId` | `String` | Target GL account |
| `debit` | `Decimal(38,12)` | Debit amount |
| `credit` | `Decimal(38,12)` | Credit amount |
| `description` | `String?` | Entry description |
| `costCenterId` | `String?` | Cost center allocation |
| `profitCenterId` | `String?` | Profit center allocation |

**Invariants**:
- `debit > 0 XOR credit > 0` (never both)
- Sum of all debits = Sum of all credits within a journal
- Cannot be modified after posting

**Relationships**:
- Belongs to `GLJournal`
- Belongs to `GLAccount`

**Prisma Model**: `GLJournalEntry` (line 256)

---

### 3.3 Ledger

**Purpose**: The official record of all financial transactions. The ledger is the single source of truth for the company's financial state.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `name` | `String` | Ledger name |
| `type` | `String` | PRIMARY, SUBSIDIARY, CONSOLIDATED |
| `currency` | `String` | Base currency |

**Relationships**:
- Belongs to `Company`
- Has many `GLAccount`
- Has many `GLSubLedger`

**Prisma Model**: `GLLedger` (line 261)

---

### 3.4 ChartOfAccounts

**Purpose**: A hierarchical list of all accounts used by the company. Defines the structure of the general ledger.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `name` | `String` | Chart name |
| `description` | `String?` | Chart description |
| `status` | `String` | DRAFT, ACTIVE, ARCHIVED |

**Relationships**:
- Belongs to `Company`
- Has many `GLAccount`

**Prisma Model**: `ChartOfAccount` (line 211)

---

### 3.5 Account

**Purpose**: An individual account in the chart of accounts. Each account has a type that determines its role in the accounting equation.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `accountCode` | `String` | Account number (e.g., 1000, 2000) |
| `accountName` | `String` | Account name |
| `accountType` | `AccountType` | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE |
| `normalBalance` | `String` | DEBIT or CREDIT |
| `isActive` | `Boolean` | Whether account is active |
| `parentId` | `String?` | Parent account (hierarchy) |

**Account Types**:
| Type | Normal Balance | Examples |
|---|---|---|
| `ASSET` | Debit | Cash, Accounts Receivable, Inventory, Fixed Assets |
| `LIABILITY` | Credit | Accounts Payable, Loans, Accrued Expenses |
| `EQUITY` | Credit | Common Stock, Retained Earnings |
| `REVENUE` | Credit | Sales Revenue, Interest Income |
| `EXPENSE` | Debit | Cost of Goods Sold, Operating Expenses |

**Relationships**:
- Belongs to `Company`
- Has parent/children `GLAccount` (hierarchy)
- Has many `GLJournalEntry`
- Has many `GLAccountBalance`

**Prisma Model**: `GLAccount` (line 252)

---

### 3.6 AccountBalance

**Purpose**: The current balance of an account, aggregated from journal entries.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `accountId` | `String` | Account reference |
| `periodId` | `String` | Accounting period |
| `debitBalance` | `Decimal(38,12)` | Total debits |
| `creditBalance` | `Decimal(38,12)` | Total credits |
| `closingBalance` | `Decimal(38,12)` | Net balance |

**Invariants**:
- `closingBalance = debitBalance - creditBalance` (for assets/expenses)
- `closingBalance = creditBalance - debitBalance` (for liabilities/equity/revenue)

**Prisma Model**: `GLAccountBalance` (line 253)

---

### 3.7 FiscalPeriod

**Purpose**: A time period for accounting — month, quarter, or year. Controls when books can be opened, posted, and closed.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `name` | `String` | Period name (e.g., "January 2026") |
| `startDate` | `DateTime` | Period start |
| `endDate` | `DateTime` | Period end |
| `status` | `String` | OPEN, CLOSING, CLOSED, LOCKED |
| `periodType` | `String` | MONTH, QUARTER, YEAR |

**Relationships**:
- Belongs to `Company`
- Has many `GLAccountBalance`
- Has many `GLClosingChecklist`

**Lifecycle**: Open → Closing → Closed → Locked

**Prisma Model**: `GLAccountingPeriod` (line 259)

---

### 3.8 CostCenter

**Purpose**: An organizational unit for cost tracking. Enables expense allocation and departmental reporting.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `code` | `String` | Cost center code |
| `name` | `String` | Cost center name |
| `isActive` | `Boolean` | Active status |

**Prisma Model**: `GLCostCenter` (line 263)

---

### 3.9 ProfitCenter

**Purpose**: An organizational unit for profit tracking. Enables revenue and expense attribution to business segments.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `code` | `String` | Profit center code |
| `name` | `String` | Profit center name |
| `isActive` | `Boolean` | Active status |

**Prisma Model**: `GLProfitCenter` (line 264)

---

## 4. Treasury Entities

### 4.1 CashPosition

**Purpose**: Current cash holdings across all bank accounts and wallets. The foundation of treasury visibility.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `asOfDate` | `DateTime` | Position date |
| `totalCash` | `Decimal(38,12)` | Total cash across accounts |
| `availableCash` | `Decimal(38,12)` | Available (not restricted) |
| `restrictedCash` | `Decimal(38,12)` | Restricted or committed |
| `currency` | `String` | ISO 4217 |
| `source` | `String` | COMPUTED, SNAPSHOT, MANUAL |

**Relationships**:
- Belongs to `Company`
- Related to `TreasuryCashPool`
- Related to `TreasuryRestrictedCash`

**Prisma Models**: `TreasuryCashPosition` (line 236), `CashPositionSnapshot` (line 379)

---

### 4.2 CashMovement

**Purpose**: An inflow or outflow of cash. Records every cash transaction with full traceability.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `movementType` | `String` | INFLOW, OUTFLOW, TRANSFER |
| `amount` | `Decimal(38,12)` | Movement amount |
| `currency` | `String` | ISO 4217 |
| `category` | `String?` | OPERATING, INVESTING, FINANCING |
| `sourceId` | `String?` | Source entity (payment, receipt, etc.) |
| `sourceType` | `String?` | Entity type |
| `movementDate` | `DateTime` | When the movement occurred |
| `valueDate` | `DateTime?` | When funds are available |

**Prisma Model**: `TreasuryCashMovement` (line 239)

---

### 4.3 CashForecast

**Purpose**: Predicted future cash positions based on historical patterns, scheduled payments, and receivables.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `forecastDate` | `DateTime` | Target date |
| `projectedCash` | `Decimal(38,12)` | Projected cash position |
| `confidence` | `String` | HIGH, MEDIUM, LOW |
| `horizon` | `String` | 7_DAY, 30_DAY, 90_DAY |
| `modelVersion` | `String?` | Forecasting model used |

**Prisma Models**: `TreasuryCashForecast` (line 240), `LiquidityForecast` (line 380)

---

### 4.4 LiquidityPosition

**Purpose**: Available liquid assets — cash plus near-cash instruments that can be converted within a defined timeframe.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `asOfDate` | `DateTime` | Position date |
| `cashAndEquivalents` | `Decimal(38,12)` | Immediately available |
| `shortTermInvestments` | `Decimal(38,12)` | Convertible within 30 days |
| `availableCredit` | `Decimal(38,12)` | Undrawn credit facilities |
| `totalLiquidity` | `Decimal(38,12)` | Sum of all liquid assets |
| `currency` | `String` | ISO 4217 |

**Prisma Model**: `TreasuryLiquidityPosition` (line 237)

---

### 4.5 FXExposure

**Purpose**: Foreign exchange risk from multi-currency operations. Tracks exposure by currency pair and hedging status.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `sourceCurrency` | `String` | Transaction currency |
| `targetCurrency` | `String` | Reporting currency |
| `exposedAmount` | `Decimal(38,12)` | Unhedged exposure |
| `hedgedAmount` | `Decimal(38,12)` | Hedged portion |
| `exchangeRate` | `Decimal(20,6)` | Current rate |
| `unrealizedPnL` | `Decimal(38,12)` | Unrealized gain/loss |

**Prisma Models**: `TreasuryFXExposure` (line 244), `FXExposureAnalysis` (line 382)

---

### 4.6 InvestmentHolding

**Purpose**: Investment positions held by the company — bonds, money market funds, treasury bills.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `investmentType` | `String` | BOND, MONEY_MARKET, T_BILL, CD, OTHER |
| `principal` | `Decimal(38,12)` | Investment principal |
| `currentValue` | `Decimal(38,12)` | Current market value |
| `maturityDate` | `DateTime?` | Maturity date |
| `interestRate` | `Decimal(10,6)` | Annual interest rate |
| `status` | `String` | ACTIVE, MATURED, REDEEMED |

**Prisma Model**: `InvestmentHolding` (line 391)

---

### 4.7 DebtInstrument

**Purpose**: Loans, bonds, credit facilities, and other debt obligations.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `instrumentType` | `String` | TERM_LOAN, REVOLVING_CREDIT, BOND, COMMERCIAL_PAPER |
| `principal` | `Decimal(38,12)` | Original principal |
| `outstandingBalance` | `Decimal(38,12)` | Current balance |
| `interestRate` | `Decimal(10,6)` | Annual rate |
| `maturityDate` | `DateTime` | Maturity date |
| `covenants` | `Json?` | Covenant definitions |
| `status` | `String` | ACTIVE, MATURED, REPAID, DEFAULT |

**Prisma Models**: `DebtInstrument` (line 388), `DebtCovenant` (line 389)

---

## 5. Governance Entities

### 5.1 Approval

**Purpose**: Authorization of a financial action. Approvals enforce segregation of duties and spending controls.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `entityType` | `String` | What is being approved (invoice, payment, workflow) |
| `entityId` | `String` | ID of the entity |
| `status` | `ApprovalStatus` | PENDING, APPROVED, REJECTED, ESCALATED, SKIPPED |
| `level` | `Int` | Approval level in chain |
| `approverId` | `String` | Assigned approver |
| `approvedAt` | `DateTime?` | When approved |
| `comments` | `String?` | Approval comments |

**Prisma Model**: `ProcurementApprovalRecord` (line 519)

---

### 5.2 ApprovalChain

**Purpose**: Sequence of required approvals for a financial action. Defines the approval workflow.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `name` | `String` | Chain name |
| `description` | `String?` | Chain description |
| `isActive` | `Boolean` | Active status |
| `thresholds` | `Json?` | Amount-based routing rules |

**Prisma Model**: `ApprovalMatrixRule` (line 58)

---

### 5.3 Policy

**Purpose**: A business rule governing financial actions. Policies enforce compliance, spending limits, and operational controls.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `name` | `String` | Policy name |
| `description` | `String?` | Policy description |
| `category` | `String` | SPENDING, APPROVAL, COMPLIANCE, OPERATIONAL |
| `rules` | `Json` | Policy rules (condition + action) |
| `isActive` | `Boolean` | Active status |
| `enforcementLevel` | `String` | STRICT, ADVISORY, MONITORING |

**Relationships**:
- Belongs to `Company`
- Has many `PolicyTestResult`
- Has many `PolicyViolation`

**Prisma Model**: `Policy` (line 178)

---

### 5.4 PolicyViolation

**Purpose**: A breach of a policy. Recorded for audit and remediation.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `policyId` | `String` | Violated policy |
| `entityType` | `String` | Entity that violated |
| `entityId` | `String` | Entity ID |
| `violationType` | `String` | Type of violation |
| `severity` | `String` | LOW, MEDIUM, HIGH, CRITICAL |
| `status` | `String` | OPEN, ACKNOWLEDGED, RESOLVED, WAIVED |
| `detectedAt` | `DateTime` | When detected |

**Prisma Model**: `PolicyViolation` (line 218)

---

### 5.5 ComplianceFinding

**Purpose**: A regulatory compliance issue identified through audit or monitoring.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `frameworkId` | `String` | Compliance framework |
| `requirementId` | `String?` | Specific requirement |
| `title` | `String` | Finding title |
| `description` | `String` | Detailed description |
| `severity` | `String` | LOW, MEDIUM, HIGH, CRITICAL |
| `status` | `String` | OPEN, IN_PROGRESS, REMEDIATED, ACCEPTED |
| `remediationPlan` | `String?` | How to fix |

**Prisma Models**: `ComplianceViolation` (line 437), `AuditFinding` (line 421)

---

### 5.6 AuditLog

**Purpose**: An immutable record of an action. Every state-changing operation produces an audit log entry.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `actorId` | `String` | Who performed the action |
| `action` | `String` | What was done |
| `entityType` | `String` | What was affected |
| `entityId` | `String` | Entity ID |
| `changes` | `Json?` | Before/after values |
| `metadata` | `Json?` | Additional context |
| `timestamp` | `DateTime` | When it happened |
| `ipAddress` | `String?` | Source IP |
| `userAgent` | `String?` | Client information |

**Invariants**:
- Append-only: no UPDATE or DELETE allowed
- Immutable: once written, never modified
- Tamper-evident: chain of entries provides integrity

**Prisma Model**: `AuditLog` (line 157)

---

### 5.7 Evidence

**Purpose**: Supporting documentation for a finding, approval, or compliance assessment.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `entityType` | `String` | Parent entity type |
| `entityId` | `String` | Parent entity ID |
| `documentType` | `String` | RECEIPT, CONTRACT, INVOICE, EMAIL, SCREENSHOT, OTHER |
| `fileName` | `String` | File name |
| `fileSize` | `Int` | File size in bytes |
| `mimeType` | `String` | MIME type |
| `storageKey` | `String` | Storage location |
| `hash` | `String?` | File hash for integrity |

**Prisma Models**: `FindingEvidence` (line 422), `ReconciliationEvidence` (line 353), `CaseEvidence` (line 403)

---

## 6. Workflow Entities

### 6.1 Workflow

**Purpose**: An automated business process that orchestrates tasks, approvals, decisions, and integrations.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `name` | `String` | Workflow name |
| `description` | `String?` | Workflow description |
| `status` | `String` | DRAFT, ACTIVE, PAUSED, ARCHIVED |
| `version` | `Int` | Version number |
| `triggerType` | `String` | MANUAL, SCHEDULED, EVENT, API |
| `definition` | `Json` | Workflow definition (steps, conditions) |

**Relationships**:
- Belongs to `Company`
- Has many `WorkflowInstance`
- Has many `WorkflowEvent`

**Prisma Model**: `WorkflowDefinition` (line 221)

---

### 6.2 WorkflowInstance

**Purpose**: A running execution of a workflow. Tracks state, inputs, outputs, and current step.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `workflowId` | `String` | Parent workflow definition |
| `status` | `String` | RUNNING, COMPLETED, FAILED, PAUSED, CANCELLED |
| `currentStep` | `String?` | Current step ID |
| `input` | `Json` | Instance input data |
| `output` | `Json?` | Instance output data |
| `startedAt` | `DateTime` | When started |
| `completedAt` | `DateTime?` | When completed |
| `error` | `String?` | Error message if failed |

**Prisma Model**: `WorkflowInstance` (line 222)

---

### 6.3 Task

**Purpose**: A unit of work within a workflow. Tasks can be automated, human-assigned, or decision points.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `instanceId` | `String` | Parent workflow instance |
| `stepId` | `String` | Step definition ID |
| `stepType` | `String` | STEP_TYPE (approval, decision, human, ai, connector, etc.) |
| `status` | `String` | PENDING, IN_PROGRESS, COMPLETED, FAILED, SKIPPED |
| `assignedTo` | `String?` | Assigned user |
| `input` | `Json` | Step input |
| `output` | `Json?` | Step output |
| `startedAt` | `DateTime?` | When started |
| `completedAt` | `DateTime?` | When completed |

**Prisma Model**: `WorkflowStepExecution` (line 326)

---

### 6.4 Exception

**Purpose**: An unexpected condition requiring human intervention. Exceptions break normal workflow flow and require resolution.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `entityType` | `String` | Source entity type |
| `entityId` | `String` | Source entity ID |
| `exceptionType` | `String` | MATCH_FAILURE, VALIDATION_ERROR, POLICY_VIOLATION, SYSTEM_ERROR |
| `severity` | `String` | LOW, MEDIUM, HIGH, CRITICAL |
| `status` | `String` | OPEN, IN_PROGRESS, RESOLVED, ESCALATED, WAIVED |
| `description` | `String` | Exception description |
| `assignedTo` | `String?` | Assigned resolver |
| `resolution` | `String?` | How it was resolved |
| `resolvedAt` | `DateTime?` | When resolved |

**Prisma Models**: `ProcurementInvoiceException` (line 518), `ReconciliationException` (line 172), `ReconException` (line 349)

---

### 6.5 Decision

**Purpose**: A structured choice with evidence, alternatives, and rationale. Decisions are recorded for audit and learning.

**Key Attributes**:
| Attribute | Type | Description |
|---|---|---|
| `id` | `String` (CUID) | Unique identifier |
| `companyId` | `String` | Tenant scope |
| `entityType` | `String` | Context entity type |
| `entityId` | `String` | Context entity ID |
| `decisionType` | `String` | APPROVAL, ALLOCATION, ROUTING, OVERRIDE |
| `chosenOption` | `String` | Selected option |
| `alternatives` | `Json?` | Other options considered |
| `evidence` | `Json?` | Supporting evidence |
| `rationale` | `String?` | Why this option was chosen |
| `decidedBy` | `String` | Who made the decision |
| `decidedAt` | `DateTime` | When decided |

**Prisma Models**: `AgentDecision` (line 14), `CaseDecision` (line 404), `ExecutiveDecision` (line 343)

---

## 7. Relationships

### 7.1 Core Relationship Map

```
Company (1) ──── (*) CompanyMembership ──── (*) User
    │
    ├── (*) Role ──── (*) UserRole ──── (*) User
    │
    ├── (*) Wallet
    ├── (*) Transaction
    ├── (*) LedgerEntry
    ├── (*) AuditLog
    │
    ├── (*) GLAccount ──── (*) GLAccountBalance
    │       │
    │       └── (*) GLJournalEntry ──── (*) GLJournal
    │
    ├── (*) ProcurementVendor ──── (*) ProcurementVendorInvoice
    │       │                          │
    │       │                          ├── (*) ProcurementInvoiceLineItem
    │       │                          ├── (*) ProcurementThreeWayMatch
    │       │                          │       └── (*) ProcurementMatchLineItem
    │       │                          ├── (*) ProcurementApprovalRecord
    │       │                          └── (*) ProcurementPaymentRecord
    │       │
    │       └── (*) ProcurementVendorCredit
    │
    ├── (*) WorkflowDefinition ──── (*) WorkflowInstance
    │                                  │
    │                                  └── (*) WorkflowStepExecution
    │
    ├── (*) Policy ──── (*) PolicyViolation
    │
    ├── (*) AgentDefinition ──── (*) AgentSession ──── (*) AgentTask
    │
    ├── (*) IntegrationInstance ──── (*) IntegrationCredential
    │
    ├── (*) Notification
    │
    └── (*) TreasuryCashPosition
         (*) TreasuryCashMovement
         (*) TreasuryCashForecast
         (*) TreasuryFXExposure
```

### 7.2 Key Cross-Domain Relationships

| From | To | Relationship | Domain |
|---|---|---|---|
| `ProcurementVendorInvoice` | `GLJournal` | Invoice posting creates journal entries | AP → GL |
| `ProcurementPaymentRecord` | `GLJournal` | Payment creates journal entries | AP → GL |
| `ProcurementThreeWayMatch` | `ProcurementVendorInvoice` | Match validates invoice | AP Matching |
| `ProcurementApprovalRecord` | `ProcurementVendorInvoice` | Approval gates payment | AP → Governance |
| `TreasuryCashMovement` | `ProcurementPaymentRecord` | Payment triggers cash movement | Treasury → AP |
| `WorkflowInstance` | `ProcurementVendorInvoice` | Workflow processes invoice | Workflow → AP |
| `AgentDecision` | `ProcurementVendorInvoice` | Agent recommends approval | AI → AP |
| `PolicyViolation` | `ProcurementVendorInvoice` | Policy blocks invalid invoice | Governance → AP |
| `AuditLog` | Any entity | Every mutation produces audit log | Audit → All |

---

## 8. Value Objects

### 8.1 Money

**Purpose**: An amount with a currency. The fundamental value object for all financial calculations.

**Definition**:
```typescript
interface Money {
  amount: Decimal;    // Decimal(38,12) — never native number
  currency: string;   // ISO 4217 (USD, EUR, GBP, etc.)
}
```

**Operations**:
- `add(a: Money, b: Money): Money` — same currency only
- `subtract(a: Money, b: Money): Money` — same currency only
- `multiply(m: Money, factor: number): Money`
- `divide(m: Money, divisor: number): Money`
- `convert(m: Money, rate: ExchangeRate): Money`
- `equals(a: Money, b: Money): boolean` — amount + currency
- `isPositive(m: Money): boolean`
- `isZero(m: Money): boolean`
- `format(m: Money): string` — locale-aware display

**Invariants**:
- Amount stored as `Decimal(38,12)` — 12 decimal places for precision
- Currency is ISO 4217 uppercase 3-letter code
- Never use native `number` for financial calculations
- Operations that mix currencies require explicit conversion

**Prisma Storage**: `Decimal(38,12)` fields across all monetary columns

**Helper Functions**: `src/lib/financial-precision.ts`
- `financialRound()` — banker's rounding via `Intl.NumberFormat`
- `toDecimal()` — safe conversion
- `sumDecimals()` — safe aggregation
- `multiplyDecimals()`, `divideDecimals()`
- `allocateAmount()` — with residual handling
- `calculateTax()`, `calculateWithholding()`

---

### 8.2 DateRange

**Purpose**: A period of time used for reporting, filtering, and fiscal period management.

**Definition**:
```typescript
interface DateRange {
  start: Date;
  end: Date;
}
```

**Invariants**:
- `start <= end`
- Non-overlapping for fiscal periods
- Inclusive of both boundaries

---

### 8.3 Address

**Purpose**: A physical address for entities (companies, vendors, customers).

**Definition**:
```typescript
interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;    // ISO 3166-1 alpha-2
}
```

---

### 8.4 TaxRate

**Purpose**: A tax rate with jurisdiction and type information.

**Definition**:
```typescript
interface TaxRate {
  rate: Decimal;       // e.g., 0.075 for 7.5%
  type: TaxType;       // SALES, VAT, GST, WITHHOLDING, EXCISE
  jurisdiction: string; // Tax jurisdiction code
  effectiveFrom: Date;
  effectiveTo?: Date;
}
```

**Prisma Model**: `TaxRate` (line 571)

---

### 8.5 PaymentTerms

**Purpose**: Terms governing when payment is due.

**Definition**:
```typescript
interface PaymentTerms {
  code: string;        // NET_30, NET_60, NET_90, DUE_ON_RECEIPT
  days: number;        // Payment due in N days
  discountPercent?: number; // Early payment discount
  discountDays?: number;    // Days to qualify for discount
}
```

**Standard Terms**:
| Code | Days | Discount |
|---|---|---|
| `DUE_ON_RECEIPT` | 0 | — |
| `NET_15` | 15 | — |
| `NET_30` | 30 | — |
| `NET_60` | 60 | — |
| `NET_90` | 90 | — |
| `2_10_NET_30` | 30 | 2% if paid in 10 days |

---

## 9. External Provider Translation Table

### 9.1 Plaid → Canonical

| Plaid Term | Canonical Perionyx Term | Translation Notes |
|---|---|---|
| `account` | `Wallet` / `BankAccount` | Plaid account → Perionyx wallet with bank metadata |
| `transaction` | `Transaction` | Plaid transaction → Perionyx transaction with category mapping |
| `balance` | `CashPosition` | Plaid balance → Perionyx cash position |
| `income` | `CashMovement` (INFLOW) | Plaid income → Perionyx cash inflow |
| `liabilities` | `DebtInstrument` | Plaid liabilities → Perionyx debt instrument |
| `investment` | `InvestmentHolding` | Plaid investment → Perionyx investment holding |
| `transfer` | `CashMovement` (TRANSFER) | Plaid transfer → Perionyx cash transfer |

### 9.2 QuickBooks → Canonical

| QuickBooks Term | Canonical Perionyx Term | Translation Notes |
|---|---|---|
| `Vendor` | `ProcurementVendor` | QBO vendor → Perionyx vendor |
| `Bill` | `ProcurementVendorInvoice` | QBO bill → Perionyx AP invoice |
| `BillPayment` | `ProcurementPaymentRecord` | QBO payment → Perionyx payment |
| `Account` | `GLAccount` | QBO account → Perionyx GL account |
| `JournalEntry` | `GLJournalEntry` | QBO journal → Perionyx journal entry |
| `PurchaseOrder` | `ProcurementPOReference` | QBO PO → Perionyx PO reference |
| `CreditMemo` | `ProcurementVendorCredit` | QBO credit memo → Perionyx vendor credit |
| `Customer` | `AccountingCustomer` / `Customer` | QBO customer → Perionyx customer |
| `Invoice` (AR) | `AccountingInvoice` | QBO AR invoice → Perionyx AR invoice |
| `Item` | `CatalogItem` (domain) | QBO item → Perionyx catalog item |
| `CompanyInfo` | `Company` | QBO company → Perionyx company profile |

### 9.3 SAP → Canonical

| SAP Term | Canonical Perionyx Term | Translation Notes |
|---|---|---|
| `BusinessPartner` | `ProcurementVendor` / `Customer` | SAP BP → Perionyx vendor or customer |
| `PurchaseOrder` | `ProcurementPOReference` | SAP PO → Perionyx PO reference |
| `Invoice` (MM) | `ProcurementVendorInvoice` | SAP MM invoice → Perionyx AP invoice |
| `AccountingDocument` | `GLJournal` + `GLJournalEntry` | SAP doc → Perionyx journal + entries |
| `CostCenter` | `GLCostCenter` | SAP CC → Perionyx cost center |
| `ProfitCenter` | `GLProfitCenter` | SAP PC → Perionyx profit center |
| `MaterialMaster` | `CatalogItem` (domain) | SAP material → Perionyx catalog item |
| `VendorEvaluation` | `ProcurementVendorPerformance` | SAP eval → Perionyx vendor performance |

### 9.4 NetSuite → Canonical

| NetSuite Term | Canonical Perionyx Term | Translation Notes |
|---|---|---|
| `Vendor` | `ProcurementVendor` | NetSuite vendor → Perionyx vendor |
| `VendorBill` | `ProcurementVendorInvoice` | NetSuite bill → Perionyx AP invoice |
| `VendorPayment` | `ProcurementPaymentRecord` | NetSuite payment → Perionyx payment |
| `Account` | `GLAccount` | NetSuite account → Perionyx GL account |
| `JournalEntry` | `GLJournal` + `GLJournalEntry` | NetSuite JE → Perionyx journal |
| `Customer` | `Customer` | NetSuite customer → Perionyx customer |
| `SalesOrder` | Domain-specific | NetSuite SO → Perionyx order |
| `Subsidiary` | `OrganizationUnit` (SUBSIDIARY) | NetSuite subsidiary → Perionyx org unit |
| `Department` | `OrganizationUnit` (DEPARTMENT) | NetSuite dept → Perionyx org unit |
| `Class` | `GLCostCenter` or `GLProfitCenter` | NetSuite class → Perionyx cost/profit center |

### 9.5 Dynamics 365 → Canonical

| Dynamics Term | Canonical Perionyx Term | Translation Notes |
|---|---|---|
| `Vendor` | `ProcurementVendor` | Dynamics vendor → Perionyx vendor |
| `PurchaseOrder` | `ProcurementPOReference` | Dynamics PO → Perionyx PO reference |
| `VendorInvoice` | `ProcurementVendorInvoice` | Dynamics invoice → Perionyx AP invoice |
| `GeneralLedgerAccount` | `GLAccount` | Dynamics GL → Perionyx GL account |
| `FinancialJournal` | `GLJournal` + `GLJournalEntry` | Dynamics JE → Perionyx journal |
| `Customer` | `Customer` | Dynamics customer → Perionyx customer |
| `Dimension` | `GLCostCenter` / `GLProfitCenter` | Dynamics dim → Perionyx center |

---

## 10. Financial Precision Policy

### 10.1 Decimal Requirements

| Context | Precision | Rationale |
|---|---|---|
| **All monetary amounts** | `Decimal(38,12)` | 12 decimal places for intermediate calculations; 2 for display |
| **Exchange rates** | `Decimal(20,6)` | 6 decimal places for FX rates |
| **Tax rates** | `Decimal(10,6)` | 6 decimal places for tax rates |
| **Interest rates** | `Decimal(10,6)` | 6 decimal places for interest |
| **Percentages** | `Decimal(10,4)` | 4 decimal places for ratios |

### 10.2 Rounding Rules

- **Banker's rounding** (round half to even) via `Intl.NumberFormat`
- Rounding happens at **display time**, not at calculation time
- Intermediate calculations preserve full precision
- Allocation residuals handled by `allocateAmount()` — last target receives `total - sum(previous)`

### 10.3 Idempotency

- All financial mutations must be idempotent
- Idempotency keys tracked in `IdempotencyRecord` model
- Duplicate submissions return the original result
- Payment processing uses idempotency keys for external API calls

---

*This document is the canonical financial language for Perionyx.*
*All external provider terminology is translated at the Provider Driver boundary.*
*Authority: Platform Constitution v1.0*
