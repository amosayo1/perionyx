import { z } from "zod";
import { NextResponse } from "next/server";
import { mfaService } from "@/server/iam/mfa";
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { handleRouteError } from "@/server/http/handle-route";
import { logger } from "@/lib/logger";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { prisma } from "@/server/db/prisma";

const MfaBaseSchema = z.object({
  action: z.enum(["enroll", "confirm", "verify", "disable", "recovery", "regenerate-recovery"]),
  code: z.string().min(1).max(128).optional(),
});

// POST /api/auth/mfa/enroll — Begin TOTP enrollment
export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      const ip = request.headers.get("x-forwarded-for") ?? "unknown";
      const rl = await rateLimit(rateLimitKey("mfa-enroll", ip), 5, 60000);
      if (!rl.ok) {
        return NextResponse.json(
          { error: { code: "TOO_MANY_REQUESTS", message: "Too many attempts. Try again later." } },
          { status: 429 },
        );
      }
  
      const rawBody = await request.json().catch(() => ({}));
      const parsed = MfaBaseSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: parsed.error.issues[0].message } },
          { status: 400 },
        );
      }
      const body = parsed.data;
      const action = body.action;
  
      if (action === "enroll") {
        const user = await prisma.user.findUnique({ where: { id: ctx.tenant.userId }, select: { email: true } });
        if (!user?.email) {
          return NextResponse.json(
            { error: { code: "INVALID_STATE", message: "User email is required." } },
            { status: 400 },
          );
        }
  
        const enrollment = await mfaService.beginEnrollment(ctx.tenant.userId, user.email);
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
        await mfaService.confirmEnrollment(ctx.tenant.userId, code);
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
        const valid = await mfaService.verifyCode(ctx.tenant.userId, code);
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
        await mfaService.disable(ctx.tenant.userId, code);
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
        const valid = await mfaService.useRecoveryCode(ctx.tenant.userId, code);
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
        const codes = await mfaService.regenerateRecoveryCodes(ctx.tenant.userId, code);
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
  });
}

// GET /api/auth/mfa/status — Get MFA status
export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      const status = await mfaService.getStatus(ctx.tenant.userId);
      return NextResponse.json(status);
    } catch (err) {
      return handleRouteError(err, request);
    }
  });
}
