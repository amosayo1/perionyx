import { NextResponse } from "next/server";
import { EnterprisePilot } from "@/modules/executive-command-center/enterprise-pilot";
import { handleRouteError } from "@/server/http/handle-route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = EnterprisePilot.getDemoScenario(id);
    if (!result) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
