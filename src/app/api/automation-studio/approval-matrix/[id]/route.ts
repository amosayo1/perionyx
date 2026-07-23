import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AutomationStudioService } from "@/modules/automation-studio/automation-studio.service";
import { updateApprovalMatrixSchema } from "@/lib/validations/automation-studio";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";

const service = new AutomationStudioService();

async function getContext() {
  const session = await auth();
  return requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getContext();
    const { id } = await params;
    const body = await parseJsonBody<Record<string, unknown>>(req);
    const parsed = updateApprovalMatrixSchema.safeParse({ ...body, id });
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const rule = await service.updateApprovalMatrixRule(ctx, id, parsed.data);
    if (!rule) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Approval matrix rule not found" } }, { status: 404 });
    return NextResponse.json(rule);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getContext();
    const { id } = await params;
    const deleted = await service.deleteApprovalMatrixRule(ctx, id);
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Approval matrix rule not found" } }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
