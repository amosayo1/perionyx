# Multi-Factor Authentication Architecture

## Overview

TOTP-based MFA implementation following RFC 6238. Each factor is a 6-digit time-based one-time password with 30-second periods. All MFA state is persisted via Prisma and audited through the existing `recordIAMAudit()` pipeline.

## Enrollment Flow

```
POST /api/auth/mfa          → begin enrollment
  - Generates random 16-byte secret (crypto.randomBytes)
  - Stores hashed secret (SHA-256) in User.mfaSecret
  - Sets mfaEnabled = false until confirmed
  - Returns: { secret, otpauthUrl, recoveryCodes[] }

POST /api/auth/mfa          → confirm enrollment
  - Body: { code, secret }
  - Validates TOTP against secret with ±1 window (clock skew tolerance)
  - On success: sets mfaEnabled = true, mfaEnrolledAt = now()
  - On failure: returns generic "Invalid code" (no secret disclosure)
  - Returns: { success: true }
```

Enrollment is atomic — `mfaEnabled` stays `false` until the user proves possession with a valid TOTP code.

## Verification Flow (Login)

```
POST /api/auth/mfa/verify   → verify during login
  - Body: { code, sessionId }
  - Checks mfaRequired flag on User record
  - Validates TOTP code against stored secret (±1 window)
  - Updates mfaLastVerifiedAt on success
  - Returns: { success: true, token? }
```

If `mfaRequired` is `false`, verification is skipped entirely. The flag is set during identity provider initialization based on org-level policy or admin configuration.

## Recovery Codes

- **10 codes** generated at enrollment
- Each code: 8-character alphanumeric (A-Z, 2-9, excluding ambiguous characters)
- **Hashed at rest**: SHA-256 with per-code random salt, stored in `mfaRecoveryCodes` as JSON array of `{ hash, salt, used }` objects
- **Single-use**: `used` flag set on consumption; reused codes rejected immediately
- **Regeneration**: `POST /api/auth/mfa/regenerate-recovery` invalidates all existing codes and issues 10 new ones
- Recovery codes bypass the TOTP check — they are a separate authentication factor

## Disable Flow

```
POST /api/auth/mfa/disable  → disable MFA
  - Body: { code, reason? }
  - Accepts either a valid TOTP code or a valid recovery code
  - On success: sets mfaEnabled = false, clears mfaSecret
  - Audit-logged with reason field
```

Disabling MFA requires proof of possession (current TOTP or recovery code). There is no unauthenticated MFA disable path.

## Trusted Devices

**Not implemented yet.** Planned as a future enhancement:

- Device fingerprint + IP binding
- Configurable trust duration (7/30/90 days)
- Per-device revocation
- Stored in `MfaTrustedDevice` table (not yet created)

Trusted devices will reduce MFA friction for recurring logins from known devices.

## Audit Logging

All MFA events are recorded via `recordIAMAudit()`:

| Event | Details |
|---|---|
| `MFA_ENROLL_START` | User initiated enrollment |
| `MFA_ENROLL_CONFIRM` | User confirmed TOTP code |
| `MFA_VERIFY_SUCCESS` | TOTP verification passed |
| `MFA_VERIFY_FAILURE` | TOTP verification failed (wrong code) |
| `MFA_RECOVERY_USED` | Recovery code consumed |
| `MFA_RECOVERY_REGENERATED` | Recovery codes regenerated |
| `MFA_DISABLE` | MFA disabled (with reason) |
| `MFA_SECRET_ROTATED` | Secret rotated (admin action) |

All events include `userId`, `ipAddress`, `userAgent`, `timestamp`, and `result` (success/failure).

## Rate Limiting

MFA endpoints are rate-limited independently:

| Endpoint | Limit | Window | Action on breach |
|---|---|---|---|
| `POST /api/auth/mfa/verify` | 5 attempts | 15 minutes | Account lock attempt |
| `POST /api/auth/mfa/disable` | 3 attempts | 15 minutes | Temporary block |
| `POST /api/auth/mfa` (enroll) | 3 requests | 1 hour | Temporary block |
| `POST /api/auth/mfa/regenerate-recovery` | 1 request | 24 hours | Temporary block |

Rate limits are enforced in the proxy layer (`src/proxy.ts`) and logged for audit.

## Security Properties

- **Timing-safe comparison**: TOTP codes compared using `crypto.timingSafeEqual()` — constant-time regardless of match position
- **Clock skew tolerance**: ±1 window (±30 seconds) accepted to handle clock drift between server and authenticator
- **Recovery codes hashed at rest**: SHA-256 with per-code salt; plaintext never stored after generation
- **No secret disclosure**: error messages never reveal whether MFA is enabled, which factor failed, or how many recovery codes remain
- **Secret rotation**: supported via `POST /api/auth/mfa/rotate` — invalidates old TOTP, generates new secret, preserves recovery codes

## Prisma Schema

```prisma
model User {
  // ... existing fields ...

  // MFA fields
  mfaEnabled         Boolean   @default(false)
  mfaSecret          String?   // SHA-256 hashed
  mfaRecoveryCodes   Json?     // Array of { hash, salt, used } objects
  mfaEnrolledAt      DateTime?
  mfaLastVerifiedAt  DateTime?
  mfaRequired        Boolean   @default(false) // Set by org policy or admin
}
```

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/mfa` | Begin enrollment (returns secret + otpauth URL) |
| `GET` | `/api/auth/mfa` | Get current MFA status |
| `POST` | `/api/auth/mfa/confirm` | Confirm enrollment with TOTP code |
| `POST` | `/api/auth/mfa/verify` | Verify TOTP during login |
| `POST` | `/api/auth/mfa/disable` | Disable MFA (requires TOTP or recovery code) |
| `POST` | `/api/auth/mfa/recovery` | Verify with recovery code (login alternative) |
| `POST` | `/api/auth/mfa/regenerate-recovery` | Regenerate recovery codes |

All endpoints require a valid JWT session (except login-context verification).

## Identity Adapter Integration

In `src/server/identity/local.ts`:

- `mfaRequired` is set during identity provider initialization based on the User record in the database
- If `user.mfaRequired === true` and `user.mfaEnabled === false`, the authentication flow returns an `MFA_REQUIRED` challenge
- The client renders the MFA enrollment UI before completing login
- If `user.mfaRequired === true` and `user.mfaEnabled === true`, the verification step is enforced

## Future Enhancements

1. **WebAuthn (FIDO2)**: Hardware security key and biometric support via `SimpleWebAuthn`
2. **SSO compatibility**: MFA enforced after SSO login for high-risk actions (wire transfers, config changes)
3. **Org-level enforcement**: Admin panel to require MFA for all users in an organization
4. **Trusted device management**: Per-device trust with revocation UI
5. **MFA metrics**: Dashboard showing adoption rate, verification failures, recovery code usage
