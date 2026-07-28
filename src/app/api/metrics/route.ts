import { NextResponse } from "next/server";
import { metricsExporter } from "@/server/observability/metrics-exporter";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const format = url.searchParams.get("format");
  
      if (format === "prometheus") {
        const body = await metricsExporter.exportPrometheus();
        return new NextResponse(body, {
          headers: {
            "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
            "Cache-Control": "no-store, max-age=0",
          },
        });
      }
  
      const snapshot = await metricsExporter.snapshotJSON();
      return new NextResponse(snapshot, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes("Unauthorized")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json(
        { error: "Failed to export metrics" },
        { status: 500 },
      );
    }
  });
}
