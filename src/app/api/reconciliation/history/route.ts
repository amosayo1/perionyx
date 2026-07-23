import { NextRequest, NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requireTenantContext } from "@/server/context/tenant-context";
import { auth } from "@/server/auth/auth";
import { matchingHistoryQuerySchema } from "@/lib/validations/reconciliation";
import { prisma } from "@/server/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { searchParams } = new URL(request.url);

    const query = matchingHistoryQuerySchema.parse({
      caseId: searchParams.get("caseId") ?? undefined,
      sourceSystem: searchParams.get("sourceSystem") ?? undefined,
      normalizedReference: searchParams.get("normalizedReference") ?? undefined,
      normalizedVendor: searchParams.get("normalizedVendor") ?? undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
    });

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (query.caseId) where.caseId = query.caseId;
    if (query.sourceSystem) where.sourceSystem = query.sourceSystem;
    if (query.normalizedReference) {
      where.normalizedReference = { contains: query.normalizedReference, mode: "insensitive" };
    }
    if (query.normalizedVendor) {
      where.normalizedVendor = { contains: query.normalizedVendor, mode: "insensitive" };
    }

    const [history, total] = await Promise.all([
      prisma.matchingHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.matchingHistory.count({ where }),
    ]);

    return NextResponse.json({
      history,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
