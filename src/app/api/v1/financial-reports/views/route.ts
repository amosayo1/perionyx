import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders, zodErrorResponse } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";
import { z } from "zod";

const createViewSchema = z.object({
  name: z.string().min(1, "Name is required"),
  reportType: z.string().min(1, "Report type is required"),
  filters: z.record(z.string(), z.unknown()).optional().default({}),
  definitionId: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

const updateViewSchema = z.object({
  name: z.string().min(1).optional(),
  reportType: z.string().optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  definitionId: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "reporting.view.read");

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("reportType");
    const userId = searchParams.get("userId");

    const where: Record<string, unknown> = { companyId: ctx.companyId };

    if (reportType) where.reportType = reportType;
    if (userId) {
      where.userId = userId;
    } else {
      where.userId = ctx.userId;
    }

    const views = await prisma.financialReportSavedView.findMany({
      where,
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json(
      { views },
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
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "reporting.view.write");

    const body = await parseJsonBody<Record<string, unknown>>(request);
    const parsed = createViewSchema.safeParse(body);

    if (!parsed.success) {
      return zodErrorResponse(parsed.error, request);
    }

    if (parsed.data.isDefault) {
      await prisma.financialReportSavedView.updateMany({
        where: { companyId: ctx.companyId, userId: ctx.userId, reportType: parsed.data.reportType },
        data: { isDefault: false },
      });
    }

    const view = await prisma.financialReportSavedView.create({
      data: {
        companyId: ctx.companyId,
        name: parsed.data.name,
        reportType: parsed.data.reportType,
        filters: JSON.parse(JSON.stringify(parsed.data.filters)),
        definitionId: parsed.data.definitionId ?? null,
        userId: ctx.userId,
        isDefault: parsed.data.isDefault,
      },
    });

    return NextResponse.json(
      { view },
      { status: 201, headers: { ...noCacheHeaders() } },
    );
  } catch (error) {
    return handleRouteError(error, request);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "reporting.view.write");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "id query parameter is required" } },
        { status: 400 },
      );
    }

    const body = await parseJsonBody<Record<string, unknown>>(request);
    const parsed = updateViewSchema.safeParse(body);

    if (!parsed.success) {
      return zodErrorResponse(parsed.error, request);
    }

    const existing = await prisma.financialReportSavedView.findFirst({
      where: { id, companyId: ctx.companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Saved view not found" } },
        { status: 404 },
      );
    }

    if (parsed.data.isDefault) {
      await prisma.financialReportSavedView.updateMany({
        where: {
          companyId: ctx.companyId,
          userId: ctx.userId,
          reportType: parsed.data.reportType ?? existing.reportType,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const updateData: Record<string, unknown> = {};

    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.reportType !== undefined) updateData.reportType = parsed.data.reportType;
    if (parsed.data.filters !== undefined) updateData.filters = JSON.parse(JSON.stringify(parsed.data.filters));
    if (parsed.data.definitionId !== undefined) updateData.definitionId = parsed.data.definitionId;
    if (parsed.data.isDefault !== undefined) updateData.isDefault = parsed.data.isDefault;

    const view = await prisma.financialReportSavedView.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      { view },
      { headers: { ...noCacheHeaders() } },
    );
  } catch (error) {
    return handleRouteError(error, request);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "reporting.view.write");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "id query parameter is required" } },
        { status: 400 },
      );
    }

    const existing = await prisma.financialReportSavedView.findFirst({
      where: { id, companyId: ctx.companyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Saved view not found" } },
        { status: 404 },
      );
    }

    await prisma.financialReportSavedView.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
