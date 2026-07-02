import { NextResponse } from "next/server";
import { z } from "zod";
import { getCompanyMembershipForUser, updateCompany } from "@/modules/companies";
import { requireSession } from "@/server/auth/require-session";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { ForbiddenError } from "@/lib/errors/app-error";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { prisma } from "@/server/db/prisma";

type RouteContext = { params: Promise<{ id: string }> };

const updateCompanyBodySchema = z.object({
  legalName: z.string().max(255).nullable().optional(),
  ein: z.string().max(20).nullable().optional(),
  jurisdiction: z.string().max(255).nullable().optional(),
  entityType: z.string().max(100).nullable().optional(),
  incorporationDate: z.string().nullable().optional(),
  address: z.string().max(500).nullable().optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const row = await getCompanyMembershipForUser(id, session.user.id);
    if (!row) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Company not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json({
      membershipId: row.id,
      role: row.role,
      company: {
        id: row.company.id,
        name: row.company.name,
        slug: row.company.slug,
        legalName: row.company.legalName,
        ein: row.company.ein,
        jurisdiction: row.company.jurisdiction,
        entityType: row.company.entityType,
        incorporationDate: row.company.incorporationDate?.toISOString() ?? null,
        address: row.company.address,
        verificationStatus: row.company.verificationStatus,
        verifiedAt: row.company.verifiedAt?.toISOString() ?? null,
        createdAt: row.company.createdAt.toISOString(),
        updatedAt: row.company.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { id } = await context.params;
    const raw = await parseJsonBody<unknown>(request);
    const body = updateCompanyBodySchema.parse(raw);
    const company = await updateCompany(id, session.user.id, body);
    if (!company) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Company not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json({
      id: company.id,
      name: company.name,
      slug: company.slug,
      legalName: company.legalName,
      ein: company.ein,
      jurisdiction: company.jurisdiction,
      entityType: company.entityType,
      incorporationDate: company.incorporationDate?.toISOString() ?? null,
      address: company.address,
      verificationStatus: company.verificationStatus,
      verifiedAt: company.verifiedAt?.toISOString() ?? null,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    });
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
    if (ctx.role !== "OWNER") {
      throw new ForbiddenError("Only company owners can delete the company.");
    }
    await prisma.company.deleteMany({ where: { id: ctx.companyId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
