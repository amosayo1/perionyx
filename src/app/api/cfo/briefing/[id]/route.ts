import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { handleRouteError } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "cfo_advisor.read");

    const result = await CFOAdvisorService.getBriefings(ctx, {});
    const briefing = result.items.find((b) => b.id === id);
    if (!briefing) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Briefing not found" } }, { status: 404 });
    }
    return NextResponse.json(briefing);
  } catch (err) {
    return handleRouteError(err);
  }
}
