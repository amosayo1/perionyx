# Feature Prioritization Framework

**Phase:** 8E.4
**Last Updated:** July 8, 2026

---

## Purpose

This framework provides an objective, weighted scoring model for prioritizing features across the Perionyx platform. Every feature is scored across 10 dimensions, producing a single numeric score that determines priority ranking.

*Reference: `docs/product/roadmap-governance.md §5`*

---

## Scoring Dimensions

Each dimension is scored 1-10. Higher scores indicate more favorable outcomes.

### 1. Customer Demand (Weight: 15%)

| Score | Criteria |
|---|---|
| 10 | ≥5 organizations explicitly requested; T1 evidence |
| 8 | 3-4 organizations requested; T1 evidence |
| 6 | 2 organizations requested; T1 or strong T2 |
| 4 | 1 organization; T2 evidence |
| 2 | Inferred demand from surveys or competitive analysis |
| 1 | No customer signal; strategic hypothesis |

### 2. Business Value (Weight: 15%)

| Score | Criteria |
|---|---|
| 10 | >$100K annual value per customer (time saved + risk reduction) |
| 8 | $50-100K annual value per customer |
| 6 | $10-50K annual value per customer |
| 4 | $1-10K annual value per customer |
| 2 | <$1K annual value per customer |
| 1 | Unquantified but directional positive |

### 3. Revenue Potential (Weight: 10%)

| Score | Criteria |
|---|---|
| 10 | Direct new revenue stream (new SKU, add-on module) |
| 8 | Significant upsell to existing customers (>20% ACV increase) |
| 6 | Moderate upsell or competitive win differentiator |
| 4 | Retention improvement (reduces churn risk) |
| 2 | Indirect revenue benefit |
| 1 | No direct revenue impact |

### 4. Strategic Differentiation (Weight: 15%)

| Score | Criteria |
|---|---|
| 10 | Uniquely Perionyx; no competitor can match in 24 months |
| 8 | Significant advantage; competitors 12+ months behind |
| 6 | Clear advantage; competitors 6+ months behind |
| 4 | Parity with competitors; table stakes |
| 2 | Behind competitors; catch-up required |
| 1 | Commodity feature; no differentiation |

### 5. Workflow Impact (Weight: 10%)

| Score | Criteria |
|---|---|
| 10 | Eliminates a multi-domain workflow; reduces steps by 50%+ |
| 8 | Significantly streamlines a workflow; reduces steps by 30%+ |
| 6 | Improves a workflow; reduces steps or time by 15%+ |
| 4 | Minor workflow improvement; reduces cognitive load |
| 2 | Workflow-neutral; quality-of-life improvement |
| 1 | No workflow impact |

### 6. AI Enablement (Weight: 5%)

| Score | Criteria |
|---|---|
| 10 | Creates new AI capability or enables AI-driven workflow |
| 8 | Significantly improves AI accuracy or coverage |
| 6 | AI enhancement to existing feature |
| 4 | Provides data or context that improves AI |
| 2 | Indirect AI infrastructure benefit |
| 1 | No AI relevance |

### 7. Implementation Effort (Weight: -10% — Inverted)

| Score | Criteria |
|---|---|
| 10 | XS — 1-2 days; single file change |
| 8 | S — 3-5 days; small component or API change |
| 6 | M — 1-2 weeks; new component or endpoint |
| 4 | L — 2-4 weeks; significant new capability |
| 2 | XL — 1-2 months; major feature with dependencies |
| 1 | XXL — 2+ months; platform-scale initiative |

### 8. Technical Risk (Weight: -5% — Inverted)

| Score | Criteria |
|---|---|
| 10 | No risk; well-understood pattern, existing primitives |
| 8 | Low risk; similar implementation exists in codebase |
| 6 | Medium risk; new pattern needed but constrained scope |
| 4 | Moderate risk; new technology or integration |
| 2 | High risk; unproven approach, significant unknowns |
| 1 | Critical risk; research required before implementation |

### 9. Enterprise Readiness (Weight: 10%)

| Score | Criteria |
|---|---|
| 10 | Directly improves audit, compliance, or security posture |
| 8 | Significant improvement to enterprise controls |
| 6 | Moderate improvement to enterprise operations |
| 4 | Minor enterprise operational improvement |
| 2 | Enterprise-neutral; consumer-facing quality |
| 1 | No enterprise impact |

### 10. Platform Leverage (Weight: 5%)

| Score | Criteria |
|---|---|
| 10 | Solves a problem for 10+ features or all domains |
| 8 | Reusable across 5-9 features or multiple domains |
| 6 | Reusable across 2-4 features |
| 4 | Single feature but foundational for future work |
| 2 | Single-use implementation |
| 1 | One-off; no reuse potential |

---

## Scoring Formula

