import crypto from "crypto";
import { prisma } from "@/server/db/prisma";

const sandboxCache = new Map<string, boolean>();

export async function isSandboxCompany(companyId: string): Promise<boolean> {
  const cached = sandboxCache.get(companyId);
  if (cached !== undefined) return cached;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { sandbox: true },
  });

  const result = company?.sandbox ?? false;
  sandboxCache.set(companyId, result);
  return result;
}

export function clearSandboxCache(companyId: string): void {
  sandboxCache.delete(companyId);
}

export const SANDBOX_EMAIL = "sandbox-guest@perionyx.dev";

/**
 * Derive a deterministic sandbox password from server secret + email.
 * Both creation and login use the same derivation, so no plaintext is stored or exported.
 */
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

export const SANDBOX_COMPANY_SLUG = "atlas-manufacturing-group";
export const SANDBOX_COMPANY_NAME = "Atlas Manufacturing Group";
