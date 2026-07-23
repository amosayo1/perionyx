# Perionyx Product Documentation

**Phase:** 8E.4 — Evidence-Driven Product Strategy & Roadmap Governance
**Last Updated:** July 8, 2026

---

## Purpose

This directory contains Perionyx's product governance system — the frameworks, principles, and processes that ensure every roadmap decision is traceable to customer evidence, workflow intelligence, business value, and strategic differentiation.

---

## Document Index

| Document | Description |
|---|---|
| [Product Governance Overview](product-governance-overview.md) | Governance philosophy, decision-making process, evidence standards, roadmap methodology |
| [Product Strategy](product-strategy.md) | Strategic vision, market positioning, platform mission, long-term objectives |
| [Product Principles](product-principles.md) | 10 enterprise product principles governing all product decisions |
| [Roadmap Governance](roadmap-governance.md) | Feature proposal, evidence collection, validation criteria, approval process, prioritization rules, review cadence, deprecation |
| [Feature Validation Matrix](feature-validation-matrix.md) | Comprehensive feature-by-feature validation with business objectives, personas, pain points, evidence |
| [Feature Prioritization Framework](feature-prioritization-framework.md) | Weighted scoring model across 10 dimensions for objective prioritization |
| [Strategic Differentiators](strategic-differentiators.md) | What makes Perionyx different from SAP, Oracle, Microsoft, NetSuite, Odoo, QuickBooks Enterprise |
| [Competitive Positioning](competitive-positioning.md) | Per-area competitive analysis with industry standards, gaps, and opportunities |
| [Future Roadmap](future-roadmap.md) | Horizon-based roadmap (12-month to 10-year) with platform evolution milestones |

---

## Related Documentation

| Directory | Description |
|---|---|
| `docs/workflows/` | 12 enterprise workflow documents with Mermaid diagrams, persona mapping, pain point mapping, competitive analysis, AI opportunity matrix |
| `docs/customer-discovery/` | Validation framework, interview template, pain point catalog, feature request catalog, decision log, roadmap evidence mapping, playbook |
| `docs/certification/` | Enterprise certification reports (8D.10, 8D.12) and remediation records |
| `docs/architecture/` | Engineering constitution, enterprise readiness checklist, AI engineering playbook, transaction strategy, self-review framework |
| `docs/PRODUCT_CONSTITUTION.md` | Permanent product principles and constitutional rules |
| `docs/ROADMAP.md` | Current product roadmap with completed/short/medium/long-term items |

---

## Governance Flow

```
Customer Evidence (docs/customer-discovery/)
    ↓
Workflow Intelligence (docs/workflows/)
    ↓
Feature Validation Matrix (this directory)
    ↓
Prioritization Framework → Roadmap → Build → Post-Ship Validation
    ↓
Decision Log (docs/customer-discovery/decision-log.md)
```

---

## Key Principles

1. **No feature without evidence** — every roadmap item references customer interviews, pain points, or workflow analysis
2. **Traceability** — every decision links back to its originating evidence
3. **Validation before investment** — T3 (strategic) items require customer validation before major engineering
4. **Quarterly governance review** — roadmap, evidence gaps, and deprecated items reviewed every quarter
