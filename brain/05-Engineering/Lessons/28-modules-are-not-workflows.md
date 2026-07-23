---
title: "Modules Are Not Workflows"
created: 2026-07-21
tags: [type/lesson, domain/engineering, domain/product]
phase: Phase 20.0
---

# Modules Are Not Workflows

Building individual modules (GL, treasury, AR, compliance) does not automatically create usable workflows. A workflow is a cross-module journey that a persona completes to achieve an outcome. The platform has 64 modules but only 3 end-to-end workflows that actually work. The gap is in the wiring: connecting module outputs to module inputs across navigation sections, persisting state across steps, and providing progress/error-recovery UX. Modules are necessary but not sufficient. Workflows are what users pay for.

## The Problem

Phase 20.0 validated 14 core workflows across 10 personas. The results:

| Metric | Value |
|--------|-------|
| Workflows evaluated | 14 |
| Production-ready | 3 (21%) |
| Average trust score | 6.4/10 |
| Experience Constitution compliance | 4.8/10 |
| Friction issues | 25 (4 critical, 8 high) |

The architecture is impressive — 460 routes, 402 APIs, 64 modules. But architecture breadth does not equal product depth. A CFO doesn't use "modules." They follow a morning briefing workflow, a payment approval workflow, a month-end close workflow. Each of those workflows crosses multiple modules, navigation sections, and data stores.

## Why This Happens

1. **Module-first development** — Teams build GL, treasury, AR, compliance as independent silos. Each module is complete in isolation but doesn't know about the others.
2. **No workflow orchestration layer** — There's no service that says "user is doing month-end close, here are the 10 steps, here's where they are, here's what failed."
3. **State doesn't persist across steps** — A user starts a payment approval, navigates to check the bank balance, comes back, and loses context.
4. **Error recovery is per-module, not per-workflow** — If step 3 of 7 fails, the user has to manually figure out what succeeded and retry from step 3.

## The Evidence

- **Morning briefing**: Partially implemented. Data freshness indicators missing. CFOs can't tell if numbers are real-time or 24 hours old.
- **Month-end close**: Manual 10-step checklist with no persistence. Controller has to track progress in a spreadsheet.
- **Payment approval**: Partially wired. Approval matrix exists but doesn't connect to bank submission or reconciliation.
- **Audit trail**: Audit log exists but workflow gaps mean some actions aren't logged end-to-end.

## The Lesson

When planning a phase, ask: "Which user workflows does this complete?" not "Which modules does this add?" Every module addition should be justified by a workflow it enables or completes. Wire before you build new modules.

## When This Applies

- Sprint planning — prioritize workflow completion over module breadth
- Architecture reviews — check cross-module wiring, not just module internals
- Product demos — show workflows, not modules
- Pilot preparation — pilots need complete workflows, not complete modules

## Related

- [[07-Enterprise-Workflows/index|Enterprise Workflows]] — the workflow automation layer
- [[09-Customer-Discovery/index|Customer Discovery]] — personas and pain points drive workflow priority
- [[05-Engineering/Lessons/17-one-screen-one-question-product|One Screen, One Question]] — clarity principle applies to workflows too
- [[11-ADR/decision-network|Decision Network]] — Principle #5 codifies workflow-level evaluation
