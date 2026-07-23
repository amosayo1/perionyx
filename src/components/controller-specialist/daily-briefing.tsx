"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Heart, AlertTriangle, ThumbsUp, Bell, CheckCircle2,
  Clock, TrendingUp, ChevronRight,
} from "lucide-react";

interface BriefingData {
  date: string;
  closeProgress: number;
  healthScore: number;
  topRisks: { title: string; severity: string }[];
  recommendations: { title: string; confidence: number }[];
  pendingApprovals: number;
  exceptions: number;
  highlights: string[];
  lateJournals: number;
  reconciliationsDue: number;
  statementsReady: number;
  statementsTotal: number;
}

const defaultBriefing: BriefingData = {
  date: new Date().toISOString().split("T")[0],
  closeProgress: 68,
  healthScore: 87,
  topRisks: [
    { title: "Goodwill impairment provision pending CFO approval", severity: "critical" },
    { title: "3 bank accounts unreconciled above materiality", severity: "high" },
    { title: "Deferred tax provision using outdated rates", severity: "high" },
  ],
  recommendations: [
    { title: "Automate 12 recurring journal entries", confidence: 89 },
    { title: "Prioritize bank reconciliation for 3 accounts", confidence: 95 },
    { title: "Shift depreciation run to Day 1 of close", confidence: 76 },
  ],
  pendingApprovals: 12,
  exceptions: 5,
  highlights: [
    "Close period Dec 2025 is 68% complete — on track for Jan 8",
    "Journal quality score improved from 72% to 78% this month",
    "2 new intercompany mismatches detected in APAC entities",
    "Balance sheet and EPS statements are ready for final review",
    "Policy compliance at 96% — no new violations",
  ],
  lateJournals: 8,
  reconciliationsDue: 7,
  statementsReady: 3,
  statementsTotal: 10,
};

export function DailyBriefing() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatedAt, setGeneratedAt] = useState<string>("Loading...");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/controller/briefings/latest");
        if (res.ok) {
          const data = await res.json();
          setBriefing(data);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
        setGeneratedAt(new Date().toLocaleTimeString());
      }
    }
    load();
  }, []);

  const b = briefing ?? defaultBriefing;

  const severityColors: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Daily Controller Briefing</h1>
          <p className="text-sm text-white/60 mt-1">{b.date} — Your daily accounting overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Clock className="w-3.5 h-3.5" />
          Generated at {generatedAt}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-gold-500">{b.closeProgress}%</div>
          <div className="text-[10px] text-white/50">Close Progress</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">{b.healthScore}%</div>
          <div className="text-[10px] text-white/50">Health Score</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{b.pendingApprovals}</div>
          <div className="text-[10px] text-white/50">Pending Approvals</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-red-400">{b.exceptions}</div>
          <div className="text-[10px] text-white/50">Exceptions</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-orange-400">{b.lateJournals}</div>
          <div className="text-[10px] text-white/50">Late Journals</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{b.statementsReady}/{b.statementsTotal}</div>
          <div className="text-[10px] text-white/50">Statements Ready</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gold-500" />
              <h2 className="text-base font-semibold text-white">Close Progress</h2>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/50">Overall Progress</span>
                <span className="text-sm text-white font-bold">{b.closeProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${b.closeProgress}%` }}
                  transition={{ duration: 1 }}
                  className="h-3 rounded-full bg-gold-500"
                />
              </div>
            </div>
            <div className="text-xs text-white/50 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Reconciliations due: {b.reconciliationsDue}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Health Overview</h2>
            </div>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/50">Accounting Health</span>
                <span className="text-sm text-white font-bold">{b.healthScore}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${b.healthScore}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-3 rounded-full bg-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-semibold text-white">Highlights</h2>
            </div>
            <div className="space-y-2">
              {b.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-gold-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-white/70">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="text-base font-semibold text-white">Top Risks</h2>
            </div>
            <div className="space-y-2">
              {b.topRisks.map((risk, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <span className="text-sm text-white">{risk.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${severityColors[risk.severity]}`}>
                    {risk.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ThumbsUp className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-semibold text-white">Top Recommendations</h2>
            </div>
            <div className="space-y-2">
              {b.recommendations.map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <span className="text-sm text-white">{rec.title}</span>
                  <span className="text-xs text-emerald-400 font-medium">{rec.confidence}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Action Items</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Pending Approvals</span>
                <span className="text-sm text-amber-400 font-medium">{b.pendingApprovals}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Late Journals</span>
                <span className="text-sm text-orange-400 font-medium">{b.lateJournals}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Exceptions</span>
                <span className="text-sm text-red-400 font-medium">{b.exceptions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
