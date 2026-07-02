import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { serverFetch, readJsonIfOk } from "@/lib/server-fetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatMoney } from "@/lib/format";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { AuditPreviewTable } from "@/components/dashboard/AuditPreviewTable";
import { TelemetryWidget } from "@/components/dashboard/TelemetryWidget";
import { FxSyncStatusWidget } from "@/components/dashboard/FxSyncStatusWidget";
import { LedgerIntegrityWidget } from "@/components/dashboard/LedgerIntegrityWidget";
import { SparklineGraph } from "@/components/dashboard/SparklineGraph";
import { FinancialInsightsPanel } from "@/components/dashboard/FinancialInsightsPanel";
import { ApprovalStatusWidget, ApprovalBottlenecksWidget } from "@/components/dashboard";
import { CommandCenterSection } from "./CommandCenterSection";
import { ActivityTimeline } from "./ActivityTimeline";

type Wallet = {
  id: string;
  name: string;
  currency: string;
  balance: string;
  kind: string;
};

type TransactionRow = {
  id: string;
  type: string;
  status: string;
  primaryAmount: string;
  currency: string;
  reference: string | null;
  metadata: unknown;
  createdAt: string;
  ledgerEntryCount: number;
};

type AuditRow = {
  id: string;
  companyId: string;
  actorUserId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  severity: string;
  metadata: unknown;
  requestId: string | null;
  payloadHash: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

async function fetchTotalTransactions(maxPages: number) {
  const limit = 100;
  let cursor: string | undefined;
  let total = 0;
  let pages = 0;
  let truncated = false;

  while (pages < maxPages) {
    const url = `/api/v1/transactions?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res = await serverFetch(url);
    if (res.status === 401 || res.status === 403) {
      return null;
    }

    const body = await readJsonIfOk<{ items: TransactionRow[]; nextCursor?: string }>(res);
    if (!body) {
      break;
    }

    total += body.items.length;
    pages += 1;
    if (!body.nextCursor) {
      break;
    }
    if (pages >= maxPages) {
      truncated = true;
    }
    cursor = body.nextCursor;
  }

  return { total, truncated };
}

function sumBalancesByCurrency(wallets: Wallet[]) {
  const totalsByCurrency = new Map<string, number>();
  for (const w of wallets) {
    const n = Number(w.balance);
    if (!Number.isFinite(n)) continue;
    totalsByCurrency.set(w.currency, (totalsByCurrency.get(w.currency) ?? 0) + n);
  }
  return totalsByCurrency;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) {
    redirect("/onboarding");
  }

  const [walletsRes, txRes, auditRes, analyticsRes] = await Promise.all([
    serverFetch("/api/v1/wallets"),
    serverFetch("/api/v1/transactions?limit=8"),
    serverFetch("/api/v1/audit-logs?limit=6"),
    serverFetch("/api/v1/admin/approval-analytics"),
  ]);

  if (walletsRes.status === 401 || walletsRes.status === 403) {
    redirect("/onboarding");
  }
  if (txRes.status === 401 || txRes.status === 403) {
    redirect("/onboarding");
  }
  if (auditRes.status === 401 || auditRes.status === 403) {
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

  const errorMessages: string[] = [];
  if (!walletsRes.ok) errorMessages.push("Unable to load wallets.");
  if (!txRes.ok) errorMessages.push("Unable to load transactions.");
  if (!auditRes.ok) errorMessages.push("Unable to load audit activity.");
  if (!analyticsRes.ok) errorMessages.push("Unable to load approval metrics.");

  let totalTransactions: { total: number; truncated: boolean } | null = null;
  try {
    totalTransactions = await fetchTotalTransactions(20);
  } catch {
    totalTransactions = null;
  }

  const totalsByCurrency = sumBalancesByCurrency(wallets);
  const totalBal = wallets.reduce((s, w) => s + Number(w.balance), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Error messages */}
      {errorMessages.length ? (
        <Card className="border-white/10 bg-zinc-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white">Some data could not be loaded</CardTitle>
            <CardDescription className="text-white/60">Empty states will still render for the missing sections.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="list-disc space-y-1 pl-5 text-sm text-white/60">
              {errorMessages.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* ROW 1: Hero with Dubai background + Treasury Balance + Activity */}
      <section className="relative min-h-[300px] overflow-hidden rounded-xl border border-white/[0.06]">
        {/* Dubai skyline background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1512453328829-43d8b66de667?w=1200&h=400&fit=crop')",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(9,9,11,0.9)] via-[rgba(9,9,11,0.5)] to-[rgba(9,9,11,0.25)]" />

        <div className="relative z-10 grid min-h-[300px] grid-cols-12 gap-6 p-8 lg:p-10">

          {/* Col 1-3: Perionyx Command Center */}
          <div className="col-span-12 lg:col-span-3 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37] mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
              Enterprise Command Center
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">Executive Overview</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/70 max-w-xs">
              Executive treasury balances, operational metrics, and governance intelligence for your enterprise.
            </p>
            <div className="mt-5 space-y-2 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                Environment: Production
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Region: UAE (DXB)
              </div>
            </div>
          </div>

          {/* Col 4-5: Total Treasury Balance */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-2 flex flex-col justify-center">
            <div className="rounded-xl border border-white/[0.08] bg-black/50 backdrop-blur-sm p-5 shadow-lg">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-3">
                Total Treasury Balance
              </p>
              <div className="overflow-hidden">
                <div className="truncate text-xl font-bold tabular-nums tracking-tight text-[#d4af37] sm:text-2xl">
                  {formatMoney(String(totalBal), wallets[0]?.currency || "USD")}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-xs font-medium text-[#d4af37]">+2.4%</span>
                <span className="text-xs text-white/50">vs last month</span>
              </div>
              <div className="mt-3">
                <SparklineGraph data={wallets.map(w => Number(w.balance)).slice(0, 8)} color="#d4af37" height={28} width={120} />
              </div>
            </div>
          </div>

          {/* Col 6-12: Recent Activity */}
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
            <div className="rounded-xl border border-white/[0.08] bg-black/50 backdrop-blur-sm p-5 shadow-lg">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
                Recent Activity
              </p>
              <ActivityTimeline transactions={transactions} />
            </div>
          </div>
        </div>
      </section>

      {/* EXISTING COMPONENTS — preserved below the hero */}
      <div className="grid gap-4 md:grid-cols-2">
        <FxSyncStatusWidget />
        <LedgerIntegrityWidget />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TelemetryWidget
          value={wallets.reduce((sum, w) => sum + Number(w.balance), 0)}
          label="Live Treasury Balance"
          unit={wallets[0]?.currency || ""}
          trend={transactions.length > 0 && Number(transactions[0].primaryAmount) > 0 ? "up" : "down"}
        />
        <FinancialInsightsPanel
          insights={[
            { label: "Liquidity Ratio", value: "2.8", trend: "up" },
            { label: "Avg. Tx Size", value: transactions.length ? `${Number(transactions[0].primaryAmount).toLocaleString()} ${transactions[0].currency}` : "-", trend: null },
            { label: "Audit Events", value: String(audits.length), trend: audits.length > 2 ? "up" : null },
            { label: "Wallets", value: String(wallets.length), trend: wallets.length > 2 ? "up" : null },
          ]}
        />
      </div>

      <WalletOverview wallets={wallets} />

      <div className="grid gap-6 lg:grid-cols-2">
        {approvalMetrics && (
          <ApprovalStatusWidget metrics={approvalMetrics} isLoading={false} />
        )}
        {approvalBottlenecks && approvalBottlenecks.length > 0 && (
          <ApprovalBottlenecksWidget bottlenecks={approvalBottlenecks} isLoading={false} />
        )}
      </div>

      <CommandCenterSection />

      <div className="space-y-6">
        <Card className="border-white/[0.06] bg-zinc-900/40">
          <CardHeader className="pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold text-white">Recent transactions</CardTitle>
              <CardDescription className="text-white/50">Latest postings across the active company.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Transactions will appear here after your first wallet operations."
              />
            ) : (
              <RecentTransactionsTable transactions={transactions} wallets={wallets} />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-zinc-900/40">
          <CardHeader className="pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold text-white">Audit activity preview</CardTitle>
              <CardDescription className="text-white/50">Security-sensitive events with severity indicators.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {audits.length === 0 ? (
              <EmptyState
                title="No audit logs yet"
                description="Mutating operations will be recorded in the audit trail."
              />
            ) : (
              <AuditPreviewTable audits={audits} />
            )}
            {audits.length ? (
              <div className="mt-3 text-xs text-white/50">
                Latest activity as of {formatDateTime(audits[0]?.createdAt)}.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
