---
id: index
title: Roadmap
sidebar_label: Overview
slug: /roadmap/
description: Completed phases and future development timeline for the Perionyx platform
---

# Roadmap

The Roadmap documents what has been built, what is in progress, and what comes next. Perionyx development follows a phased approach where each phase adds a complete, tested, and documented capability — never shipping partial features to production.

## Architecture

```mermaid
gantt
    title Perionyx Development Timeline
    dateFormat YYYY-MM
    axisFormat %b %Y

    section Completed
    Phase 7D - Onboarding & Readiness    :done, 2026-01, 2026-02
    Phase 7E - Persistence Infrastructure  :done, 2026-02, 2026-03
    Phase 7F - Production Readiness       :done, 2026-03, 2026-04
    Phase 8A - Performance & Optimization :done, 2026-04, 2026-05
    Phase 8B - Enterprise UX              :done, 2026-05, 2026-06
    Phase 11B - Installation & Deployment :done, 2026-06, 2026-07
    Phase 11C - Identity & Access Mgmt    :done, 2026-07, 2026-07

    section In Progress
    Version 1.0 Platform Core            :crit, 2026-07, 2026-07

    section Planned
    Phase 9C - Investments               :2026-08, 2026-09
    Phase 9D - Risk Management           :2026-09, 2026-10
    Phase 9E - Compliance                :2026-10, 2026-11
    Phase 9F - Executive AI              :2026-11, 2026-12
```

## Core Components

| Component | Description | Source |
|-----------|-------------|--------|
| [Completed Phases](./completed-phases/) | All finished development phases with deliverables and metrics | `docs/releases/` |
| [Future Roadmap](./future-roadmap/) | Upcoming phases, feature priorities, and timeline estimates | Planning documents |

## Key Design Decisions

- **Phases are atomic** — A phase is either complete or not started; no half-shipped features
- **Documentation ships with code** — Every phase includes docs, not just code
- **Build verification is mandatory** — `pnpm typecheck` and `pnpm build` must pass before any phase is marked complete
- **Zero breaking changes within major versions** — New phases extend, never break, existing APIs
- **Infrastructure phases precede feature phases** — Persistence, security, and deployment come before features that depend on them

## Related Documentation

- [Executive Overview](/docs/executive-overview/) — Platform vision driving the roadmap
- [Engineering Standards — Enterprise Readiness](/docs/engineering-standards/enterprise-readiness/) — Readiness gates for each phase
- [Architecture Decision Records](/docs/adrs/) — Decisions that shaped the roadmap
- [Engineering Standards — Engineering Constitution](/docs/engineering-standards/engineering-constitution/) — Principles guiding prioritization
