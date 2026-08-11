import { z } from "zod";
import { NextResponse } from "next/server";
import { SCENARIOS, getScenario } from "@/modules/sandbox/scenario";
import { handleRouteError } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { rbacService } from "@/modules/rbac/rbac.service";

const ScenarioSchema = z.object({
  scenarioId: z.string().min(1, "scenarioId is required").max(128),
});

/**
 * GET /api/v1/sandbox/scenario
 * Returns the list of all available scenarios.
 */
export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "analytics.read");

      const scenarios = SCENARIOS.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        estimatedDuration: s.estimatedDuration,
        modules: s.modules,
      }));
  
      return NextResponse.json({ scenarios });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

/**
 * POST /api/v1/sandbox/scenario
 * Body: { scenarioId: string }
 * Executes the specified scenario.
 */
export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "admin.settings");

      const rawBody = await request.json();
      const parsed = ScenarioSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: parsed.error.issues[0].message } },
          { status: 400 },
        );
      }
      const { scenarioId } = parsed.data;
  
      const scenario = getScenario(scenarioId);
      if (!scenario) {
        return NextResponse.json(
          { error: `Scenario "${scenarioId}" not found` },
          { status: 404 },
        );
      }
  
      const result = await scenario.run(ctx.tenant);
  
      return NextResponse.json({ result });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}
