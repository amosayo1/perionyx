# Risk Assessment

## Overview

Risk assessments quantify the likelihood and impact of each risk, providing inherent and residual scores. Assessments are conducted periodically and track the effectiveness of controls.

## RiskAssessment Entity

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| registerId | string | Link to risk register entry |
| inherentLikelihood | number (1-5) | Likelihood without controls |
| inherentImpact | number (1-5) | Impact without controls |
| inherentScore | number | Product of likelihood × impact |
| residualLikelihood | number (1-5) | Likelihood with controls |
| residualImpact | number (1-5) | Impact with controls |
| residualScore | number | Product of residual likelihood × impact |
| assessmentDate | Date | When assessment was performed |
| assessedBy | string | Assessor name |
| methodology | string | Assessment methodology (Bow-tie, HAZOP, SWIFT, FMEA, etc.) |
| companyId | string | Tenant ID |

## Scoring

- Inherent Score = Inherent Likelihood × Inherent Impact
- Residual Score = Residual Likelihood × Residual Impact
- Maximum score per dimension: 5 × 5 = 25

## Service API

```typescript
class RiskAssessmentService {
  add(item: RiskAssessment): RiskAssessment
  get(id: string): RiskAssessment | undefined
  getAll(): RiskAssessment[]
  update(id: string, update: Partial<RiskAssessment>): RiskAssessment | undefined
  delete(id: string): boolean
  getByRegister(registerId: string): RiskAssessment[]
  getLatestAssessment(registerId: string): RiskAssessment | undefined
  computeInherentScore(likelihood: number, impact: number): number
  computeResidualScore(likelihood: number, impact: number): number
  getByDateRange(start: Date, end: Date): RiskAssessment[]
  count(): number
}
```
