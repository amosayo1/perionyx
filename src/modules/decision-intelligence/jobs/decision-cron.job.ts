import { prisma } from "@/server/db/prisma";
import { registerHandler, scheduleCron } from "@/modules/queue/queue.service";
import { DecisionService } from "../decision.service";
import { generateDecisionBriefing } from "../briefing";
import type { TenantContext } from "@/server/context/tenant-context";
import type { CompanyRole } from "@prisma/client";

const decisionService = new DecisionService();

function systemContext(companyId: string): TenantContext {
  return { companyId, userId: "system", role: "ADMIN" as CompanyRole };
}

export async function startDecisionCronJobs(): Promise<void> {
  registerHandler("decisions-daily", dailyDecisionHandler);
  registerHandler("decisions-hourly", hourlyDecisionHandler);

  await scheduleCron("decisions-daily", "0 5 * * *", {
    type: "decisions-daily",
    data: {},
  });
  await scheduleCron("decisions-hourly", "0 * * * *", {
    type: "decisions-hourly",
    data: {},
  });

  console.log("[DecisionCron] Jobs registered and scheduled");
}

async function dailyDecisionHandler(_job: { id: string; data: any }): Promise<void> {
  const companies = await prisma.company.findMany({ select: { id: true } });

  for (const company of companies) {
    try {
      const ctx = systemContext(company.id);
      await decisionService.evaluateAll(ctx);
      await generateDecisionBriefing(ctx, "daily");
      console.log(`[DecisionCron] Daily run complete for ${company.id}`);
    } catch (err) {
      console.error(`[DecisionCron] Daily run failed for ${company.id}:`, err);
    }
  }
}

async function hourlyDecisionHandler(_job: { id: string; data: any }): Promise<void> {
  const companies = await prisma.company.findMany({ select: { id: true } });

  for (const company of companies) {
    try {
      const ctx = systemContext(company.id);
      await decisionService.getTopDecisions(ctx);
    } catch (err) {
      console.error(`[DecisionCron] Hourly run failed for ${company.id}:`, err);
    }
  }
}
