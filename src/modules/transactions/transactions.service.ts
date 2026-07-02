import { Prisma, TransactionStatus, TransactionType, type WalletKind } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit/audit.service";
import { AuditAction } from "@/domain/constants/audit-actions";
import {
  applyLedgerSide,
  assertBalancedLedger,
  ledgerService,
  type LedgerLineDraft,
} from "@/modules/ledger/ledger.service";
import { ConflictError, NotFoundError } from "@/lib/errors/app-error";
import type {
  ParsedCreditWalletInput,
  ParsedTransferWalletInput,
} from "@/domain/schemas/financial";
import { ApprovalAuthorityService } from "@/modules/rbac/approval-authority.service";
import { NotificationService } from "@/modules/notifications/notifications.service";
import { PolicyEngineService } from "@/modules/policies/policies.service";

const notificationService = new NotificationService();

const APPROVAL_SCOPE_TRANSACTION_TYPE = "TRANSACTION_TYPE";

function getRoleLevel(role: string): number {
  const roleMap: Record<string, number> = {
    OWNER: 100, ADMIN: 75, TREASURER: 50, SPECIALIST: 25,
  };
  return roleMap[role] || 25;
}

async function checkAndCreateApprovals(
  tx: Prisma.TransactionClient,
  companyId: string,
  transactionId: string,
  amount: Prisma.Decimal | number,
  transactionType: string,
  lines: LedgerLineDraft[],
  metadata?: Record<string, unknown> | null,
): Promise<boolean> {
  // Find matching approval rules
  const rules = await tx.approvalRule.findMany({
    where: {
      companyId,
      enabled: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: { approvalSteps: { orderBy: { stepNumber: "asc" } } },
    orderBy: { priority: "asc" },
  });

  let matched = false;
  const approvalsToCreate: Array<{
    transactionId: string;
    companyId: string;
    status: string;
    level: number;
    sequenceNumber: number;
  }> = [];

  for (const rule of rules) {
    const amt = Number(amount);
    if (amt < Number(rule.minAmount)) continue;
    if (rule.maxAmount && amt > Number(rule.maxAmount)) continue;
    if (
      rule.applicableTransactionTypes.length > 0 &&
      !rule.applicableTransactionTypes.includes(transactionType)
    ) continue;

    matched = true;
    for (const step of rule.approvalSteps) {
      const exists = approvalsToCreate.some(
        (a) => a.sequenceNumber === step.stepNumber,
      );
      if (!exists) {
        approvalsToCreate.push({
          transactionId,
          companyId,
          status: "PENDING",
          level: getRoleLevel(step.roleRequired),
          sequenceNumber: step.stepNumber,
        });
      }
    }
  }

  if (!matched || approvalsToCreate.length === 0) {
    return false;
  }

  // Store the ledger lines in metadata for later replay on approval
  await tx.transaction.update({
    where: { id: transactionId },
    data: {
      status: TransactionStatus.PENDING_APPROVAL,
      metadata: {
        ...((metadata ?? {}) as Record<string, unknown>),
        ledgerLines: lines.map((l) => ({
          walletId: l.walletId,
          side: l.side,
          amount: Number(l.amount),
          currency: l.currency,
          sequence: l.sequence,
        })),
      } as any,
    },
  });

  const seenLevels = new Set<number>();
  const deduped = approvalsToCreate.filter((a) => {
    if (seenLevels.has(a.level)) return false;
    seenLevels.add(a.level);
    return true;
  });

  await tx.transactionApproval.createMany({ data: deduped });

  return true;
}

async function notifyApprovers(
  companyId: string,
  transaction: { id: string; status: string },
  amount: number,
  transactionType: string,
) {
  if (transaction.status !== TransactionStatus.PENDING_APPROVAL) return;

  try {
    const approvers = await ApprovalAuthorityService.getApproversForTransaction(
      companyId,
      new Prisma.Decimal(amount),
      transactionType,
    );

    for (const approver of approvers) {
      await notificationService.send({
        companyId,
        userId: approver.id,
        eventType: "APPROVAL_REQUIRED",
        title: "Approval Required",
        message: `Transaction #${transaction.id.slice(0, 8)} for ${amount} requires your approval.`,
        link: `/transactions/${transaction.id}`,
        metadata: { transactionId: transaction.id, amount, transactionType },
      });
    }
  } catch (err) {
    // notification errors should not block the transaction
  }
}

const SERIALIZABLE_FINANCIAL_TX = {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  maxWait: 10_000,
  timeout: 30_000,
} as const;

function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

async function findClearingWallet(
  tx: Prisma.TransactionClient,
  companyId: string,
  currency: string,
) {
  return tx.wallet.findFirst({
    where: { companyId, kind: "SYSTEM_CLEARING", currency },
  });
}

async function ensureClearingWallet(
  tx: Prisma.TransactionClient,
  companyId: string,
  currency: string,
  actorUserId: string,
) {
  const existing = await findClearingWallet(tx, companyId, currency);
  if (existing) {
    return existing;
  }
  const clearing = await tx.wallet.create({
    data: {
      companyId,
      kind: "SYSTEM_CLEARING",
      name: `System clearing (${currency})`,
      currency,
    },
  });
  await recordAudit(tx, {
    companyId,
    actorUserId,
    action: AuditAction.WALLET_CREATE,
    resourceType: "Wallet",
    resourceId: clearing.id,
    metadata: { kind: "SYSTEM_CLEARING", currency, name: clearing.name },
  });
  return clearing;
}

async function loadWalletForCompany(
  tx: Prisma.TransactionClient,
  companyId: string,
  walletId: string,
) {
  return tx.wallet.findFirst({
    where: { id: walletId, companyId },
  });
}

async function lockWalletsInOrder(
  tx: Prisma.TransactionClient,
  companyId: string,
  walletIds: string[],
) {
  const uniqueSorted = [...new Set(walletIds)].sort((a, b) => a.localeCompare(b));
  for (const walletId of uniqueSorted) {
    await tx.$executeRaw(
      Prisma.sql`SELECT id FROM "Wallet" WHERE id = ${walletId} AND "companyId" = ${companyId} FOR UPDATE`,
    );
  }
}

async function applyWalletBalanceUpdate(
  tx: Prisma.TransactionClient,
  companyId: string,
  wallet: { id: string; kind: WalletKind },
  nextBalance: Prisma.Decimal,
) {
  const current = await tx.wallet.findFirst({
    where: { id: wallet.id, companyId },
  });
  if (!current) {
    throw new NotFoundError("Wallet");
  }
  if (current.kind === "STANDARD" && nextBalance.lessThan(0)) {
    throw new ConflictError("Insufficient balance for this operation.");
  }
  const updated = await tx.wallet.updateMany({
    where: { id: wallet.id, companyId, version: current.version },
    data: {
      balance: nextBalance,
      version: { increment: 1 },
    },
  });
  if (updated.count !== 1) {
    throw new ConflictError(
      "Concurrent wallet modification detected; retry the request.",
    );
  }
}

async function persistLedger(
  tx: Prisma.TransactionClient,
  companyId: string,
  transactionId: string,
  lines: LedgerLineDraft[],
) {
  const uniqueCurrencies = new Set(lines.map((l) => l.currency));
  if (uniqueCurrencies.size === 1) {
    assertBalancedLedger(lines);
  } else {
    validateCrossCurrencyPostings(lines);
  }
  const sortedLines = [...lines].sort((a, b) => a.sequence - b.sequence);
  await lockWalletsInOrder(
    tx,
    companyId,
    sortedLines.map((l) => l.walletId),
  );

  for (const line of sortedLines) {
    const wallet = await loadWalletForCompany(tx, companyId, line.walletId);
    if (!wallet) {
      throw new NotFoundError("Wallet");
    }
    if (wallet.currency !== line.currency) {
      throw new ConflictError("Ledger line currency must match wallet currency.");
    }
    await tx.ledgerEntry.create({
      data: {
        companyId,
        transactionId,
        walletId: line.walletId,
        side: line.side,
        amount: line.amount,
        currency: line.currency,
        sequence: line.sequence,
      },
    });
    const nextBalance = applyLedgerSide(wallet.balance, line.side, line.amount);
    await applyWalletBalanceUpdate(tx, companyId, wallet, nextBalance);
  }
}

function validateConversionRate(
  fromAmount: Prisma.Decimal,
  toAmount: Prisma.Decimal,
  rate: number,
): void {
  const expected = new Prisma.Decimal(rate).mul(fromAmount);
  const diff = expected.sub(toAmount).abs();
  const tolerance = new Prisma.Decimal("0.01");
  if (diff.greaterThan(tolerance)) {
    throw new ConflictError(
      `Cross-currency conversion rate validation failed: ${rate} × ${fromAmount} = ${expected}, got ${toAmount}`,
    );
  }
}

function validateCrossCurrencyPostings(lines: LedgerLineDraft[]): void {
  const debits = lines.filter((l) => l.side === "DEBIT");
  const credits = lines.filter((l) => l.side === "CREDIT");
  for (const d of debits) {
    if (d.amount.lessThanOrEqualTo(0)) {
      throw new ConflictError("Cross-currency debit amount must be positive.");
    }
  }
  for (const c of credits) {
    if (c.amount.lessThanOrEqualTo(0)) {
      throw new ConflictError("Cross-currency credit amount must be positive.");
    }
  }
  const uniqueCurrencies = new Set(lines.map((l) => l.currency));
  if (uniqueCurrencies.size > 2) {
    throw new ConflictError("Cross-currency postings cannot involve more than two currencies.");
  }
}

async function loadTransactionWithLedger(
  tx: Prisma.TransactionClient,
  companyId: string,
  transactionId: string,
) {
  return tx.transaction.findFirst({
    where: { id: transactionId, companyId },
    include: { ledgerEntries: { orderBy: { sequence: "asc" } } },
  });
}

async function findTransactionByIdempotency(
  tx: Prisma.TransactionClient,
  companyId: string,
  idempotencyKey: string,
) {
  return tx.transaction.findUnique({
    where: {
      companyId_idempotencyKey: { companyId, idempotencyKey },
    },
    include: { ledgerEntries: { orderBy: { sequence: "asc" } } },
  });
}

type IdempotentTransactionRow = NonNullable<
  Awaited<ReturnType<typeof findTransactionByIdempotency>>
>;

function withCreditIntentMetadata(
  metadata: Prisma.InputJsonValue | undefined,
  targetWalletId: string,
): Prisma.InputJsonValue {
  const envelope = { perionyxCredit: { targetWalletId } };
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return { ...(metadata as Record<string, unknown>), ...envelope } as Prisma.InputJsonValue;
  }
  return envelope as Prisma.InputJsonValue;
}

