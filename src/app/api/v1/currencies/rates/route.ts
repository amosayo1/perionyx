import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { CurrencyService } from "@/modules/currency";
import { z } from "zod";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const setRateSchema = z.object({
  baseCurrency: z.string().length(3),
  quoteCurrency: z.string().length(3),
  rate: z.number().positive(),
  source: z.string().optional(),
});

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const rates = await CurrencyService.listRates(ctx.tenant);
      const available = await CurrencyService.listAvailableCurrencies();
      return NextResponse.json({ rates, available }, { headers: { ...cacheHeaders(120) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const raw = await parseJsonBody<unknown>(request);
      const parsed = setRateSchema.safeParse(raw);
      if (!parsed.success) return zodErrorResponse(parsed.error);
      await CurrencyService.setRate(ctx.tenant, parsed.data.baseCurrency, parsed.data.quoteCurrency, parsed.data.rate, parsed.data.source);
      return NextResponse.json({ success: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
