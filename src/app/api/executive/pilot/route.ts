import { NextResponse } from "next/server";
import { EnterprisePilot } from "@/modules/executive-command-center/enterprise-pilot";
import { handleRouteError, zodErrorResponse } from "@/server/http/handle-route";
import { z } from "zod";

const generateSchema = z.object({
  industry: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const result = EnterprisePilot.getIndustryTemplates();
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = generateSchema.safeParse(body);
    if (!parseResult.success) return zodErrorResponse(parseResult.error, req);

    const result = EnterprisePilot.generatePilotSetup(parseResult.data.industry);
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
