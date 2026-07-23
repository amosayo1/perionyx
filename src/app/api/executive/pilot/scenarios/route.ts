import { NextResponse } from "next/server";
import { EnterprisePilot } from "@/modules/executive-command-center/enterprise-pilot";
import { handleRouteError } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const result = EnterprisePilot.getDemoScenarios();
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
