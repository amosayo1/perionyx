import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { generateBriefingSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "cfo_advisor.read");

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") ?? undefined;
    const endDate = url.searchParams.get("endDate") ?? undefined;
    const period = url.searchParams.get("period") as "daily" | "weekly" | "monthly" | undefined;

    if (startDate || endDate || period) {
      const result = await CFOAdvisorService.getBriefings(ctx, {
        period,
        startDate,
        endDate,
      });
      return NextResponse.json(result);
    }

    const latest = await CFOAdvisorService.getLatestBriefing(ctx, period);
    return NextResponse.json(latest ?? { error: { code: "NOT_FOUND", message: "No briefings found" } }, latest ? {} : { status: 404 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "cfo_advisor.manage");

    const body = await parseJsonBody<unknown>(req);
    const parsed = generateBriefingSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const briefing = await CFOAdvisorService.generateMorningBriefing(ctx, parsed.data);
    return NextResponse.json(briefing, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
