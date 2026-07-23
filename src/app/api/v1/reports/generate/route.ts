import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { enqueue } from "@/modules/queue/queue.service";
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { generateReport } from "@/modules/queue/jobs/report-generate.job";
import { rbacService } from "@/modules/rbac/rbac.service";

const generateSchema = z.object({
  dataset: z.enum(["transactions", "ledger", "approvals", "risk", "audit"]),
  columns: z.array(z.string()).min(1),
  format: z.enum(["csv", "json"]).default("csv"),
  filters: z.record(z.string(), z.string()).optional(),
  async: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await rateLimit(rateLimitKey("report-generate", ip), 10, 60000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: { code: "TOO_MANY_REQUESTS", message: "Too many report requests." } },
        { status: 429 },
      );
    }

    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'reporting.create');

    const raw = await parseJsonBody<unknown>(request);
    const body = generateSchema.parse(raw);

    if (body.async) {
      const jobId = await enqueue("report-generate", {
        companyId: ctx.companyId,
        userId: ctx.userId,
        format: body.format,
        dataset: body.dataset,
        columns: body.columns,
        filters: body.filters,
      });
      return NextResponse.json({ jobId, status: "queued" }, { status: 202 });
    }

    const result = await generateReport({
      companyId: ctx.companyId,
      userId: ctx.userId,
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
}
