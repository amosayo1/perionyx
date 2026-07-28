---
title: "Fail-Open Has a Ceiling"
created: 2026-07-20
tags:
  - type/lesson
  - domain/security
  - status/active
aliases:
  - Bounded Fail-Open
  - Session Resilience
---

# Fail-Open Has a Ceiling

**Category**: Security

**Lesson**: Session validation fail-open during database outages is acceptable only with a bounded window (24-hour JWT expiry) and a cache of recent revocations. Fail-open is a pragmatic choice for availability, but it must have hard limits. A fail-open that never closes is just fail-open-forever. The bounded window + revocation cache pattern gives you availability during transient outages without creating a permanent backdoor.

**When it applies**: When designing resilience patterns for authentication or authorization systems. Any fail-open mechanism needs: (1) a time-bound window, (2) a cached revocation list, (3) monitoring that alerts when fail-open is active, and (4) a plan to close the window.

**Related**: [[04-Security/session-validation|Session Validation]], [[11-ADR/adr-004-session-validation-hybrid|ADR-004]]

**Source**: Phase 17 P0-5 — Session validation fail-open with bounded window
