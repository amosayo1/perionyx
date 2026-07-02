import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { CurrencyService } from "@/modules/currency";
import { z } from "zod";

const convertSchema = z.object({
  amount: z.number().positive(),
  from: z.string().length(3),
  to: z.string().length(3),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const raw = await parseJsonBody<unknown>(request);
    const parsed = convertSchema.safeParse(raw);
    if (!parsed.success) return zodErrorResponse(parsed.error);
    const result = await CurrencyService.convert(ctx, parsed.data.amount, parsed.data.from, parsed.data.to);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
