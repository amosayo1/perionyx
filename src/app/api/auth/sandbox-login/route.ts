import { NextResponse } from "next/server";
import { signIn } from "@/server/auth/auth";
import { ensureSandboxTenant } from "@/modules/sandbox/sandbox-seed";
import { SANDBOX_EMAIL, SANDBOX_PASSWORD } from "@/modules/sandbox/sandbox-context";
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await rateLimit(rateLimitKey("sandbox-login", ip), 10, 60000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: { code: "TOO_MANY_REQUESTS", message: "Too many attempts. Try again later." } },
        { status: 429 },
      );
    }

    // Ensure the sandbox tenant and guest user exist
    await ensureSandboxTenant();

    const result = await signIn("credentials", {
      email: SANDBOX_EMAIL,
      password: SANDBOX_PASSWORD,
      redirect: false,
    });

    if (!result || result.error) {
      return NextResponse.json(
        { error: { code: "AUTH_FAILED", message: "Sandbox authentication failed." } },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(error, "sandbox-login error:");
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: { code: "INTERNAL", message } },
      { status: 500 },
    );
  }
}
