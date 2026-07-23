"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/components/enterprise/motion/tokens";
import type { AdoptionScoreData, AdoptionEventData, UserAdoptionData } from "@/modules/enterprise-experience/types";
import { BarChart3, TrendingUp, Lightbulb, Users, Zap, FileText } from "lucide-react";

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "stroke-emerald-400" : score >= 50 ? "stroke-amber-400" : "stroke-red-400";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none"
          className={color}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-zinc-500">Score</span>
      </div>
    </div>
  );
}

function EventBarChart({ events }: { events: AdoptionEventData[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    events.forEach((e) => {
      const day = new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      map.set(day, (map.get(day) ?? 0) + 1);
    });
    return Array.from(map.entries()).slice(-14);
  }, [events]);

  const maxVal = Math.max(...grouped.map(([, v]) => v), 1);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-white">
        <BarChart3 className="h-4 w-4 text-amber-400" />
        Event Trends
      </h3>
      <div className="flex items-end gap-1.5" style={{ height: 80 }}>
        {grouped.map(([day, count]) => {
          const height = (count / maxVal) * 100;
          return (
            <div key={day} className="flex flex-1 flex-col items-center gap-0.5">
              <motion.div
                className="w-full rounded-sm bg-amber-400/60"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ maxHeight: "100%" }}
              />
              <span className="text-[9px] text-zinc-600">{day.split(" ")[0]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureUsageBreakdown({ score }: { score: AdoptionScoreData }) {
  const entries: Array<[string, number]> = Object.entries(score.featureUsage ?? {}).sort(([, a], [, b]) => b - a);
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-white">
        <Zap className="h-4 w-4 text-amber-400" />
        Feature Usage
      </h3>
      <div className="space-y-2">
        {entries.slice(0, 8).map(([key, val]) => {
          const pct = (val / maxVal) * 100;
          return (
            <div key={key}>
              <div className="mb-0.5 flex items-center justify-between">
                <span className="text-xs text-zinc-400">{key}</span>
                <span className="text-xs text-zinc-500">{val}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800">
                <motion.div
                  className="h-full rounded-full bg-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          );
        })}
        {entries.length === 0 && (
          <p className="text-xs text-zinc-500">No feature usage data</p>
        )}
      </div>
    </div>
  );
}

function UserMiniTable({ users }: { users: UserAdoptionData[] }) {
  const sorted = useMemo(() => [...users].sort((a, b) => b.score - a.score).slice(0, 5), [users]);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-white">
        <Users className="h-4 w-4 text-amber-400" />
        Top Users
      </h3>
      <div className="space-y-2">
        {sorted.map((u) => (
          <div key={u.userId} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{u.userName}</p>
              <p className="truncate text-xs text-zinc-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">{u.totalEvents} events</span>
              <span className={cn(
                "text-xs font-semibold",
                u.score >= 75 ? "text-emerald-400" : u.score >= 50 ? "text-amber-400" : "text-red-400",
              )}>{u.score}</span>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-xs text-zinc-500">No user data</p>
        )}
      </div>
    </div>
  );
}

interface AdoptionAnalyticsDashboardProps {
  score: AdoptionScoreData;
  recentEvents: AdoptionEventData[];
  users: UserAdoptionData[];
}

export function AdoptionAnalyticsDashboard({ score, recentEvents, users }: AdoptionAnalyticsDashboardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-4"
    >
      <div className="flex items-center gap-4">
        <ScoreRing score={score.overallScore} />
        <div>
          <h2 className="text-lg font-semibold text-white">Adoption Analytics</h2>
          <p className="text-sm text-zinc-400">
            {score.activeUsers} of {score.totalUsers} active users
          </p>
          <p className="text-xs text-zinc-500">
            {new Date(score.periodStart).toLocaleDateString()} – {new Date(score.periodEnd).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EventBarChart events={recentEvents} />
        <FeatureUsageBreakdown score={score} />
      </div>

      <UserMiniTable users={users} />

      {score.recommendations && score.recommendations.length > 0 && (
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
            <Lightbulb className="h-3 w-3 text-amber-400" />
            Recommendations
          </p>
          <div className="space-y-1">
            {score.recommendations.map((rec, i) => (
              <p key={i} className="text-sm text-zinc-400">• {rec}</p>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
