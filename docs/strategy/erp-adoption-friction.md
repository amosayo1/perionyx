# ERP Adoption Friction Strategy

How the Perionyx Enterprise Form System reduces ERP integration friction.

## Problem Statement

ERP migrations and integrations are the #1 source of configuration complexity for finance teams. Each ERP (Oracle, SAP, NetSuite, Microsoft Dynamics, Sage, QuickBooks) has unique:
- Chart of accounts structures
- Currency and date formatting
- Approval hierarchy models
- Field naming conventions
- API authentication patterns

Finance teams waste weeks mapping fields and correcting configuration errors.

## How Enterprise Forms Address ERP Friction

### 1. SmartSelect with ERP-Specific Grouping

```typescript
// Example: Chart of Accounts mapping form
<SmartSelect
  options={[
    { label: "1000 - Cash", value: "1000", group: "Oracle" },
    { label: "1010 - Cash", value: "1010", group: "SAP" },
    { label: "1100 - AR", value: "1100", group: "Oracle" },
  ]}
  grouped
/>
```

ERP-specific options are visually grouped, preventing cross-ERP confusion.

### 2. FieldHint with ERP Format Examples

```
Field: Account Code
Hint: Oracle format: 1234-5678-90 | SAP format: A123456789
```

Users never guess the required format for their specific ERP.

### 3. Smart Defaults Based on ERP Type

When a user selects their ERP during onboarding, all connected forms auto-configure:
- Date format (YYYY-MM-DD for SAP, MM/DD/YYYY for Oracle)
- Currency formatting preferences
- Account code validation patterns
- Approval threshold defaults

### 4. Cross-Field Validation Across Systems

The ConditionEditor supports cross-ERP validation rules:
```
IF ERP = "SAP" AND account_length != 10 THEN error
IF ERP = "Oracle" AND account_prefix NOT IN ("1", "2", "3") THEN warning
```

### 5. Progressive Disclosure for ERP Complexity

```
[CORE] ERP Connection (always visible)
  → API endpoint, credentials, test connection

[OPTIONAL] Advanced Mapping (visible on toggle)
  → Account code transformation rules
  → Currency mapping overrides

[EXPERT] Custom Transformation (hidden behind badge)
  → Custom field mapping scripts
  → Legacy system compatibility mode
```

## Current State

- ERP connector platform exists in `src/modules/connector-platform/`
- Plaid, Slack, Teams, and banking adapters implemented
- `ConnectorLifecycle.validate()` and `healthCheck()` available
- No dedicated ERP adoption friction form UI yet

## Implementation Plan

### Phase 1: ERP Connection Forms (Pending)
- [ ] Build ERP connection configuration form using EnterpriseForm system
- [ ] Add ERP-specific validation patterns to FieldValidation types
- [ ] Integrate SmartSelect grouped options with connector registry

### Phase 2: Account Mapping (Pending)
- [ ] Cross-ERP account mapping wizard using EnterpriseWizard
- [ ] ApprovalPreview for cross-system approval path simulation
- [ ] Duplicate detection across connected ERPs

### Phase 3: Transformation Rules (Future)
- [ ] ConditionEditor-based field transformation rules
- [ ] Real-time preview of transformed data
- [ ] Audit trail for all mapping changes

## Measurable Outcomes

| Metric | Current | Target |
|---|---|---|
| ERP connector setup time | 2-3 days | 30 minutes |
| Account mapping errors | 15% rejection rate | <1% rejection rate |
| Cross-ERP approval configuration | 4 hours | 15 minutes |
| New ERP adapter onboarding | 2 weeks | 2 days |
