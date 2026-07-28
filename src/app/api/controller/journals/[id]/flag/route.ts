import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { JournalReviewService } from "@/modules/controller-specialist/journal-review";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const body = await parseJsonBody<{
        riskType: "unusual_amount" | "duplicate" | "late" | "large" | "policy_violation" | "missing_support" | "unusual_timing" | "round_amount";
        description: string;
      }>(req);
  
      const risk = await JournalReviewService.flagJournal(ctx.tenant, id, body.riskType, body.description);
      return NextResponse.json(risk, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