function withTransferIntentMetadata(
  metadata: Prisma.InputJsonValue | undefined,
  fromWalletId: string,
  toWalletId: string,
): Prisma.InputJsonValue {
  const envelope = { perionyxTransfer: { fromWalletId, toWalletId } };
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return { ...(metadata as Record<string, unknown>), ...envelope } as Prisma.InputJsonValue;
  }
  return envelope as Prisma.InputJsonValue;
}

function readCreditTargetFromMetadata(metadata: Prisma.JsonValue | null): string | undefined {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return undefined;
  }
  const vc = (metadata as Record<string, unknown>).perionyxCredit;
  if (!vc || typeof vc !== "object" || Array.isArray(vc)) {
    return undefined;
  }
  const id = (vc as Record<string, unknown>).targetWalletId;
  return typeof id === "string" ? id : undefined;
}

function readTransferWalletsFromMetadata(
  metadata: Prisma.JsonValue | null,
): { fromWalletId?: string; toWalletId?: string } {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  const vt = (metadata as Record<string, unknown>).perionyxTransfer;
  if (!vt || typeof vt !== "object" || Array.isArray(vt)) {
    return {};
  }
  const o = vt as Record<string, unknown>;
  const fromWalletId = typeof o.fromWalletId === "string" ? o.fromWalletId : undefined;
  const toWalletId = typeof o.toWalletId === "string" ? o.toWalletId : undefined;
  return { fromWalletId, toWalletId };
}

