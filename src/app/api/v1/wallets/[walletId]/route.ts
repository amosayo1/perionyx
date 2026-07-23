import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { getWalletForTenant } from "@/modules/wallets";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { serializeWalletJson } from "@/server/http/wallet-response";
import { prisma } from "@/server/db/prisma";
import { rbacService } from "@/modules/rbac/rbac.service";

type RouteContext = { params: Promise<{ walletId: string }> };

const updateWalletBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  currency: z.string().length(3).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'wallets.read');
    const { walletId } = await context.params;
    const wallet = await getWalletForTenant(ctx, walletId);
    return NextResponse.json(serializeWalletJson(wallet));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { walletId } = await context.params;
    const raw = await parseJsonBody<unknown>(request);
    const body = updateWalletBodySchema.parse(raw);
    await prisma.wallet.updateMany({ where: { id: walletId, companyId: ctx.companyId }, data: body });
    const updated = await prisma.wallet.findFirst({ where: { id: walletId, companyId: ctx.companyId } });
    return NextResponse.json(serializeWalletJson(updated!));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return zodErrorResponse(error);
    }
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { walletId } = await context.params;
    await prisma.wallet.deleteMany({ where: { id: walletId, companyId: ctx.companyId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
