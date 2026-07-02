import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";

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