function assertCreditReplayMatchesRow(
  existing: IdempotentTransactionRow,
  input: ParsedCreditWalletInput,
  targetWalletId: string,
  targetCurrency: string,
) {
  if (existing.type !== TransactionType.WALLET_CREDIT) {
    throw new ConflictError("Idempotency key already used for a different operation.");
  }
  if (!existing.primaryAmount.equals(input.amount)) {
    throw new ConflictError("Idempotency key already used with a different amount.");
  }
  if (existing.currency !== targetCurrency) {
    throw new ConflictError("Idempotency key already used with a different currency.");
  }
  const metaWallet = readCreditTargetFromMetadata(existing.metadata);
  if (metaWallet !== undefined && metaWallet !== targetWalletId) {
    throw new ConflictError("Idempotency key already used with a different wallet.");
  }
}

function assertCreditReplayMatchesLedger(
  existing: IdempotentTransactionRow,
  input: ParsedCreditWalletInput,
  targetWalletId: string,
  targetCurrency: string,
) {
  assertCreditReplayMatchesRow(existing, input, targetWalletId, targetCurrency);
  const sorted = [...existing.ledgerEntries].sort((a, b) => a.sequence - b.sequence);
  if (sorted.length !== 2) {
    throw new ConflictError(
      "This idempotency key is tied to a transaction that did not finish cleanly. Contact support.",
    );
  }
  assertBalancedLedger(sorted.map((e) => ({ side: e.side, amount: e.amount })));
  const credit = sorted.find((e) => e.side === "CREDIT" && e.sequence === 1);
  if (!credit || credit.walletId !== targetWalletId) {
    throw new ConflictError("Idempotency key already used with a different wallet.");
  }
}

