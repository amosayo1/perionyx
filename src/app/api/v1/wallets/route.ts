import { NextResponse } from "next/server";
import { z } from "zod";
import { createWallet, listWallets } from "@/modules/wallets";
import { cacheHeaders, handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { serializeWalletJson } from "@/server/http/wallet-response";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'wallets.read');
      const wallets = await listWallets(ctx.tenant);
      return NextResponse.json(wallets.map(serializeWalletJson), { headers: { ...cacheHeaders(30) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const raw = await parseJsonBody<unknown>(request);
      const wallet = await createWallet(ctx.tenant, raw);
      return NextResponse.json(serializeWalletJson(wallet), { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return zodErrorResponse(error);
      }
      return handleRouteError(error);
    }
  });
}
