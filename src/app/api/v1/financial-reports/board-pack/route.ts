import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders, zodErrorResponse } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";
import { z } from "zod";
import type { TenantContext } from "@/server/context/tenant-context";

const generateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  period: z.string().min(1, "Period is required"),
  fiscalYear: z.string().min(1, "Fiscal year is required"),
  audience: z.string().optional(),
  companyIds: z.array(z.string()).optional(),
});

interface IBoardPackGenerator {
  generate(ctx: TenantContext, options: {
    title: string;
    description?: string;
    period: string;
    fiscalYear: string;
    audience: string;
    companyIds: string[];
  }): Promise<Record<string, unknown>>;
}

async function getGenerator(): Promise<IBoardPackGenerator> {
  const mod = await import("@/modules/financial-reporting/board-pack-generator");
  const GeneratorClass = mod.BoardPackGenerator as unknown as new () => IBoardPackGenerator;
  return new GeneratorClass();
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "reporting.board-pack");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const period = searchParams.get("period");
    const fiscalYear = searchParams.get("fiscalYear");

    const where: Record<string, unknown> = { companyId: ctx.companyId };

    if (status) where.status = status;
    if (period) where.period = period;
    if (fiscalYear) where.fiscalYear = fiscalYear;

    const boardPacks = await prisma.boardPack.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { boardPacks },
      { headers: { ...cacheHeaders(30) } },
    );
  } catch (error) {
    return handleRouteError(error, request);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "reporting.board-pack");

    const body = await parseJsonBody<Record<string, unknown>>(request);
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return zodErrorResponse(parsed.error, request);
    }

    const generator = await getGenerator();
    const boardPack = await generator.generate(ctx, {
      title: parsed.data.title,
      description: parsed.data.description,
      period: parsed.data.period,
      fiscalYear: parsed.data.fiscalYear,
      audience: parsed.data.audience ?? "board",
      companyIds: parsed.data.companyIds ?? [ctx.companyId],
    });

    return NextResponse.json(
      { boardPack },
      { status: 201, headers: { ...noCacheHeaders() } },
    );
  } catch (error) {
    return handleRouteError(error, request);
  }
}
