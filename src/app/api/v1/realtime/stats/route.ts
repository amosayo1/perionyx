// ---------------------------------------------------------------------------
// Real-Time Observability — Connection Stats + Emit Counts
// ---------------------------------------------------------------------------
import { NextResponse } from "next/server";
import { getSseStats, getEmitCounts } from "@/server/realtime";
import { getEventBusStats } from "@/server/realtime/event-bus";
import { auth } from "@/server/auth/auth";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.companyRole || session.user.companyRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({
    sse: getSseStats(),
    bus: getEventBusStats(),
    emits: getEmitCounts(),
    timestamp: new Date().toISOString(),
  });
}
