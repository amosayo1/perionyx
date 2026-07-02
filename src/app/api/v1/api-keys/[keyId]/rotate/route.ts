import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { ApiKeyService } from "@/modules/api-keys";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ keyId: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { keyId } = await params;
    const result = await ApiKeyService.rotate(ctx, keyId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
