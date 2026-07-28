---
title: "Prisma Parameterized Queries Prevent SQL Injection by Default"
created: 2026-07-20
tags:
  - type/lesson
  - domain/engineering
  - domain/security
  - status/active
aliases:
  - ORM Security
  - SQL Injection Prevention
---

# Prisma Parameterized Queries Prevent SQL Injection by Default

**Category**: Engineering / Security

**Lesson**: The Phase 16 audit found zero SQL injection vulnerabilities — entirely because Prisma uses parameterized queries by default. The one exception was `$queryRawUnsafe` in a legacy module, which was immediately flagged. This is the strongest argument for ORMs: they make the secure path the default path. Never use raw SQL unless absolutely necessary, and when you do, always parameterize.

**When it applies**: When building any database access layer. Use Prisma (or another parameterized ORM) by default. If raw SQL is unavoidable, use parameterized queries — never string interpolation.

**Related**: [[04-Security/database-security|Database Security]], [[11-ADR/adr-002-prisma-orm|ADR-002]]

**Source**: Phase 16 — Zero SQL injection findings, Prisma default parameterization
