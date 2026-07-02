# Perionyx — Documentation Index

**Last Updated: July 2026**

---

## Quick Navigation

| I need to... | Start here |
|-------------|------------|
| Understand the platform | `ARCHITECTURE.md` |
| Understand the "why" behind decisions | `DECISIONS.md` → individual ADRs in `adr/` |
| Write code | `CODING_STANDARDS.md` |
| Build UI | `DESIGN_SYSTEM.md` |
| Design API | `API_GUIDELINES.md` |
| Work on AI | `AI_GUIDELINES.md` |
| Review security | `SECURITY.md` |
| Contribute | `CONTRIBUTING.md` |
| Plan features | `ROADMAP.md` |
| Work on sandbox | `SANDBOX_SPEC.md` |
| Look up a term | `GLOSSARY.md` |

## Document Map

| Document | Description |
|----------|-------------|
| `ARCHITECTURE.md` | System architecture, runtime, modules, request lifecycle, principles |
| `DECISIONS.md` | Index of all 20 Architectural Decision Records |
| `PRODUCT_CONSTITUTION.md` | Permanent principles governing the platform |
| `SECURITY.md` | Authentication, RBAC, tenant isolation, encryption, audit |
| `API_GUIDELINES.md` | REST conventions, pagination, filtering, errors, idempotency |
| `CODING_STANDARDS.md` | TypeScript rules, naming, error handling, testing philosophy |
| `DESIGN_SYSTEM.md` | Colors, typography, spacing, components, accessibility |
| `AI_GUIDELINES.md` | Grounded AI, persona system, confidence scoring, citations |
| `CONTRIBUTING.md` | Workflow, branch strategy, PR process, setup |
| `GLOSSARY.md` | All platform terminology |
| `SANDBOX_SPEC.md` | Sandbox architecture, seed data, scenarios, simulation engine |
| `ROADMAP.md` | Completed features, in-progress work, planned features |

## Document Maintenance

All documents must be kept current with the codebase. When filing a pull request:

1. Update `ARCHITECTURE.md` if the module structure or data flow changes
2. Update `GLOSSARY.md` if new terminology is introduced
3. Create or update ADR documents for significant decisions
4. Update `ROADMAP.md` when features ship
5. Update `API_GUIDELINES.md` when API conventions change
