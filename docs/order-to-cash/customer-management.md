# Customer Management

## Customer Lifecycle

Customers move through a defined lifecycle managed by `CustomerService`:

```
Prospect → Active → [Suspended] → [Blocked] → Inactive
```

| Status | Description |
|--------|-------------|
| `active` | Customer is fully onboarded and transacting |
| `inactive` | No recent transactions; may be dormant |
| `blocked` | Customer is blocked from new orders (payment/compliance issues) |
| `pending` | Onboarding in progress |
| `prospect` | Lead stage — not yet a transacting customer |

## Customer Groups

Customers are categorized into groups for segmentation and reporting:

| Group | Description |
|-------|-------------|
| `enterprise` | Large enterprise accounts with dedicated support |
| `mid-market` | Mid-size business accounts |
| `small-business` | Small business / SMB accounts |
| `government` | Government and public sector entities |
| `non-profit` | Non-profit organizations |
| `partner` | Channel partners and resellers |

## Credit Profiles

Every customer has an associated credit profile managed by `CreditService`:
- **Credit limit**: Maximum outstanding balance allowed
- **Credit utilization**: Current usage as percentage of limit
- **Credit available**: Remaining credit = limit - outstanding
- **Risk rating**: `low` / `medium` / `high` / `critical` — computed from payment history, outstanding, and external factors
- **On hold**: If `true`, new orders and shipments are blocked
- **Hold reason**: Explanation of why credit is on hold
- **Decision**: `approved` / `denied` / `pending-review` / `reduced`

## Customer Contacts

Each customer can have multiple contacts (`CustomerContact`). Contacts include:
- Name, email, phone
- Title and department
- Primary contact flag
- Creation and update timestamps

## Customer Hierarchy

Customers are organized into a group hierarchy for reporting and management. The hierarchy supports nesting (parent/child groups) with:
- Customer count per group
- Aggregate revenue per group
- Drill-down navigation through child groups

This enables enterprise account structures where a parent organization has multiple subsidiaries or divisions.

## Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Unique customer code |
| `legalName` | string | Registered legal entity name |
| `taxId` | string | Tax registration number |
| `taxCountry` | string | Country of tax registration |
| `currency` | string | Default transaction currency |
| `paymentTerms` | string | Payment terms (e.g. "Net 30") |
| `creditLimit` | number | Maximum credit allowed |
| `creditUtilization` | number | Current credit usage |
| `totalRevenue` | number | Lifetime revenue from this customer |
| `totalOrders` | number | Total orders placed |
| `avgPaymentDays` | number | Average days to pay |
| `lifetimeValue` | number | Customer lifetime value |
| `preferred` | boolean | Preferred customer flag |
| `isBlocked` | boolean | Blocked from transactions |
| `tags` | string[] | Arbitrary tags for categorization |
