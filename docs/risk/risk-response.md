# Risk Response

## Overview

Risk responses define the strategy and actions taken to address identified risks. Each risk in the register can have multiple response strategies.

## Response Strategies

| Strategy | Description |
|---|---|
| Avoid | Eliminate the risk by discontinuing the activity |
| Reduce | Implement controls to lower likelihood or impact |
| Transfer | Shift risk to third party (insurance, hedging) |
| Accept | Acknowledge and monitor without active mitigation |
| Escalate | Raise to higher authority for decision |

## RiskResponse Entity

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| registerId | string | Link to risk register entry |
| strategy | RiskResponseStrategy | Avoid, reduce, transfer, accept, escalate |
| description | string | Response plan details |
| responsibleParty | string | Who is responsible |
| timeline | Date | Expected completion date |
| cost | number? | Estimated implementation cost |
| status | ResponseStatus | Planned, in-progress, completed, overdue |
| effectiveness | ControlEffectiveness? | How well the response is working |
| companyId | string | Tenant ID |

## Service API

```typescript
class RiskResponseService {
  add(item: RiskResponse): RiskResponse
  get(id: string): RiskResponse | undefined
  getAll(): RiskResponse[]
  update(id: string, update: Partial<RiskResponse>): RiskResponse | undefined
  delete(id: string): boolean
  getByRegister(registerId: string): RiskResponse[]
  getByStrategy(strategy: RiskResponseStrategy): RiskResponse[]
  getOverdue(): RiskResponse[]
  count(): number
}
```
