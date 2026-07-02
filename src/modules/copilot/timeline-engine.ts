import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

export interface TimelineEvent {
  stage: string;
  module: string;
  timestamp: string;
  summary: string;
  recordId: string;
  status: string;
}

export interface TimelineResult {
  transactionId: string;
  events: TimelineEvent[];
  duration?: string;
  status: string;
}

export async function traceTransactionLifecycle(ctx: TenantContext, transactionId: string): Promise<TimelineResult | null> {
  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, companyId: ctx.companyId },
    select: { id: true, status: true, createdAt: true, type: true, primaryAmount: true, currency: true },
  });
  if (!tx) return null;

  const events: TimelineEvent[] = [];

  // 1. Creation
  events.push({
    stage: "Created",
    module: "Transactions",
    timestamp: tx.createdAt.toISOString(),
    summary: `${tx.type} transaction for ${tx.primaryAmount} ${tx.currency}`,
    recordId: tx.id,
    status: "COMPLETED",
  });

  // 2. Approval thread
  const threads = await prisma.approvalThread.findMany({
    where: { transactionId: tx.id },
    select: { id: true, createdAt: true, updatedAt: true, comments: { select: { id: true, body: true, author: { select: { name: true } }, createdAt: true } } },
    orderBy: { createdAt: "asc" },
  });
  for (const t of threads) {
    events.push({
      stage: "Approval Thread",
      module: "Approvals",
      timestamp: t.createdAt.toISOString(),
      summary: `Thread created — ${t.comments.length} comments so far`,
      recordId: t.id,
      status: "CREATED",
    });
    for (const c of t.comments) {
      events.push({
        stage: "Approval Comment",
        module: "Approvals",
        timestamp: c.createdAt.toISOString(),
        summary: `${c.author?.name ?? "Unknown"}: "${c.body.slice(0, 100)}"`,
        recordId: c.id,
        status: "INFO",
      });
    }
  }

  // 3. Ledger entries
  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { transactionId: tx.id },
    select: { id: true, side: true, amount: true, currency: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  for (const le of ledgerEntries) {
    events.push({
      stage: "Ledger Entry",
      module: "Ledger",
      timestamp: le.createdAt.toISOString(),
      summary: `${le.side} ${le.amount} ${le.currency}`,
      recordId: le.id,
      status: "POSTED",
    });
  }

  // 4. Reconciliation
  const reconExceptions = await prisma.reconciliationException.findMany({
    where: { resourceId: tx.id },
    select: { id: true, type: true, message: true, createdAt: true, run: { select: { id: true } } },
    orderBy: { createdAt: "asc" },
  });
  for (const re of reconExceptions) {
    events.push({
      stage: "Reconciliation",
      module: "Reconciliation",
      timestamp: re.createdAt.toISOString(),
      summary: `Exception: ${re.type} — ${re.message}`,
      recordId: re.id,
      status: "EXCEPTION",
    });
  }

  // 5. Audit logs
  const auditLogs = await prisma.auditLog.findMany({
    where: { resourceId: tx.id, companyId: ctx.companyId },
    select: { id: true, action: true, severity: true, resourceType: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  for (const al of auditLogs) {
    events.push({
      stage: "Audit Event",
      module: "Audit",
      timestamp: al.createdAt.toISOString(),
      summary: `${al.action} [${al.severity}] on ${al.resourceType}`,
      recordId: al.id,
      status: al.severity,
    });
  }

  // Sort events by timestamp
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const duration = events.length >= 2
    ? msToDuration(new Date(events[events.length - 1].timestamp).getTime() - new Date(events[0].timestamp).getTime())
    : undefined;

  return {
    transactionId: tx.id,
    events,
    duration,
    status: tx.status,
  };
}

function msToDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}
