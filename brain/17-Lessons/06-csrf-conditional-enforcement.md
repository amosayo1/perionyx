---
title: "CSRF Needs Conditional Enforcement"
created: 2026-07-20
tags:
  - type/lesson
  - domain/security
  - status/active
aliases:
  - CSRF Conditional
  - API Key Bypass
---

# CSRF Needs Conditional Enforcement

**Category**: Security

**Lesson**: API keys aren't vulnerable to CSRF — they're sent in headers, not cookies. Enforcing CSRF protection on all requests breaks integrations that use API key authentication. The correct pattern is conditional enforcement: check the authentication method, and only enforce CSRF on session-authenticated requests. This was learned the hard way when API integrations broke after a blanket CSRF fix.

**When it applies**: When implementing CSRF protection on endpoints that accept both session cookies and API keys. Always check the auth method before applying CSRF validation.

**Related**: [[04-Security/csrf-remediation|CSRF Remediation]], [[11-ADR/adr-001|ADR-001]], [[03-Architecture/proxy|Proxy]], [[Phase 17]]

**Source**: Phase 17 P0-1 — CSRF fix broke API integrations, required conditional enforcement
