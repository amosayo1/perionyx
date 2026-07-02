import { prisma } from "@/server/db/prisma";
import { ForbiddenError } from "@/lib/errors/app-error";
import type { TenantContext } from "@/server/context/tenant-context";

export async function requireNonSandbox(ctx: TenantContext): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { id: ctx.companyId },
    select: { sandbox: true },
  });

  if (company?.sandbox) {
    throw new ForbiddenError("This action is not available in the sandbox environment.");
  }
}
