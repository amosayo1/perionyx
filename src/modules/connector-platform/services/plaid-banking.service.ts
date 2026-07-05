import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { recordAudit } from "@/modules/audit";
import type {
  NormalizedExternalAccount,
  NormalizedBalance,
  NormalizedTransaction,
} from "@/modules/financial-mapping/types";

type SyncLogCounts = {
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
};

export class PlaidBankingService {
  async createExternalAccount(companyId: string, normalized: NormalizedExternalAccount & { itemId?: string }) {
    return prisma.externalAccount.upsert({
      where: {
        companyId_externalId_source: {
          companyId,
          externalId: normalized.externalId,
          source: "plaid",
        },
      },
      update: {
        itemId: normalized.itemId ?? null,
        institutionName: normalized.institutionName ?? null,
        institutionId: normalized.institutionId ?? null,
        name: normalized.name,
        officialName: normalized.officialName ?? null,
        type: normalized.type ?? null,
        subtype: normalized.subtype ?? null,
        mask: normalized.mask ?? null,
        currency: normalized.currency,
      },
      create: {
        companyId,
        source: "plaid",
        externalId: normalized.externalId,
        itemId: normalized.itemId ?? null,
        institutionName: normalized.institutionName ?? null,
        institutionId: normalized.institutionId ?? null,
        name: normalized.name,
        officialName: normalized.officialName ?? null,
        type: normalized.type ?? null,
        subtype: normalized.subtype ?? null,
        mask: normalized.mask ?? null,
        currency: normalized.currency,
      },
    });
  }

  async createExternalBalance(companyId: string, normalized: NormalizedBalance) {
    return prisma.externalBalance.create({
      data: {
        companyId,
        source: "plaid",
        externalAccountId: normalized.externalAccountId,
        current: normalized.current,
        available: normalized.available ?? null,
        limit: normalized.limit ?? null,
        currency: normalized.currency,
        recordedAt: normalized.recordedAt,
      },
    });
  }

  async upsertExternalTransaction(companyId: string, normalized: NormalizedTransaction) {
    return prisma.externalTransaction.upsert({
      where: {
        companyId_externalId_source: {
          companyId,
          externalId: normalized.externalId,
          source: "plaid",
        },
      },
      update: {
        amount: normalized.amount,
        currency: normalized.currency,
        description: normalized.description ?? null,
        merchantName: normalized.merchantName ?? null,
        category: normalized.category ?? null,
        categoryId: normalized.categoryId ?? null,
        pending: normalized.pending,
        transactionDate: normalized.transactionDate ?? null,
        postDate: normalized.postDate ?? null,
        paymentChannel: normalized.paymentChannel ?? null,
        transactionType: normalized.transactionType ?? null,
        isoCurrencyCode: normalized.isoCurrencyCode ?? null,
        pendingExternalId: normalized.pendingExternalId ?? null,
      },
      create: {
        companyId,
        source: "plaid",
        externalId: normalized.externalId,
        externalAccountId: normalized.externalAccountId,
        amount: normalized.amount,
        currency: normalized.currency,
        description: normalized.description ?? null,
        merchantName: normalized.merchantName ?? null,
        category: normalized.category ?? null,
        categoryId: normalized.categoryId ?? null,
        pending: normalized.pending,
        transactionDate: normalized.transactionDate ?? null,
        postDate: normalized.postDate ?? null,
        paymentChannel: normalized.paymentChannel ?? null,
        transactionType: normalized.transactionType ?? null,
        isoCurrencyCode: normalized.isoCurrencyCode ?? null,
        pendingExternalId: normalized.pendingExternalId ?? null,
      },
    });
  }

  async getExternalAccounts(companyId: string) {
    return prisma.externalAccount.findMany({
      where: { companyId, source: "plaid" },
      orderBy: { name: "asc" },
    });
  }

  async findExternalAccountByExternalId(companyId: string, externalId: string) {
    return prisma.externalAccount.findFirst({
      where: { companyId, externalId, source: "plaid" },
    });
  }

  async getExternalBalances(companyId: string, accountId?: string) {
    const where: Record<string, unknown> = { companyId, source: "plaid" };
    if (accountId) where.externalAccountId = accountId;
    return prisma.externalBalance.findMany({
      where: where as any,
      orderBy: { recordedAt: "desc" },
      take: 100,
    });
  }

  async getExternalTransactions(
    companyId: string,
    accountId?: string,
    opts?: { limit?: number; cursor?: string; offset?: number },
  ) {
    const where: Record<string, unknown> = { companyId, source: "plaid" };
    if (accountId) where.externalAccountId = accountId;
    const limit = opts?.limit ?? 50;
    const items = await prisma.externalTransaction.findMany({
      where: where as any,
      orderBy: { transactionDate: "desc" },
      take: limit + 1,
      ...(opts?.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
      ...(opts?.offset ? { skip: opts.offset } : {}),
    });
    let nextCursor: string | undefined;
    if (items.length > limit) {
      items.pop();
      nextCursor = items[items.length - 1]?.id;
    }
    return { items, nextCursor };
  }

  async createSyncLog(
    companyId: string,
    connectorId: string,
    source: string,
    syncType: string,
    status: string,
    counts: SyncLogCounts,
  ) {
    return prisma.syncLog.create({
      data: {
        companyId,
        connectorId,
        source,
        syncType,
        status,
        recordsProcessed: counts.recordsProcessed,
        recordsCreated: counts.recordsCreated,
        recordsUpdated: counts.recordsUpdated,
        recordsFailed: counts.recordsFailed,
        startedAt: new Date(),
        completedAt: status === "running" ? null : new Date(),
      },
    });
  }

  async updateConnectionStatus(companyId: string, connectorId: string, status: string) {
    const existing = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId },
      select: { config: true, version: true },
    });
    if (!existing) return;
    const cfg = existing.config as Record<string, unknown>;
    cfg.healthStatus = status === "active" ? "GOOD" : status;
    cfg.lastHealthCheckAt = new Date().toISOString();
    const pbResult = await prisma.connectorConfig.updateMany({
      where: { id: connectorId, version: existing.version },
      data: { config: cfg as any, version: { increment: 1 } },
    });
    if (pbResult.count === 0) {
      const { ConflictError } = await import("@/lib/errors/app-error");
      throw new ConflictError("Concurrent modification detected — Plaid banking connection status update conflicted.");
    }

    await recordAudit(prisma, {
      companyId,
      action: "CONNECTOR_STATUS_UPDATED",
      resourceType: "ConnectorConfig",
      resourceId: connectorId,
      metadata: { status, provider: "plaid" },
    });
  }
}
