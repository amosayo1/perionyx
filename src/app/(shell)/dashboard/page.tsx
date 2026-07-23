import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { serverFetch, readJsonIfOk } from "@/lib/server-fetch";
import { ExecutiveCommandCenter } from "@/components/executive-dashboard";

type Wallet = { id: string; name: string; currency: string; balance: string; kind: string };
type TransactionRow = { id: string; type: string; status: string; primaryAmount: string; currency: string; reference: string | null; metadata: unknown; createdAt: string; ledgerEntryCount: number };

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

  const [walletsRes, analyticsRes] = await Promise.all([
    serverFetch("/api/v1/wallets"),
    serverFetch("/api/v1/admin/approval-analytics"),
  ]);

  const wallets = walletsRes.ok ? (await readJsonIfOk<Wallet[]>(walletsRes)) ?? [] : [];
  const analyticsBody = analyticsRes.ok ? await readJsonIfOk<any>(analyticsRes) : null;
  const approvalMetrics = analyticsBody?.metrics ?? null;

  const totalBal = wallets.reduce((s, w) => s + Number(w.balance), 0);
  const pendingApprovals = approvalMetrics?.pendingApprovals ?? 0;

  const normalizedWallets = wallets.map((w) => ({ currency: w.currency, balance: Number(w.balance) }));

  return (
    <ExecutiveCommandCenter
      userName={session.user.name}
      wallets={normalizedWallets}
      totalBal={totalBal}
      pendingApprovals={pendingApprovals}
    />
  );
}
