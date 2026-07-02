import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { ValidationError } from "@/lib/errors/app-error";

type CursorOpts = {
  limit?: number;
  cursor?: string;
};

type InstitutionGroup = {
  institutionName: string | null;
  institutionId: string | null;
  accounts: Array<{
    id: string;
    source: string;
    externalId: string;
    name: string;
    type: string | null;
    subtype: string | null;
    mask: string | null;
    currency: string;
    linked: boolean;
    treasuryAccountId: string | null;
    latestBalance: {
      current: string;
      available: string | null;
      limit: string | null;
      currency: string;
      recordedAt: string;
    } | null;
  }>;
  syncHealth: {
    lastSyncAt: string | null;
    lastSyncStatus: string | null;
    lastSyncType: string | null;
    recordsProcessed: number;
  };
};

export class ExternalBankingService {
  static async listConnectedInstitutions(ctx: TenantContext) {
    const accounts = await prisma.externalAccount.findMany({
      where: { companyId: ctx.companyId },
      orderBy: [{ institutionName: "asc" }, { name: "asc" }],
      include: {
        balances: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
        syncLogs: {
          orderBy: { startedAt: "desc" },
          take: 1,
        },
      },
    });

    const grouped = new Map<string, InstitutionGroup>();

    for (const account of accounts) {
      const key = account.institutionName ?? account.institutionId ?? "__unknown__";
      if (!grouped.has(key)) {
        grouped.set(key, {
          institutionName: account.institutionName,
          institutionId: account.institutionId,
          accounts: [],
          syncHealth: {
            lastSyncAt: null,
            lastSyncStatus: null,
            lastSyncType: null,
            recordsProcessed: 0,
          },
        });
      }

      const group = grouped.get(key)!;

      const latestBalance = account.balances[0]
        ? {
            current: account.balances[0].current.toString(),
            available: account.balances[0].available?.toString() ?? null,
            limit: account.balances[0].limit?.toString() ?? null,
            currency: account.balances[0].currency,
            recordedAt: account.balances[0].recordedAt.toISOString(),
          }
        : null;

      group.accounts.push({
        id: account.id,
        source: account.source,
        externalId: account.externalId,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask,
        currency: account.currency,
        linked: account.treasuryAccountId !== null,
        treasuryAccountId: account.treasuryAccountId,
        latestBalance,
      });

      const latestSync = account.syncLogs[0];
      if (latestSync) {
        if (
          !group.syncHealth.lastSyncAt ||
          latestSync.startedAt > new Date(group.syncHealth.lastSyncAt)
        ) {
          group.syncHealth = {
            lastSyncAt: latestSync.startedAt.toISOString(),
            lastSyncStatus: latestSync.status,
            lastSyncType: latestSync.syncType,
            recordsProcessed: latestSync.recordsProcessed,
          };
        }
      }
    }

    return Array.from(grouped.values());
  }

