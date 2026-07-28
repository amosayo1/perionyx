---
title: "Unified Error Handling Saves Hundreds of Hours"
created: 2026-07-20
tags:
  - type/lesson
  - domain/engineering
  - status/active
aliases:
  - Error Unification
  - handleRouteError
---

# Unified Error Handling Saves Hundreds of Hours

**Category**: Engineering

**Lesson**: The `handleRouteError()` / `zodErrorResponse()` pattern in `src/server/http/handle-route.ts` replaced 272 individual error handling implementations with a single shared pattern. The before-state: every API route had its own try/catch with inconsistent error formats, missing status codes, and different Zod validation error shapes. The after-state: one pattern, one place to fix, consistent responses. Every new endpoint gets error handling for free.

**When it applies**: When you find yourself writing the same try/catch pattern in more than 5 API routes. Extract it. The ROI of unified error handling compounds with every new endpoint.

**Related**: [[05-Engineering/api-optimization|API Optimization]], [[11-ADR/adr-011-error-unification|ADR-011]]

**Source**: Phase 8A — 31 files changed, unified error format across 272 endpoints
