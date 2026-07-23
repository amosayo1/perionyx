import { NextRequest, NextResponse } from "next/server";
import { installerFacade } from "@/server/installer";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { requirePermission } from "@/server/security/require-permission";

export async function POST(req: NextRequest) {
  try {
    await requirePermission(req, "admin.settings");

    const body = await parseJsonBody<{
      action: "check-prerequisites" | "validate" | "install";
      config?: Record<string, unknown>;
    }>(req);

    switch (body.action) {
      case "check-prerequisites": {
        const result = await installerFacade.checkPrerequisites();
        return NextResponse.json(result);
      }

      case "validate": {
        const checks = await installerFacade.validate(body.config as unknown as Parameters<typeof installerFacade.validate>[0]);
        return NextResponse.json({ checks });
      }

      case "install": {
        const result = await installerFacade.install(body.config as unknown as Parameters<typeof installerFacade.install>[0]);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    return handleRouteError(err, req);
  }
}
