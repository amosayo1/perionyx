---
title: "Progressive Disclosure Over Everything"
created: 2026-07-20
tags:
  - type/lesson
  - domain/ux
  - status/active
aliases:
  - Progressive Disclosure
  - Cognitive Load
---

# Progressive Disclosure Over Everything

**Category**: UX

**Lesson**: Core fields always visible, optional labeled "Optional", advanced collapsed with badge, expert behind toggle. CFOs don't want to see 50 fields at once. Progressive disclosure reduces cognitive load, prevents errors, and makes the 80% case fast while keeping the 20% case accessible. The EnterpriseForm system implements this with EnterpriseSection collapse states, optional field badges, and expert toggle patterns.

**When it applies**: When building any form or configuration UI with more than 5 fields. If a user would need to scroll past fields they don't understand, those fields should be behind progressive disclosure.

**Related**: [[06-Experience-UX/enterprise-forms|Enterprise Forms]], [[11-ADR/adr-008-enterprise-form-system|ADR-008]]

**Source**: Phase 8B.6 — EnterpriseForm system design
