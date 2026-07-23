"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer } from "@/components/enterprise/motion/tokens";
import type { AdoptionScoreData } from "@/modules/enterprise-experience/types";
import { Users, Lightbulb, PackageX } from "lucide-react";

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

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const color = pct >= 75 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 truncate text-xs text-zinc-400">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-zinc-800">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="w-10 text-right text-xs text-zinc-500">{value}</span>
    </div>
  );
}

interface AdoptionScoreCardProps {
  score: AdoptionScoreData;
}

export function AdoptionScoreCard({ score }: AdoptionScoreCardProps) {
  const usageMax = Math.max(...Object.values(score.featureUsage ?? {}), 1);
  const workspaceMax = Math.max(...Object.values(score.workspaceEngagement ?? {}), 1);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5"
    >
      <div className="mb-6 flex items-center gap-6">
        <ScoreRing score={score.overallScore} />
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-white">Adoption Score</h2>
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <Users className="h-4 w-4 text-amber-400" />
            {score.activeUsers} of {score.totalUsers} active users
          </p>
          <p className="text-xs text-zinc-500">
            {new Date(score.periodStart).toLocaleDateString()} – {new Date(score.periodEnd).toLocaleDateString()}
          </p>
        </div>
      </div>

      {score.userAdoption && Object.keys(score.userAdoption).length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">User Adoption</p>
          <div className="space-y-1.5">
            {Object.entries(score.userAdoption).map(([key, val]) => (
              <MiniBar key={key} label={key} value={val} max={100} />
            ))}
          </div>
        </div>
      )}

      {score.featureUsage && Object.keys(score.featureUsage).length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Feature Usage</p>
          <div className="space-y-1.5">
            {Object.entries(score.featureUsage).slice(0, 6).map(([key, val]) => (
              <MiniBar key={key} label={key} value={val} max={usageMax} />
            ))}
          </div>
        </div>
      )}

      {score.workspaceEngagement && Object.keys(score.workspaceEngagement).length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Workspace Engagement</p>
          <div className="space-y-1.5">
            {Object.entries(score.workspaceEngagement).map(([key, val]) => (
              <MiniBar key={key} label={key} value={val} max={workspaceMax} />
            ))}
          </div>
        </div>
      )}

      {score.unusedFeatures && score.unusedFeatures.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500">
            <PackageX className="h-3 w-3 text-amber-400" />
            Unused Features
          </p>
          <div className="flex flex-wrap gap-1">
            {score.unusedFeatures.map((f) => (
              <span key={f} className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{f}</span>
            ))}
          </div>
        </div>
      )}

      {score.recommendations && score.recommendations.length > 0 && (
        <div>
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
