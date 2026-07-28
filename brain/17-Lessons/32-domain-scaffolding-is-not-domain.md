---
title: "Domain Scaffolding Is Not Domain Functionality"
created: 2026-07-21
tags:
  - type/lesson
  - domain/architecture
  - status/permanent
aliases:
  - Scaffolding ≠ Functionality
  - UI ≠ Workflow
  - Types ≠ Runtime
---

# Lesson 32: Domain Scaffolding Is Not Domain Functionality

**Origin**: Phase 21.0 — Accounts Payable capability inventory
**Impact**: Discovered that AP domain had 11 pages, 12 services, 20 components, and 5,716 seeded records — but zero runtime functionality. Every page was display-only. Every service was in-memory. Every workflow stage was static data.

---

## The Illusion

When you see 11 procurement pages, 12 domain services, 20 components, and an 888-line seed file with 5,716+ records, you assume the AP domain is functional. It looks complete. The dashboard shows 14 KPIs. The invoice page shows matching scores. The approval page shows a queue. The vendor page shows risk ratings.

**None of it works.** Every page displays seeded data. No user action triggers any state change. The workflow is a static display, not a dynamic process.

---

## What Scaffolding Includes

| Layer | What Exists | What's Missing |
|---|---|---|
| **UI Pages** | 11 procurement routes | All display-only, zero forms, zero actions |
| **Components** | 20 components | Zero interactive forms, zero mutations |
| **Services** | 12 domain services | Zero update/delete methods, zero tenant isolation |
| **Types** | 15 interfaces, 16 type aliases | No Prisma models, no persistence |
| **Seed Data** | 5,716+ records | In-memory Maps, lost on restart |
| **Matching** | 2-way + 3-way algorithms | Hardcoded tolerance, no persistence, no UI trigger |
| **GL Integration** | Invoice/Payment/Receipt entries | Never called from any service or page |

**Total scaffolding**: ~3,000 lines of code across 40+ files.
**Total functionality**: Zero.

---

## Why This Happens

1. **Scaffolding is easy.** Types, interfaces, and display components can be built quickly because they have no behavioral complexity.
2. **Seed data creates false confidence.** 5,716 records make the dashboard look alive. Stakeholders see data and assume the system works.
3. **No one tries to use it.** The pages render. The data displays. No one clicks "Create Invoice" because the button doesn't exist.
4. **The gap is invisible until you trace a workflow.** "Create PO → Receive Goods → Enter Invoice → Match → Approve → Pay" — trace this end-to-end and you discover every step is a dead end.

---

## The Rule

**Every domain must be evaluated by its workflow execution capability, not by its scaffolding completeness.**

| Metric | Scaffolding Metric (Wrong) | Functionality Metric (Right) |
|---|---|---|
| Pages | "11 procurement pages exist" | "0 pages can create/update/approve" |
| Services | "12 domain services exist" | "0 services have mutation methods" |
| Types | "15 interfaces defined" | "0 interfaces backed by Prisma models" |
| Data | "5,716 records seeded" | "0 records persist across restarts" |
| Matching | "3-way match algorithm exists" | "0 matches triggered by user action" |

---

## Prevention

1. **Workflow trace test**: For every domain, trace the primary workflow end-to-end. If any step is a dead end, the domain is not functional.
2. **Mutation audit**: Count create/update/delete methods on services. If zero, the domain is read-only.
3. **Persistence check**: Count Prisma models. If zero, the domain has no persistence.
4. **API route count**: Count REST endpoints. If zero, the UI cannot communicate with the backend.
5. **Seed dependency**: If the domain only works with seed data, it's not a system — it's a demo.

---

## Application

This lesson applies to every domain in Perionyx:
- **AP**: 11 pages, 0 functionality (Phase 21.0 finding)
- **AR**: Likely similar — display-only pages with in-memory data
- **Treasury**: Partially functional (Prisma models exist for some entities)
- **Fixed Assets**: Likely similar — display-only with seed data

**Every domain should undergo the workflow trace test before being claimed as "built."**

---

## Related

- Lesson 28 (Modules Are Not Workflows) — similar insight at module level
- Lesson 29 (Workflow Success Defines Product Success) — product is evaluated by workflow outcomes
- Principle #5 (Product validation requires workflow-level evaluation)
- Principle #6 (Workflow Success Defines Product Success)
- Principle #7 (Cross-cutting UX has shallow impact)
- Phase 21.0 Gap Analysis — full AP scaffolding inventory
