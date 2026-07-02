import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { createWallet, listWallets } from "@/modules/wallets";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { serializeWalletJson } from "@/server/http/wallet-response";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );
    const wallets = await listWallets(ctx);
    return NextResponse.json(wallets.map(serializeWalletJson));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );
    const raw = await parseJsonBody<unknown>(request);
    const wallet = await createWallet(ctx, raw);
    return NextResponse.json(serializeWalletJson(wallet), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return zodErrorResponse(error);
    }
    return handleRouteError(error);
  }
}
