import { NextResponse } from "next/server";
import { encode as encodeJwt, type JWT } from "next-auth/jwt";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createPasswordUser } from "@/modules/users";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { sessionTokenName } from "@/server/auth/auth";
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";
import { acceptInvite, getInviteByToken } from "@/modules/invites/invites.service";
import { prisma } from "@/server/db/prisma";
import { ForbiddenError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logger";

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().max(120).optional().nullable(),
  inviteToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await rateLimit(rateLimitKey("register", ip), 5, 60000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: { code: "TOO_MANY_REQUESTS", message: "Too many registration attempts. Try again later." } },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      );
    }

    const raw = await parseJsonBody<unknown>(request);

    // Check if any company exists — if yes, registration is invite-only (skip in development)
    const companyCount = await prisma.company.count();
    const body = registerSchema.parse(raw);
    if (companyCount > 0 && !body.inviteToken && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: { code: "INVITE_REQUIRED", message: "Registration is invite-only. Please use an invitation link to sign up." } },
        { status: 403 },
      );
    }
    const user = await createPasswordUser({
      email: body.email,
      password: body.password,
      name: body.name,
    });

    // Auto-accept invitation if token provided
    let invitedCompanyId: string | undefined;
    if (body.inviteToken) {
      const invite = await getInviteByToken(body.inviteToken);
      if (!invite) {
        return NextResponse.json(
          { error: { code: "INVALID_INVITE", message: "Invitation not found or expired." } },
          { status: 400 },
        );
      }
      if (invite.email.toLowerCase().trim() !== body.email.toLowerCase().trim()) {
        return NextResponse.json(
          { error: { code: "INVITE_EMAIL_MISMATCH", message: "This invitation was sent to a different email address." } },
          { status: 400 },
        );
      }
      invitedCompanyId = await acceptInvite(body.inviteToken, user.id, user.email ?? undefined);
    }

    // Create a NextAuth JWT session token and set cookie so user is signed in immediately
    try {
      const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
      if (!secret) {
        throw new Error("Missing AUTH_SECRET or NEXTAUTH_SECRET");
      }
      const maxAge = 24 * 60 * 60; // 24 hours, matches auth.ts session.maxAge
      const token: JWT = {
        sub: user.id,
        email: user.email,
        name: user.name ?? undefined,
        activeCompanyId: invitedCompanyId ?? null,
        companyRole: invitedCompanyId ? "MEMBER" : null,
      };
      const encoded = await encodeJwt({
        token,
        secret,
        salt: sessionTokenName,
        maxAge,
      });
      const cookieParts = [
        `${sessionTokenName}=${encoded}`,
        `Path=/`,
        `HttpOnly`,
        `SameSite=Lax`,
        `Max-Age=${maxAge}`,
      ];
      if (process.env.NODE_ENV === "production") cookieParts.push("Secure");

      const body = JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        companyId: invitedCompanyId,
      });
      const headers = new Headers({
        "Content-Type": "application/json",
        "Set-Cookie": cookieParts.join("; "),
      });
      return new Response(body, { status: 201, headers });
    } catch (e) {
      // If session creation fails, still return 201 so registration succeeds and client can sign in manually
      // eslint-disable-next-line no-console
      logger.error(e, "[register] failed to create session cookie");
      return NextResponse.json(
        { id: user.id, email: user.email, name: user.name },
        { status: 201 },
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return zodErrorResponse(error);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "An account with this email already exists." } },
        { status: 409 },
      );
    }
    return handleRouteError(error);
  }
}
