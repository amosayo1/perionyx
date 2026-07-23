import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders, zodErrorResponse } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  reportType: z.string().min(1, "Report type is required"),
  audience: z.string().optional(),
  config: z.record(z.string(), z.unknown()).refine((v) => Object.keys(v).length > 0, "Config is required"),
  isTemplate: z.boolean().optional().default(false),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "reporting.definition.read");

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const audience = searchParams.get("audience");
    const isTemplate = searchParams.get("isTemplate");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { companyId: ctx.companyId, isActive: true };

    if (type) where.reportType = type;
    if (audience) where.audience = audience;
    if (isTemplate !== null) where.isTemplate = isTemplate === "true";
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const definitions = await prisma.financialReportDefinition.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(
      { definitions },
      { headers: { ...cacheHeaders(30) } },
    );
  } catch (error) {
    return handleRouteError(error, request);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "reporting.definition.write");

    const body = await parseJsonBody<Record<string, unknown>>(request);
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return zodErrorResponse(parsed.error, request);
    }

    const definition = await prisma.financialReportDefinition.create({
      data: {
        companyId: ctx.companyId,
        name: parsed.data.name,
        description: parsed.data.description,
        reportType: parsed.data.reportType,
        audience: parsed.data.audience ?? null,
        config: JSON.parse(JSON.stringify(parsed.data.config)),
        isActive: true,
        isTemplate: parsed.data.isTemplate,
        createdBy: ctx.userId,
      },
    });

    return NextResponse.json(
      { definition },
      { status: 201, headers: { ...noCacheHeaders() } },
    );
  } catch (error) {
    return handleRouteError(error, request);
  }
}
