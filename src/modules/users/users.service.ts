import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import { sessionValidationStore } from "@/server/security/session-validation-store";

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
  if (!user?.passwordHash || !user.email) {
    return null;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { locked: true as const, remainingMinutes: Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000) };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const data: { failedLoginAttempts: number; lockedUntil?: Date } = { failedLoginAttempts: attempts };
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      data.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    }
    await prisma.user.update({ where: { id: user.id }, data });
    return null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  return { id: user.id, email: user.email, name: user.name };
}

export async function createPasswordUser(input: {
  email: string;
  password: string;
  name?: string | null;
}) {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  return prisma.user.create({
    data: {
      email: normalizeEmail(input.email),
      passwordHash,
      name: input.name ?? undefined,
    },
  });
}

/**
 * Change a user's password and invalidate all active sessions.
 * Returns true on success, false if current password is wrong.
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) {
    return { success: false, reason: "Unable to change password" };
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, reason: "Current password is incorrect" };
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newHash,
      tokenVersion: { increment: 1 },
    },
  });
  sessionValidationStore.recordRevocation(userId);

  return { success: true };
}

/**
 * Reset a user's password (admin or forgot-password flow) and invalidate all sessions.
 */
export async function resetPassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newHash,
      tokenVersion: { increment: 1 },
    },
  });
  sessionValidationStore.recordRevocation(userId);
}

/**
 * Disable a user account and invalidate all active sessions.
 *
 * INTERNAL USE ONLY — not exposed through any API endpoint.
 * Administrative suspension and account deprovisioning will be built
 * as part of the Enterprise IAM module, which will enforce RBAC/ABAC,
 * record the acting administrator and reason, generate audit events,
 * and integrate with the Governance Constitution and Audit Logger.
 */
export async function disableUser(
  userId: string,
): Promise<{ success: boolean }> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      lockedUntil: new Date("9999-12-31T23:59:59Z"), // effectively permanent lock
      tokenVersion: { increment: 1 },
    },
  });
  sessionValidationStore.recordRevocation(userId);
  return { success: true };
}

/**
 * Re-enable a disabled user account.
 */
export async function enableUser(
  userId: string,
): Promise<{ success: boolean }> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      lockedUntil: null,
      failedLoginAttempts: 0,
    },
  });
  return { success: true };
}

/**
 * Lock a user account (e.g., after repeated failed attempts) and invalidate active sessions.
 *
 * INTERNAL USE ONLY — not exposed through any API endpoint.
 * The current automatic lockout mechanism (via verifyCredentials) is intended solely
 * for temporary protection against repeated failed login attempts.
 * Administrative suspension will be built as part of the Enterprise IAM module.
 */
export async function lockAccount(
  userId: string,
  durationMs: number = LOCKOUT_DURATION_MS,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      lockedUntil: new Date(Date.now() + durationMs),
      tokenVersion: { increment: 1 },
    },
  });
  sessionValidationStore.recordRevocation(userId);
}

/**
 * Unlock a user account.
 */
export async function unlockAccount(
  userId: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      lockedUntil: null,
      failedLoginAttempts: 0,
    },
  });
}

/**
 * Get user by ID (for admin operations).
 */
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      lockedUntil: true,
      failedLoginAttempts: true,
      tokenVersion: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
