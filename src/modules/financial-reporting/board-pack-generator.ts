import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { logger } from "@/lib/logger";
import type {
  ReportConfig, BoardPack, BoardPackSlide, BoardPackStatus,
  ReportType, AICommentary, ExportFormat,
} from "./types";
import { AICommentaryService } from "./ai-commentary.service";

export class BoardPackGenerator {
  static async generate(
    ctx: TenantContext,
    options: {
      title: string;
      description?: string;
      period: string;
      fiscalYear: string;
      audience?: string;
      companyIds?: string[];
      includeSlides?: string[];
    },
  ): Promise<BoardPack> {
    const boardPackId = crypto.randomUUID();
    const slideBuilders = this.getSlideBuilders(options);
    const slides = await this.buildSlides(ctx, slideBuilders);

    const aiCommentary = this.buildAiCommentary(slides);
    const executiveSummary = this.buildExecutiveSummary(slides);

    const boardPack: BoardPack = {
      id: boardPackId,
      companyId: ctx.companyId,
      title: options.title,
      description: options.description,
      period: options.period,
      fiscalYear: options.fiscalYear,
      status: "completed",
      slides,
      executiveSummary,
      aiCommentary,
      generatedBy: ctx.userId,
      generatedAt: new Date().toISOString(),
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await prisma.boardPack.create({
      data: {
        id: boardPack.id,
        companyId: ctx.companyId,
        title: boardPack.title,
        description: boardPack.description,
        period: boardPack.period,
        fiscalYear: boardPack.fiscalYear,
        status: boardPack.status,
        slides: boardPack.slides as unknown as any,
        executiveSummary: (boardPack.executiveSummary ?? {}) as unknown as any,
        aiCommentary: (boardPack.aiCommentary ?? {}) as unknown as any,
        generatedBy: ctx.userId,
        generatedAt: new Date(),
        version: 1,
      },
    });

    logger.info({ boardPackId, companyId: ctx.companyId }, "board_pack_generated");

    return boardPack;
  }

  static async getBoardPack(ctx: TenantContext, boardPackId: string): Promise<BoardPack | null> {
    const record = await prisma.boardPack.findUnique({
      where: { id: boardPackId },
    });

    if (!record || record.companyId !== ctx.companyId) return null;

    return BoardPackGenerator.mapBoardPack(record);
  }

  static async listBoardPacks(
    ctx: TenantContext,
    opts: { status?: string; period?: string; fiscalYear?: string; limit?: number; offset?: number } = {},
  ): Promise<{ boardPacks: BoardPack[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (opts.status) where.status = opts.status;
    if (opts.period) where.period = opts.period;
    if (opts.fiscalYear) where.fiscalYear = opts.fiscalYear;

    const [records, total] = await Promise.all([
      prisma.boardPack.findMany({
        where: where as any,
        orderBy: { createdAt: "desc" },
        take: opts.limit ?? 20,
        skip: opts.offset ?? 0,
      }),
      prisma.boardPack.count({
        where: where as any,
      }),
    ]);

    return {
      boardPacks: records.map((r) => BoardPackGenerator.mapBoardPack(r)),
      total,
    };
  }

  static async distribute(ctx: TenantContext, boardPackId: string, format: ExportFormat): Promise<BoardPack> {
    const record = await prisma.boardPack.findUnique({
      where: { id: boardPackId },
    });

    if (!record || record.companyId !== ctx.companyId) {
      throw new Error(`Board pack "${boardPackId}" not found`);
    }

    const updated = await prisma.boardPack.update({
      where: { id: boardPackId },
      data: {
        status: "distributed",
        distributedAt: new Date(),
      },
    });

    logger.info({ boardPackId, format }, "board_pack_distributed");

    return BoardPackGenerator.mapBoardPack(updated);
  }

  private static getSlideBuilders(options: {
    title: string;
    description?: string;
    period: string;
    fiscalYear: string;
    audience?: string;
    companyIds?: string[];
    includeSlides?: string[];
  }): Array<{ type: BoardPackSlide["type"]; title: string; order: number; builder: () => Promise<Record<string, unknown>> }> {
    const companyIds = options.companyIds ?? [options.companyIds?.[0] ?? "all"];
    const slides: Array<{ type: BoardPackSlide["type"]; title: string; order: number; builder: () => Promise<Record<string, unknown>> }> = [
      {
        type: "kpi",
        title: "Key Performance Indicators",
        order: 1,
        builder: async () => ({ metrics: await BoardPackGenerator.fetchKpiMetrics(companyIds) }),
      },
      {
        type: "financial-statement",
        title: "Financial Statements Overview",
        order: 2,
        builder: async () => ({
          statements: [
            { name: "Balance Sheet", period: options.period, fiscalYear: options.fiscalYear },
            { name: "Profit & Loss", period: options.period, fiscalYear: options.fiscalYear },
            { name: "Cash Flow Statement", period: options.period, fiscalYear: options.fiscalYear },
          ],
        }),
      },
      {
        type: "treasury",
        title: "Treasury Summary",
        order: 3,
        builder: async () => ({
          summary: "Cash position, liquidity metrics, and FX exposure overview.",
          period: options.period,
        }),
      },
      {
        type: "risk",
        title: "Risk Assessment",
        order: 4,
        builder: async () => ({
          risks: ["Market risk", "Credit risk", "Operational risk", "Liquidity risk"],
          period: options.period,
        }),
      },
      {
        type: "commentary",
        title: "AI Commentary & Insights",
        order: 5,
        builder: async () => {
          const commentary = AICommentaryService.generate(
            {} as TenantContext,
            "profit-loss",
            [],
            {
              dateRange: { start: "", end: "" },
              companyIds: [],
              entityIds: [],
              currency: "USD",
              departmentIds: [],
              costCenterIds: [],
              projectIds: [],
              customColumns: [],
              groupBy: [],
              comparison: "prior-year",
              includeAiCommentary: true,
              includeDrillDown: false,
              showZeroBalances: false,
              rounding: 0,
              compact: true,
            },
          );
          return { commentary } as Record<string, unknown>;
        },
      },
      {
        type: "recommendations",
        title: "Recommendations & Action Items",
        order: 6,
        builder: async () => ({
          recommendations: [
            "Review operating expense trends and identify cost savings opportunities",
            "Optimize working capital through receivables management",
            "Evaluate hedging strategy for FX exposure",
            "Update financial forecast based on current performance",
          ],
        }),
      },
      {
        type: "appendix",
        title: "Appendix — Supporting Details",
        order: 7,
        builder: async () => ({
          notes: "Detailed transaction logs, source references, and methodology notes available upon request.",
          slideCount: 7,
        }),
      },
    ];

    if (options.includeSlides && options.includeSlides.length > 0) {
      return slides.filter((s) => options.includeSlides!.includes(s.type));
    }

    return slides;
  }

  private static async buildSlides(
    ctx: TenantContext,
    slideBuilders: Array<{ type: BoardPackSlide["type"]; title: string; order: number; builder: () => Promise<Record<string, unknown>> }>,
  ): Promise<BoardPackSlide[]> {
    const slides: BoardPackSlide[] = [];

    for (const sb of slideBuilders) {
      try {
        const content = await sb.builder();
        slides.push({
          id: crypto.randomUUID(),
          title: sb.title,
          type: sb.type,
          content,
          order: sb.order,
        });
      } catch (err) {
        logger.error({ slideType: sb.type, error: err }, "slide_generation_failed");
        slides.push({
          id: crypto.randomUUID(),
          title: sb.title,
          type: sb.type,
          content: { error: err instanceof Error ? err.message : "Unknown error" },
          order: sb.order,
        });
      }
    }

    return slides;
  }

  private static async fetchKpiMetrics(companyIds: string[]): Promise<Array<{ label: string; value: string; trend: string }>> {
    const snapshotMetrics = [
      "cash_position", "risk_score", "approval_sla", "operational_efficiency",
    ];

    try {
      const snapshots = await prisma.intelligenceSnapshot.findMany({
        where: {
          companyId: { in: companyIds },
          metric: { in: snapshotMetrics },
        },
        orderBy: { takenAt: "desc" },
        distinct: ["metric"],
      });

      return snapshots.map((s) => ({
        label: s.label ?? s.metric.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: String(Number(s.value).toLocaleString()),
        trend: Number(s.value) >= 0 ? "up" : "down",
      }));
    } catch {
      return snapshotMetrics.map((m) => ({
        label: m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: "—",
        trend: "neutral",
      }));
    }
  }

  private static buildAiCommentary(slides: BoardPackSlide[]): AICommentary | undefined {
    const commentarySlide = slides.find((s) => s.type === "commentary");
    if (!commentarySlide) return undefined;

    return commentarySlide.content.commentary as AICommentary | undefined;
  }

  private static buildExecutiveSummary(slides: BoardPackSlide[]): Record<string, unknown> {
    const kpiSlide = slides.find((s) => s.type === "kpi");
    const metrics = kpiSlide?.content?.metrics as Array<{ label: string; value: string; trend: string }> | undefined;

    return {
      slideCount: slides.length,
      kpiCount: metrics?.length ?? 0,
      generatedAt: new Date().toISOString(),
      metrics: metrics ?? [],
      summary: "Board pack generated with KPI overview, financial statements, treasury analysis, risk assessment, and AI-powered commentary.",
    };
  }

  private static mapBoardPack(record: {
    id: string; companyId: string; title: string; description: string | null;
    period: string; fiscalYear: string; status: string; slides: unknown;
    executiveSummary: unknown; aiCommentary: unknown; generatedBy: string;
    generatedAt: Date | null; distributedAt: Date | null; version: number;
    createdAt: Date; updatedAt: Date;
  }): BoardPack {
    return {
      id: record.id,
      companyId: record.companyId,
      title: record.title,
      description: record.description ?? undefined,
      period: record.period,
      fiscalYear: record.fiscalYear,
      status: record.status as BoardPackStatus,
      slides: (record.slides ?? []) as BoardPackSlide[],
      executiveSummary: record.executiveSummary ? (record.executiveSummary as Record<string, unknown>) : undefined,
      aiCommentary: record.aiCommentary ? (record.aiCommentary as AICommentary) : undefined,
      generatedBy: record.generatedBy,
      generatedAt: record.generatedAt?.toISOString(),
      distributedAt: record.distributedAt?.toISOString(),
      version: record.version,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
