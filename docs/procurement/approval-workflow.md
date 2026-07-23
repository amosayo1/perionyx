# Approval Workflow

## Overview

The Approval module provides a flexible, multi-level approval routing engine for all procurement entities (PRs, POs, invoices, contracts, payments). It supports delegation, escalation, and configurable approval matrices.

## Supported Entity Types

| Entity Type | Description |
|-------------|-------------|
| `pr` | Purchase Request approval |
| `po` | Purchase Order approval |
| `invoice` | Invoice approval for payment |
| `contract` | Contract approval |
| `payment` | Payment execution approval |

## Approval Lifecycle

```
Pending → Approved
        → Rejected
        → Escalated
        → Delegated
```

### Status Definitions

| Status | Description |
|--------|-------------|
| `pending` | Awaiting action from current approver |
| `approved` | Approved at current level |
| `rejected` | Denied with optional comments |
| `escalated` | Moved to higher authority due to timeout or threshold |
| `delegated` | Assigned to alternate approver |

## Multi-Level Approval

Each approval request tracks:

| Field | Description |
|-------|-------------|
| `level` | Current approval level (1-based) |
| `maxLevel` | Total levels required for this entity |
| `currentApproverId` | Approver assigned to current level |
| `originalApproverId` | Original approver (before delegation) |

### Level Progression

```
Level 1 → Approved → Level 2 → Approved → Level 3 → ... → Complete
```

At each level:
1. Current approver reviews the entity
2. Approve, reject, or request changes
3. If approved and `level < maxLevel`, advance to next level
4. If rejected, entire request is rejected
5. If approved and `level = maxLevel`, request is fully approved

## Delegation

Delegation occurs when an approver assigns their approval authority to another user:

- `isDelegated` flag indicates active delegation
- `currentApproverId` updated to delegate
- `originalApproverId` preserves the original
- Delegation can be temporary (vacation coverage) or permanent
- Audit trail records delegation events

## Escalation

Escalation occurs when approval deadlines are missed:

- `escalationMinutes`: Time limit for each level
- `isEscalated` flag indicates escalation occurred
- Escalation routes to the next level automatically
- Escalated requests may be flagged for management attention
- Configurable escalation chains per entity type and amount

## Approval Matrix

The approval matrix determines routing based on:

| Dimension | Configuration |
|-----------|---------------|
| Entity type | PR, PO, invoice, contract, payment |
| Amount threshold | Tiers (e.g., <$10K, $10K-$100K, $100K-$1M, >$1M) |
| Department | Department-specific approvers |
| Risk level | High-risk entities require additional approvals |
| Urgency | Critical items may bypass standard routing |

## Audit Trail

Every approval action is recorded with:
- Action (approved/rejected/delegated/escalated)
- Actor (approver ID)
- Timestamp
- Comments
- Level at time of action

## ApprovalsService API

| Method | Description |
|--------|-------------|
| `addApproval()` | Create a new approval request |
| `getApproval()` | Get approval by ID |
| `getAllApprovals()` | List all approval requests |
| `getByStatus()` | Filter by approval status |
| `getByEntity()` | Get approvals for a specific entity |
| `getByApprover()` | Get approvals assigned to an approver |
| `getPending()` | Get all pending approvals |
| `getByCompany()` | Filter by company |
| `count()` | Total approval count |
