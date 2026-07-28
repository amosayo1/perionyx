import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, zodErrorResponse } from "@/server/http/handle-route";
import { diffVersions, getVersionById } from "@/modules/version-history/version-history";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const querySchema = z.object({
  v1: z.string().min(1, "v1 (version ID) is required"),
  v2: z.string().min(1, "v2 (version ID) is required"),
});

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'analytics.read');
      const url = new URL(request.url);
  
      const parsed = querySchema.safeParse({
        v1: url.searchParams.get("v1"),
        v2: url.searchParams.get("v2"),
      });
      if (!parsed.success) return zodErrorResponse(parsed.error);
  
      const { v1, v2 } = parsed.data;
      const [version1, version2, diffs] = await Promise.all([
        getVersionById(ctx.tenant, v1),
        getVersionById(ctx.tenant, v2),
        diffVersions(ctx.tenant, v1, v2),
      ]);
  
      if (!version1 || !version2) {
        return NextResponse.json({ error: "One or both versions not found" }, { status: 404 });
      }
  
      return NextResponse.json({
        version1,
        version2,
        diffs,
        changesCount: diffs.length,
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
