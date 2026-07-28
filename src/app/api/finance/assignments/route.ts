import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { AssignmentEngine } from "@/modules/finance-collaboration";
import { getAssignmentsSchema, createAssignmentSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
  
      const parsed = getAssignmentsSchema.safeParse(params);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await AssignmentEngine.getAssignments(ctx.tenant, parsed.data);
      return NextResponse.json(data, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createAssignmentSchema.safeParse(body);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await AssignmentEngine.createAssignment(ctx.tenant, {
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
  });
}
