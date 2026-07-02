import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

const simulationCache = new Map<string, boolean>();

export async function isSimulated(ctx: TenantContext): Promise<boolean> {
  const cached = simulationCache.get(ctx.companyId);
  if (cached !== undefined) return cached;

  const company = await prisma.company.findUnique({
    where: { id: ctx.companyId },
    select: { sandbox: true },
  });

  const result = company?.sandbox ?? false;
  simulationCache.set(ctx.companyId, result);
  return result;
}

export function clearSimulationCache(companyId: string): void {
  simulationCache.delete(companyId);
}
