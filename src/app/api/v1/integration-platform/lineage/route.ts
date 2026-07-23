import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { DataLineageService } from "@/modules/integration-platform";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.lineage");
    const body = await parseJsonBody<any>(request);
    const record = await DataLineageService.recordLineage(ctx, body);
    return NextResponse.json({ record }, { status: 201, headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.lineage");
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");
    const recordId = searchParams.get("recordId");
    const provTargetType = searchParams.get("provenanceTargetType");
    const provTargetId = searchParams.get("provenanceTargetId");
    if (targetType && targetId) {
      const records = await DataLineageService.getLineageByTarget(ctx, targetType, targetId);
      return NextResponse.json({ records });
    }
    if (recordId) {
      const records = await DataLineageService.getLineageChain(ctx, recordId);
      return NextResponse.json({ records });
    }
    if (provTargetType && provTargetId) {
      const provenance = await DataLineageService.getProvenance(ctx, provTargetType, provTargetId);
      return NextResponse.json({ provenance });
    }
    return NextResponse.json({ error: "Provide targetType+targetId, recordId, or provenanceTargetType+provenanceTargetId" }, { status: 400 });
  } catch (error) {
    return handleRouteError(error);
  }
}
