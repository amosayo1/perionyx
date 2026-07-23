import crypto from "crypto";
import { prisma } from "@/server/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logger";
import type { MFAMethod } from "./types";

// ---------------------------------------------------------------------------
// TOTP implementation using Node.js crypto (RFC 6238 / RFC 4226)
// ---------------------------------------------------------------------------

const TOTP_PERIOD = 30; // seconds
const TOTP_DIGITS = 6;
const TOTP_ALGORITHM = "sha1"; // Google Authenticator compatible
const RECOVERY_CODE_COUNT = 10;

function base32Decode(encoded: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = encoded.replace(/[\s=-]/g, "").toUpperCase();
  let bits = "";
  for (const char of cleaned) {
    const val = alphabet.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return Buffer.from(bytes);
}

function generateTOTP(secret: string, timeStep?: number): string {
  const key = base32Decode(secret);
  const step = timeStep ?? Math.floor(Date.now() / 1000 / TOTP_PERIOD);
  const stepBuffer = Buffer.alloc(8);
  stepBuffer.writeUInt32BE(0, 0);
  stepBuffer.writeUInt32BE(step, 4);

  const hmac = crypto.createHmac(TOTP_ALGORITHM, key).update(stepBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % Math.pow(10, TOTP_DIGITS)).padStart(TOTP_DIGITS, "0");
}

function generateBase32Secret(length = 20): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += alphabet[bytes[i] % 32];
  }
  return result;
}

function generateRecoveryCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(10);
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars[bytes[i] % chars.length];
    if (i === 4) code += "-";
  }
  return code;
}

function hashRecoveryCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

// ---------------------------------------------------------------------------
// MFA Service
// ---------------------------------------------------------------------------

export interface TOTPEnrollment {
  secret: string;
  uri: string;
  recoveryCodes: string[];
}

export interface MFAStatus {
  enabled: boolean;
  enrolled: boolean;
  methods: MFAMethod[];
  recoveryCodesRemaining: number;
  lastVerifiedAt: Date | null;
}

