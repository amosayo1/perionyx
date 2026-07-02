import { FxService } from "@/modules/fx/fx.service";
import { riskService, RiskService } from "@/modules/risk/risk.service";

export async function handleFxSync(job: { id: string; data: { companyId: string } }) {
  const { companyId } = job.data;
  const ctx = { companyId, userId: "00000000-0000-0000-0000-000000000000", role: "OWNER" as const };

  const result = await FxService.syncRates(companyId, ctx.userId);
  if (!result.success) {
    throw new Error(`FX sync failed for ${companyId}: ${result.error}`);
  }

  const health = await FxService.checkHealth(companyId);
  if (!health.healthy) {
    await riskService.createAlert(ctx, {
      category: "FX_SYNC",
      severity: "MEDIUM",
      title: "FX rate sync outdated",
      description: health.hoursSinceLastSync === null
        ? "No FX rate sync has ever completed."
        : `Last successful FX rate sync was ${Math.round(health.hoursSinceLastSync)} hours ago (threshold: 24h).`,
      source: "FxWorker",
      metadata: { hoursSinceLastSync: health.hoursSinceLastSync },
    });
  }
}
