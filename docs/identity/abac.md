# Attribute-Based Access Control — Perionyx Identity & Access Management

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Overview

Attribute-Based Access Control (ABAC) provides fine-grained, context-aware authorization by evaluating user attributes and resource attributes against policy conditions. ABAC operates alongside RBAC — both checks must pass for an action to be authorized.

The ABAC system is implemented in `src/server/iam/abac.ts` with two components:

| Component | File | Purpose |
|---|---|---|
| `ABACEvaluator` | `src/server/iam/abac.ts` | Basic attribute-based evaluator (stub) |
| `ABACPolicyEngine` | `src/server/iam/abac.ts` | Full policy-based evaluation with condition matching |
| `ABAC_ATTRIBUTE_DEFINITIONS` | `src/server/iam/abac.ts` | Attribute metadata for UI and tooling |

## Attribute Definitions

### User Attributes

User attributes describe properties of the authenticated user making the request:

| Attribute Key | Type | Values | Description |
|---|---|---|---|
| `department` | enum | `finance`, `engineering`, `operations`, `compliance`, `executive`, `hr`, `legal` | The user's department affiliation |
| `region` | enum | `us`, `eu`, `apac`, `latam`, `mea` | Geographic region of operation |
| `legalEntity` | string | Free-form | Legal entity the user belongs to |
| `costCenter` | string | Free-form | Cost center code associated with the user |
| `approvalLimit` | number | Numeric | Maximum monetary value the user can approve |
| `riskLevel` | enum | `low`, `medium`, `high`, `critical` | User's risk clearance level |

### Resource Attributes

Resource attributes describe properties of the resource being accessed:

| Attribute Key | Type | Description |
|---|---|---|
| `walletId` | string | Wallet identifier (for treasury operations) |
| `workflowId` | string | Workflow definition identifier |
| `connectorType` | string | Type of connector (e.g., "bank", "erp", "csv") |
| `region` | enum | Resource region |
| `legalEntity` | string | Resource legal entity |
| `costCenter` | string | Resource cost center |
| `riskLevel` | enum | Resource risk classification |

### Attribute Metadata

For UI rendering and validation:

```typescript
ABAC_ATTRIBUTE_DEFINITIONS = [
  { key: "department", label: "Department", type: "enum",
    values: ["finance", "engineering", "operations", "compliance", "executive", "hr", "legal"] },
  { key: "region", label: "Region", type: "enum",
    values: ["us", "eu", "apac", "latam", "mea"] },
  { key: "legalEntity", label: "Legal Entity", type: "string" },
  { key: "costCenter", label: "Cost Center", type: "string" },
  { key: "approvalLimit", label: "Approval Limit", type: "number" },
  { key: "riskLevel", label: "Risk Level", type: "enum",
    values: ["low", "medium", "high", "critical"] },
  { key: "walletId", label: "Wallet", type: "string" },
  { key: "workflowId", label: "Workflow", type: "string" },
  { key: "connectorType", label: "Connector Type", type: "string" },
]
```

## Policy Evaluation

### ABAC Policy Structure

```typescript
interface ABACPolicy {
  id: string;                        // Unique policy identifier
  name: string;                      // Human-readable policy name
  effect: "allow" | "deny";         // Allow or deny matching requests
  permissions: GranularPermission[]; // Targeted permissions
  conditions: ABACCondition[];      // Conditions to evaluate
  priority: number;                  // Priority (higher = evaluated first)
  description: string;               // Purpose documentation
}

interface ABACCondition {
  attribute: keyof ABACAttribute;    // Attribute to evaluate
  operator: "eq" | "neq" | "in" | "nin" | "lt" | "lte" | "gt" | "gte" | "contains";
  value: unknown;                    // Value to compare against
}
```

### Evaluation Algorithm

```
ABACPolicyEngine.evaluate(permission, userAttributes, resourceAttributes):
  1. Sort policies by priority descending (highest priority first)
  2. For each policy:
     a. Skip if policy does not apply to the requested permission
     b. Evaluate ALL conditions in the policy
     c. If ALL conditions match:
        - Return policy.effect (allow or deny)
        - Record matchedPolicy name
  3. If no policy matches: return { allowed: true } (default allow)

Note: Deny policies at higher priority can override allow policies.
     The first matching policy wins.
```

### Condition Operators

| Operator | Type | Returns true when | Example |
|---|---|---|---|
| `eq` | Equality | `attribute === value` | `region eq "eu"` |
| `neq` | Inequality | `attribute !== value` | `department neq "engineering"` |
| `in` | Set membership | `value.includes(attribute)` | `region in ["us", "eu"]` |
| `nin` | Set exclusion | `!value.includes(attribute)` | `department nin ["engineering", "legal"]` |
| `lt` | Numeric less | `attribute < value` | `approvalLimit lt 100000` |
| `lte` | Numeric <= | `attribute <= value` | `amount lte 50000` |
| `gt` | Numeric greater | `attribute > value` | `amount gt 10000` |
| `gte` | Numeric >= | `attribute >= value` | `priority gte 5` |
| `contains` | Substring | `attribute.includes(value)` | `connectorType contains "bank"` |

