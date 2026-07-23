import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { traceTransactionLifecycle } from "@/modules/copilot/timeline-engine";
import { prisma } from "@/server/db/prisma";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'analytics.read');
    const body = await parseJsonBody<{ transactionId: string }>(request);

    if (!body.transactionId?.trim()) {
      return NextResponse.json({ error: { code: "VALIDATION", message: "transactionId is required" } }, { status: 400 });
    }

    const txId = body.transactionId.trim();

    const timeline = await traceTransactionLifecycle(ctx, txId);
    if (!timeline) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: `Transaction ${txId} not found` } }, { status: 404 });
    }

    // Build graph data
    const tx = await prisma.transaction.findFirst({
      where: { id: txId, companyId: ctx.companyId },
      select: { type: true, primaryAmount: true, currency: true, reference: true },
    });

    const graph = {
      id: txId,
      label: txId,
      subtitle: tx ? `${tx.type} — ${Number(tx.primaryAmount).toLocaleString()} ${tx.currency}` : undefined,
      type: "payment",
      href: `/transactions/${txId}`,
      children: [
        {
          id: "approvals",
          label: "Approvals",
          subtitle: `Threads: ${timeline.events.filter((e) => e.module === "Approvals").length}`,
          type: "approval" as const,
          href: `/approvals`,
        },
        {
          id: "ledger",
          label: "Ledger",
          subtitle: `Entries: ${timeline.events.filter((e) => e.module === "Ledger").length}`,
          type: "ledger" as const,
          href: `/ledger`,
        },
        {
          id: "audit",
          label: "Audit Trail",
          subtitle: `Events: ${timeline.events.filter((e) => e.module === "Audit").length}`,
          type: "audit" as const,
          href: `/audit-logs`,
        },
        {
          id: "reconciliation",
          label: "Reconciliation",
          subtitle: `Exceptions: ${timeline.events.filter((e) => e.module === "Reconciliation").length}`,
          type: "report" as const,
          href: `/reconciliation`,
        },
      ],
    };

    return NextResponse.json({ timeline, graph });
  } catch (error) {
    return handleRouteError(error);
  }
}
