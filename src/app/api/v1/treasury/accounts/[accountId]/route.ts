import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { NotFoundError } from "@/lib/errors/app-error";
import { prisma } from "@/server/db/prisma";

type RouteContext = { params: Promise<{ accountId: string }> };

const updateTreasuryAccountBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  accountNumber: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { accountId } = await context.params;
    const account = await prisma.treasuryAccount.findFirst({
      where: { id: accountId, companyId: ctx.companyId },
      include: { controls: true },
    });
    if (!account) {
      throw new NotFoundError("Treasury account");
    }
    return NextResponse.json(account);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { accountId } = await context.params;
    const raw = await parseJsonBody<unknown>(request);
    const body = updateTreasuryAccountBodySchema.parse(raw);
    await prisma.treasuryAccount.updateMany({ where: { id: accountId, companyId: ctx.companyId }, data: body });
    const updated = await prisma.treasuryAccount.findFirst({
      where: { id: accountId, companyId: ctx.companyId },
      include: { controls: true },
    });
    if (!updated) {
      throw new NotFoundError("Treasury account");
    }
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return zodErrorResponse(error);
    }
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { accountId } = await context.params;
    await prisma.treasuryAccount.deleteMany({ where: { id: accountId, companyId: ctx.companyId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
