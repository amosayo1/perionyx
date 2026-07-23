---
title: "Evidence Can Overturn Architectural Assumptions"
created: 2026-07-21
updated: 2026-07-21
tags:
  - type/lesson
  - domain/engineering
  - domain/architecture
  - status/active
aliases:
  - Evidence Over Assumptions
  - Implementation-Time Validation
  - Architectural Assumptions
related:
  - "[[05-Engineering/lessons-learned|Lessons Learned]]"
  - "[[BRAIN_CONSTITUTION|Brain Constitution]]"
  - "[[12-Roadmaps/evolution-timeline|Evolution Timeline]]"
phase: Phase 18.1A
status: active
---

# Evidence Can Overturn Architectural Assumptions

**Category**: Engineering

**Lesson**: During Phase 18.0 Architecture Consolidation, the full architectural inventory concluded that `src/server/identity/` appeared to be dead code with zero consumers. This made deletion appear safe. During Phase 18.1A implementation, repository-wide validation was repeated immediately before deletion — and discovered nine active page consumers importing `identityFacade` from `src/app/(shell)/system/identity/`. Deletion was blocked. The original architectural assumption proved incomplete. The architecture changed because new evidence emerged at implementation time, not because new code was written.

**When it applies**: Dead code removal, architecture consolidation, security remediation, performance optimization, large refactoring, dependency cleanup, platform simplification — any destructive change. Never delete code solely because an earlier report declared it unused. Implementation-time validation is authoritative.

**Decision framework**: For every proposed deletion, ask: Has the repository been searched again? Are there runtime consumers? Dynamic imports? Reflection-based usages? Test dependencies? Configuration references? Documentation references? Has implementation-time evidence changed since the original report? Only proceed when all evidence supports deletion.

**Related**: [[03-Architecture/index|Architecture]], [[05-Engineering/index|Engineering]], [[13-Engineering-Journal/index|Engineering Journal]], [[12-Roadmaps/evolution-timeline|Evolution Timeline]]

**Source**: Phase 18.1A — Architecture Consolidation Safe Removals
