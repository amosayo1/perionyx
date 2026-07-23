# Purchase Requests

## Overview

The Purchase Request (PR) module manages the requisition lifecycle from draft creation through approval to conversion into purchase orders. It supports 1,500 requests with multi-line items, budget validation, urgency tracking, and department-level routing.

## PR Lifecycle

```
Draft → Submitted → Approved → Converted (to PO)
                   → Rejected
                   → Cancelled
```

### Status Definitions

| Status | Description |
|--------|-------------|
| `draft` | Initial creation, editable, not yet submitted |
| `submitted` | Sent for approval workflow |
| `approved` | All approvals obtained, ready for PO conversion |
| `rejected` | Denied during approval, includes rejection reason |
| `cancelled` | Voided before or during approval process |
| `converted` | Successfully transformed into a purchase order |

## PR Structure

Each Purchase Request contains:

| Field | Description |
|-------|-------------|
| `prNumber` | Auto-generated unique identifier |
| `title` | Short description of request |
| `description` | Detailed justification |
| `department` | Originating department |
| `requestedBy` | Requester name |
| `requesterEmail` | Contact email |
| `approverId` | Assigned approver (may be set by workflow) |
| `items` | Line items with quantity, unit, price |
| `totalAmount` | Computed sum of all line item totals |
| `currency` | Transaction currency |
| `budgetCode` | Budget allocation reference |
| `budgetValidated` | Whether budget check passed |
| `urgency` | Priority level (low/medium/high/critical) |
| `convertedToPOId` | Link to resulting purchase order |
| `rejectionReason` | Explanation if rejected |

## Line Items

Each PR can have 1-5 line items, each with:

| Field | Description |
|-------|-------------|
| `lineNumber` | Sequential line identifier |
| `description` | Item or service description |
| `category` | Procurement category |
| `quantity` | Requested quantity |
| `unit` | Unit of measure |
| `unitPrice` | Price per unit |
| `totalPrice` | Computed subtotal |
| `needByDate` | Required delivery date |
| `vendorId` | Preferred/designated vendor |
| `accountCode` | GL account assignment |
| `costCenter` | Cost center allocation |
| `project` | Project code |

## Approval Workflow

For detailed approval workflow documentation, see [Approval Workflow](approval-workflow.md).

Key PR-specific approval behaviors:
- PRs over configurable thresholds require additional approval levels
- Budget validation must pass before approval
- Critical urgency PRs may bypass standard routing
- Department-level routing applies by default

## Budget Validation

Before approval, PRs may be validated against:
- Available budget under the assigned `budgetCode`
- Department budget remaining
- Fiscal year budget constraints
- Cost center allocation limits

The `budgetValidated` flag indicates validation status. Failed validation may block progression to `approved`.

## Conversion to Purchase Order

Approved PRs can be converted to purchase orders via:
- Manual conversion in the UI
- Automated conversion based on business rules
- Batch conversion for recurring procurement

The `convertedToPOId` field links the PR to its resulting PO. Once converted, the PR status moves to `converted` and is no longer editable.

## PurchaseRequestService API

| Method | Description |
|--------|-------------|
| `addPR()` | Create a new purchase request |
| `getPR()` | Get PR by ID |
| `getAllPRs()` | List all purchase requests |
| `getByStatus()` | Filter PRs by status |
| `getByDepartment()` | Filter PRs by department |
| `getByRequester()` | Filter PRs by requester |
| `getByCompany()` | Filter PRs by company |
| `getPending()` | Get pending PRs (draft + submitted) |
| `convertToPO()` | Mark a PR as converted to a PO |
| `generatePRNumber()` | Generate unique PR identifier |
| `count()` | Total PR count |
