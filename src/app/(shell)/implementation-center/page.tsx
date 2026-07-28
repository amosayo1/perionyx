import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

interface MilestoneWithProgress {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  order: number;
  isRequired: boolean;
  estimatedDays: number | null;
  dependsOn: string | null;
  progress: {
    status: string;
    completedAt: string | null;
    notes: string | null;
  } | null;
}

export default async function ImplementationCenterPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
    if (!ctx.tenant.companyId) redirect("/onboarding");
  
    const [milestones, activeIntegrations, policyCount, usersCount] = await Promise.all([
      prisma.implementationMilestone.findMany({
        where: { companyId: ctx.tenant.companyId },
        include: {
          progress: {
            where: { companyId: ctx.tenant.companyId },
          },
        },
        orderBy: { order: "asc" },
      }),
      prisma.integrationInstance.count({
        where: { companyId: ctx.tenant.companyId, status: "ACTIVE" },
      }),
      prisma.policy.count({
        where: { companyId: ctx.tenant.companyId },
      }),
      prisma.companyMembership.count({
        where: { companyId: ctx.tenant.companyId },
      }),
    ]);
  
    const milestonesWithProgress: MilestoneWithProgress[] = milestones.map((m: any) => ({
      id: m.id,
      slug: m.slug,
      name: m.name,
      description: m.description,
      category: m.category,
      order: m.order,
      isRequired: m.isRequired,
      estimatedDays: m.estimatedDays,
      dependsOn: m.dependsOn,
      progress: m.progress.length > 0
        ? {
            status: m.progress[0].status,
            completedAt: m.progress[0].completedAt instanceof Date
              ? m.progress[0].completedAt.toISOString()
              : m.progress[0].completedAt,
            notes: m.progress[0].notes,
          }
        : null,
    }));
  
    const total = milestones.length;
    const completed = milestonesWithProgress.filter(
      (m) => m.progress?.status === "completed",
    ).length;
    const inProgress = milestonesWithProgress.filter(
      (m) => m.progress?.status === "in_progress",
    ).length;
    const blocked = milestonesWithProgress.filter(
      (m) => m.progress?.status === "blocked",
    ).length;
    const skipped = milestonesWithProgress.filter(
      (m) => m.progress?.status === "skipped",
    ).length;
    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;
  
    const nextRecommended = milestonesWithProgress.find(
      (m) => !m.progress || m.progress.status === "pending",
    );
  
    const summary = {
      total,
      completed,
      inProgress,
      blocked,
      skipped,
      percentComplete,
      nextRecommendedSlug: nextRecommended?.slug ?? null,
      estimatedDaysRemaining: milestonesWithProgress
        .filter((m) => !m.progress || m.progress.status !== "completed")
        .reduce((sum, m) => sum + (m.estimatedDays ?? 0), 0),
    };
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Implementation Center"
          description="Track your deployment progress and system readiness"
        />
  
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Overall Progress</p>
            <p className="mt-1 text-3xl font-bold text-white">{summary.percentComplete}%</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${summary.percentComplete}%` }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Active Integrations</p>
            <p className="mt-1 text-3xl font-bold text-white">{activeIntegrations}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Policies Configured</p>
            <p className="mt-1 text-3xl font-bold text-white">{policyCount}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Team Members</p>
            <p className="mt-1 text-3xl font-bold text-white">{usersCount}</p>
          </div>
        </div>
  
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
              Milestones ({summary.completed}/{summary.total})
            </h3>
            <div className="space-y-2">
              {milestonesWithProgress.map((m) => {
                const statusColor: Record<string, string> = {
                  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
                  in_progress: "border-amber-500/20 bg-amber-500/10 text-amber-400",
                  blocked: "border-red-500/20 bg-red-500/10 text-red-400",
                  skipped: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
                  pending: "border-white/[0.06] bg-zinc-900/40 text-zinc-500",
                };
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-4 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-4 py-3"
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        m.progress?.status === "completed"
                          ? "bg-emerald-400"
                          : m.progress?.status === "in_progress"
                            ? "bg-amber-400"
                            : m.progress?.status === "blocked"
                              ? "bg-red-400"
                              : "bg-zinc-600"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{m.name}</p>
                      {m.description && (
                        <p className="truncate text-xs text-zinc-500">{m.description}</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColor[m.progress?.status ?? "pending"]
                      }`}
                    >
                      {(m.progress?.status ?? "pending").replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
  
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">Progress by Category</h3>
            <div className="space-y-3">
              {["setup", "integration", "configuration", "validation", "go-live"].map((cat) => {
                const catMilestones = milestonesWithProgress.filter((m) => m.category === cat);
                const catCompleted = catMilestones.filter(
                  (m) => m.progress?.status === "completed",
                ).length;
                const catTotal = catMilestones.length;
                const catPercent = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;
                return (
                  <div key={cat} className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm capitalize text-zinc-300">{cat}</p>
                      <p className="text-xs text-zinc-500">{catCompleted}/{catTotal}</p>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{ width: `${catPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
  
            {summary.blocked > 0 && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-sm font-medium text-red-400">Blocked Items</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {summary.blocked} milestone{summary.blocked > 1 ? "s" : ""} blocked. Resolve blockers to continue.
                </p>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    );
  });
}