export class MFAService {
  /**
   * Begin TOTP enrollment — generates a secret and returns the provisioning URI.
   * The secret is NOT persisted until `confirmEnrollment` is called.
   */
  async beginEnrollment(userId: string, email: string): Promise<TOTPEnrollment> {
    const secret = generateBase32Secret(20);
    const issuer = "Perionyx";
    const encodedEmail = encodeURIComponent(email);
    const uri = `otpauth://totp/${issuer}:${encodedEmail}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;

    // Generate recovery codes (not yet hashed — returned in plaintext once)
    const recoveryCodes: string[] = [];
    for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
      recoveryCodes.push(generateRecoveryCode());
    }

    // Store the pending enrollment in-memory (not yet persisted to DB)
    // The caller must call confirmEnrollment to complete the flow
    this.pendingEnrollments.set(userId, { secret, recoveryCodes });

    return { secret, uri, recoveryCodes };
  }

  private pendingEnrollments = new Map<string, { secret: string; recoveryCodes: string[] }>();

  /**
   * Confirm TOTP enrollment — verifies the first code and persists to DB.
   */
  async confirmEnrollment(userId: string, totpCode: string): Promise<void> {
    const pending = this.pendingEnrollments.get(userId);
    if (!pending) {
      throw new AppError("No pending MFA enrollment. Start enrollment first.", "MFA_NO_PENDING_ENROLLMENT", 400);
    }

    // Verify the TOTP code
    if (!this.verifyTOTPCode(pending.secret, totpCode)) {
      throw new AppError("Invalid TOTP code. Please try again.", "MFA_INVALID_CODE", 400);
    }

    // Hash recovery codes for storage
    const hashedCodes = pending.recoveryCodes.map((code) =>
      JSON.stringify({ hash: hashRecoveryCode(code), used: false }),
    );

    // Persist to DB
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        mfaSecret: pending.secret,
        mfaRecoveryCodes: JSON.stringify(hashedCodes),
        mfaEnrolledAt: new Date(),
        mfaLastVerifiedAt: new Date(),
      },
    });

    this.pendingEnrollments.delete(userId);

    logger.info({ userId }, "MFA TOTP enrollment confirmed");
  }

  /**
   * Verify a TOTP code during login or sensitive action.
   */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaEnabled: true, mfaSecret: true },
    });

    if (!user?.mfaEnabled || !user.mfaSecret) {
      return false;
    }

    const valid = this.verifyTOTPCode(user.mfaSecret, code);
    if (valid) {
      await prisma.user.update({
        where: { id: userId },
        data: { mfaLastVerifiedAt: new Date() },
      });
    }

    return valid;
  }

  /**
   * Use a recovery code during login when TOTP is unavailable.
   */
  async useRecoveryCode(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaRecoveryCodes: true },
    });

    if (!user?.mfaRecoveryCodes) return false;

    let codes: Array<{ hash: string; used: boolean }>;
    try {
      codes = JSON.parse(user.mfaRecoveryCodes);
    } catch {
      return false;
    }

    const hashedInput = hashRecoveryCode(code);
    const match = codes.find((c) => c.hash === hashedInput);
    if (!match || match.used) return false;

    match.used = true;
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaRecoveryCodes: JSON.stringify(codes),
        mfaLastVerifiedAt: new Date(),
      },
    });

    logger.info({ userId }, "MFA recovery code used");
    return true;
  }

  /**
   * Disable MFA for a user. Requires current TOTP code or recovery code.
   */
  async disable(userId: string, code: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaEnabled: true, mfaSecret: true },
    });

    if (!user?.mfaEnabled) {
      throw new AppError("MFA is not enabled.", "MFA_NOT_ENABLED", 400);
    }

    // Verify identity before disabling
    const totpValid = user.mfaSecret ? this.verifyTOTPCode(user.mfaSecret, code) : false;
    const recoveryValid = await this.useRecoveryCode(userId, code);
    if (!totpValid && !recoveryValid) {
      throw new AppError("Invalid code. Cannot disable MFA without verification.", "MFA_INVALID_CODE", 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaRecoveryCodes: null,
        mfaEnrolledAt: null,
      },
    });

    logger.info({ userId }, "MFA disabled");
  }

  /**
   * Get MFA status for a user.
   */
  async getStatus(userId: string): Promise<MFAStatus> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mfaEnabled: true,
        mfaEnrolledAt: true,
        mfaLastVerifiedAt: true,
        mfaRecoveryCodes: true,
      },
    });

    if (!user?.mfaEnabled) {
      return {
        enabled: false,
        enrolled: false,
        methods: [],
        recoveryCodesRemaining: 0,
        lastVerifiedAt: null,
      };
    }

    let recoveryCodesRemaining = 0;
    if (user.mfaRecoveryCodes) {
      try {
        const codes: Array<{ hash: string; used: boolean }> = JSON.parse(user.mfaRecoveryCodes);
        recoveryCodesRemaining = codes.filter((c) => !c.used).length;
      } catch {
        // Parse error — treat as 0
      }
    }

    return {
      enabled: true,
      enrolled: !!user.mfaEnrolledAt,
      methods: ["totp"],
      recoveryCodesRemaining,
      lastVerifiedAt: user.mfaLastVerifiedAt,
    };
  }

  /**
   * Regenerate recovery codes. Requires TOTP verification.
   */
  async regenerateRecoveryCodes(userId: string, totpCode: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaEnabled: true, mfaSecret: true },
    });

    if (!user?.mfaEnabled || !user.mfaSecret) {
      throw new AppError("MFA is not enabled.", "MFA_NOT_ENABLED", 400);
    }

    if (!this.verifyTOTPCode(user.mfaSecret, totpCode)) {
      throw new AppError("Invalid TOTP code.", "MFA_INVALID_CODE", 400);
    }

    const recoveryCodes: string[] = [];
    for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
      recoveryCodes.push(generateRecoveryCode());
    }

    const hashedCodes = recoveryCodes.map((code) =>
      JSON.stringify({ hash: hashRecoveryCode(code), used: false }),
    );

    await prisma.user.update({
      where: { id: userId },
      data: { mfaRecoveryCodes: JSON.stringify(hashedCodes) },
    });

    logger.info({ userId }, "MFA recovery codes regenerated");
    return recoveryCodes;
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private verifyTOTPCode(secret: string, code: string): boolean {
    if (!code || code.length !== TOTP_DIGITS) return false;
    const currentStep = Math.floor(Date.now() / 1000 / TOTP_PERIOD);

    // Allow ±1 window (±30 seconds) for clock skew
    for (const offset of [-1, 0, 1]) {
      const expected = generateTOTP(secret, currentStep + offset);
      if (crypto.timingSafeEqual(Buffer.from(code), Buffer.from(expected))) {
        return true;
      }
    }
    return false;
  }
}

export const mfaService = new MFAService();
