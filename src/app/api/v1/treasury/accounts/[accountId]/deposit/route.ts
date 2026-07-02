import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { TreasuryService } from "@/modules/treasury";

export async function POST(request: Request, { params }: { params: Promise<{ accountId: string }> }) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { accountId } = await params;
    const body = await parseJsonBody<{ amount: number; currency?: string; reference?: string; description?: string }>(request);
    const result = await TreasuryService.deposit(ctx, { ...body, accountId });
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
