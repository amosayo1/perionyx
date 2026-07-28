---
title: "50 — Audits Correct More Than They Discover"
created: 2026-07-27
phase: 26.1
tags:
  - type/lesson
  - domain/architecture
  - status/active
aliases:
  - Audit Accuracy
  - Correction Over Discovery
---

# Lesson 50: Audits Correct More Than They Discover

## Context

Phase 26.1 began with four parallel audits (in-memory stores, providers, telemetry, security) that produced alarming findings: "encryption is a no-op passthrough," "73 in-memory stores," "zero production-ready providers." Upon investigation, the actual code told a different story.

## The Lesson

**Audits produce hypotheses, not conclusions.** Every audit finding must be validated against source code before it drives action.

### Specific Findings Corrected

1. **Encryption "no-op"**: The audit claimed `encrypt()` was a passthrough. The actual code is a production-grade AES-256-GCM implementation with `crypto.randomBytes(16)` IV, auth tags, key rotation, and KMS support. The audit likely read a test mock or an older version.

2. **"73 in-memory stores"**: The audit conflated:
   - Dead code (identity module, iam/session — deleted)
   - By-design caches (session validation 30s TTL — correct pattern)
   - In-process transactional state (AP event bus — architecturally correct)
   - Already-persisted Runtime layer (config, capabilities, secrets — Prisma-backed)

3. **"Zero production-ready providers"**: The audit looked for `extends ProviderDriver` adoption. But the real production auth runs through `authenticate-request.ts` + `proxy.ts`, not through the provider driver abstraction. The abstraction is for future provider unification, not current production auth.

## The Principle

**Evidence before action.** Before rewriting code based on audit findings, read the actual implementation. Audits are compasses, not GPS — they point toward areas of interest, but don't guarantee the destination.

## Application

1. Always grep for the actual function/class before concluding it's dead
2. Always check if "in-memory" is a cache (acceptable) or state (dangerous)
3. Always verify audit claims against source code
4. Distinguish "not adopted" from "not needed" — adoption gaps are not bugs
