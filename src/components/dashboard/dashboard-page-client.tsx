"use client";

import { startTransition, useEffect, useState, useCallback } from "react";
import { PageContainer } from "@/components/enterprise/page-container";
import { DashboardSection } from "@/components/enterprise/dashboard-section";
import { DashboardMetricStrip } from "./dashboard-metric-strip";
import { DashboardAttentionQueue } from "./dashboard-attention-queue";
import { DashboardDecisionBrief } from "./dashboard-decision-brief";
import { DashboardWorkQueue } from "./dashboard-work-queue";
import { DashboardTodaysWork } from "./dashboard-todays-work";
import { DashboardActivity } from "./dashboard-activity";
import { dashboardService } from "@/modules/dashboard/dashboard-service";
import type { DashboardDataV2 } from "@/modules/dashboard/types";
import type { TodaysWorkResult } from "@/modules/todays-work/types";

const PERSONA_LABELS: Record<string, string> = {
  controller: "Controller",
  treasurer: "Treasurer",
  executive: "Executive",
  auditor: "Auditor",
};

export function DashboardPageClient() {
  const [data, setData] = useState<DashboardDataV2 | null>(null);
  const [todaysWork, setTodaysWork] = useState<TodaysWorkResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const result = await dashboardService.getDashboardData();
      setData(result);
      setTodaysWork(result.todaysWork);
    } catch {
      setHasError(true);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      void loadData();
    });
  }, [loadData]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-zinc-900/50" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-zinc-900/50" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="col-span-2 h-72 animate-pulse rounded-xl bg-zinc-900/50" />
            <div className="h-72 animate-pulse rounded-xl bg-zinc-900/50" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (hasError || !data) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[15px] text-red-400">Failed to load dashboard data.</p>
          <button
            onClick={loadData}
            className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-[13px] font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Retry
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
          <p className="mt-0.5 text-[12px] text-zinc-600">
            Updated{" "}
            {new Date(data.generatedAt).toLocaleString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
            · Personalised for {PERSONA_LABELS[data.persona] ?? "Controller"}
          </p>
        </div>
      </div>

      <DashboardMetricStrip metrics={data.metrics ?? []} dataMode={data.dataMode} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardSection title="Attention Queue" description="Ranked first-actionable items">
            <DashboardAttentionQueue items={data.attentionQueue ?? []} />
          </DashboardSection>
        </div>
        <DashboardSection title="Decision Brief" description="What the AI recommends you decide">
          <DashboardDecisionBrief decisions={data.decisions ?? []} />
        </DashboardSection>
      </div>

      <DashboardSection title="Work Queue" description="Full AP invoice queue state">
        <DashboardWorkQueue
          items={data.workQueue ?? []}
          totalCount={data.workQueueTotal ?? data.workQueue?.length ?? 0}
        />
      </DashboardSection>

      <DashboardSection title="Today's Work" description="Your task summary for today">
        <DashboardTodaysWork state={todaysWork && todaysWork.categories.length > 0 ? "ready" : todaysWork ? "empty" : "loading"} data={todaysWork ?? undefined} />
      </DashboardSection>

      <DashboardSection title="Recent Activity" description="Latest finance activity">
        <DashboardActivity items={data.activity ?? []} />
      </DashboardSection>
    </PageContainer>
  );
}
