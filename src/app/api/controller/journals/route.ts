import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { JournalReviewService } from "@/modules/controller-specialist/journal-review";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status") as "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED" | "FLAGGED" | null;
      const journalType = searchParams.get("journalType") as string | null;
      const riskLevel = searchParams.get("riskLevel") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
      const reviewerId = searchParams.get("reviewerId");
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
      const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;
  
      const result = await JournalReviewService.getJournalReviews(ctx.tenant, {
        status: status ?? undefined,
        journalType: (journalType as import("@/modules/controller-specialist/types").JournalType) ?? undefined,
        riskLevel: riskLevel ?? undefined,
        reviewerId: reviewerId ?? undefined,
        from: from ?? undefined,
        to: to ?? undefined,
        limit,
        offset,
      });
  
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<{
        journalId: string;
        journalType: string;
        amount: number;
        currency?: string;
        postingDate?: string;
        accountCode?: string;
        accountName?: string;
        description?: string;
        reference?: string;
        sourceSystem?: string;
        supportingDocs?: string[];
      }>(req);
  
      const input = {
        ...body,
        journalType: body.journalType as import("@/modules/controller-specialist/types").JournalType,
        amount: body.amount as unknown as import("@prisma/client").Prisma.Decimal,
        postingDate: body.postingDate ? new Date(body.postingDate) : undefined,
      };
  
      const review = await JournalReviewService.createJournalReview(ctx.tenant, input);
      return NextResponse.json(review, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