function assertTransferReplayMatchesRow(
  existing: IdempotentTransactionRow,
  input: ParsedTransferWalletInput,
  fromWalletId: string,
  toWalletId: string,
  currency: string,
) {
  if (existing.type !== TransactionType.INTERNAL_TRANSFER) {
    throw new ConflictError("Idempotency key already used for a different operation.");
  }
  if (!existing.primaryAmount.equals(input.amount)) {
    throw new ConflictError("Idempotency key already used with a different amount.");
  }
  if (existing.currency !== currency) {
    throw new ConflictError("Idempotency key already used with a different currency.");
  }
  const meta = readTransferWalletsFromMetadata(existing.metadata);
  if (
    meta.fromWalletId !== undefined &&
    meta.toWalletId !== undefined &&
    (meta.fromWalletId !== fromWalletId || meta.toWalletId !== toWalletId)
  ) {
    throw new ConflictError("Idempotency key already used with different transfer wallets.");
  }
}

function assertTransferReplayMatchesLedger(
  existing: IdempotentTransactionRow,
  input: ParsedTransferWalletInput,
  fromWalletId: string,
  toWalletId: string,
  currency: string,
) {
  assertTransferReplayMatchesRow(existing, input, fromWalletId, toWalletId, currency);
  const sorted = [...existing.ledgerEntries].sort((a, b) => a.sequence - b.sequence);
  if (sorted.length !== 2) {
    throw new ConflictError(
      "This idempotency key is tied to a transaction that did not finish cleanly. Contact support.",
    );
  }
  assertBalancedLedger(sorted.map((e) => ({ side: e.side, amount: e.amount })));
  const debit = sorted.find((e) => e.side === "DEBIT" && e.sequence === 0);
  const credit = sorted.find((e) => e.side === "CREDIT" && e.sequence === 1);
  if (!debit || debit.walletId !== fromWalletId || !credit || credit.walletId !== toWalletId) {
    throw new ConflictError("Idempotency key already used with different transfer wallets.");
  }
}

function isIdempotentReplayComplete(
  row: { status: TransactionStatus; ledgerEntries: { length: number } },
): boolean {
  if (row.status === TransactionStatus.COMPLETED) {
    return true;
  }
  if (
    row.status === TransactionStatus.FAILED ||
    row.status === TransactionStatus.REVERSED
  ) {
    return true;
  }
  return false;
}

