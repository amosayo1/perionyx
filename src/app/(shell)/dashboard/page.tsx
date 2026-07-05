import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { serverFetch, readJsonIfOk } from "@/lib/server-fetch";
import { ModernDashboardClient } from "@/components/dashboard/modern-dashboard-client";

type Wallet = { id: string; name: string; currency: string; balance: string; kind: string };
type TransactionRow = { id: string; type: string; status: string; primaryAmount: string; currency: string; reference: string | null; metadata: unknown; createdAt: string; ledgerEntryCount: number };
type AuditRow = { id: string; companyId: string; actorUserId: string | null; action: string; resourceType: string; resourceId: string | null; severity: string; metadata: unknown; requestId: string | null; payloadHash: string | null; ipAddress: string | null; userAgent: string | null; createdAt: string };

async function fetchTotalTransactions(maxPages: number) {
  const limit = 100;
  let cursor: string | undefined;
  let total = 0;
  let pages = 0;
  let truncated = false;

  while (pages < maxPages) {
    const url = `/api/v1/transactions?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res = await serverFetch(url);
    if (res.status === 401 || res.status === 403) return null;
    const body = await readJsonIfOk<{ items: TransactionRow[]; nextCursor?: string }>(res);
    if (!body) break;
    total += body.items.length;
    pages += 1;
    if (!body.nextCursor) break;
    if (pages >= maxPages) truncated = true;
    cursor = body.nextCursor;
  }
  return { total, truncated };
}

function sumBalancesByCurrency(wallets: Wallet[]) {
  const totals = new Map<string, number>();
  for (const w of wallets) {
    const n = Number(w.balance);
    if (Number.isFinite(n)) totals.set(w.currency, (totals.get(w.currency) ?? 0) + n);
  }
  return totals;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");

  const [walletsRes, txRes, auditRes, analyticsRes] = await Promise.all([
    serverFetch("/api/v1/wallets"),
    serverFetch("/api/v1/transactions?limit=8"),
    serverFetch("/api/v1/audit-logs?limit=6"),
    serverFetch("/api/v1/admin/approval-analytics"),
  ]);

  if (walletsRes.status === 401 || walletsRes.status === 403 ||
      txRes.status === 401 || txRes.status === 403 ||
      auditRes.status === 401 || auditRes.status === 403) {
    redirect("/onboarding");
  }

  const wallets = (await readJsonIfOk<Wallet[]>(walletsRes)) ?? [];
  const txBody = await readJsonIfOk<{ items: TransactionRow[] }>(txRes);
  const auditBody = await readJsonIfOk<{ items: AuditRow[] }>(auditRes);
  const analyticsBody = await readJsonIfOk<any>(analyticsRes);

  const transactions = txBody?.items ?? [];
  const audits = auditBody?.items ?? [];
  const approvalMetrics = analyticsBody?.metrics ?? null;
  const approvalBottlenecks = analyticsBody?.bottlenecks ?? [];

  let totalTransactions: { total: number; truncated: boolean } | null = null;
  try {
    totalTransactions = await fetchTotalTransactions(20);
  } catch {
    totalTransactions = null;
  }

  const totalBal = wallets.reduce((s, w) => s + Number(w.balance), 0);

  return (
    <ModernDashboardClient
      wallets={wallets}
      transactions={transactions}
      audits={audits}
      approvalMetrics={approvalMetrics}
      approvalBottlenecks={approvalBottlenecks}
      totalBal={totalBal}
      totalTransactions={totalTransactions}
    />
  );
}
