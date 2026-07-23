import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { CheckCircle2, Play, RotateCcw } from "lucide-react";

interface TourWithProgress {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  triggerOn: string | null;
  priority: number;
  isActive: boolean;
  stepCount: number;
  progress: {
    stepIndex: number;
    isCompleted: boolean;
    dismissedAt: string | null;
  } | null;
}

export default async function GuidancePage() {
  const session = await auth();
  if (!session?.user?.activeCompanyId) redirect("/onboarding");
  if (!session.user.id) redirect("/onboarding");
  const ctx = requireTenantContext(session.user.id, session.user.activeCompanyId, session.user.companyRole);

  const [tours, userProgressRecords] = await Promise.all([
    prisma.productGuidance.findMany({
      where: { companyId: ctx.companyId },
      include: {
        steps: { orderBy: { order: "asc" } },
      },
      orderBy: { priority: "asc" },
    }),
    prisma.userGuidanceProgress.findMany({
      where: { userId: session.user.id },
    }),
  ]);

  const progressByGuidanceId = new Map(
    userProgressRecords.map((p: any) => [
      p.guidanceId,
      {
        stepIndex: p.stepIndex,
        isCompleted: p.isCompleted,
        dismissedAt: p.dismissedAt instanceof Date ? p.dismissedAt.toISOString() : p.dismissedAt,
      },
    ]),
  );

  const toursWithProgress: TourWithProgress[] = tours
    .filter((t: any) => t.isActive)
    .map((t: any) => {
      const prog = progressByGuidanceId.get(t.id);
      return {
        id: t.id,
        slug: t.slug,
        title: t.title,
        description: t.description,
        triggerOn: t.triggerOn,
        priority: t.priority,
        isActive: t.isActive,
        stepCount: t.steps.length,
        progress: prog
          ? {
              stepIndex: prog.stepIndex,
              isCompleted: prog.isCompleted,
              dismissedAt: prog.dismissedAt,
            }
          : null,
      };
    });

  const completedCount = toursWithProgress.filter((t) => t.progress?.isCompleted).length;
  const inProgressCount = toursWithProgress.filter(
    (t) => t.progress && !t.progress.isCompleted,
  ).length;
  const notStartedCount = toursWithProgress.filter((t) => !t.progress).length;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Interactive Guidance"
        description="Product tours to help you get the most out of the platform"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Completed</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">In Progress</p>
          <p className="mt-1 text-3xl font-bold text-amber-400">{inProgressCount}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Not Started</p>
          <p className="mt-1 text-3xl font-bold text-zinc-400">{notStartedCount}</p>
        </div>
      </div>

      <div className="space-y-3">
        {toursWithProgress.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-900/40 p-12 text-center">
            <RotateCcw className="mb-3 h-12 w-12 text-zinc-600" />
            <p className="text-lg font-medium text-zinc-400">No guidance tours available</p>
            <p className="mt-1 text-sm text-zinc-500">Tours will appear here when configured.</p>
          </div>
        ) : (
          toursWithProgress.map((tour) => {
            const hasStarted = !!tour.progress;
            const isComplete = tour.progress?.isCompleted ?? false;
            return (
              <div
                key={tour.id}
                className={`rounded-xl border bg-zinc-900/40 p-5 transition-all hover:border-amber-400/20 ${
                  isComplete
                    ? "border-emerald-500/10"
                    : hasStarted
                      ? "border-amber-500/10"
                      : "border-white/[0.06]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{tour.title}</h3>
                      {isComplete && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    {tour.description && (
                      <p className="mt-0.5 text-xs text-zinc-500">{tour.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                      <span>{tour.stepCount} step{tour.stepCount !== 1 ? "s" : ""}</span>
                      {tour.triggerOn && (
                        <span className="rounded-full border border-white/[0.06] bg-zinc-800 px-2 py-0.5">
                          {tour.triggerOn}
                        </span>
                      )}
                      {hasStarted && !isComplete && (
                        <span className="text-amber-400">
                          Step {tour.progress!.stepIndex + 1} of {tour.stepCount}
                        </span>
                      )}
                      {tour.progress?.dismissedAt && (
                        <span className="text-zinc-500">Dismissed</span>
                      )}
                    </div>
                  </div>
                  <button
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isComplete
                        ? "border border-white/[0.06] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                        : "bg-amber-400 text-black hover:bg-amber-500"
                    }`}
                  >
                    {isComplete ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Retake
                      </>
                    ) : hasStarted ? (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        Start
                      </>
                    )}
                  </button>
                </div>

                {hasStarted && !isComplete && (
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{
                        width: `${((tour.progress!.stepIndex + 1) / tour.stepCount) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </PageContainer>
  );
}
