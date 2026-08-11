import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/server/db/prisma";
import { ExecutiveCommandCenter } from "@/modules/executive-command-center";
import type { TenantContext } from "@/server/context/tenant-context";

interface TestContext {
  companyId: string;
  userId: string;
  cleanup: (() => Promise<unknown>)[];
}

async function createTestData(): Promise<TestContext> {
  const cleanup: TestContext["cleanup"] = [];

  const company = await prisma.company.create({
    data: { name: `ECC Test ${Date.now()}`, slug: `ecc-${Date.now()}` },
  });
  cleanup.push(() => prisma.company.delete({ where: { id: company.id } }).catch(() => {}));

  const user = await prisma.user.create({
    data: {
      email: `ecc-${Date.now()}@perionyx.test`,
      name: "Executive Test",
    },
  });
  cleanup.push(() => prisma.user.delete({ where: { id: user.id } }).catch(() => {}));

  return { companyId: company.id, userId: user.id, cleanup };
}

async function cleanupTestData(ctx: TestContext): Promise<void> {
  for (const fn of ctx.cleanup.reverse()) {
    await fn();
  }
}

describe("ExecutiveCommandCenter.getExecutiveDashboard", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestData();

    // Seed a critical treasury alert so the treasury specialist returns a
    // non-empty AlertSummary object ({ totalActive, bySeverity, byType,
    // criticalAlerts }). This exercises the exact contract that previously
    // crashed _composeAlerts / _composeRiskSummary, which called .slice()
    // on the object instead of the criticalAlerts array.
    const alert = await prisma.treasurySpecialistAlert.create({
      data: {
        companyId: ctx.companyId,
        alertType: "cash",
        severity: "critical",
        title: "Critical cash buffer breach",
        description: "Operating cash below minimum threshold",
        businessReason: "Treasury policy C-1",
        confidence: 0.95,
        source: "TreasuryRiskService",
        status: "active",
      },
    });
    ctx.cleanup.push(() =>
      prisma.treasurySpecialistAlert.delete({ where: { id: alert.id } }).catch(() => {}),
    );
  });

  afterAll(async () => {
    await cleanupTestData(ctx);
  });

  it("composes the dashboard without throwing on treasury alert summaries", async () => {
    const tenant: TenantContext = {
      companyId: ctx.companyId,
      userId: ctx.userId,
      role: "OWNER",
    };

    const result = await ExecutiveCommandCenter.getExecutiveDashboard(tenant);

    expect(result).toHaveProperty("healthScore");
    expect(result).toHaveProperty("kpis");
    expect(Array.isArray(result.alerts)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(Array.isArray(result.riskSummary.topRisks)).toBe(true);
    expect(result.companyId).toBe(ctx.companyId);

    // The seeded critical treasury alert must surface in the alert feed —
    // evidence that the producer's alert items were actually consumed.
    const treasuryAlerts = result.alerts.filter((a) => a.source === "treasury");
    expect(treasuryAlerts.length).toBeGreaterThanOrEqual(1);
    expect(treasuryAlerts.some((a) => a.title === "Critical cash buffer breach")).toBe(true);
  });
});
