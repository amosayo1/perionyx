import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { NotFoundError } from "@/lib/errors/app-error";
import { prisma } from "@/server/db/prisma";
import { decimalToString } from "@/server/http/money";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await context.params;
    const transaction = await prisma.transaction.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!transaction) {
      throw new NotFoundError("Transaction");
    }
    return NextResponse.json({
      ...transaction,
      primaryAmount: decimalToString(transaction.primaryAmount),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
