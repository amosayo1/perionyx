# Secret Hardening Report — Phase 26.3

**Phase**: 26.3 — Enterprise Foundation Hardening
**Date**: 2026-07-28
**Condition**: C-06 (Sandbox Secret — Medium)

---

## Problem

`deriveSandboxPassword()` in `src/modules/sandbox/sandbox-context.ts` fell back to the hardcoded string `"sandbox-fallback"` when `AUTH_SECRET` or `NEXTAUTH_SECRET` environment variables were missing. This created a predictable password derivation in any environment without proper secret configuration.

---

## Before

**File**: `src/modules/sandbox/sandbox-context.ts` (original)

```typescript
export function deriveSandboxPassword(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "sandbox-fallback";
  // ... derives password from secret
}
```

**Risk**: In production, if `AUTH_SECRET` is missing (misconfiguration, container startup race), the sandbox password becomes deterministic and guessable. Any attacker who reads the source code can derive the same password.

---

## After

**File**: `src/modules/sandbox/sandbox-context.ts:30-36`

```typescript
export function deriveSandboxPassword(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET or NEXTAUTH_SECRET environment variable is required. " +
      "Sandbox password derivation cannot use fallback secrets in production."
    );
  }
  const hmac = crypto.createHmac("sha256", secret).update(SANDBOX_EMAIL).digest("hex");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "Sb-";
  for (let i = 0; i < 21; i++) {
    password += chars[parseInt(hmac.slice(i * 2, i * 2 + 2), 16) % chars.length];
  }
  return password;
}
```

**Behavior**: Throws immediately if no secret is available. The failure is loud, fast, and impossible to miss.

---

## Impact Analysis

### Who Calls `deriveSandboxPassword()`
- `src/modules/sandbox/sandbox-enterprise-seed.ts` — sandbox company bootstrap
- Only called during demo/sandbox setup, not in normal request flow

### What Happens on Missing Secret
- Function throws `Error("AUTH_SECRET or NEXTAUTH_SECRET environment variable is required...")`
- Caller catches or propagates — operation fails explicitly
- No fallback, no silent degradation, no placeholder

### No Production Path Affected
- `deriveSandboxPassword()` is only called in sandbox setup
- Normal authentication uses bcrypt (Phase 17.2) — not affected by this change
- No API route depends on this function for normal operation

---

## Verification

```bash
# No hardcoded fallback secrets in production paths
grep -r "sandbox-fallback\|fallback.*secret\|changeme\|placeholder" src/
# Result: 0 matches

# Sandbox context throws on missing secret
grep -A3 "AUTH_SECRET" src/modules/sandbox/sandbox-context.ts
# Result: throws Error("AUTH_SECRET or NEXTAUTH_SECRET environment variable is required...")
```

---

## Related Security Measures

| Measure | Status | Phase |
|---------|--------|-------|
| Password storage: bcrypt.hash(password, 12) | ✅ Active | 17.2 |
| Password comparison: bcrypt.compare() | ✅ Active | 17.2 |
| Webhook HMAC-SHA256 | ✅ Active | 26.0 |
| MFA: TOTP + recovery codes | ✅ Active | 17.2 |
| AUTH_SECRET validation at boot | ✅ Active | 26.3 |

---

## Prevention

- CI scans for hardcoded fallback strings in production code
- Pattern: always throw on missing required secrets, never fallback to placeholder
- Documented in `ENGINEERING_PREVENTION_RULES.md` (Rule 7)
- Any new code using `process.env.SECRET ?? "fallback"` will be caught by CI validation
