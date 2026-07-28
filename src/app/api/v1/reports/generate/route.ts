import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { enqueue } from "@/modules/queue/queue.service";
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { generateReport } from "@/modules/queue/jobs/report-generate.job";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const generateSchema = z.object({
  dataset: z.enum(["transactions", "ledger", "approvals", "risk", "audit"]),
  columns: z.array(z.string()).min(1),
  format: z.enum(["csv", "json"]).default("csv"),
  filters: z.record(z.string(), z.string()).optional(),
  async: z.boolean().default(false),
});

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const ip = request.headers.get("x-forwarded-for") ?? "unknown";
      const rl = await rateLimit(rateLimitKey("report-generate", ip), 10, 60000);
      if (!rl.ok) {
        return NextResponse.json(
          { error: { code: "TOO_MANY_REQUESTS", message: "Too many report requests." } },
          { status: 429 },
        );
      }
  
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'reporting.create');
  
      const raw = await parseJsonBody<unknown>(request);
      const body = generateSchema.parse(raw);
  
      if (body.async) {
        const jobId = await enqueue("report-generate", {
          companyId: ctx.tenant.companyId,
          userId: ctx.tenant.userId,
          format: body.format,
          dataset: body.dataset,
          columns: body.columns,
          filters: body.filters,
        });
        return NextResponse.json({ jobId, status: "queued" }, { status: 202 });
      }
  
      const result = await generateReport({
        companyId: ctx.tenant.companyId,
        userId: ctx.tenant.userId,
        format: body.format,
        dataset: body.dataset,
        columns: body.columns,
        filters: body.filters,
      });
  
      if (body.format === "json") {
        return NextResponse.json(result);
      }
  
      const filename = `perionyx-${body.dataset}-${new Date().toISOString().split("T")[0]}.csv`;
      return new NextResponse(result.csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return zodErrorResponse(error);
      }
      return handleRouteError(error);
    }
  });
}
