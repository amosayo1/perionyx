---
title: "Proxy Correlation IDs Are Debugging Gold"
created: 2026-07-20
tags:
  - type/lesson
  - domain/engineering
  - status/active
aliases:
  - Correlation IDs
  - Request Tracing
---

# Proxy Correlation IDs Are Debugging Gold

**Category**: Engineering

**Lesson**: Adding correlation ID generation in `src/proxy.ts` and propagating it through every log entry turned debugging from "search for the error" to "search for the correlation ID." Every request gets a UUID that flows through the entire request lifecycle — proxy, route handler, service calls, database queries, external API calls. When a customer reports an error, you get the correlation ID from their browser and trace the entire path.

**When it applies**: When building any API layer. Add correlation IDs at the entry point and propagate them through every layer. The 5 minutes of implementation saves hours of debugging.

**Related**: [[03-Architecture/proxy|Proxy]], [[05-Engineering/monitoring-stack|Monitoring Stack]]

**Source**: Phase 8A — Correlation ID generation in proxy
