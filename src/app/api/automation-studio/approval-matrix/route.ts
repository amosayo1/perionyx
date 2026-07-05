import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AutomationStudioService } from "@/modules/automation-studio/automation-studio.service";
import { createApprovalMatrixSchema, validationError, serverError } from "@/lib/validations/automation-studio";

const service = new AutomationStudioService();

export async function POST(req: Request) {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createApprovalMatrixSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const rule = await service.createApprovalMatrixRule(ctx, parsed.data);
    return NextResponse.json(rule, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