```
Total Score = (CustomerDemand × 0.15)
            + (BusinessValue × 0.15)
            + (RevenuePotential × 0.10)
            + (StrategicDiff × 0.15)
            + (WorkflowImpact × 0.10)
            + (AIEnablement × 0.05)
            + (ImplementationEffort × -0.10)
            + (TechnicalRisk × -0.05)
            + (EnterpriseReadiness × 0.10)
            + (PlatformLeverage × 0.05)
```

### Score Range

| Range | Meaning |
|---|---|
| 0.0 — 10.0 | Possible score range |
| 8.0 — 10.0 | P0 — Launch blocker |
| 6.0 — 7.9 | P1 — High priority |
| 4.0 — 5.9 | P2 — Medium priority |
| 2.0 — 3.9 | P3 — Low priority |
| 0.0 — 1.9 | P4 — Future consideration |

---

## Scoring Examples

### Example A: AI Executive Briefing (P0 Feature)

| Dimension | Score | Weighted |
|---|---|---|
| Customer Demand | 8 | 1.20 |
| Business Value | 9 | 1.35 |
| Revenue Potential | 6 | 0.60 |
| Strategic Differentiation | 10 | 1.50 |
| Workflow Impact | 7 | 0.70 |
| AI Enablement | 10 | 0.50 |
| Implementation Effort | 5 | -0.50 |
| Technical Risk | 6 | -0.30 |
| Enterprise Readiness | 9 | 0.90 |
| Platform Leverage | 6 | 0.30 |
| **Total** | | **6.25 — P1** |

### Example B: Month-End Close Workflow (Proposed P1)

| Dimension | Score | Weighted |
|---|---|---|
| Customer Demand | 5 | 0.75 |
| Business Value | 8 | 1.20 |
| Revenue Potential | 6 | 0.60 |
| Strategic Differentiation | 7 | 1.05 |
| Workflow Impact | 9 | 0.90 |
| AI Enablement | 3 | 0.15 |
| Implementation Effort | 4 | -0.40 |
| Technical Risk | 6 | -0.30 |
| Enterprise Readiness | 8 | 0.80 |
| Platform Leverage | 7 | 0.35 |
| **Total** | | **5.10 — P2** |

### Example C: Dashboard Loading Skeletons (P2)

| Dimension | Score | Weighted |
|---|---|---|
| Customer Demand | 2 | 0.30 |
| Business Value | 4 | 0.60 |
| Revenue Potential | 2 | 0.20 |
| Strategic Differentiation | 2 | 0.30 |
| Workflow Impact | 3 | 0.30 |
| AI Enablement | 1 | 0.05 |
| Implementation Effort | 8 | -0.80 |
| Technical Risk | 9 | -0.45 |
| Enterprise Readiness | 4 | 0.40 |
| Platform Leverage | 3 | 0.15 |
| **Total** | | **1.05 — P4** |

*Note: This feature was prioritized higher (P2) due to CFO experience criticality — override rule applied for customer-facing dashboard quality.*

---

## Override Rules

| Rule | Condition | Effect |
|---|---|---|
| Security override | P0/P1 security vulnerability | Auto-elevate to P0 regardless of score |
| Compliance override | Regulatory mandate with deadline | Elevate to P0/P1 based on deadline |
| Customer escalation | Executive-level customer churn risk | Elevate to P0 pending review |
| Platform dependency | Blocks ≥3 other roadmap items | Elevate to match highest dependent priority |
| Effort override | XS effort + high strategic value | Can be auto-included in current sprint |
| Evidence override | T3 evidence only | Cannot exceed P3 without validation |

---

## Ties and Arbitration

| Condition | Resolution |
|---|---|
| Score difference <0.5 | Product Director decides based on strategic alignment |
| Score difference <0.3 within same priority | Both included; team capacity determines sequencing |
| Same score, different priority buckets | Higher strategic differentiation wins |
| Engineering team disagrees with score | Re-score together with PM; document divergence |

---

## Sprint Planning Integration

```
Roadmap prioritized (quarterly)
    ↓
Top P0/P1 features selected for next sprint
    ↓
PM provides scored prioritization sheet to Engineering
    ↓
Engineering confirms effort estimates; adjust scores if needed
    ↓
Sprint commitment based on capacity
    ↓
Post-sprint: update feature status; collect new evidence
```

---

## Tooling

### Current (Phase 1) — Spreadsheet / Markdown

All scoring is recorded in this document or a companion spreadsheet.

### Future (Phase 2+) — Product Intelligence Module

- Database-backed feature registry with automated scoring
- Visualization of priority distribution across dimensions
- What-if analysis (adjust weights → see priority changes)
- Historical scoring to track priority changes over time

---

## References

- `docs/product/roadmap-governance.md` — Full governance process
- `docs/product/feature-validation-matrix.md` — Scored feature registry
- `docs/customer-discovery/validation-framework.md` — Evidence tiers
- `docs/customer-discovery/customer-discovery-playbook.md` — Decision criteria
- `docs/PRODUCT_CONSTITUTION.md` — Permanent product principles