### Evaluation Rules

1. **Default allow**: If no policy matches the permission, access is allowed (RBAC must still pass)
2. **First match wins**: Policies are evaluated in priority order; the first matching policy determines the result
3. **All conditions must match**: Conditions within a single policy are AND-ed together
4. **Deny overrides**: A deny policy at higher priority can override an allow policy at lower priority
5. **Missing attributes**: If a condition references an attribute that is `undefined`, the condition evaluates to `false`

## Policy Priority

Policies are ordered by `priority` (higher = evaluated first):

| Priority Range | Intended Use |
|---|---|
| 1000+ | Global deny rules (e.g., block all high-risk transactions) |
| 500-999 | Regulatory compliance policies |
| 100-499 | Company-specific policies |
| 1-99 | Department-specific overrides |
| 0 (default) | General-purpose policies |

## Policy Examples

### Example 1: Regional Restriction

```typescript
{
  id: "pol_regional_treasury",
  name: "Regional Treasury Restriction",
  effect: "deny",
  permissions: ["treasury.transfer", "treasury.debit"],
  conditions: [
    { attribute: "region", operator: "neq", value: "us" },
  ],
  priority: 800,
  description: "Block treasury transfers from non-US regions",
}
```

### Example 2: Approval Limit

```typescript
{
  id: "pol_approval_limit",
  name: "Approval Limit Enforcement",
  effect: "deny",
  permissions: ["approvals.approve"],
  conditions: [
    { attribute: "approvalLimit", operator: "gte", value: 500000 },
    { attribute: "riskLevel", operator: "in", value: ["critical"] },
  ],
  priority: 600,
  description: "Require multi-signer for approvals over $500k at critical risk level",
}
```

### Example 3: Department Scope

```typescript
{
  id: "pol_dept_workflow",
  name: "Department-Scoped Workflow Access",
  effect: "allow",
  permissions: ["workflow.create", "workflow.update", "workflow.delete"],
  conditions: [
    { attribute: "department", operator: "eq", value: "operations" },
  ],
  priority: 300,
  description: "Only operations department can modify workflows",
}
```

### Example 4: Connector Type Restriction

```typescript
{
  id: "pol_connector_banking",
  name: "Banking Connector Access",
  effect: "deny",
  permissions: ["connectors.connect", "connectors.credentials"],
  conditions: [
    { attribute: "connectorType", operator: "in", value: ["bank", "payment"] },
    { attribute: "department", operator: "neq", value: "finance" },
  ],
  priority: 500,
  description: "Only finance department can manage banking/payment connectors",
}
```

### Example 5: Legal Entity Isolation

```typescript
{
  id: "pol_legal_entity",
  name: "Legal Entity Data Isolation",
  effect: "deny",
  permissions: ["treasury.read", "wallets.read", "reconciliation.view"],
  conditions: [
    { attribute: "legalEntity", operator: "neq", value: null },
    // user.legalEntity must match resource.legalEntity
  ],
  priority: 900,
  description: "Prevent cross-legal-entity data access",
}
```

## ABAC vs RBAC

| Aspect | RBAC | ABAC |
|---|---|---|
| Basis | Who the user is (role) | Context (user + resource attributes) |
| Granularity | Role-level | Individual attribute-level |
| Flexibility | New roles for each change | Policy changes without role updates |
| Complexity | Simple to understand | More complex to configure |
| Use case | Broad access categories | Fine-grained restrictions |
| Evaluation | Set membership | Condition matching |
| Default | Deny (no matching role) | Allow (if no policy matches) |

## Security Considerations

1. **ABAC is additive to RBAC**: Both checks must pass — never use ABAC as the sole authorization mechanism
2. **Deny policies first**: Place deny policies at higher priority than allow policies
3. **Default allow risk**: The ABAC engine defaults to allow when no policy matches — always pair with RBAC checks
4. **Attribute validation**: Validate attribute values at input time to prevent policy bypass via unexpected values
5. **Audit all denials**: Log ABAC policy matches (both allow and deny) for audit trail completeness
6. **Performance**: Policies are evaluated in sequence — keep the policy list small for latency-sensitive operations

## Source Code Reference

| File | Class/Method | Description |
|---|---|---|
| `src/server/iam/abac.ts` | `ABACEvaluator` | Basic ABAC stub evaluator |
| `src/server/iam/abac.ts:13` | `ABACPolicyEngine` | Full policy evaluation engine |
| `src/server/iam/abac.ts:29` | `ABACPolicyEngine.evaluate()` | Main evaluation entry point |
| `src/server/iam/abac.ts:52` | `ABACPolicyEngine.evaluateCondition()` | Single condition evaluation |
| `src/server/iam/abac.ts:84` | `ABAC_ATTRIBUTE_DEFINITIONS` | Attribute metadata definitions |
| `src/server/iam/abac.ts:101` | `abacPolicyEngine` | Singleton instance |
| `src/server/iam/types.ts:115` | `ABACAttribute` | Attribute type definition |
| `src/server/iam/types.ts:127` | `ABACPolicy` | Policy type definition |
| `src/server/iam/types.ts:137` | `ABACCondition` | Condition type definition |
