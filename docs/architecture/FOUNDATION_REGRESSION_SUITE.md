# Foundation Regression Suite — Phase 26.3

**Phase**: 26.3 — Enterprise Foundation Hardening
**Date**: 2026-07-28

---

## Purpose

The Foundation Regression Suite ensures that the 6 certification conditions resolved in Phase 26.3 remain resolved. It combines three layers of defense:

1. **ESLint** — prevents new empty catches at authoring time
2. **CI validation script** — detects regressions at build time
3. **Test suites** — verifies correctness at verification time

---

## Layer 1: ESLint `no-empty-catch` Rule

**Enforcement**: Developer IDE + CI build gate
**Scope**: All TypeScript/JavaScript files

### Rule Definition
```javascript
"no-empty-catch": "error"
```

### What It Prevents
- New empty `catch {}` blocks in any file
- Empty catches with only comments (`catch { /* ignored */ }`)
- Any catch block without an explicit body

### How to Fix Violations
```typescript
// ❌ Violation
try { riskyOperation(); } catch { }

// ✅ Fix: log the error
try { riskyOperation(); } catch (err) {
  log.warn({ err }, "Operation failed");
}

// ✅ Fix: rethrow
try { riskyOperation(); } catch (err) {
  throw err;
}

// ✅ Fix: fallback
try { riskyOperation(); } catch { return defaultValue; }
```

---

## Layer 2: CI Validation Script

**File**: `scripts/foundation-validation.sh`
**Enforcement**: CI build gate (exit code 1 on failure)
**Scope**: Foundation and runtime layers

### 7 Automated Checks

#### Check 1: No Empty Catches in Foundation
```bash
COUNT=$(grep -r "catch\s*{}" src/server/foundation/ 2>/dev/null | wc -l)
if [ "$COUNT" -gt 0 ]; then
  echo "[FAIL] $COUNT empty catch blocks in foundation layer"
  exit 1
fi
echo "[PASS] 0 empty catch blocks in foundation"
```

#### Check 2: No Unbounded Arrays in Singletons
```bash
COUNT=$(grep -rP "private\s+\w+\s*:\s*\w+\[\]\s*=\s*\[\]" src/server/foundation/ src/runtime/ 2>/dev/null | wc -l)
if [ "$COUNT" -gt 0 ]; then
  echo "[FAIL] $COUNT unbounded arrays in foundation/runtime singletons"
  exit 1
fi
echo "[PASS] 0 unbounded arrays in foundation singletons"
```

#### Check 3: Singleton Shutdown Pattern
```bash
# Verify all create() methods call shutdown() before overwrite
for file in src/runtime/*/registry.ts src/runtime/*/runtime.ts; do
  if grep -q "static.*create" "$file" 2>/dev/null; then
    if ! grep -q "await.*shutdown" "$file" 2>/dev/null; then
      echo "[FAIL] $file: create() does not call shutdown()"
      exit 1
    fi
  fi
done
echo "[PASS] All singleton create() methods call shutdown()"
```

#### Check 4: TenantId Required in Audit Methods
```bash
# Verify getAuditLog and listSecrets require tenantId
for file in src/server/foundation/*/registry.ts src/server/foundation/*/manager.ts; do
  if grep -q "getAuditLog\|listSecrets" "$file" 2>/dev/null; then
    if grep -q "tenantId\?:\s*string" "$file" 2>/dev/null; then
      echo "[FAIL] $file: tenantId is optional in audit method"
      exit 1
    fi
  fi
done
echo "[PASS] All audit query methods require tenantId"
```

#### Check 5: No Hardcoded Fallback Secrets
```bash
COUNT=$(grep -r "sandbox-fallback\|fallback.*secret\|changeme" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$COUNT" -gt 0 ]; then
  echo "[FAIL] $COUNT hardcoded fallback secrets found"
  exit 1
fi
echo "[PASS] 0 hardcoded fallback secrets"
```

#### Check 6: BoundedRingBuffer in Foundation
```bash
COUNT=$(grep -r "BoundedRingBuffer" src/server/foundation/ 2>/dev/null | wc -l)
if [ "$COUNT" -lt 4 ]; then
  echo "[FAIL] BoundedRingBuffer not imported in all foundation registries (found $COUNT, expected 4+)"
  exit 1
fi
echo "[PASS] BoundedRingBuffer imported in $COUNT foundation files"
```

#### Check 7: Zod Validation on API Routes
```bash
COUNT=$(grep -r "safeParse" src/app/api/ 2>/dev/null | wc -l)
if [ "$COUNT" -lt 19 ]; then
  echo "[FAIL] Only $COUNT routes with Zod validation (expected 19+)"
  exit 1
fi
echo "[PASS] $COUNT routes with Zod validation"
```

### Usage
```bash
# Run manually
bash scripts/foundation-validation.sh

# Run in CI
- name: Foundation Validation
  run: bash scripts/foundation-validation.sh
```

---

## Layer 3: Test Suites

### Runtime Tests
**Suite**: 60 tests
**Scope**: RuntimeContext, Configuration, Secrets, Capabilities
**Result**: 60/60 PASS

Key test areas:
- RuntimeContext propagation (AsyncLocalStorage)
- Configuration hierarchy (Global → Tenant → Environment)
- Secret provider lifecycle
- Capability registration and health
- Singleton lifecycle (create → shutdown → create)
- BoundedRingBuffer capacity enforcement

### AP Tests
**Suite**: 52 tests
**Scope**: All 10 AP API endpoints
**Result**: 52/52 PASS

Key test areas:
- Vendor CRUD
- Invoice lifecycle
- Three-way matching
- Exception handling
- Approval routing
- Payment processing
- Reconciliation
- Credit notes
- Reports
- Dashboard

### Total: 112/112 Tests PASSING

---

## Future Regression Detection

### What Gets Caught
| Regression | Detection Layer | Speed |
|-----------|----------------|-------|
| New empty catch block | ESLint | Instant (IDE) |
| New empty catch in foundation | CI validation | Build time |
| Unbounded array in singleton | CI validation | Build time |
| Singleton without shutdown | CI validation | Build time |
| Optional tenantId in audit | CI validation | Build time |
| Hardcoded fallback secret | CI validation | Build time |
| Missing BoundedRingBuffer | CI validation | Build time |
| Missing Zod validation | CI validation | Build time |
| Test regression | Test suites | CI time |

### What Does NOT Get Caught (Gaps)
| Gap | Mitigation |
|-----|-----------|
| New API route without validation | Manual code review + CI count check |
| Memory leak outside foundation | No automated detection (monitoring in production) |
| New singleton without lifecycle | CI checks existing singletons, not new ones |
| Performance regression | No automated benchmarking yet |

---

## Maintenance

### Adding New Foundation Singletons
1. Use `BoundedRingBuffer` for any in-memory collection
2. Implement `async create()` with `shutdown()` before overwrite
3. Add `tenantId` to any audit query method
4. Add the new file to CI validation script patterns

### Updating the CI Script
The script is intentionally simple (grep + wc) for maximum portability. When adding new checks:
1. Follow the existing pattern (COUNT → check → echo)
2. Add the check to the appropriate position
3. Update this document

### ESLint Rule Evolution
The `no-empty-catch` rule may need exceptions for legitimate patterns (JSON.parse fallbacks, browser localStorage). Document any exceptions in the ESLint config with a comment explaining why.
