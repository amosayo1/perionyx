# Contracts

## Overview

The Contract module manages the full contract lifecycle from draft creation through execution, renewal, and expiry. It supports 350 contracts across multiple types with auto-renewal tracking and integration with purchase orders and vendor management.

## Contract Lifecycle

```
Draft → Active → Expired
               → Terminated
               → Renewed (creates new cycle)
```

### Status Definitions

| Status | Description |
|--------|-------------|
| `draft` | Initial creation, not yet executed |
| `active` | Currently in effect |
| `expired` | Past end date, not renewed |
| `terminated` | Early termination for cause or convenience |
| `renewed` | Superseded by a renewal contract |

## Contract Types

| Type | Description |
|------|-------------|
| Service Agreement | Ongoing service delivery contracts |
| Supply Agreement | Material and product supply contracts |
| Maintenance Contract | Equipment and facility maintenance |
| Software License | Software usage rights |
| Consulting Agreement | Advisory and consulting services |
| Lease Agreement | Equipment or facility leases |
| Partnership Agreement | Strategic partnership frameworks |
| NDA | Non-disclosure agreements |

## Contract Structure

| Field | Description |
|-------|-------------|
| `contractNumber` | Auto-generated unique identifier |
| `title` | Contract name |
| `description` | Scope and purpose |
| `vendorId` `vendorName` | Associated vendor |
| `type` | Contract type classification |
| `value` | Total contract value |
| `currency` | Contract currency |
| `startDate` | Effective date |
| `endDate` | Expiration date |
| `renewalDate` | Date for renewal decision |
| `autoRenew` | Whether contract auto-renews |
| `paymentTerms` | Payment schedule |
| `department` `budgetCode` | Organizational assignment |
| `attachments` | Count of supporting documents |

## Renewal Management

### Renewal Date Calculation

```
renewalDate = endDate - 30 days (default)
```

Configurable per contract type.

### Renewal Actions

| Action | Description |
|--------|-------------|
| Auto-renew | Contract automatically renews if `autoRenew = true` |
| Manual renew | Contract manager initiates renewal |
| Renegotiate | Terms updated before renewal |
| Non-renew | Contract expires without renewal |

### Auto-Renewal

When `autoRenew = true`:
- Contract automatically extends for the original term
- New contract record created with `renewed` status
- Previous contract marked as `renewed`
- Notifications sent 60/30/7 days before auto-renewal

## ContractService API

| Method | Description |
|--------|-------------|
| `addContract()` | Create a new contract |
| `getContract()` | Get contract by ID |
| `getAllContracts()` | List all contracts |
| `getByStatus()` | Filter by contract status |
| `getByVendor()` | Get contracts for a vendor |
| `getByCompany()` | Filter by company |
| `getExpiring()` | Get contracts expiring within N days |
| `getActive()` | Get all active contracts |
| `generateContractNumber()` | Generate unique contract identifier |
| `count()` | Total contract count |
