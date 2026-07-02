# Enterprise Approval Policy System - Documentation

## Overview

The enterprise approval policy management system provides configurable, non-hardcoded approval orchestration for Perionyx treasury operations. Rules are evaluated dynamically based on transaction context, enabling fine-grained control without code changes.

## Key Features

### 1. Rule Management
**UI**: `/admin/rules`

Admins can create approval rules that specify:
- **Rule Name & Priority**: Lower priority = higher precedence
- **Amount Thresholds**: Min/max transaction amounts that trigger the rule
- **Transaction Types**: Which transaction types the rule applies to
- **Approval Steps**: Ordered roles and approval counts needed
- **Options**:
  - Sequential approval: Steps must occur in order
  - Dual approval: Requires two independent approvals
  - Compliance review: Triggers compliance check
  - Expiration: Rules can expire automatically

### 2. Rule Evaluation Engine
**Service**: `RuleEvaluationEngine` (`src/modules/rbac/rule-evaluation.engine.ts`)

When a transaction is evaluated:
1. All matching rules are identified based on amount, type, scope
2. Rules are sorted by priority (lower = higher priority)
3. Most restrictive rule determines final approval requirements
4. Approval chain is built from matched rule's approval steps

**Usage**:
```typescript
const matchedRules = await RuleEvaluationEngine.evaluateTransaction({
  companyId,
  amount: new Decimal(50000),
  transactionType: 'WALLET_TRANSFER',
  metadata: { connector_type: 'ACH' }
});
```

### 3. Approval Workflow Integration
**Service**: `ApprovalWorkflowEngine` (modified)

The approval workflow now automatically:
- Evaluates rules when determining approval requirements
- Uses matched rules to set approval chain
- Enforces sequential/parallel approval logic
- Validates user authority before allowing approval/rejection

**API Endpoints**:
- `POST /api/v1/transactions/[id]/approvals/approve` - Approve transaction
- `POST /api/v1/transactions/[id]/approvals/reject` - Reject with reason

### 4. Transaction Approval Details
**UI**: `/transactions/[id]/approval-details`

Users can view:
- Transaction details (amount, type, status)
- Applicable approval rules (with priority and requirements)
- Required approval steps
- Current approval status and history
- Inline approve/reject actions (if authorized)

**API**:
- `GET /api/v1/transactions/[id]/matching-rules` - Get rules and requirements for transaction

### 5. Rule Testing
**UI**: Rule testing form in `/admin/rules` page

Admins can test rule matching by:
1. Enter a transaction amount
2. Select transaction type
3. Click "Test Rules"
4. See which rules would apply

**API**:
- `POST /api/v1/admin/approval-rules/test` - Test rule matching

## API Reference

### Rule Management

```bash
# List all rules
GET /api/v1/admin/approval-rules

# Create rule
POST /api/v1/admin/approval-rules
Body: {
  name: "Large Transfers",
  minAmount: 50000,
  applicableTransactionTypes: ["WALLET_TRANSFER"],
  priority: 50,
  scope: "GLOBAL",
  sequentialApproval: false,
  dualApprovalRequired: true,
  requiresComplianceReview: false,
  approvalSteps: [
    { stepNumber: 1, roleRequired: "treasury_admin", approvalCount: 1 },
    { stepNumber: 2, roleRequired: "compliance_officer", approvalCount: 1 }
  ]
}

# Get rule details
GET /api/v1/admin/approval-rules/[ruleId]

# Update rule
PUT /api/v1/admin/approval-rules/[ruleId]

# Delete rule
DELETE /api/v1/admin/approval-rules/[ruleId]

# Enable/disable rule
POST /api/v1/admin/approval-rules/[ruleId]/toggle

# View audit history
GET /api/v1/admin/approval-rules/[ruleId]/audit
```

### Transaction Approvals

