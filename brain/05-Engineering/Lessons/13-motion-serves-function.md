---
title: "Motion Serves Function"
created: 2026-07-20
tags:
  - type/lesson
  - domain/ux
  - status/active
aliases:
  - Animation Purpose
  - Reduced Motion
---

# Motion Serves Function

**Category**: UX

**Lesson**: Animations should communicate state changes, not decorate. Reduced-motion must always be supported — `prefers-reduced-motion: reduce` disables all non-essential animation. Duration under 400ms for UI feedback, under 200ms for micro-interactions. The MotionProvider checks reduced-motion preference and exposes an `enabled` flag that all motion components consume. Motion that can't be disabled is an accessibility violation.

**When it applies**: When adding any animation or transition. Always ask: "Does this animation communicate a state change?" If no, it's decoration. Always support reduced-motion. Always keep durations under 400ms.

**Related**: [[06-Experience-UX/motion-system|Motion System]], [[11-ADR/adr-009-motion-system|ADR-009]]

**Source**: Phase 8B.7 — Motion system design
