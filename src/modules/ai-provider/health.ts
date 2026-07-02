import { prisma } from "@/server/db/prisma";
import type { AiProviderKind, ProviderHealth } from "./types";

class ProviderHealthMonitor {
  private healthCache = new Map<AiProviderKind, ProviderHealth>();

  async recordHealth(kind: AiProviderKind, health: ProviderHealth): Promise<void> {
    this.healthCache.set(kind, health);

    try {
      await prisma.aiProviderHealth.create({
        data: {
          provider: kind,
          status: health.status,
          latency: health.latency ?? null,
          error: health.error ?? null,
        },
      });
    } catch {
      // Non-critical
    }
  }

  getCachedHealth(kind: AiProviderKind): ProviderHealth | undefined {
    return this.healthCache.get(kind);
  }

  getAllCached(): Map<AiProviderKind, ProviderHealth> {
    return new Map(this.healthCache);
  }

  async getHealthHistory(kind: AiProviderKind, limit = 20): Promise<{ status: string; latency: number | null; checkedAt: Date }[]> {
    try {
      const records = await prisma.aiProviderHealth.findMany({
        where: { provider: kind },
        orderBy: { checkedAt: "desc" },
        take: limit,
        select: { status: true, latency: true, checkedAt: true },
      });
      return records;
    } catch {
      return [];
    }
  }
}

export const providerHealthMonitor = new ProviderHealthMonitor();