function isPendingApproval(
  row: { status: TransactionStatus },
): boolean {
  return row.status === TransactionStatus.PENDING_APPROVAL;
}

export async function creditWallet(ctx: TenantContext, input: ParsedCreditWalletInput) {
  // Evaluate policies before creating transaction
  const policyResult = await PolicyEngineService.evaluateTransaction(ctx.companyId, {
    amount: Number(input.amount),
    transactionType: "WALLET_CREDIT",
    currency: "", // will be updated below inside transaction
    walletId: input.walletId,
    metadata: input.metadata as Record<string, any> | undefined,
  });
  if (policyResult?.action === "BLOCK") {
    throw new ConflictError(`Transaction blocked by policy "${policyResult.policy.name}"`);
  }
  const policyFlags = policyResult?.action === "FLAG" ? policyResult.policy : null;

  const result = await prisma.$transaction(
    async (tx) => {
      const existing = await findTransactionByIdempotency(
        tx,
        ctx.companyId,
        input.idempotencyKey,
      );
      if (existing && isIdempotentReplayComplete(existing)) {
        assertCreditReplayMatchesRow(existing, input, input.walletId, existing.currency);
        return existing;
      }

      const target = await loadWalletForCompany(tx, ctx.companyId, input.walletId);
      if (!target) {
        throw new NotFoundError("Wallet");
      }
      if (target.kind !== "STANDARD") {
        throw new ConflictError("Credits can only be posted to standard wallets.");
      }

      if (existing && !isIdempotentReplayComplete(existing)) {
        // Return existing pending approval
        if (existing.status === TransactionStatus.PENDING_APPROVAL) {
          return (await loadTransactionWithLedger(tx, ctx.companyId, existing.id))!;
        }
        const n = existing.ledgerEntries.length;
        if (n === 2) {
          assertCreditReplayMatchesLedger(existing, input, target.id, target.currency);
          await tx.transaction.update({
            where: { id: existing.id },
            data: { status: TransactionStatus.COMPLETED },
          });
          await recordAudit(tx, {
            companyId: ctx.companyId,
            actorUserId: ctx.userId,
            action: AuditAction.TRANSACTION_WALLET_CREDIT,
            resourceType: "Transaction",
            resourceId: existing.id,
            metadata: {
              walletId: target.id,
              amount: input.amount.toString(),
              idempotencyKey: input.idempotencyKey,
              finalized: "idempotent_ledger_replay",
            },
          });
          return (await loadTransactionWithLedger(tx, ctx.companyId, existing.id))!;
        }
        if (n !== 0) {
          throw new ConflictError(
            "This idempotency key is tied to a transaction that did not finish cleanly. Contact support.",
          );
        }
        assertCreditReplayMatchesRow(existing, input, target.id, target.currency);
      }

      const clearing = await ensureClearingWallet(
        tx,
        ctx.companyId,
        target.currency,
        ctx.userId,
      );

      const lines: LedgerLineDraft[] = [
        {
          walletId: clearing.id,
          side: "DEBIT",
          amount: input.amount,
          currency: target.currency,
          sequence: 0,
        },
        {
          walletId: target.id,
          side: "CREDIT",
          amount: input.amount,
          currency: target.currency,
          sequence: 1,
        },
      ];

      let txn: { id: string };
      if (existing && existing.ledgerEntries.length === 0) {
        txn = { id: existing.id };
      } else {
        try {
          txn = await tx.transaction.create({
            data: {
              companyId: ctx.companyId,
              type: "WALLET_CREDIT",
              status: TransactionStatus.PENDING,
              primaryAmount: input.amount,
              currency: target.currency,
              reference: input.reference ?? undefined,
              idempotencyKey: input.idempotencyKey,
              metadata: withCreditIntentMetadata(input.metadata, target.id),
              createdByUserId: ctx.userId,
            },
          });
        } catch (error) {
          if (isPrismaUniqueViolation(error)) {
            const dup = await findTransactionByIdempotency(
              tx,
              ctx.companyId,
              input.idempotencyKey,
            );
            if (!dup) {
              throw error;
            }
            if (isIdempotentReplayComplete(dup)) {
              assertCreditReplayMatchesRow(dup, input, input.walletId, dup.currency);
              return dup;
            }
            const dn = dup.ledgerEntries.length;
            if (dn === 2) {
              assertCreditReplayMatchesLedger(dup, input, target.id, target.currency);
              await tx.transaction.update({
                where: { id: dup.id },
                data: { status: TransactionStatus.COMPLETED },
              });
              await recordAudit(tx, {
                companyId: ctx.companyId,
                actorUserId: ctx.userId,
                action: AuditAction.TRANSACTION_WALLET_CREDIT,
                resourceType: "Transaction",
                resourceId: dup.id,
                metadata: {
                  walletId: target.id,
                  amount: input.amount.toString(),
                  idempotencyKey: input.idempotencyKey,
                  finalized: "idempotent_ledger_replay",
                },
              });
              return (await loadTransactionWithLedger(tx, ctx.companyId, dup.id))!;
            }
            if (dn !== 0) {
              throw new ConflictError(
                "This idempotency key is tied to a transaction that did not finish cleanly. Contact support.",
              );
            }
            // Return existing pending approval
            if (dup.status === TransactionStatus.PENDING_APPROVAL) {
              return (await loadTransactionWithLedger(tx, ctx.companyId, dup.id))!;
            }
            assertCreditReplayMatchesRow(dup, input, target.id, target.currency);
            txn = { id: dup.id };
      } else {
        throw error;
      }
    }
  }

  // Check if approval is needed before processing
  const needsApproval = await checkAndCreateApprovals(
    tx, ctx.companyId, txn.id, input.amount, "WALLET_CREDIT", lines, input.metadata as any,
  );
  if (needsApproval) {
    await recordAudit(tx, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: AuditAction.TRANSACTION_APPROVAL_REQUIRED,
      resourceType: "Transaction",
      resourceId: txn.id,
      metadata: {
        walletId: target.id,
        amount: input.amount.toString(),
        idempotencyKey: input.idempotencyKey,
      },
    });
    return (await loadTransactionWithLedger(tx, ctx.companyId, txn.id))!;
  }

  await tx.transaction.update({
    where: { id: txn.id },
    data: { status: TransactionStatus.PROCESSING },
  });

  await persistLedger(tx, ctx.companyId, txn.id, lines);

  await tx.transaction.update({
    where: { id: txn.id },
    data: { status: TransactionStatus.COMPLETED },
  });

  await recordAudit(tx, {
    companyId: ctx.companyId,
    actorUserId: ctx.userId,
    action: AuditAction.TRANSACTION_WALLET_CREDIT,
    resourceType: "Transaction",
    resourceId: txn.id,
    metadata: {
      walletId: target.id,
      amount: input.amount.toString(),
      idempotencyKey: input.idempotencyKey,
    },
  });

  return (await loadTransactionWithLedger(tx, ctx.companyId, txn.id))!;
},
SERIALIZABLE_FINANCIAL_TX,
);

  if (result.ledgerEntries?.length) {
    const walletIds = [...new Set(result.ledgerEntries.map(e => e.walletId))];
    await ledgerService.verifyWalletsAfterPosting(walletIds, ctx.companyId, result.id);
  }

  await notifyApprovers(ctx.companyId, result, Number(input.amount), "WALLET_CREDIT");

  return result;
}

