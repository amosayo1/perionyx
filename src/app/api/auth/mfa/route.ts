import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { mfaService } from "@/server/iam/mfa";
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { handleRouteError } from "@/server/http/handle-route";
import { logger } from "@/lib/logger";

// POST /api/auth/mfa/enroll — Begin TOTP enrollment
export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await rateLimit(rateLimitKey("mfa-enroll", ip), 5, 60000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: { code: "TOO_MANY_REQUESTS", message: "Too many attempts. Try again later." } },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action ?? "enroll";

    if (action === "enroll") {
      const user = session?.user as { email?: string } | undefined;
      if (!user?.email) {
        return NextResponse.json(
          { error: { code: "INVALID_STATE", message: "User email is required." } },
          { status: 400 },
        );
      }

      const enrollment = await mfaService.beginEnrollment(ctx.userId, user.email);
      return NextResponse.json({
        secret: enrollment.secret,
        uri: enrollment.uri,
        recoveryCodes: enrollment.recoveryCodes,
      });
    }

    if (action === "confirm") {
      const { code } = body as { code?: string };
      if (!code) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "TOTP code is required." } },
          { status: 400 },
        );
      }
      await mfaService.confirmEnrollment(ctx.userId, code);
      return NextResponse.json({ success: true, message: "MFA enabled successfully." });
    }

    if (action === "verify") {
      const { code } = body as { code?: string };
      if (!code) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "TOTP code is required." } },
          { status: 400 },
        );
      }
      const valid = await mfaService.verifyCode(ctx.userId, code);
      if (!valid) {
        return NextResponse.json(
          { error: { code: "MFA_INVALID", message: "Invalid TOTP code." } },
          { status: 401 },
        );
      }
      return NextResponse.json({ success: true, verified: true });
    }

    if (action === "disable") {
      const { code } = body as { code?: string };
      if (!code) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "TOTP or recovery code is required to disable MFA." } },
          { status: 400 },
        );
      }
      await mfaService.disable(ctx.userId, code);
      return NextResponse.json({ success: true, message: "MFA disabled." });
    }

    if (action === "recovery") {
      const { code } = body as { code?: string };
      if (!code) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "Recovery code is required." } },
          { status: 400 },
        );
      }
      const valid = await mfaService.useRecoveryCode(ctx.userId, code);
      if (!valid) {
        return NextResponse.json(
          { error: { code: "MFA_INVALID", message: "Invalid or already used recovery code." } },
          { status: 401 },
        );
      }
      return NextResponse.json({ success: true, verified: true });
    }

    if (action === "regenerate-recovery") {
      const { code } = body as { code?: string };
      if (!code) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "TOTP code is required to regenerate recovery codes." } },
          { status: 400 },
        );
      }
      const codes = await mfaService.regenerateRecoveryCodes(ctx.userId, code);
      return NextResponse.json({ recoveryCodes: codes });
    }

    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Invalid action." } },
      { status: 400 },
    );
  } catch (err) {
    logger.error(err, "MFA route error");
    return handleRouteError(err, request);
  }
}

// GET /api/auth/mfa/status — Get MFA status
export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const status = await mfaService.getStatus(ctx.userId);
    return NextResponse.json(status);
  } catch (err) {
    return handleRouteError(err, request);
  }
}
