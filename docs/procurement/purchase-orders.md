# Purchase Orders

## Overview

The Purchase Order (PO) module manages the complete PO lifecycle across 5 types, 8 statuses, and 1,200 orders. It supports multi-line items, partial fulfillment, vendor communication, and integration with receiving and invoice matching.

## PO Types

| Type | Description | Use Case |
|------|-------------|----------|
| `standard` | One-time purchase of goods or services | Single procurement event |
| `blanket` | Long-term agreement with scheduled releases | Recurring procurement |
| `service` | Service-based procurement | Consulting, maintenance |
| `capital` | Capital equipment purchases | Fixed asset acquisition |
| `contract` | PO issued under an existing contract | Contract-based procurement |

## PO Lifecycle

```
Draft → Approved → Sent → Acknowledged → Partially Received → Fully Received → Closed
                                                              ↓
                                                          Cancelled (any state)
```

### Status Definitions

| Status | Description |
|--------|-------------|
| `draft` | Initial creation, internal only |
| `approved` | Approved for sending to vendor |
| `sent` | Dispatched to vendor |
| `acknowledged` | Vendor confirmed receipt |
| `partially-received` | Some line items received |
| `fully-received` | All line items received |
| `closed` | Fully fulfilled and financially settled |
| `cancelled` | Voided before or during fulfillment |

## PO Structure

| Field | Description |
|-------|-------------|
| `poNumber` | Auto-generated unique identifier |
| `type` | PO type (standard/blanket/service/capital/contract) |
| `status` | Current PO status |
| `vendorId` `vendorName` `vendorCode` | Vendor identification |
| `prId` | Source purchase request (if converted) |
| `contractId` | Associated contract (if contract-based) |
| `items` | Line items with pricing and fulfillment tracking |
| `totalAmount` | PO total value |
| `currency` `exchangeRate` | Multi-currency support |
| `paymentTerms` `shippingTerms` | Commercial terms |
| `expectedDeliveryDate` | Expected delivery date |
| `department` `budgetCode` | Organizational assignment |
| `approvedBy` `approvedAt` | Approval audit trail |
| `receivedAmount` `receivedPercent` | Fulfillment tracking |
| `billedAmount` | Invoice progress tracking |

## Line Items

Each PO line item tracks fulfillment independently:

| Field | Description |
|-------|-------------|
| `quantity` | Ordered quantity |
| `unitPrice` | Contracted price per unit |
| `totalPrice` | Line total |
| `receivedQuantity` `receivedValue` | Receiving progress |
| `billedQuantity` `billedValue` | Invoicing progress |
| `expectedDeliveryDate` | Per-item delivery date |
| `accountCode` `costCenter` `project` | Financial assignment |

## Amendments

PO amendments (change orders) are planned for future implementation. The current data model supports:
- Price adjustments (via updated unitPrice)
- Quantity changes (via updated quantities)
- Line item additions/removals
- Schedule changes (via expectedDeliveryDate)

## Fulfillment Tracking

Fulfillment progress is tracked at both the PO level and line item level:

```
receivedPercent = (totalReceivedValue / totalAmount) × 100
billedAmount = sum of all line billedValues
```

Integration with Receiving module updates `receivedQuantity`/`receivedValue` automatically when receipts are created against the PO.

## PurchaseOrderService API

| Method | Description |
|--------|-------------|
| `addPO()` | Create a new purchase order |
| `getPO()` | Get PO by ID |
| `getAllPOs()` | List all purchase orders |
| `getByStatus()` | Filter POs by status |
| `getByType()` | Filter POs by type |
| `getByVendor()` | Filter POs by vendor |
| `getByCompany()` | Filter POs by company |
| `getPending()` | Get open/pending POs |
| `getByContract()` | Get POs under a specific contract |
| `generatePONumber()` | Generate unique PO identifier |
| `count()` | Total PO count |
