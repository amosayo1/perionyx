import { NextResponse } from "next/server";
import { TaxProvisionService } from "@/modules/tax-specialist";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { updateProvisionStatusSchema } from "@/lib/validations/tax-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { id } = await params;
      const result = await TaxProvisionService.getProvisionReconciliation(ctx.tenant, id);
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { id } = await params;
      const body = await parseJsonBody<unknown>(req);
      const parsed = updateProvisionStatusSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: parsed.error.issues.map((i) => i.message).join("; ") } },
          { status: 400 },
        );
      }
  
      const result = await TaxProvisionService.updateProvisionStatus(ctx.tenant, id, parsed.data.status);
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
