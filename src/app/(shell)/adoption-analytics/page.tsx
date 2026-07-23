import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";

interface UserAdoptionEntry {
  userId: string;
  userName: string;
  email: string;
  lastActive: string;
  totalEvents: number;
  workspacesUsed: string[];
  featuresUsed: string[];
  score: number;
}

export default async function AdoptionAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");
  const ctx = requireTenantContext(session.user.id, session.user.activeCompanyId, session.user.companyRole);

  const [latestScore, recentEvents, memberships] = await Promise.all([
    prisma.adoptionScore.findFirst({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.adoptionEvent.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.companyMembership.findMany({
      where: { companyId: ctx.companyId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const serializedScore = latestScore
    ? {
        ...latestScore,
        periodStart:
          latestScore.periodStart instanceof Date
            ? latestScore.periodStart.toISOString()
            : latestScore.periodStart,
        periodEnd:
          latestScore.periodEnd instanceof Date
            ? latestScore.periodEnd.toISOString()
            : latestScore.periodEnd,
        createdAt:
          latestScore.createdAt instanceof Date
            ? latestScore.createdAt.toISOString()
            : latestScore.createdAt,
      }
    : null;

  const serializedEvents = recentEvents.map((e: any) => ({
    ...e,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
  }));

  const userMap = new Map(memberships.map((m: any) => [m.user.id, m.user]));
  const userEvents = new Map<string, any[]>();
  for (const event of recentEvents) {
    const uid = (event as any).userId;
    if (!userEvents.has(uid)) userEvents.set(uid, []);
    userEvents.get(uid)!.push(event);
  }

  const userAdoptionData: UserAdoptionEntry[] = Array.from(userEvents.entries()).map(
    ([userId, events]) => {
      const user = userMap.get(userId);
      const workspaceSet = new Set<string>();
      const featureSet = new Set<string>();
      for (const e of events) {
        if (e.category === "workspace" && e.key) workspaceSet.add(e.key);
        if (e.category === "feature" && e.key) featureSet.add(e.key);
      }
      const lastActive = events.reduce(
        (latest: Date, e: any) =>
          new Date(e.createdAt) > latest ? new Date(e.createdAt) : latest,
        new Date(0),
      );
      return {
        userId,
        userName: user?.name ?? "Unknown",
        email: user?.email ?? "",
        lastActive: lastActive.toISOString(),
        totalEvents: events.length,
        workspacesUsed: Array.from(workspaceSet),
        featuresUsed: Array.from(featureSet),
        score:
          typeof latestScore?.userAdoption === "object" &&
          latestScore.userAdoption !== null
            ? ((latestScore.userAdoption as Record<string, number>)[userId] ?? 0)
            : 0,
      };
    },
  );

  const overallScore = latestScore?.overallScore ?? 0;
  const activeUsers = latestScore?.activeUsers ?? 0;
  const totalUsers = latestScore?.totalUsers ?? 0;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Adoption Analytics"
        description="Understand how your team is using the platform"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Adoption Score</p>
          <p className="mt-1 text-3xl font-bold text-amber-400">{overallScore}%</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Active Users</p>
          <p className="mt-1 text-3xl font-bold text-white">{activeUsers}</p>
          <p className="text-xs text-zinc-500">of {totalUsers} total</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Total Events (Last 100)</p>
          <p className="mt-1 text-3xl font-bold text-white">{recentEvents.length}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Active Workspaces</p>
          <p className="mt-1 text-3xl font-bold text-white">
            {new Set(recentEvents.filter((e: any) => e.category === "workspace").map((e: any) => e.key)).size}
          </p>
        </div>
      </div>

      {latestScore?.unusedFeatures && Array.isArray(latestScore.unusedFeatures) && (latestScore.unusedFeatures as string[]).length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="mb-2 text-sm font-medium text-amber-400">Unused Features</p>
          <div className="flex flex-wrap gap-2">
            {(latestScore.unusedFeatures as string[]).map((f: string) => (
              <span
                key={f}
                className="rounded-full border border-white/[0.06] bg-zinc-900/60 px-2.5 py-0.5 text-xs text-zinc-300"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {latestScore?.recommendations && Array.isArray(latestScore.recommendations) && (latestScore.recommendations as string[]).length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="mb-3 text-sm font-medium text-white">Recommendations</p>
          <ul className="space-y-2">
            {(latestScore.recommendations as string[]).map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          User Adoption ({userAdoptionData.length} users)
        </h3>
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-zinc-900/60">
                <th className="px-4 py-3 text-left font-medium text-zinc-400">User</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Email</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">Events</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-400">Score</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Last Active</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-400">Workspaces</th>
              </tr>
            </thead>
            <tbody>
              {userAdoptionData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No adoption data yet
                  </td>
                </tr>
              ) : (
                userAdoptionData
                  .sort((a, b) => b.totalEvents - a.totalEvents)
                  .map((u) => (
                    <tr key={u.userId} className="border-b border-white/[0.06] last:border-0">
                      <td className="px-4 py-3 font-medium text-white">{u.userName}</td>
                      <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{u.totalEvents}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span
                          className={`font-medium ${
                            u.score >= 70
                              ? "text-emerald-400"
                              : u.score >= 40
                                ? "text-amber-400"
                                : "text-red-400"
                          }`}
                        >
                          {u.score}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {new Date(u.lastActive).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.workspacesUsed.map((w) => (
                            <span
                              key={w}
                              className="rounded-full border border-white/[0.06] bg-zinc-900/60 px-2 py-0.5 text-xs text-zinc-400"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
