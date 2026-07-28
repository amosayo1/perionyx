import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { MorningBriefingCard } from "@/components/enterprise-experience/morning-briefing-card";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

interface BriefingListItem {
  id: string;
  date: string;
  title: string | null;
  summary: string | null;
  pendingApprovals: number;
  cashPosition: number | null;
  isRead: boolean;
}

function serializeBriefing(b: any) {
  return {
    ...b,
    date: b.date instanceof Date ? b.date.toISOString() : b.date,
    readAt: b.readAt instanceof Date ? b.readAt.toISOString() : b.readAt,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
  };
}

export default async function MorningBriefingPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
    if (!ctx.tenant.companyId) redirect("/onboarding");
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  
    const [todayBriefing, recentBriefings, pendingCount, cashAgg, riskCount] = await Promise.all([
      prisma.morningBriefing.findFirst({
        where: { companyId: ctx.tenant.companyId, date: { gte: today } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.morningBriefing.findMany({
        where: { companyId: ctx.tenant.companyId, date: { gte: sevenDaysAgo } },
        orderBy: { date: "desc" },
        take: 10,
      }),
      prisma.transactionApproval.count({
        where: { companyId: ctx.tenant.companyId, status: "PENDING" },
      }),
      prisma.treasuryCashPosition.aggregate({
        where: { companyId: ctx.tenant.companyId },
        _sum: { totalBalance: true },
      }),
      prisma.riskAlert.count({
        where: { companyId: ctx.tenant.companyId, status: { not: "RESOLVED" } },
      }),
    ]);
  
    const cashPosition = Number(cashAgg._sum.totalBalance ?? 0);
  
    const briefingList: BriefingListItem[] = recentBriefings.map((b: any) => ({
      id: b.id,
      date: b.date instanceof Date ? b.date.toISOString() : b.date,
      title: b.title,
      summary: b.summary,
      pendingApprovals: b.pendingApprovals,
      cashPosition: b.cashPosition,
      isRead: b.isRead,
    }));
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Morning Briefing"
          description={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        />
  
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {todayBriefing ? (
              <MorningBriefingCard
                briefing={serializeBriefing(todayBriefing) as any}
                onMarkRead={async () => {}}
                onViewAll={() => {}}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-900/40 p-12 text-center">
                <p className="text-lg font-medium text-zinc-400">No briefing for today</p>
                <p className="mt-1 text-sm text-zinc-500">Briefings are generated each morning with your financial overview.</p>
              </div>
            )}
          </div>
  
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Quick Stats</h3>
            <div className="space-y-2">
              <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
                <p className="text-xs text-zinc-500">Pending Approvals</p>
                <p className="text-xl font-bold text-white">{pendingCount}</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
                <p className="text-xs text-zinc-500">Cash Position</p>
                <p className="text-xl font-bold text-white">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cashPosition)}
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
                <p className="text-xs text-zinc-500">Open Risk Alerts</p>
                <p className="text-xl font-bold text-white">{riskCount}</p>
              </div>
            </div>
  
            <h3 className="pt-2 text-sm font-medium uppercase tracking-wider text-zinc-500">Recent Briefings</h3>
            <div className="space-y-2">
              {briefingList.length === 0 ? (
                <p className="text-sm text-zinc-500">No recent briefings</p>
              ) : (
                briefingList.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${b.isRead ? "bg-zinc-600" : "bg-amber-400"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-300">{b.title ?? "Morning Briefing"}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(b.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  });
}
