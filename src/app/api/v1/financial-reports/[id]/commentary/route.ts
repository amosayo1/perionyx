import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";
import type { AICommentary } from "@/modules/financial-reporting/types";
import type { TenantContext } from "@/server/context/tenant-context";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "reporting.commentary");
  
      const { id: _definitionId } = await params;
      const { searchParams } = new URL(request.url);
      const executionId = searchParams.get("executionId");
  
      if (!executionId) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "executionId query parameter is required" } },
          { status: 400 },
        );
      }
  
      const record = await prisma.financialReportCommentary.findFirst({
        where: {
          executionId,
          companyId: ctx.tenant.companyId,
        },
        orderBy: { generatedAt: "desc" },
      });
  
      if (!record) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Commentary not found for this execution" } },
          { status: 404 },
        );
      }
  
      return NextResponse.json({
        commentary: {
          ...(record.content as unknown as AICommentary),
          id: record.id,
          executionId: record.executionId,
          model: record.model,
          generatedAt: record.generatedAt.toISOString(),
        },
      });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "reporting.commentary");
  
      const { id: definitionId } = await params;
      const body = await parseJsonBody<{ executionId: string }>(request);
  
      if (!body.executionId) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "executionId is required in body" } },
          { status: 400 },
        );
      }
  
      const execution = await prisma.financialReportExecution.findFirst({
        where: { id: body.executionId, companyId: ctx.tenant.companyId, definitionId },
      });
  
      if (!execution) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Execution not found" } },
          { status: 404 },
        );
      }
  
      if (execution.status !== "completed") {
        return NextResponse.json(
          { error: { code: "INVALID_STATE", message: "Cannot generate commentary for incomplete execution" } },
          { status: 400 },
        );
      }
  
      const { AICommentaryService } = await import("@/modules/financial-reporting/ai-commentary.service");
      const service = new (AICommentaryService as unknown as new () => {
        generate: (ctx: TenantContext, reportType: string, sections: unknown[], config: unknown) => Promise<AICommentary>;
      })();
      const commentary = await service.generate(
        ctx.tenant,
        execution.reportType,
        execution.sections as unknown[],
        execution.config,
      );
  
      await prisma.financialReportCommentary.create({
        data: {
          id: crypto.randomUUID(),
          executionId: body.executionId,
          companyId: ctx.tenant.companyId,
          reportType: execution.reportType,
          content: JSON.parse(JSON.stringify(commentary)),
          model: commentary.model,
          tokensUsed: 0,
        },
      });
  
      return NextResponse.json(
        { commentary },
        { status: 201, headers: { ...noCacheHeaders() } },
      );
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
