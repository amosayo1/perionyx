import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { JournalReviewService } from "@/modules/controller-specialist/journal-review";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const body = await parseJsonBody<{
      riskType: "unusual_amount" | "duplicate" | "late" | "large" | "policy_violation" | "missing_support" | "unusual_timing" | "round_amount";
      description: string;
    }>(req);

    const risk = await JournalReviewService.flagJournal(ctx, id, body.riskType, body.description);
    return NextResponse.json(risk, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
