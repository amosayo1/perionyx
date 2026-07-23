"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ApprovalMetric } from "./types";
import { ChartLegend } from "./chart-legend";

interface ApprovalAnalyticsProps {
  data: ApprovalMetric[];
  totalPending?: number;
  avgApprovalTime?: string;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  approved: "rgba(52,211,153,0.7)",
  pending: "rgba(251,191,36,0.7)",
  rejected: "rgba(248,113,113,0.7)",
  escalated: "rgba(168,85,247,0.7)",
  expired: "rgba(113,113,122,0.7)",
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours ? `${days}d ${remHours}h` : `${days}d`;
}

export const ApprovalAnalytics = memo(function ApprovalAnalytics({
  data,
  totalPending,
  avgApprovalTime,
  className,
}: ApprovalAnalyticsProps) {
  const { total, segments, waitTimes } = useMemo(() => {
    const total = data.reduce((s, d) => s + d.count, 0) || 1;
    let cumulative = 0;
    const segments = data.map((d) => {
      const startAngle = (cumulative / total) * 360;
      cumulative += d.count;
      const endAngle = (cumulative / total) * 360;
      return { ...d, startAngle, endAngle };
    });
    const waitTimes = data.filter((d) => d.avgWaitMinutes > 0);
    return { total, segments, waitTimes };
  }, [data]);

  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-5", className)}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Approval Analytics</h3>
          {avgApprovalTime && (
            <p className="mt-0.5 text-xs text-zinc-500">Avg {avgApprovalTime}</p>
          )}
        </div>
        {totalPending !== undefined && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
            <span className="text-xs font-medium text-amber-400">{totalPending} pending</span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-8">
        <div className="relative shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {segments.map((seg, i) => {
              const cx = 60, cy = 60, r = 50;
              const startRads = ((seg.startAngle - 90) * Math.PI) / 180;
              const endRads = ((seg.endAngle - 90) * Math.PI) / 180;
              const x1 = cx + r * Math.cos(startRads);
              const y1 = cy + r * Math.sin(startRads);
              const x2 = cx + r * Math.cos(endRads);
              const y2 = cy + r * Math.sin(endRads);
              const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;
              return (
                <path key={i} d={`M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${largeArc} 1 ${x2.toFixed(1)},${y2.toFixed(1)}`} fill="none" stroke={STATUS_COLORS[seg.status.toLowerCase()] || "rgba(255,255,255,0.15)"} strokeWidth={14} strokeLinecap="round" />
              );
            })}
            <text x={60} y={56} textAnchor="middle" fill="white" fontSize={20} fontWeight={700}>{total}</text>
            <text x={60} y={72} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={10}>total</text>
          </svg>
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <ChartLegend
            items={data.map((d) => ({
              label: `${d.status} (${Math.round((d.count / total!) * 100)}%)`,
              color: STATUS_COLORS[d.status.toLowerCase()] || "rgba(255,255,255,0.15)",
            }))}
            direction="vertical"
          />

          {waitTimes.length > 0 && (
            <div className="pt-2 border-t border-white/[0.06]">
              <p className="text-[11px] font-medium text-zinc-500 mb-2">Avg Wait Times</p>
              {waitTimes.map((d) => (
                <div key={d.status} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-zinc-400">{d.status}</span>
                  <span className="text-xs text-zinc-300">{formatDuration(d.avgWaitMinutes)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
