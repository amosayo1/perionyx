import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { NotFoundError } from "@/lib/errors/app-error";
import { prisma } from "@/server/db/prisma";
import { decimalToString } from "@/server/http/money";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const { id } = await context.params;
      const transaction = await prisma.transaction.findFirst({
        where: { id, companyId: ctx.tenant.companyId },
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
  });
}
