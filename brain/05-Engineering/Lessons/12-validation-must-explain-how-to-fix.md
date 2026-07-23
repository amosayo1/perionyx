---
title: "Validation Must Explain HOW to Fix"
created: 2026-07-20
tags:
  - type/lesson
  - domain/ux
  - status/active
aliases:
  - Helpful Validation
  - Error Messages UX
---

# Validation Must Explain HOW to Fix

**Category**: UX

**Lesson**: "Invalid email" is useless. "Enter a valid email address (e.g., name@company.com)" is helpful. Every validation message should explain the fix, not just state the problem. CFOs and treasurers are domain experts, not UX experts — they need to know what to do, not what went wrong. The EnterpriseField component enforces this pattern: every validation error includes a help hint explaining the expected format.

**When it applies**: When writing any validation message for any form field. The message should answer: "What should the user do now?" not "What did the user do wrong?"

**Related**: [[06-Experience-UX/enterprise-forms|Enterprise Forms]], [[11-ADR/adr-008-enterprise-form-system|ADR-008]]

**Source**: Phase 8B.6 — EnterpriseField validation standards
