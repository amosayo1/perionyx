import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "reporting.execute");

    const { id } = await params;

    const definition = await prisma.financialReportDefinition.findFirst({
      where: { id, companyId: ctx.companyId, isActive: true },
    });

    if (!definition) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Report definition not found or inactive" } },
        { status: 404 },
      );
    }

    const { ReportEngine } = await import("@/modules/financial-reporting/report-engine");
    const execution = await (ReportEngine as unknown as { executeDefinition: (ctx: TenantContext, definitionId: string) => Promise<Record<string, unknown>> }).executeDefinition(ctx, id);

    return NextResponse.json(
      { execution },
      { headers: { ...noCacheHeaders() } },
    );
  } catch (error) {
    return handleRouteError(error, request);
  }
}
