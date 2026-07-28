import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { JournalReviewService } from "@/modules/controller-specialist/journal-review";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const result = await JournalReviewService.getJournalReviews(ctx.tenant, {
        limit: 1,
        offset: 0,
      });
  
      const review = result.reviews.find((r) => r.id === id);
      if (!review) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: `Journal review ${id} not found` } },
          { status: 404 },
        );
      }
  
      return NextResponse.json(review, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const body = await parseJsonBody<{
        status?: "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED" | "FLAGGED";
        reviewerId?: string;
        reviewNotes?: string;
        riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        approvedBy?: string;
        metadata?: Record<string, unknown>;
      }>(req);
  
      const review = await JournalReviewService.updateJournalReview(ctx.tenant, id, body);
      return NextResponse.json(review);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
