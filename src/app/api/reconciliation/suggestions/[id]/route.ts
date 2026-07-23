import { NextRequest, NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requireTenantContext } from "@/server/context/tenant-context";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;
    const body = await request.json();

    const suggestion = await prisma.matchingSuggestion.update({
      where: { id },
      data: {
        status: body.status,
        acceptedBy: body.status === "ACCEPTED" ? ctx.userId : undefined,
        acceptedAt: body.status === "ACCEPTED" ? new Date() : undefined,
      },
    });

    return NextResponse.json(suggestion);
  } catch (error) {
    return handleRouteError(error);
  }
}
