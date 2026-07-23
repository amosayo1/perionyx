import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { FeatureDiscoveryService } from "@/modules/enterprise-experience";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") ?? undefined;
    const items = await FeatureDiscoveryService.getAvailable(ctx, role ?? "");
    return NextResponse.json({ items });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "enterprise.experience");
    const body = await parseJsonBody<{ slug: string; isEnabled: boolean }>(request);
    const flag = body.isEnabled
      ? await FeatureDiscoveryService.enable(ctx, body.slug)
      : await FeatureDiscoveryService.disable(ctx, body.slug);
    return NextResponse.json(flag);
  } catch (error) {
    return handleRouteError(error);
  }
}
