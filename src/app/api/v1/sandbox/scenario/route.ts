import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { SCENARIOS, getScenario } from "@/modules/sandbox/scenario";
import { handleRouteError } from "@/server/http/handle-route";

/**
 * GET /api/v1/sandbox/scenario
 * Returns the list of all available scenarios.
 */
export async function GET() {
  try {
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
}

/**
 * POST /api/v1/sandbox/scenario
 * Body: { scenarioId: string }
 * Executes the specified scenario.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );

    const body = await request.json();
    const { scenarioId } = body as { scenarioId: string };

    if (!scenarioId) {
      return NextResponse.json(
        { error: "scenarioId is required" },
        { status: 400 },
      );
    }

    const scenario = getScenario(scenarioId);
    if (!scenario) {
      return NextResponse.json(
        { error: `Scenario "${scenarioId}" not found` },
        { status: 404 },
      );
    }

    const result = await scenario.run(ctx);

    return NextResponse.json({ result });
  } catch (err) {
    return handleRouteError(err);
  }
}
