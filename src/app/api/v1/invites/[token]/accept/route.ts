import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { acceptInvite } from "@/modules/invites";
import { handleRouteError } from "@/server/http/handle-route";
import { UnauthorizedError } from "@/lib/errors/app-error";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { token } = await context.params;
    const companyId = await acceptInvite(token, session.user.id, session.user.email ?? undefined);
    return NextResponse.json({ success: true, companyId });
  } catch (error) {
    return handleRouteError(error);
  }
}
