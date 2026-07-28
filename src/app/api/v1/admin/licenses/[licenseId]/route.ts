import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { LicenseService } from "@/modules/license/license.service";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ licenseId: string }> },
) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "admin.manage_licenses");
      const { licenseId } = await context.params;
      const raw = await parseJsonBody<unknown>(_request);
      const body = raw as { action?: string; reason?: string };
      if (body.action === "revoke") {
        const license = await LicenseService.revokeLicense(licenseId, body.reason);
        return NextResponse.json({ success: true, license });
      }
      return NextResponse.json({ error: { code: "INVALID_ACTION", message: "Supported action: revoke" } }, { status: 400 });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}
