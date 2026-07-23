import { NextRequest, NextResponse } from "next/server";
import { healthManager } from "@/server/health/health-manager";
import { cacheHeaders } from "@/server/http/handle-route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format");

  if (format === "markdown") {
    const md = await healthManager.generateHealthReportMarkdown();
    return new NextResponse(md, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        ...cacheHeaders(30),
      },
    });
  }

  const report = await healthManager.getFullHealthReport();
  return NextResponse.json(report, { headers: { ...cacheHeaders(30) } });
}
