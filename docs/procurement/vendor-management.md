# Vendor Management

## Overview

The Vendor Management module provides end-to-end vendor lifecycle management including onboarding, classification, risk scoring, performance tracking, and document management. It supports 800 vendors across 5 companies with 5 statuses, 6 categories, and 4 risk levels.

## Vendor Lifecycle

```
Pending → Active → Suspended → Blocked
                   ↓
               Inactive
```

### Status Definitions

| Status | Description |
|--------|-------------|
| `pending` | Vendor record created, awaiting approval |
| `active` | Fully onboarded and ready for transactions |
| `inactive` | Temporarily disabled, can be reactivated |
| `blocked` | Permanently blocked due to compliance or risk issues |
| `suspended` | Temporarily suspended pending investigation |

## Vendor Onboarding

Each vendor record includes:
- **Identification**: `id`, `code`, `name`, `legalName`, `taxId`, `taxCountry`
- **Contact**: `contactName`, `contactEmail`, `contactPhone`
- **Addresses**: `billingAddress`, `shippingAddress`
- **Financial**: `paymentTerms`, `paymentMethod`, `creditLimit`, `currencyCreditLimit`
- **Banking**: `bankAccount`, `bankName`, `bankCountry`
- **Classification**: `category`, `tags`, `preferred`, `preferredRank`
- **Risk**: `riskLevel`, `isBlocked`, `blockReason`
- **Performance**: `rating`, `totalSpend`, `totalOrders`, `avgPaymentDays`

## Vendor Classification

### Categories

| Category | Description |
|----------|-------------|
| `supplier` | Direct material and product suppliers |
| `contractor` | Labor and project-based contractors |
| `consultant` | Advisory and consulting services |
| `service-provider` | Ongoing managed services |
| `distributor` | Wholesale and distribution partners |
| `manufacturer` | Original equipment manufacturers |

### Tags

Vendors can have arbitrary tags (e.g., `premium`, `standard`, `economy`) for custom categorization beyond the primary category.

## Risk Scoring

### Risk Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| `low` | 80-100 | Trusted, long-term relationships |
| `medium` | 60-79 | Standard risk, requires monitoring |
| `high` | 40-59 | Elevated risk, enhanced due diligence |
| `critical` | 0-39 | Immediate action required |

Risk level is determined by a weighted combination of:
- Financial stability indicators
- Payment history (avgPaymentDays)
- Quality scores from performance tracking
- Compliance document status
- Geopolitical risk (taxCountry)
- Spend concentration

## Performance Tracking

Vendors are tracked quarterly via `VendorPerformance` records:

| Metric | Description |
|--------|-------------|
| `onTimeDelivery` | Percentage of orders delivered on schedule |
| `qualityScore` | Quality rating for goods/services received |
| `responseTime` | Average response time in hours |
| `invoiceAccuracy` | Percentage of invoices matching PO/receipt |
| `returnRate` | Percentage of goods returned |
| `overallScore` | Composite performance score |

Performance data supports:
- Vendor scorecards and dashboards
- Preferred vendor program qualification
- Automated risk level adjustments
- Contract renewal decisions

## Document Management

Vendors can have multiple associated documents via `VendorDocument`:

| Document Type | Examples |
|---------------|----------|
| Tax Forms | W-9, W-8BEN, VAT registration |
| Insurance | Certificate of Insurance (COI) |
| Agreements | MSA, SOW, NDA |
| Licenses | Business license, trade permits |
| Compliance | SOC2 reports, ISO certifications |

Each document tracks:
- **Status**: `valid`, `expired`, `pending`
- **Expiry**: Automated notifications for approaching expiry
- **Reference**: External document identifiers
- **File URL**: Link to stored document (when file storage is integrated)

## VendorService API

| Method | Description |
|--------|-------------|
| `addVendor()` | Create a new vendor record |
| `getVendor()` | Get vendor by ID |
| `getAllVendors()` | List all vendors |
| `getByStatus()` | Filter vendors by status |
| `getByCategory()` | Filter vendors by category |
| `getByRiskLevel()` | Filter vendors by risk level |
| `getPreferred()` | Get all preferred vendors |
| `getBlocked()` | Get all blocked vendors |
| `getByCompany()` | Filter vendors by company |
| `search()` | Full-text search across vendor fields |
| `addPerformance()` | Record vendor performance data |
| `getPerformances()` | Get performance history for a vendor |
| `addDocument()` | Upload/attach a document |
| `getDocuments()` | Get documents for a vendor |
| `count()` | Total vendor count |
