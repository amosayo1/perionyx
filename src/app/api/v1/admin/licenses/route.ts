import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { LicenseService } from "@/modules/license/license.service";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "admin.manage_licenses");
      const licenses = await LicenseService.listLicenses(ctx.tenant);
      return NextResponse.json({ items: licenses });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

const issueSchema = z.object({
  companyId: z.string().min(1),
  seats: z.number().int().min(1).optional(),
  features: z.record(z.string(), z.unknown()).optional(),
  expiresAt: z.string().optional(),
});

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "admin.manage_licenses");
      const raw = await parseJsonBody<unknown>(request);
      const body = issueSchema.parse(raw);
      const license = await LicenseService.issueLicense(ctx.tenant, body);
      return NextResponse.json({ success: true, license }, { status: 201 });
    } catch (err) {
      if (err instanceof z.ZodError) return zodErrorResponse(err);
      return handleRouteError(err);
    }
  });
}
