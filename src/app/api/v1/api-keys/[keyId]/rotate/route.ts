import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { ApiKeyService } from "@/modules/api-keys";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ keyId: string }> },
) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.api_keys');
      const { keyId } = await params;
      const result = await ApiKeyService.rotate(ctx.tenant, keyId);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
