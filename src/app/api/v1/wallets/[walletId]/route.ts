import { NextResponse } from "next/server";
import { z } from "zod";
import { getWalletForTenant } from "@/modules/wallets";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { serializeWalletJson } from "@/server/http/wallet-response";
import { prisma } from "@/server/db/prisma";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ walletId: string }> };

const updateWalletBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  currency: z.string().length(3).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'wallets.read');
      const { walletId } = await context.params;
      const wallet = await getWalletForTenant(ctx.tenant, walletId);
      return NextResponse.json(serializeWalletJson(wallet));
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { walletId } = await context.params;
      const raw = await parseJsonBody<unknown>(request);
      const body = updateWalletBodySchema.parse(raw);
      await prisma.wallet.updateMany({ where: { id: walletId, companyId: ctx.tenant.companyId }, data: body });
      const updated = await prisma.wallet.findFirst({ where: { id: walletId, companyId: ctx.tenant.companyId } });
      return NextResponse.json(serializeWalletJson(updated!));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return zodErrorResponse(error);
      }
      return handleRouteError(error);
    }
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { walletId } = await context.params;
      await prisma.wallet.deleteMany({ where: { id: walletId, companyId: ctx.tenant.companyId } });
      return NextResponse.json({ success: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
