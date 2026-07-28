import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { CurrencyService } from "@/modules/currency";
import { z } from "zod";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const convertSchema = z.object({
  amount: z.number().positive(),
  from: z.string().length(3),
  to: z.string().length(3),
});

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const raw = await parseJsonBody<unknown>(request);
      const parsed = convertSchema.safeParse(raw);
      if (!parsed.success) return zodErrorResponse(parsed.error);
      const result = await CurrencyService.convert(ctx.tenant, parsed.data.amount, parsed.data.from, parsed.data.to);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
