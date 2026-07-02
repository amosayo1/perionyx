import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import {
  createCompanyWithOwner,
  listCompaniesForUser,
} from "@/modules/companies";
import { prisma } from "@/server/db/prisma";
import { requireSession } from "@/server/auth/require-session";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";

const createCompanyBodySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, digits, or hyphen")
    .transform((s) => s.toLowerCase()),
});

export async function GET() {
  try {
    const session = await requireSession();
    const memberships = await listCompaniesForUser(session.user.id);
    return NextResponse.json({
      items: memberships.map((m) => ({
        membershipId: m.id,
        role: m.role,
        company: {
          id: m.company.id,
          name: m.company.name,
          slug: m.company.slug,
          createdAt: m.company.createdAt.toISOString(),
          updatedAt: m.company.updatedAt.toISOString(),
        },
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();

    // Only users without an existing company can create one
    const membershipCount = await prisma.companyMembership.count({
      where: { userId: session.user.id },
    });
    if (membershipCount > 0) {
      return NextResponse.json(
        { error: { code: "ALREADY_MEMBER", message: "You already belong to a company and cannot create another." } },
        { status: 403 },
      );
    }

    const raw = await parseJsonBody<unknown>(request);
    const body = createCompanyBodySchema.parse(raw);
    const company = await createCompanyWithOwner({
      name: body.name,
      slug: body.slug,
      ownerUserId: session.user.id,
    });
    return NextResponse.json(
      {
        id: company.id,
        name: company.name,
        slug: company.slug,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return zodErrorResponse(error);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "A company with this slug already exists." } },
        { status: 409 },
      );
    }
    return handleRouteError(error);
  }
}