  static async getExternalAccount(ctx: TenantContext, accountId: string) {
    const account = await prisma.externalAccount.findFirst({
      where: { id: accountId, companyId: ctx.companyId },
      include: {
        treasuryAccount: {
          select: { id: true, name: true, currency: true },
        },
        balances: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!account) return null;

    const latestBalance = account.balances[0]
      ? {
          current: account.balances[0].current.toString(),
          available: account.balances[0].available?.toString() ?? null,
          limit: account.balances[0].limit?.toString() ?? null,
          currency: account.balances[0].currency,
          recordedAt: account.balances[0].recordedAt.toISOString(),
        }
      : null;

    return {
      id: account.id,
      source: account.source,
      externalId: account.externalId,
      itemId: account.itemId,
      institutionName: account.institutionName,
      institutionId: account.institutionId,
      name: account.name,
      officialName: account.officialName,
      type: account.type,
      subtype: account.subtype,
      mask: account.mask,
      currency: account.currency,
      treasuryAccount: account.treasuryAccount,
      latestBalance,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }

  static async getExternalBalances(ctx: TenantContext, accountId: string, opts?: CursorOpts) {
    const limit = opts?.limit ?? 50;
    const rows = await prisma.externalBalance.findMany({
      where: {
        companyId: ctx.companyId,
        externalAccountId: accountId,
      },
      orderBy: [{ recordedAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(opts?.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) {
      rows.pop();
      nextCursor = rows[rows.length - 1]?.id;
    }

    return {
      items: rows.map((b) => ({
        id: b.id,
        source: b.source,
        current: b.current.toString(),
        available: b.available?.toString() ?? null,
        limit: b.limit?.toString() ?? null,
        currency: b.currency,
        recordedAt: b.recordedAt.toISOString(),
      })),
      nextCursor,
    };
  }

  static async getExternalTransactions(ctx: TenantContext, accountId: string, opts?: CursorOpts) {
    const limit = opts?.limit ?? 50;
    const rows = await prisma.externalTransaction.findMany({
      where: {
        companyId: ctx.companyId,
        externalAccountId: accountId,
      },
      orderBy: [{ transactionDate: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(opts?.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) {
      rows.pop();
      nextCursor = rows[rows.length - 1]?.id;
    }

    return {
      items: rows.map((t) => ({
        id: t.id,
        source: t.source,
        externalId: t.externalId,
        amount: t.amount.toString(),
        currency: t.currency,
        description: t.description,
        merchantName: t.merchantName,
        category: t.category,
        pending: t.pending,
        transactionDate: t.transactionDate?.toISOString() ?? null,
        postDate: t.postDate?.toISOString() ?? null,
        paymentChannel: t.paymentChannel,
        transactionType: t.transactionType,
        pendingExternalId: t.pendingExternalId,
      })),
      nextCursor,
    };
  }

  static async getSyncHistory(ctx: TenantContext, connectorId?: string) {
    const where: Prisma.SyncLogWhereInput = { companyId: ctx.companyId };
    if (connectorId) {
      where.connectorId = connectorId;
    }

    const logs = await prisma.syncLog.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: 100,
      include: {
        externalAccount: {
          select: { id: true, name: true },
        },
      },
    });

    const summaries = await prisma.syncLog.groupBy({
      by: ["status"],
      where: { companyId: ctx.companyId, ...(connectorId ? { connectorId } : {}) },
      _count: { id: true },
    });

    return {
      summaries: Object.fromEntries(summaries.map((s) => [s.status, s._count.id])),
      logs: logs.map((l) => ({
        id: l.id,
        connectorId: l.connectorId,
        source: l.source,
        syncType: l.syncType,
        status: l.status,
        externalAccount: l.externalAccount
          ? { id: l.externalAccount.id, name: l.externalAccount.name }
          : null,
        recordsProcessed: l.recordsProcessed,
        recordsCreated: l.recordsCreated,
        recordsUpdated: l.recordsUpdated,
        recordsFailed: l.recordsFailed,
        errorMessage: l.errorMessage,
        startedAt: l.startedAt.toISOString(),
        completedAt: l.completedAt?.toISOString() ?? null,
      })),
    };
  }

  static async getConnectionHealth(ctx: TenantContext) {
    const [accounts, syncLogs] = await Promise.all([
      prisma.externalAccount.findMany({
        where: { companyId: ctx.companyId },
        select: {
          id: true,
          source: true,
          institutionName: true,
          treasuryAccountId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.syncLog.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { startedAt: "desc" },
        take: 1000,
        select: {
          connectorId: true,
          status: true,
          syncType: true,
          startedAt: true,
          completedAt: true,
          recordsProcessed: true,
          errorMessage: true,
        },
      }),
    ]);

    const latestSyncPerConnector = new Map<string, (typeof syncLogs)[0]>();
    for (const log of syncLogs) {
      if (!latestSyncPerConnector.has(log.connectorId)) {
        latestSyncPerConnector.set(log.connectorId, log);
      }
    }

    const connectorIds = [...new Set(syncLogs.map((l) => l.connectorId))];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last30dSyncs = syncLogs.filter((l) => l.startedAt > thirtyDaysAgo);

    const connectors = connectorIds.map((connectorId) => {
      const latest = latestSyncPerConnector.get(connectorId);
      const connectorLogs = syncLogs.filter(
        (l) => l.connectorId === connectorId && l.startedAt > thirtyDaysAgo,
      );
      const total = connectorLogs.length;
      const completed = connectorLogs.filter((l) => l.status === "completed").length;
      return {
        connectorId,
        healthy: total > 0 ? completed / total >= 0.8 : true,
        lastSyncAt: latest?.startedAt.toISOString() ?? null,
        lastSyncStatus: latest?.status ?? null,
        lastErrorMessage: latest?.errorMessage ?? null,
        syncCount30d: total,
        failureCount30d: connectorLogs.filter((l) => l.status === "failed").length,
      };
    });

    return {
      totalConnections: accounts.length,
      linkedConnections: accounts.filter((a) => a.treasuryAccountId).length,
      unlinkedConnections: accounts.filter((a) => !a.treasuryAccountId).length,
      connectors,
      overallHealth30d: {
        totalSyncs: last30dSyncs.length,
        success: last30dSyncs.filter((l) => l.status === "completed").length,
        failed: last30dSyncs.filter((l) => l.status === "failed").length,
        running: last30dSyncs.filter((l) => l.status === "running").length,
        successRate:
          last30dSyncs.length > 0
            ? Math.round(
                (last30dSyncs.filter((l) => l.status === "completed").length /
                  last30dSyncs.length) *
                  100,
              )
            : 100,
      },
    };
  }

  static async linkExternalAccount(
    ctx: TenantContext,
    externalAccountId: string,
    treasuryAccountId: string,
  ) {
    const externalAccount = await prisma.externalAccount.findFirst({
      where: { id: externalAccountId, companyId: ctx.companyId },
    });
    if (!externalAccount) {
      throw new ValidationError("External account not found");
    }

    const treasuryAccount = await prisma.treasuryAccount.findFirst({
      where: { id: treasuryAccountId, companyId: ctx.companyId },
    });
    if (!treasuryAccount) {
      throw new ValidationError("Treasury account not found");
    }

    if (externalAccount.treasuryAccountId === treasuryAccountId) {
      return { linked: true, externalAccountId, treasuryAccountId };
    }

    const updated = await prisma.externalAccount.update({
      where: { id: externalAccountId },
      data: { treasuryAccountId },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "EXTERNAL_ACCOUNT_LINKED",
      resourceType: "ExternalAccount",
      resourceId: externalAccountId,
      metadata: {
        treasuryAccountId,
        institutionName: externalAccount.institutionName,
        accountName: externalAccount.name,
      },
    });

    return {
      linked: true,
      externalAccountId: updated.id,
      treasuryAccountId: updated.treasuryAccountId,
    };
  }

  static async getRegionalBankingStructure(ctx: TenantContext): Promise<{
    region: string;
    institutions: { name: string; accountCount: number; currencies: string[]; totalBalance: string }[];
  }[]> {
    const accounts = await prisma.externalAccount.findMany({
      where: { companyId: ctx.companyId },
      include: { balances: { orderBy: { recordedAt: "desc" }, take: 1 } },
    });

    const byCountry = new Map<string, Map<string, { count: number; currencies: Set<string>; total: number }>>();

    for (const acct of accounts) {
      const region = acct.institutionName ?? "Other";
      const inst = acct.institutionName ?? "Unknown";
      if (!byCountry.has(region)) byCountry.set(region, new Map());
      const instMap = byCountry.get(region)!;
      if (!instMap.has(inst)) instMap.set(inst, { count: 0, currencies: new Set(), total: 0 });
      const entry = instMap.get(inst)!;
      entry.count++;
      entry.currencies.add(acct.currency);
      entry.total += Number(acct.balances?.[0]?.current ?? 0);
    }

    return Array.from(byCountry.entries()).map(([region, insts]) => ({
      region,
      institutions: Array.from(insts.entries()).map(([name, data]) => ({
        name,
        accountCount: data.count,
        currencies: Array.from(data.currencies),
        totalBalance: data.total.toFixed(2),
      })),
    }));
  }
}
