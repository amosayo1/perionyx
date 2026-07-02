import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

/** Tracks created IDs for cleanup after tests. */
const createdIds: { model: string; id: string }[] = [];

export function track(model: string, id: string): void {
  createdIds.push({ model, id });
}

/** Clean up all tracked IDs in dependency order. */
export async function cleanup(): Promise<void> {
  const order = [
    "reconciliationReport",
    "reconciliationException",
    "reconciliationRun",
    "ledgerEntry",
    "transactionApproval",
    "approvalStep",
    "approvalCondition",
    "calendarEvent",
    "approvalComment",
    "approvalParticipant",
    "approvalThread",
    "transaction",
    "settlementRecord",
    "wallet",
    "companyMembership",
    "userRole",
    "auditLog",
    "notification",
    "notificationPreference",
    "notificationChannel",
    "exchangeRate",
    "riskAlert",
    "riskIncident",
    "connectorConfig",
    "treasuryAccount",
    "internalTransfer",
    "accountControl",
    "policyTestResult",
    "policyRule",
    "policy",
    "connectorRun",
    "connectorEvent",
    "user",
    "company",
  ];
  for (const model of order) {
    const ids = createdIds.filter((c) => c.model === model).map((c) => c.id);
    if (ids.length === 0) continue;
    try {
      await (prisma as any)[model].deleteMany({ where: { id: { in: ids } } });
    } catch {
      // ignore if table doesn't exist or FK blocks
    }
  }
  createdIds.length = 0;
}

/**
 * Run a test callback inside a Prisma transaction that rolls back on completion.
 * Use this for new tests to avoid manual cleanup.
 */
export async function withTestDb<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  return prisma.$transaction(
    async (tx) => {
      try {
        return await fn(tx);
      } finally {
        throw new Error("__ROLLBACK__");
      }
    },
    { isolationLevel: "Serializable", maxWait: 5000, timeout: 10000 },
  ).catch((err) => {
    if (err instanceof Error && err.message === "__ROLLBACK__") {
      return undefined as unknown as T;
    }
    throw err;
  });
}

export function buildTenantContext(
  companyId: string,
  overrides?: Partial<TenantContext>,
): TenantContext {
  return {
    userId: overrides?.userId ?? "test-user",
    companyId,
    role: overrides?.role ?? "OWNER",
  };
}
