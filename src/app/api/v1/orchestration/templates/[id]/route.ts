import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { TemplateLibrary } from "@/modules/orchestration";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.read");
    const item = await TemplateLibrary.get(ctx, id);
    if (!item) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Template not found" } }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "orchestration.write");
    const body = await parseJsonBody<{ name: string }>(_request);
    const result = await TemplateLibrary.instantiate(ctx, id, body.name);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
