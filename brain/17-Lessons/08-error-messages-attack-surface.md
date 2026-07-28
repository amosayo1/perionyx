---
title: "Error Messages Are Attack Surface"
created: 2026-07-20
tags:
  - type/lesson
  - domain/security
  - status/active
aliases:
  - Information Disclosure
  - Safe Error Messages
---

# Error Messages Are Attack Surface

**Category**: Security

**Lesson**: Every `ForbiddenError` message that reveals tenant existence, role names, or authorization details is information disclosure. An attacker who learns "Tenant X exists" from a 403 error has gained reconnaissance for free. Sanitize at the endpoint level — return generic "Access denied" messages in production, and reserve detailed errors for development mode only. The Phase 16 audit found this pattern across 30+ endpoints.

**When it applies**: When throwing or returning error responses in any API endpoint. Before including details in an error message, ask: "Would I give this information to an attacker?" If the answer is yes, don't include it.

**Related**: [[04-Security/error-disclosure|Error Disclosure]], [[11-ADR/adr-005-error-message-disclosure-policy|ADR-005]], [[Phase 16]], [[Phase 17]]

**Source**: Phase 16 audit — 30+ endpoints with information disclosure in error messages
