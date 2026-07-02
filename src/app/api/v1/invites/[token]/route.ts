import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { getInviteByToken } from "@/modules/invites";
import { handleRouteError } from "@/server/http/handle-route";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    const invitation = await getInviteByToken(token);
    if (!invitation) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Invitation not found" } },
        { status: 404 },
      );
    }
    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: { code: "INVALID", message: "This invitation has already been used or cancelled" } },
        { status: 400 },
      );
    }
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: { code: "EXPIRED", message: "This invitation has expired" } },
        { status: 400 },
      );
    }
    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      company: invitation.company,
      expiresAt: invitation.expiresAt.toISOString(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
