import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { TreasurySpecialistService } from "@/modules/treasury-specialist/treasury-specialist";
import { prisma } from "@/server/db/prisma";
import type { BriefingType, GenerateBriefingInput } from "@/modules/treasury-specialist/types";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const briefingType = searchParams.get("briefingType") as BriefingType | null;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = { companyId: ctx.companyId };

    if (briefingType) {
      where.briefingType = briefingType;
    }

    if (dateFrom || dateTo) {
      where.briefingDate = {};
      if (dateFrom) {
        (where.briefingDate as Record<string, Date>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.briefingDate as Record<string, Date>).lte = new Date(dateTo);
      }
    }

    const briefings = await prisma.treasuryBriefing.findMany({
      where: where as never,
      orderBy: { briefingDate: "desc" },
      take: 50,
    });

    return NextResponse.json(briefings, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await parseJsonBody<{
      briefingType?: string;
      title?: string;
      includeSections?: string[];
      metadata?: Record<string, unknown>;
    }>(req);

    const type = (body.briefingType as BriefingType) ?? "daily";

    const briefing = await TreasurySpecialistService.getBriefing(ctx, type);
    return NextResponse.json(briefing, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
