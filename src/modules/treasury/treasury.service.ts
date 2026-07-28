import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { notificationService, NotificationService } from "@/modules/notifications";
import { logger } from "@/lib/logger";
import { ValidationError } from "@/lib/errors/app-error";
import { getCached, CacheTier, tenantKey, CacheDomains } from "@/server/cache";
import type { NormalizedLiquiditySummary, NormalizedErpPosition } from "@/modules/financial-mapping";
import { FinancialTransactionManager, RowLockManager } from "@/lib/financial-transaction";

export type TreasuryAccountSummary = {
  id: string;
  name: string;
  currency: string;
  balance: string;
  description: string | null;
  accountNumber: string | null;
  isActive: boolean;
  controls: AccountControlData[];
  createdAt: string;
};

export type AccountControlData = {
  id: string;
  type: string;
  scope: string;
  value: string;
  description: string | null;
  enabled: boolean;
};

export type InternalTransferSummary = {
  id: string;
  fromAccountName: string;
  toAccountName: string;
  amount: string;
  currency: string;
  status: string;
  reference: string | null;
  failureReason: string | null;
  createdAt: string;
};

const treasuryTxManager = new FinancialTransactionManager();
const treasuryLockManager = new RowLockManager(treasuryTxManager);

export class TreasuryService {
  static async listAccounts(ctx: TenantContext): Promise<TreasuryAccountSummary[]> {
    const accounts = await prisma.treasuryAccount.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { name: "asc" },
      include: { controls: { where: { enabled: true } } },
    });

    return accounts.map((a) => ({
      id: a.id,
      name: a.name,
      currency: a.currency,
      balance: a.balance.toString(),
      description: a.description,
      accountNumber: a.accountNumber,
      isActive: a.isActive,
      controls: a.controls.map((c) => ({
        id: c.id,
        type: c.type,
        scope: c.scope,
        value: c.value.toString(),
        description: c.description,
        enabled: c.enabled,
      })),
      createdAt: a.createdAt.toISOString(),
    }));
  }

  static async getAccount(ctx: TenantContext, accountId: string) {
    const account = await prisma.treasuryAccount.findFirst({
      where: { id: accountId, companyId: ctx.companyId },
      include: { controls: true },
    });
    if (!account) return null;

    const recentTransfers = await prisma.internalTransfer.findMany({
      where: {
        companyId: ctx.companyId,
        OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { fromAccount: { select: { name: true } }, toAccount: { select: { name: true } } },
    });

    return {
      id: account.id,
      companyId: account.companyId,
      name: account.name,
      currency: account.currency,
      balance: account.balance.toString(),
      description: account.description,
      accountNumber: account.accountNumber,
      routingInfo: account.routingInfo as Record<string, any> | null,
      isActive: account.isActive,
      plaidAccountId: account.plaidAccountId,
      plaidItemId: account.plaidItemId,
      lastSyncedAt: account.lastSyncedAt?.toISOString() ?? null,
      controls: account.controls.map((c) => ({ ...c, value: c.value.toString() })),
      recentTransfers: recentTransfers.map((t) => ({
        id: t.id,
        fromAccountName: t.fromAccount.name,
        toAccountName: t.toAccount.name,
        amount: t.amount.toString(),
        currency: t.currency,
        status: t.status,
        reference: t.reference,
        createdAt: t.createdAt.toISOString(),
      })),
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }

  static async createAccount(ctx: TenantContext, data: {
    name: string; currency?: string; description?: string; accountNumber?: string; routingInfo?: Record<string, any>;
  }): Promise<TreasuryAccountSummary> {
    const existing = await prisma.treasuryAccount.findFirst({
      where: { companyId: ctx.companyId, name: data.name },
    });
    if (existing) throw new ValidationError(`Account "${data.name}" already exists`);

    const account = await prisma.treasuryAccount.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        currency: data.currency ?? "USD",
        description: data.description,
        accountNumber: data.accountNumber,
        routingInfo: (data.routingInfo ?? null) as any,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "TREASURY_ACCOUNT_CREATED", resourceType: "TreasuryAccount", resourceId: account.id,
      metadata: { name: account.name, currency: account.currency },
    });

    return {
      id: account.id, name: account.name, currency: account.currency,
      balance: account.balance.toString(), description: account.description,
      accountNumber: account.accountNumber, isActive: account.isActive,
      controls: [], createdAt: account.createdAt.toISOString(),
    };
  }

  static async addControl(ctx: TenantContext, accountId: string, data: {
    type: string; scope: string; value: number; description?: string;
  }) {
    const account = await prisma.treasuryAccount.findFirst({
      where: { id: accountId, companyId: ctx.companyId },
    });
    if (!account) throw new ValidationError("Account not found");

    const control = await prisma.accountControl.create({
      data: {
        accountId, companyId: ctx.companyId,
        type: data.type as any, scope: data.scope as any,
        value: data.value, description: data.description,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "ACCOUNT_CONTROL_ADDED", resourceType: "AccountControl", resourceId: control.id,
      metadata: { accountId, type: data.type, value: data.value },
    });

    return { ...control, value: control.value.toString() };
  }

  static async deposit(ctx: TenantContext, data: {
    accountId: string; amount: number; currency?: string; reference?: string; description?: string;
  }) {
    if (data.amount <= 0) throw new ValidationError("Amount must be positive");

    return treasuryLockManager.withLocks(
      [{ entity: "TreasuryAccount", id: data.accountId }],
      async (tx) => {
        const account = await tx.treasuryAccount.findFirst({
          where: { id: data.accountId, companyId: ctx.companyId },
        });
        if (!account) throw new ValidationError("Account not found");

        const updated = await tx.treasuryAccount.update({
          where: { id: data.accountId },
          data: { balance: { increment: data.amount } },
        });

        await recordAudit(tx, {
          companyId: ctx.companyId, actorUserId: ctx.userId,
          action: "TREASURY_DEPOSIT", resourceType: "TreasuryAccount", resourceId: data.accountId,
          metadata: { amount: data.amount, currency: data.currency ?? account.currency, reference: data.reference },
        });

        return { id: data.accountId, balance: updated.balance.toString(), currency: updated.currency };
      },
      { behavior: "NOWAIT" },
    );
  }

  static async transfer(ctx: TenantContext, data: {
    fromAccountId: string; toAccountId: string; amount: number; currency?: string;
    reference?: string; description?: string;
  }) {
    if (data.fromAccountId === data.toAccountId) {
      throw new ValidationError("Cannot transfer to the same account");
    }
    if (data.amount <= 0) throw new ValidationError("Amount must be positive");

    const lockResult = await treasuryLockManager.withLocks<{
      id: string;
      fromAccountName: string;
      toAccountName: string;
      amount: string;
      currency: string;
      status: string;
      reference: string | null;
      createdAt: string;
    }>(
      [
        { entity: "TreasuryAccount", id: data.fromAccountId },
        { entity: "TreasuryAccount", id: data.toAccountId },
      ],
      async (tx) => {
        const [fromAccount, toAccount] = await Promise.all([
          tx.treasuryAccount.findFirst({ where: { id: data.fromAccountId, companyId: ctx.companyId } }),
          tx.treasuryAccount.findFirst({ where: { id: data.toAccountId, companyId: ctx.companyId } }),
        ]);

        if (!fromAccount || !toAccount) throw new ValidationError("Account not found");

        const currency = data.currency ?? fromAccount.currency;

        const transfer = await tx.internalTransfer.create({
          data: {
            companyId: ctx.companyId,
            fromAccountId: data.fromAccountId,
            toAccountId: data.toAccountId,
            amount: data.amount,
            currency,
            status: "COMPLETED",
            reference: data.reference,
            description: data.description,
          },
        });

        await tx.treasuryAccount.update({
          where: { id: data.fromAccountId },
          data: { balance: { decrement: data.amount } },
        });

        await tx.treasuryAccount.update({
          where: { id: data.toAccountId },
          data: { balance: { increment: data.amount } },
        });

        await recordAudit(tx, {
          companyId: ctx.companyId, actorUserId: ctx.userId,
          action: "INTERNAL_TRANSFER_COMPLETED", resourceType: "InternalTransfer", resourceId: transfer.id,
          metadata: { fromAccountId: data.fromAccountId, toAccountId: data.toAccountId, amount: data.amount, currency },
        });

        return {
          id: transfer.id,
          fromAccountName: fromAccount.name,
          toAccountName: toAccount.name,
          amount: transfer.amount.toString(),
          currency: transfer.currency,
          status: transfer.status,
          reference: transfer.reference,
          failureReason: null,
          createdAt: transfer.createdAt.toISOString(),
        };
      },
    );

    notificationService.broadcast({
      companyId: ctx.companyId, eventType: "TRANSFER_COMPLETED",
      title: `Transfer completed: $${data.amount.toLocaleString()} ${lockResult.currency}`,
      message: `${lockResult.fromAccountName} → ${lockResult.toAccountName}`,
      link: `/transactions?id=${lockResult.id}`,
      metadata: { amount: data.amount, currency: lockResult.currency, from: data.fromAccountId, to: data.toAccountId },
    }).catch((err) => { logger.error(err, "Failed to send transfer completed notification"); });

    return {
      ...lockResult,
      failureReason: null,
    };
  }

  static async listTransfers(ctx: TenantContext, limit: number = 50, cursor?: string) {
    const rows = await prisma.internalTransfer.findMany({
      where: { companyId: ctx.companyId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { fromAccount: { select: { name: true } }, toAccount: { select: { name: true } } },
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) { rows.pop(); nextCursor = rows[rows.length - 1]?.id; }

    return {
      items: rows.map((t) => ({
        id: t.id, fromAccountName: t.fromAccount.name, toAccountName: t.toAccount.name,
        amount: t.amount.toString(), currency: t.currency, status: t.status,
        reference: t.reference, failureReason: t.failureReason, createdAt: t.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  static async getAccountHistory(ctx: TenantContext, accountId: string, limit: number = 100) {
    const transfers = await prisma.internalTransfer.findMany({
      where: {
        companyId: ctx.companyId,
        OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { fromAccount: { select: { name: true } }, toAccount: { select: { name: true } } },
    });

    return transfers.map((t) => ({
      id: t.id,
      direction: t.fromAccountId === accountId ? "DEBIT" : "CREDIT",
      counterparty: t.fromAccountId === accountId ? t.toAccount.name : t.fromAccount.name,
      amount: t.amount.toString(),
      currency: t.currency,
      status: t.status,
      reference: t.reference,
      createdAt: t.createdAt.toISOString(),
    }));
  }

  static async getLiquiditySummary(ctx: TenantContext): Promise<NormalizedLiquiditySummary[]> {
    const cacheKey = tenantKey(ctx.companyId, CacheDomains.TREASURY, "liquidity");
    return getCached(cacheKey, () => this._getLiquiditySummary(ctx), CacheTier.SHORT);
  }

  private static async _getLiquiditySummary(ctx: TenantContext): Promise<NormalizedLiquiditySummary[]> {
    const internalAccounts = await prisma.treasuryAccount.findMany({
      where: { companyId: ctx.companyId, isActive: true },
    });

    const externalAccounts = await prisma.externalAccount.findMany({
      where: { companyId: ctx.companyId },
      include: { balances: { orderBy: { recordedAt: "desc" }, take: 1 } },
    });

    const externalPositions: NormalizedErpPosition[] = [];
    const byCurrency = new Map<string, { internal: number; external: number; positions: NormalizedErpPosition[] }>();

    for (const acct of internalAccounts) {
      const curr = acct.currency;
      const val = Number(acct.balance);
      if (!byCurrency.has(curr)) byCurrency.set(curr, { internal: 0, external: 0, positions: [] });
      const entry = byCurrency.get(curr)!;
      entry.internal += val;
    }

    for (const acct of externalAccounts) {
      const curr = acct.currency;
      const latestBalance = acct.balances?.[0];
      const val = latestBalance ? Number(latestBalance.current) : 0;
      if (!byCurrency.has(curr)) byCurrency.set(curr, { internal: 0, external: 0, positions: [] });
      const entry = byCurrency.get(curr)!;
      entry.external += val;
    }

    return Array.from(byCurrency.entries()).map(([currency, data]) => ({
      currency,
      totalInternal: data.internal,
      totalExternal: data.external,
      positions: data.positions,
    }));
  }

  static async getExternalTreasuryPositions(ctx: TenantContext): Promise<NormalizedErpPosition[]> {
    const externalAccounts = await prisma.externalAccount.findMany({
      where: { companyId: ctx.companyId },
      include: { balances: { orderBy: { recordedAt: "desc" }, take: 1 } },
    });

    const byCurrency = new Map<string, { total: number; count: number; lastSync: string }>();

    for (const acct of externalAccounts) {
      const curr = acct.currency;
      const bal = acct.balances?.[0];
      const val = bal ? Number(bal.current) : 0;
      const ts = bal ? bal.recordedAt.toISOString() : new Date().toISOString();
      if (!byCurrency.has(curr)) byCurrency.set(curr, { total: 0, count: 0, lastSync: ts });
      const entry = byCurrency.get(curr)!;
      entry.total += val;
      entry.count++;
      if (ts > entry.lastSync) entry.lastSync = ts;
    }

    return Array.from(byCurrency.entries()).map(([currency, data]) => ({
      provider: "manual" as const,
      currency,
      totalBalance: data.total,
      accountCount: data.count,
      lastSyncedAt: data.lastSync,
    }));
  }
}
