---
title: "Proxy Over Middleware"
created: 2026-07-20
tags:
  - type/lesson
  - domain/architecture
  - status/active
aliases:
  - Next.js Proxy
  - Edge Proxy
---

# Proxy Over Middleware

**Category**: Architecture

**Lesson**: Next.js 16's `src/proxy.ts` replaced `src/middleware.ts`. The proxy gives more control over request flow, handles edge concerns (auth, rate limiting, CSRF, correlation IDs) without the middleware's limitations, and is the right pattern for edge-level concerns in the App Router. Middleware runs on every request and is harder to configure per-route; the proxy lets you compose behavior explicitly.

**When it applies**: When adding any cross-cutting request concern (authentication, rate limiting, logging, headers) in a Next.js 16+ application. Always check if the proxy is the right place before adding middleware.

**Related**: [[03-Architecture/proxy|Proxy]], [[11-ADR/adr-004-proxy-over-middleware|ADR-004]]

**Source**: Phase 7 — Middleware replaced by proxy for all edge-level concerns
