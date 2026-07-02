import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { LicenseService } from "@/modules/license/license.service";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "admin.manage_licenses");
    const licenses = await LicenseService.listLicenses(ctx);
    return NextResponse.json({ items: licenses });
  } catch (err) {
    return handleRouteError(err);
  }
}

const issueSchema = z.object({
  companyId: z.string().min(1),
  seats: z.number().int().min(1).optional(),
  features: z.record(z.string(), z.unknown()).optional(),
  expiresAt: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "admin.manage_licenses");
    const raw = await parseJsonBody<unknown>(request);
    const body = issueSchema.parse(raw);
    const license = await LicenseService.issueLicense(ctx, body);
    return NextResponse.json({ success: true, license }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return zodErrorResponse(err);
    return handleRouteError(err);
  }
}
