import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { AssignmentEngine } from "@/modules/finance-collaboration";
import { getAssignmentsSchema, createAssignmentSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = getAssignmentsSchema.safeParse(params);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, req);
    }

    const data = await AssignmentEngine.getAssignments(ctx, parsed.data);
    return NextResponse.json(data, { headers: cacheHeaders(15) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await parseJsonBody<unknown>(req);
    const parsed = createAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, req);
    }

    const data = await AssignmentEngine.createAssignment(ctx, {
      caseId: parsed.data.caseId,
      title: parsed.data.taskTitle,
      description: parsed.data.taskDescription,
      assignmentType: parsed.data.assignmentType,
      assignedTo: parsed.data.toSpecialist,
      assignedBy: parsed.data.fromSpecialist,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
