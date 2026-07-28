import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders, zodErrorResponse } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";
import { z } from "zod";
import type { TenantContext } from "@/server/context/tenant-context";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const createScheduleSchema = z.object({
  definitionId: z.string().min(1, "definitionId is required"),
  name: z.string().min(1, "Name is required"),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]),
  cronExpression: z.string().optional(),
  recipients: z.array(z.string()).min(1, "At least one recipient is required"),
  format: z.enum(["pdf", "excel", "csv", "powerpoint"]),
  config: z.record(z.string(), z.unknown()).optional().default({}),
});

interface IScheduleService {
  createSchedule(ctx: TenantContext, data: Record<string, unknown>): Promise<Record<string, unknown>>;
  updateSchedule(ctx: TenantContext, scheduleId: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
  deleteSchedule(ctx: TenantContext, scheduleId: string): Promise<void>;
}

async function getScheduleService(): Promise<IScheduleService> {
  const mod = await import("@/modules/financial-reporting/report-scheduler.service");
  const ServiceClass = mod.ReportSchedulerService as unknown as new () => IScheduleService;
  return new ServiceClass();
}

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "reporting.schedule.read");
  
      const { searchParams } = new URL(request.url);
      const definitionId = searchParams.get("definitionId");
      const isActive = searchParams.get("isActive");
  
      const where: Record<string, unknown> = { companyId: ctx.tenant.companyId };
  
      if (definitionId) where.definitionId = definitionId;
      if (isActive !== null) where.isActive = isActive === "true";
  
      const schedules = await prisma.financialReportSchedule.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
  
      return NextResponse.json(
        { schedules },
        { headers: { ...cacheHeaders(15) } },
      );
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "reporting.schedule.write");
  
      const body = await parseJsonBody<Record<string, unknown>>(request);
      const parsed = createScheduleSchema.safeParse(body);
  
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, request);
      }
  
      const scheduleService = await getScheduleService();
      const schedule = await scheduleService.createSchedule(ctx.tenant, {
        definitionId: parsed.data.definitionId,
        name: parsed.data.name,
        frequency: parsed.data.frequency,
        cronExpression: parsed.data.cronExpression,
        recipients: parsed.data.recipients,
        format: parsed.data.format,
        config: JSON.parse(JSON.stringify(parsed.data.config)),
      });
  
      return NextResponse.json(
        { schedule },
        { status: 201, headers: { ...noCacheHeaders() } },
      );
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

export async function PUT(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "reporting.schedule.write");
  
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
  
      if (!id) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "id query parameter is required" } },
          { status: 400 },
        );
      }
  
      const body = await parseJsonBody<Record<string, unknown>>(request);
  
      const scheduleService = await getScheduleService();
      const schedule = await scheduleService.updateSchedule(ctx.tenant, id, {
        name: body.name,
        frequency: body.frequency,
        cronExpression: body.cronExpression,
        recipients: body.recipients,
        format: body.format,
        config: body.config ? JSON.parse(JSON.stringify(body.config)) : undefined,
        isActive: body.isActive,
      });
  
      return NextResponse.json(
        { schedule },
        { headers: { ...noCacheHeaders() } },
      );
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}

export async function DELETE(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "reporting.schedule.write");
  
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
  
      if (!id) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "id query parameter is required" } },
          { status: 400 },
        );
      }
  
      const scheduleService = await getScheduleService();
      await scheduleService.deleteSchedule(ctx.tenant, id);
  
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
