import "dotenv/config";
import { describe, it, expect, afterAll, afterEach, vi } from "vitest";
import { prisma } from "@/server/db/prisma";
import { createCompany } from "../test/helpers/factories";
import { cleanup } from "../test/helpers/db";
import { SYSTEM_ACTOR_ID } from "@/modules/queue/jobs/job-utils";
import { AuditAction } from "@/domain/constants/audit-actions";
import { createFxProvider, MockFxProvider } from "@/modules/fx/fx.provider";

vi.mock("@/modules/fx/fx.provider", async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import("@/modules/fx/fx.provider");
  return {
    ...actual,
    createFxProvider: vi.fn(actual.createFxProvider),
  };
});

afterAll(cleanup);

beforeEach(() => {
  vi.mocked(createFxProvider).mockImplementation(() => new MockFxProvider());
});

afterEach(() => {
  vi.mocked(createFxProvider).mockImplementation(() => new MockFxProvider());
});

describe("FxSync — system actor audit", () => {
  it("records FX_RATE_SYNC with NULL actor on success and persists rates", async () => {
    const company = await createCompany();
    const { FxService } = await import("@/modules/fx/fx.service");

    const result = await FxService.syncRates(company.id, SYSTEM_ACTOR_ID);

    expect(result.success).toBe(true);
    expect(result.currenciesUpdated).toBeGreaterThan(0);

    const rateCount = await prisma.exchangeRate.count({ where: { companyId: company.id } });
    expect(rateCount).toBeGreaterThan(0);

    const audit = await prisma.auditLog.findFirst({
      where: { companyId: company.id, action: AuditAction.FX_RATE_SYNC },
      orderBy: { createdAt: "desc" },
    });
    expect(audit).not.toBeNull();
    expect(audit!.actorUserId).toBeNull();
  });

  it("preserves the original provider error and records FX_RATE_SYNC_FAILED with NULL actor without throwing a second error", async () => {
    const company = await createCompany();
    const { FxService } = await import("@/modules/fx/fx.service");
    vi.mocked(createFxProvider).mockImplementation(() => ({
      getRates: async () => {
        throw new Error("provider down");
      },
    }));

    const result = await FxService.syncRates(company.id, SYSTEM_ACTOR_ID);

    expect(result.success).toBe(false);
    expect(result.error).toBe("provider down");

    const audit = await prisma.auditLog.findFirst({
      where: { companyId: company.id, action: AuditAction.FX_RATE_SYNC_FAILED },
      orderBy: { createdAt: "desc" },
    });
    expect(audit).not.toBeNull();
    expect(audit!.metadata).toMatchObject({ error: "provider down" });
    expect(audit!.actorUserId).toBeNull();
  });
});

describe("FxSyncCron — hourly cron", () => {
  it("syncs FX rates for real companies and completes without FK failures", async () => {
    const company = await createCompany();
    const { handleFxSyncCron } = await import("@/modules/queue/jobs/fx-sync.job");

    await expect(handleFxSyncCron()).resolves.toBeUndefined();

    const rateCount = await prisma.exchangeRate.count({ where: { companyId: company.id } });
    expect(rateCount).toBeGreaterThan(0);

    const audit = await prisma.auditLog.findFirst({
      where: { companyId: company.id, action: AuditAction.FX_RATE_SYNC },
      orderBy: { createdAt: "desc" },
    });
    expect(audit).not.toBeNull();
    expect(audit!.actorUserId).toBeNull();
  });
});

describe("Audit invariant", () => {
  it("never persists the zero-UUID system sentinel into AuditLog.actorUserId", async () => {
    const count = await prisma.auditLog.count({
      where: { actorUserId: SYSTEM_ACTOR_ID },
    });
    expect(count).toBe(0);
  });
});
