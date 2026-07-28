# Engineering Prevention Rules — Phase 26.3

**Phase**: 26.3 — Enterprise Foundation Hardening
**Date**: 2026-07-28
**Authority**: Codified from 6 certification condition resolutions

---

## Overview

Every certification condition in Phase 26.2 was resolved with two deliverables:
1. **A code fix** — addresses the immediate issue
2. **A preventive control** — prevents recurrence

This document encodes all 7 preventive controls as engineering rules.

---

## Rule 1: ESLint `no-empty-catch`

**File**: `eslint.config.mjs` (custom rule configuration)
**Enforcement**: CI build gate
**Scope**: All TypeScript/JavaScript files

### Rule
```javascript
// No empty catch blocks allowed
"no-empty-catch": "error"
```

### What It Catches
```typescript
// ❌ FORBIDDEN
try { riskyOperation(); } catch { }

// ✅ REQUIRED — at minimum, log the error
try { riskyOperation(); } catch (err) {
  log.warn({ err }, "Operation failed");
}
```

### Exceptions
- `JSON.parse` with fallback: `try { JSON.parse(x); } catch { return []; }` — acceptable when fallback is documented
- Browser `localStorage`: `try { localStorage.setItem(...); } catch { /* private browsing */ }` — acceptable with comment

### CI Check
```bash
# Counts empty catches in foundation layer
grep -r "catch\s*{}" src/server/foundation/ src/runtime/ | wc -l
# Must return 0
```

---

## Rule 2: CI Foundation Validation Script

**File**: `scripts/foundation-validation.sh`
**Enforcement**: CI build gate
**Scope**: Foundation and runtime layers

### 7 Automated Checks

| # | Check | Command | Expected |
|---|-------|---------|----------|
| 1 | No empty catches in foundation | `grep -r "catch\s*{}" src/server/foundation/` | 0 matches |
| 2 | No unbounded arrays | `grep -r "private.*= \[\];" src/server/foundation/ src/runtime/` | 0 matches |
| 3 | Singleton shutdown pattern | `grep -A2 "if.*instance)" src/runtime/*/registry.ts src/runtime/*/runtime.ts` | `await.*shutdown()` present |
| 4 | TenantId required in audits | `grep "getAuditLog\|listSecrets" src/server/foundation/` | `tenantId` as required param |
| 5 | No hardcoded fallback secrets | `grep -r "sandbox-fallback\|fallback.*secret" src/` | 0 matches |
| 6 | BoundedRingBuffer imported | `grep "BoundedRingBuffer" src/server/foundation/*/registry.ts src/server/foundation/*/manager.ts` | 5 files match |
| 7 | Zod validation on API routes | `grep -r "safeParse" src/app/api/` | 19+ routes validated |

### Usage
```bash
bash scripts/foundation-validation.sh
# Exit code 0 = all pass
# Exit code 1 = regression detected
```

---

## Rule 3: BoundedRingBuffer Utility

**File**: `src/lib/bounded-ring-buffer.ts`
**Authority**: Standard for all in-memory collections in long-running processes

### Design
```typescript
export class BoundedRingBuffer<T> {
  private items: T[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 10_000) {
    if (maxSize <= 0) throw new Error("maxSize must be positive");
    this.maxSize = maxSize;
  }

  push(item: T): void {
    this.items.push(item);
    if (this.items.length > this.maxSize) {
      this.items = this.items.slice(-this.maxSize); // Evict oldest
    }
  }
}
```

### API
- `push(item)` — add item, evict oldest if at capacity
- `getAll()` — return all items (readonly)
- `getLatest(n)` — return last n items
- `filter(predicate)` — filter items
- `size` — current count
- `clear()` — empty the buffer

### Usage Rule
Every in-memory collection in a singleton must use `BoundedRingBuffer<T>` instead of `Array<T>`. The `maxSize` must be a named constant, not a magic number.

---

## Rule 4: Singleton Lifecycle Pattern

**Authority**: Phase 26.3 C-01 resolution
**Scope**: All Runtime and Foundation singletons