```bash
# Get transaction with matching rules
GET /api/v1/transactions/[transactionId]/matching-rules
Response: {
  transaction: { id, type, amount, currency, status, createdAt },
  matchedRules: [{ name, priority, approvalSteps, ... }],
  requirements: {
    rulesApplied: ["rule-id-1", "rule-id-2"],
    requiredApprovals: [{ level, roleRequired }],
    currentApprovals: [...],
    isApproved: boolean,
    canBePosted: boolean
  }
}

# Approve transaction
POST /api/v1/transactions/[transactionId]/approvals/approve

# Reject transaction
POST /api/v1/transactions/[transactionId]/approvals/reject
Body: { reason: "Insufficient funds in wallet" }

# Test rule matching
POST /api/v1/admin/approval-rules/test
Body: {
  amount: 75000,
  transactionType: "WALLET_TRANSFER"
}
Response: {
  testInput: { amount, transactionType },
  matchedRulesCount: 2,
  matchedRules: [{ ... }]
}
```

## Database Schema

### ApprovalRule
Stores approval rule definitions:
- `id, companyId, name, description`
- `priority` (lower = higher priority)
- `scope` (GLOBAL, WALLET, WALLET_TYPE, TRANSACTION_TYPE, CONNECTOR_TYPE)
- `minAmount, maxAmount` (Decimal thresholds)
- `applicableTransactionTypes[]` (array of transaction types)
- `requiredApprovalsCount, sequentialApproval, dualApprovalRequired`
- `requiresComplianceReview, escalationTimeoutHours`
- `enabled, expiresAt`
- `createdByUserId, updatedByUserId` (audit trail)

### ApprovalCondition
Flexible condition matching:
- `ruleId, fieldName, operator, value`
- Operators: EQUALS, GREATER_THAN, LESS_THAN, BETWEEN, IN, CONTAINS

### ApprovalStep
Approval chain definition:
- `ruleId, stepNumber, roleRequired, approvalCount, timeoutHours`

## Permission Model

Required permissions:
- `admin.manage_authorities` - Create/update/delete approval rules
- `approvals.approve` - Approve pending transactions
- `approvals.reject` - Reject pending transactions

Assign via RBAC:
```typescript
await RBACService.addPermissionToRole(roleId, 'admin.manage_authorities');
```

## Configuration Examples

### Example 1: Large Transfer Dual Approval
```json
{
  "name": "Large Transfers - Dual Approval",
  "minAmount": 100000,
  "applicableTransactionTypes": ["WALLET_TRANSFER", "SETTLEMENT"],
  "priority": 50,
  "dualApprovalRequired": true,
  "sequentialApproval": true,
  "approvalSteps": [
    { "stepNumber": 1, "roleRequired": "treasury_admin", "approvalCount": 1 },
    { "stepNumber": 2, "roleRequired": "cfo", "approvalCount": 1 }
  ]
}
```

### Example 2: Compliance Review for ACH
```json
{
  "name": "ACH Requires Compliance Review",
  "applicableConnectorTypes": ["ACH"],
  "applicableTransactionTypes": ["SETTLEMENT"],
  "priority": 75,
  "requiresComplianceReview": true,
  "approvalSteps": [
    { "stepNumber": 1, "roleRequired": "compliance_officer", "approvalCount": 1 }
  ]
}
```

### Example 3: Amount-Based Tiered Approvals
```json
{
  "name": "Small Transfers",
  "minAmount": 1000,
  "maxAmount": 50000,
  "applicableTransactionTypes": ["WALLET_TRANSFER"],
  "priority": 100,
  "approvalSteps": [
    { "stepNumber": 1, "roleRequired": "treasury_specialist", "approvalCount": 1 }
  ]
}
```

## Audit & Compliance

All rule changes are logged:
- Rule creation/updates/deletion
- Who made the change and when
- Full audit history accessible via `/api/v1/admin/approval-rules/[ruleId]/audit`

Transaction approvals tracked:
- Who approved/rejected and when
- Rejection reasons captured
- Full approval chain visible in transaction detail view

## Performance Notes

- Rules indexed by `(companyId, priority, enabled)` for fast evaluation
- Rule caching recommended for high-throughput scenarios
- Condition evaluation optimized for common operators (EQUALS, GREATER_THAN, BETWEEN)

## Troubleshooting

- Rules apply to new transactions only. Existing pending approvals retain the rule set at creation time.
- Use the rule test endpoint (`POST /api/v1/admin/approval-rules/test`) to verify matching.
- Verify the user has `approvals.approve` permission and their role has approval authority for the transaction type/amount.
