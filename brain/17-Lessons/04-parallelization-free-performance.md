---
title: "Parallelization Is Free Performance"
created: 2026-07-20
tags:
  - type/lesson
  - domain/architecture
  - status/active
aliases:
  - Promise.all
  - Concurrent Queries
---

# Parallelization Is Free Performance

**Category**: Architecture

**Lesson**: 9 independent database queries across 2 services were converted from sequential `await` to `Promise.all` with zero risk. All were read-only operations against different tables — no transaction concern. The performance gain was immediate and the code change was trivial. Always check if independent queries can run in parallel before optimizing anything else.

**When it applies**: When fetching data for a page or API response that requires multiple independent database reads. Especially impactful for dashboard pages that aggregate data from multiple sources.

**Related**: [[05-Engineering/parallelization|Parallelization]], [[Phase 8A]]

**Source**: Phase 8A — 9 sequential queries converted to Promise.all
