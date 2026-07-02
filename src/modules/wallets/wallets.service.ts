import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit/audit.service";
import { AuditAction } from "@/domain/constants/audit-actions";
import { parseCreateWalletBody } from "@/domain/schemas/financial";
import { NotFoundError } from "@/lib/errors/app-error";

export async function listWallets(ctx: TenantContext) {
  return prisma.wallet.findMany({
    where: { companyId: ctx.companyId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createWallet(ctx: TenantContext, rawInput: unknown) {
  const input = parseCreateWalletBody(rawInput);
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.create({
      data: {
        companyId: ctx.companyId,
        name: input.name,
        currency: input.currency,
      },
    });
    await recordAudit(tx, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: AuditAction.WALLET_CREATE,
      resourceType: "Wallet",
      resourceId: wallet.id,
      metadata: { name: wallet.name, currency: wallet.currency },
    });
    return wallet;
  });
}

export async function getWalletForTenant(ctx: TenantContext, walletId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, companyId: ctx.companyId },
  });
  if (!wallet) {
    throw new NotFoundError("Wallet");
  }
  return wallet;
}
