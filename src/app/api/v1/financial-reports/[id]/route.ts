import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders, zodErrorResponse } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";
import { z } from "zod";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  reportType: z.string().optional(),
  audience: z.string().nullable().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  isTemplate: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "reporting.definition.read");
  
      const { id } = await params;
  
      const definition = await prisma.financialReportDefinition.findFirst({
        where: { id, companyId: ctx.tenant.companyId },
      });
  
      if (!definition) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Report definition not found" } },
          { status: 404 },
        );
      }
  
      return NextResponse.json(
        { definition },
        { headers: { ...cacheHeaders(30) } },
      );
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "reporting.definition.write");
  
      const { id } = await params;
  
      const existing = await prisma.financialReportDefinition.findFirst({
        where: { id, companyId: ctx.tenant.companyId },
      });
  
      if (!existing) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Report definition not found" } },
          { status: 404 },
        );
      }
  
      const body = await parseJsonBody<Record<string, unknown>>(request);
      const parsed = updateSchema.safeParse(body);
  
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, request);
      }
  
      const updateData: Record<string, unknown> = { version: existing.version + 1 };
  
      if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
      if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
      if (parsed.data.reportType !== undefined) updateData.reportType = parsed.data.reportType;
      if (parsed.data.audience !== undefined) updateData.audience = parsed.data.audience;
      if (parsed.data.config !== undefined) updateData.config = JSON.parse(JSON.stringify(parsed.data.config));
      if (parsed.data.isTemplate !== undefined) updateData.isTemplate = parsed.data.isTemplate;
      if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
  
      const definition = await prisma.financialReportDefinition.update({
        where: { id },
        data: updateData,
      });
  
      return NextResponse.json(
        { definition },
        { headers: { ...noCacheHeaders() } },
      );
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "reporting.definition.write");
  
      const { id } = await params;
  
      const existing = await prisma.financialReportDefinition.findFirst({
        where: { id, companyId: ctx.tenant.companyId },
      });
  
      if (!existing) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Report definition not found" } },
          { status: 404 },
        );
      }
  
      await prisma.financialReportDefinition.update({
        where: { id },
        data: { isActive: false },
      });
  
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