export async function transferBetweenWallets(
  ctx: TenantContext,
  input: ParsedTransferWalletInput,
) {
  if (input.fromWalletId === input.toWalletId) {
    throw new ConflictError("Cannot transfer to the same wallet.");
  }

  // Evaluate policies before creating transaction
  const policyResult = await PolicyEngineService.evaluateTransaction(ctx.companyId, {
    amount: Number(input.amount),
    transactionType: "INTERNAL_TRANSFER",
    currency: "",
    walletId: input.fromWalletId,
    metadata: input.metadata as Record<string, any> | undefined,
  });
  if (policyResult?.action === "BLOCK") {
    throw new ConflictError(`Transaction blocked by policy "${policyResult.policy.name}"`);
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const existing = await findTransactionByIdempotency(
        tx,
        ctx.companyId,
        input.idempotencyKey,
      );
      if (existing && isIdempotentReplayComplete(existing)) {
        assertTransferReplayMatchesRow(
          existing,
          input,
          input.fromWalletId,
          input.toWalletId,
          existing.currency,
        );
        return existing;
      }

      const from = await loadWalletForCompany(tx, ctx.companyId, input.fromWalletId);
      const to = await loadWalletForCompany(tx, ctx.companyId, input.toWalletId);
      if (!from) {
        throw new NotFoundError("Source wallet");
      }
      if (!to) {
        throw new NotFoundError("Destination wallet");
      }
      if (from.kind !== "STANDARD" || to.kind !== "STANDARD") {
        throw new ConflictError("Transfers are only supported between standard wallets.");
      }
      const isCrossCurrency = from.currency !== to.currency;
      let convertedAmount = input.amount;
      let fxRate: number | null = null;
      if (isCrossCurrency) {
        const { CurrencyService } = await import("@/modules/currency/currency.service");
        const result = await CurrencyService.convert(
          ctx, Number(input.amount), from.currency, to.currency,
        );
        convertedAmount = new Prisma.Decimal(result.convertedAmount);
        fxRate = result.rate;
      }

      if (existing && !isIdempotentReplayComplete(existing)) {
        // Return existing pending approval
        if (existing.status === TransactionStatus.PENDING_APPROVAL) {
          return (await loadTransactionWithLedger(tx, ctx.companyId, existing.id))!;
        }
        const n = existing.ledgerEntries.length;
        if (n === 2) {
          assertTransferReplayMatchesLedger(
            existing,
            input,
            from.id,
            to.id,
            from.currency,
          );
          await tx.transaction.update({
            where: { id: existing.id },
            data: { status: TransactionStatus.COMPLETED },
          });
          await recordAudit(tx, {
            companyId: ctx.companyId,
            actorUserId: ctx.userId,
            action: AuditAction.TRANSACTION_INTERNAL_TRANSFER,
            resourceType: "Transaction",
            resourceId: existing.id,
            metadata: {
              fromWalletId: from.id,
              toWalletId: to.id,
              amount: input.amount.toString(),
              idempotencyKey: input.idempotencyKey,
              finalized: "idempotent_ledger_replay",
            },
          });
          return (await loadTransactionWithLedger(tx, ctx.companyId, existing.id))!;
        }
        if (n !== 0) {
          throw new ConflictError(
            "This idempotency key is tied to a transaction that did not finish cleanly. Contact support.",
          );
        }
        assertTransferReplayMatchesRow(
          existing,
          input,
          from.id,
          to.id,
          from.currency,
        );
      }

      const lines: LedgerLineDraft[] = [
        {
          walletId: from.id,
          side: "DEBIT",
          amount: input.amount,
          currency: from.currency,
          sequence: 0,
        },
        {
          walletId: to.id,
          side: "CREDIT",
          amount: convertedAmount,
          currency: to.currency,
          sequence: 1,
        },
      ];

      let txn: { id: string };
      if (existing && existing.ledgerEntries.length === 0) {
        txn = { id: existing.id };
      } else {
        try {
          txn = await tx.transaction.create({
            data: {
              companyId: ctx.companyId,
              type: "INTERNAL_TRANSFER",
              status: TransactionStatus.PENDING,
              primaryAmount: input.amount,
              currency: from.currency,
              reference: input.reference ?? undefined,
              idempotencyKey: input.idempotencyKey,
              metadata: withTransferIntentMetadata(input.metadata, from.id, to.id),
              createdByUserId: ctx.userId,
            },
          });
        } catch (error) {
          if (isPrismaUniqueViolation(error)) {
            const dup = await findTransactionByIdempotency(
              tx,
              ctx.companyId,
              input.idempotencyKey,
            );
            if (!dup) {
              throw error;
            }
            if (isIdempotentReplayComplete(dup)) {
              assertTransferReplayMatchesRow(
                dup,
                input,
                input.fromWalletId,
                input.toWalletId,
                dup.currency,
              );
              return dup;
            }
            const dn = dup.ledgerEntries.length;
            if (dn === 2) {
              assertTransferReplayMatchesLedger(
                dup,
                input,
                from.id,
                to.id,
                from.currency,
              );
              await tx.transaction.update({
                where: { id: dup.id },
                data: { status: TransactionStatus.COMPLETED },
              });
              await recordAudit(tx, {
                companyId: ctx.companyId,
                actorUserId: ctx.userId,
                action: AuditAction.TRANSACTION_INTERNAL_TRANSFER,
                resourceType: "Transaction",
                resourceId: dup.id,
                metadata: {
                  fromWalletId: from.id,
                  toWalletId: to.id,
                  amount: input.amount.toString(),
                  idempotencyKey: input.idempotencyKey,
                  finalized: "idempotent_ledger_replay",
                },
              });
              return (await loadTransactionWithLedger(tx, ctx.companyId, dup.id))!;
            }
            if (dn !== 0) {
              throw new ConflictError(
                "This idempotency key is tied to a transaction that did not finish cleanly. Contact support.",
              );
            }
            // Return existing pending approval
            if (dup.status === TransactionStatus.PENDING_APPROVAL) {
              return (await loadTransactionWithLedger(tx, ctx.companyId, dup.id))!;
            }
            assertTransferReplayMatchesRow(dup, input, from.id, to.id, from.currency);
            txn = { id: dup.id };
          } else {
            throw error;
          }
        }
      }

      // Check if approval is needed before processing
      const needsApproval = await checkAndCreateApprovals(
        tx, ctx.companyId, txn.id, input.amount, "INTERNAL_TRANSFER", lines, input.metadata as any,
      );
      if (needsApproval) {
        await recordAudit(tx, {
          companyId: ctx.companyId,
          actorUserId: ctx.userId,
          action: AuditAction.TRANSACTION_APPROVAL_REQUIRED,
          resourceType: "Transaction",
          resourceId: txn.id,
          metadata: {
            fromWalletId: from.id,
            toWalletId: to.id,
            amount: input.amount.toString(),
            idempotencyKey: input.idempotencyKey,
          },
        });
        return (await loadTransactionWithLedger(tx, ctx.companyId, txn.id))!;
      }

      await tx.transaction.update({
        where: { id: txn.id },
        data: { status: TransactionStatus.PROCESSING },
      });

      await persistLedger(tx, ctx.companyId, txn.id, lines);

      if (isCrossCurrency && fxRate !== null) {
        validateConversionRate(input.amount, convertedAmount, fxRate);
      }

      await tx.transaction.update({
        where: { id: txn.id },
        data: { status: TransactionStatus.COMPLETED },
      });

      await recordAudit(tx, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: AuditAction.TRANSACTION_INTERNAL_TRANSFER,
        resourceType: "Transaction",
        resourceId: txn.id,
        metadata: {
          fromWalletId: from.id,
          toWalletId: to.id,
          amount: input.amount.toString(),
          idempotencyKey: input.idempotencyKey,
        },
      });

      return (await loadTransactionWithLedger(tx, ctx.companyId, txn.id))!;
    },
    SERIALIZABLE_FINANCIAL_TX,
  );

  if (result.ledgerEntries?.length) {
    const walletIds = [...new Set(result.ledgerEntries.map(e => e.walletId))];
    await ledgerService.verifyWalletsAfterPosting(walletIds, ctx.companyId, result.id);
  }

  await notifyApprovers(ctx.companyId, result, Number(input.amount), "INTERNAL_TRANSFER");

  return result;
}

export type ListTransactionsOptions = {
  take: number;
  cursor?: string;
};

export async function listTransactionsForTenant(
  ctx: TenantContext,
  opts: ListTransactionsOptions,
) {
  const rows = await prisma.transaction.findMany({
    where: { companyId: ctx.companyId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: opts.take + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    include: {
      _count: { select: { ledgerEntries: true } },
    },
  });

  let nextCursor: string | undefined;
  if (rows.length > opts.take) {
    rows.pop();
    nextCursor = rows[rows.length - 1]?.id;
  }

  return { rows, nextCursor };
}
