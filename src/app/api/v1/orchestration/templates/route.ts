import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { TemplateLibrary } from "@/modules/orchestration";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.read");
    const category = request.nextUrl.searchParams.get("category") ?? undefined;
    const items = await TemplateLibrary.list(ctx, category);
    return NextResponse.json({ items });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
