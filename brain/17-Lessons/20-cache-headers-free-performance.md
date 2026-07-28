---
title: "Cache Headers Are Free Performance"
created: 2026-07-20
tags:
  - type/lesson
  - domain/engineering
  - status/active
aliases:
  - Cache-Control
  - HTTP Caching
---

# Cache Headers Are Free Performance

**Category**: Engineering

**Lesson**: Adding `Cache-Control` headers to 18 read endpoints with tiered TTLs (15-120s) reduced client-side load with zero backend changes. The pattern: `cacheHeaders(ttl)` wraps the response with appropriate caching directives. Critical data (cash position) gets 15s TTL; reference data (settings, templates) gets 120s. Stale-while-revalidate allows background refresh. This is the lowest-effort, highest-impact optimization available.

**When it applies**: When any GET endpoint returns data that doesn't change on every request. If the data has a natural freshness window, add cache headers. Start with 30s TTL and adjust based on staleness complaints.

**Related**: [[05-Engineering/caching-strategy|Caching Strategy]], [[11-ADR/adr-015-cache-strategy|ADR-015]]

**Source**: Phase 8A — 18 endpoints with Cache-Control headers
