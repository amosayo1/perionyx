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
export const SANDBOX_PASSWORD = "sandbox-guest-pw";
export const SANDBOX_COMPANY_SLUG = "atlas-manufacturing-group";
export const SANDBOX_COMPANY_NAME = "Atlas Manufacturing Group";
