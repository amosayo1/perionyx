import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { CurrencyService } from "@/modules/currency";
import { z } from "zod";
import { rbacService } from "@/modules/rbac/rbac.service";

const setRateSchema = z.object({
  baseCurrency: z.string().length(3),
  quoteCurrency: z.string().length(3),
  rate: z.number().positive(),
  source: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'treasury.read');
    const rates = await CurrencyService.listRates(ctx);
    const available = await CurrencyService.listAvailableCurrencies();
    return NextResponse.json({ rates, available }, { headers: { ...cacheHeaders(120) } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const raw = await parseJsonBody<unknown>(request);
    const parsed = setRateSchema.safeParse(raw);
    if (!parsed.success) return zodErrorResponse(parsed.error);
    await CurrencyService.setRate(ctx, parsed.data.baseCurrency, parsed.data.quoteCurrency, parsed.data.rate, parsed.data.source);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
