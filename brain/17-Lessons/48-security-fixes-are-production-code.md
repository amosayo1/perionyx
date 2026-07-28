---
title: "Security fixes are production code, not documentation"
created: 2026-07-27
updated: 2026-07-27
tags:
  - type/lesson
  - domain/security
  - status/active
aliases:
  - Lesson 48
---

# Security fixes are production code, not documentation

**Category**: Security Engineering

**Lesson**: A security audit that produces documents without fixing the code is a risk assessment, not remediation. The moment a Critical finding is confirmed (broken HMAC, plaintext passwords, no-op webhook verification), the correct response is to write working code that fixes it — not to create a remediation plan document. Security findings that exist only in documentation are vulnerabilities waiting to be exploited. The code fix IS the deliverable.

**When it applies**: When a security audit identifies Critical or High findings that can be fixed with bounded, localized code changes (single file or small set of files). Not applicable when the fix requires architectural changes across many modules — those need planning first.

**Related**: [[11-Decisions/decision-network|Decision Network]] (Principle #25), Phase 16.0 Security Audit, Phase 17.1 P0 Remediation, Phase 26.0 Security Fixes

**Source**: Phase 26.0 — Fixed 3 Critical + 1 High security findings with working code in a single session: webhook HMAC (FNV-1a → HMAC-SHA256), plaintext passwords (→ bcrypt), Plaid verification (→ JWS ES256), admin bootstrap (SHA-256 → bcrypt)
