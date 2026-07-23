# Risk Register

## Overview

The Risk Register is the central repository for all identified enterprise risks. Each risk is categorized by type, assessed for severity, tracked through its lifecycle, and assigned to an owner.

## RiskRegister Entity

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| title | string | Risk name |
| description | string | Detailed description |
| category | RiskCategory | Classification (strategic, operational, financial, compliance, reputational, credit, market, liquidity, technology, cyber, third-party, fraud) |
| riskLevel | RiskLevel | Severity (low, medium, high, critical) |
| status | RiskStatus | Lifecycle stage (identified, assessed, mitigated, monitored, closed, re-opened) |
| owner | string | Responsible person |
| department | string | Department |
| businessUnit | string? | Business unit |
| dateIdentified | Date | When risk was identified |
| lastReviewed | Date | Last review date |
| targetDate | Date? | Target resolution date |
| closureDate | Date? | Actual closure date |
| trend | RiskTrend | Direction (improving, stable, deteriorating) |
| companyId | string | Tenant ID |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

## Service API

```typescript
class RiskRegisterService {
  add(item: RiskRegister): RiskRegister
  get(id: string): RiskRegister | undefined
  getAll(): RiskRegister[]
  update(id: string, update: Partial<RiskRegister>): RiskRegister | undefined
  delete(id: string): boolean
  getByCategory(category: RiskCategory): RiskRegister[]
  getByLevel(level: RiskLevel): RiskRegister[]
  getByStatus(status: RiskStatus): RiskRegister[]
  getByOwner(owner: string): RiskRegister[]
  search(query: string): RiskRegister[]
  getOpenRisks(): RiskRegister[]
  getCriticalRisks(): RiskRegister[]
  count(): number
}
```