### Pattern
```typescript
class MySingleton {
  private static instance: MySingleton;

  static getInstance(): MySingleton {
    if (!MySingleton.instance) {
      throw new Error("Not initialized. Call create() first.");
    }
    return MySingleton.instance;
  }

  static async create(options: Options): Promise<MySingleton> {
    if (MySingleton.instance) {
      await MySingleton.instance.shutdown(); // ← Clean up first
    }
    MySingleton.instance = new MySingleton(options);
    return MySingleton.instance;
  }

  async shutdown(): Promise<void> {
    // Clean up: timers, listeners, caches, connections
  }
}
```

### Rules
1. `getInstance()` throws if `create()` never called — no lazy initialization
2. `create()` is async and calls `shutdown()` before overwrite — no resource leaks
3. `shutdown()` cleans up ALL resources — timers, listeners, caches, connections
4. `getInstance()` returns the instance, not a copy

---

## Rule 5: Tenant Isolation Pattern

**Authority**: Phase 26.3 C-02 resolution
**Scope**: All foundation query methods

### Pattern
```typescript
// ❌ FORBIDDEN — optional tenantId
getAuditLog(key?: string, tenantId?: string): AuditEntry[]

// ✅ REQUIRED — tenantId is always required
getAuditLog(key: string | undefined, tenantId: string): AuditEntry[]
```

### Rules
1. Any method querying tenant-scoped data must have `tenantId` as a **required** parameter
2. `tenantId` must filter results — never return cross-tenant data
3. TypeScript compilation fails if caller omits `tenantId`
4. Exception: methods that explicitly aggregate across tenants must be named `getAllX()` and require elevated permissions

---

## Rule 6: API Validation Pattern

**Authority**: Phase 26.3 C-05 resolution
**Scope**: All API routes accepting request bodies

### Pattern
```typescript
import { z } from "zod";

const CreateThingSchema = z.object({
  name: z.string().min(1).max(200),
  value: z.number().min(0).max(1_000_000),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = CreateThingSchema.safeParse(body);

  if (!result.success) {
    return zodErrorResponse(result.error);
  }

  // result.data is fully validated
  const thing = await createThing(result.data);
  return Response.json(thing);
}
```

### Rules
1. Every API route that reads `req.json()` must have a Zod schema
2. Use `safeParse()` (not `parse()`) — returns `{ success, data, error }`
3. Return `zodErrorResponse(error)` on failure — structured error response
4. Schema name: `{Action}{Entity}Schema` (e.g., `CreateThingSchema`)
5. Never trust client input — validate at the API boundary, not just the UI

---

## Rule 7: Secret Safety Pattern

**Authority**: Phase 26.3 C-06 resolution
**Scope**: All code paths that read secrets

### Pattern
```typescript
// ❌ FORBIDDEN — placeholder fallback
const secret = process.env.AUTH_SECRET ?? "placeholder";

// ✅ REQUIRED — fail loudly
const secret = process.env.AUTH_SECRET;
if (!secret) {
  throw new Error(
    "AUTH_SECRET environment variable is required. " +
    "Cannot proceed without it."
  );
}
```

### Rules
1. Never use placeholder strings as secret fallbacks (`"placeholder"`, `"sandbox-fallback"`, `"changeme"`)
2. If a secret is required, throw immediately if missing — don't defer the failure
3. If a secret is optional, document why and return a sentinel value (not a placeholder)
4. CI scans for hardcoded fallback strings in production paths
5. `AUTH_SECRET` must be validated at boot, not at first use

---

## Enforcement Architecture

```
Developer writes code
        ↓
ESLint catches empty catches (Rule 1)
        ↓
CI validation script runs 7 checks (Rule 2)
        ↓
TypeScript catches missing tenantId (Rule 5)
        ↓
Zod catches invalid input (Rule 6)
        ↓
Runtime throws on missing secrets (Rule 7)
        ↓
BoundedRingBuffer prevents memory growth (Rule 3)
        ↓
Singleton lifecycle prevents resource leaks (Rule 4)
        ↓
Code merges safely
```

Each rule is enforced at a different layer: lint → CI → compile → runtime → memory. No single layer is sufficient. Together, they form a defense-in-depth preventive architecture.
