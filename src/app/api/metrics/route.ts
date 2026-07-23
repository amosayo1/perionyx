import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { metricsExporter } from "@/server/observability/metrics-exporter";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );

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
}
