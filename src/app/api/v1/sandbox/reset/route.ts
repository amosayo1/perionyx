import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { resetSandbox } from "@/modules/sandbox/sandbox-reset";
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const ip = request.headers.get("x-forwarded-for") ?? "unknown";
      const rl = await rateLimit(rateLimitKey("sandbox-reset", ip), 3, 60000);
      if (!rl.ok) {
        return NextResponse.json(
          { error: { code: "TOO_MANY_REQUESTS", message: "Too many sandbox resets. Try again later." } },
          { status: 429 },
        );
      }
  
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.settings');
  
      const result = await resetSandbox(ctx.tenant.companyId);
  
      if (!result) {
        return NextResponse.json({ error: { code: "FORBIDDEN", message: "Only sandbox tenants can be reset." } }, { status: 403 });
      }
  
      return NextResponse.json({ success: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
