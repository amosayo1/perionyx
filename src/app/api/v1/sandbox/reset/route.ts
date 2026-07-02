import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { resetSandbox } from "@/modules/sandbox/sandbox-reset";
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await rateLimit(rateLimitKey("sandbox-reset", ip), 3, 60000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: { code: "TOO_MANY_REQUESTS", message: "Too many sandbox resets. Try again later." } },
        { status: 429 },
      );
    }

    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const result = await resetSandbox(ctx.companyId);

    if (!result) {
      return NextResponse.json({ error: { code: "FORBIDDEN", message: "Only sandbox tenants can be reset." } }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
