"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, FileText, AlertCircle, CheckCircle2, Clock,
  ChevronRight, TrendingUp,
} from "lucide-react";

interface StatementReadiness {
  id: string;
  name: string;
  type: string;
  readinessScore: number;
  status: "NOT_READY" | "PARTIAL" | "READY";
  blockingIssues: number;
  unapprovedJournals: number;
  missingAdjustments: number;
  lastUpdated: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  NOT_READY: { label: "Not Ready", color: "text-red-400", bg: "bg-red-500/10" },
  PARTIAL: { label: "Partial", color: "text-amber-400", bg: "bg-amber-500/10" },
  READY: { label: "Ready", color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

const defaultStatements: StatementReadiness[] = [
  { id: "1", name: "Balance Sheet", type: "Financial", readinessScore: 92, status: "READY", blockingIssues: 0, unapprovedJournals: 2, missingAdjustments: 0, lastUpdated: "2025-12-30" },
  { id: "2", name: "Income Statement", type: "Financial", readinessScore: 85, status: "PARTIAL", blockingIssues: 1, unapprovedJournals: 5, missingAdjustments: 1, lastUpdated: "2025-12-30" },
  { id: "3", name: "Cash Flow Statement", type: "Financial", readinessScore: 78, status: "PARTIAL", blockingIssues: 2, unapprovedJournals: 3, missingAdjustments: 2, lastUpdated: "2025-12-29" },
  { id: "4", name: "Statement of Changes in Equity", type: "Financial", readinessScore: 65, status: "PARTIAL", blockingIssues: 3, unapprovedJournals: 4, missingAdjustments: 3, lastUpdated: "2025-12-28" },
  { id: "5", name: "Notes to Financial Statements", type: "Disclosure", readinessScore: 45, status: "NOT_READY", blockingIssues: 5, unapprovedJournals: 0, missingAdjustments: 4, lastUpdated: "2025-12-27" },
  { id: "6", name: "Segment Reporting", type: "Disclosure", readinessScore: 30, status: "NOT_READY", blockingIssues: 7, unapprovedJournals: 0, missingAdjustments: 6, lastUpdated: "2025-12-26" },
  { id: "7", name: "Related Party Disclosures", type: "Disclosure", readinessScore: 55, status: "PARTIAL", blockingIssues: 2, unapprovedJournals: 1, missingAdjustments: 2, lastUpdated: "2025-12-29" },
  { id: "8", name: "Earnings Per Share", type: "Calculation", readinessScore: 90, status: "READY", blockingIssues: 0, unapprovedJournals: 1, missingAdjustments: 0, lastUpdated: "2025-12-30" },
  { id: "9", name: "Deferred Tax Disclosure", type: "Tax", readinessScore: 40, status: "NOT_READY", blockingIssues: 4, unapprovedJournals: 6, missingAdjustments: 3, lastUpdated: "2025-12-25" },
  { id: "10", name: "Subsequent Events", type: "Disclosure", readinessScore: 70, status: "PARTIAL", blockingIssues: 1, unapprovedJournals: 0, missingAdjustments: 2, lastUpdated: "2025-12-30" },
];

export function StatementReadinessDashboard() {
  const [statements, setStatements] = useState<StatementReadiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/controller/statements");
        if (res.ok) {
          const data = await res.json();
          setStatements(data.statements ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const list = statements.length > 0 ? statements : defaultStatements;
  const readyCount = list.filter((s) => s.status === "READY").length;
  const partialCount = list.filter((s) => s.status === "PARTIAL").length;
  const notReadyCount = list.filter((s) => s.status === "NOT_READY").length;
  const avgReadiness = list.length > 0 ? Math.round(list.reduce((a, b) => a + b.readinessScore, 0) / list.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Statement Readiness</h1>
        <p className="text-sm text-white/60 mt-1">Track readiness of all financial statements for close</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-white">{avgReadiness}%</div>
          <div className="text-xs text-white/50">Avg Readiness</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">{readyCount}</div>
          <div className="text-xs text-white/50">Ready</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{partialCount}</div>
          <div className="text-xs text-white/50">Partial</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-red-400">{notReadyCount}</div>
          <div className="text-xs text-white/50">Not Ready</div>
        </div>
      </div>

      <div className="space-y-3">
        {list.map((stmt, i) => {
          const st = statusConfig[stmt.status];
          return (
            <motion.div
              key={stmt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-gold-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{stmt.name}</div>
                    <div className="text-[10px] text-white/40">{stmt.type} · Updated {stmt.lastUpdated}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>
                  {st.label}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white/50">Readiness Score</span>
                  <span className="text-xs text-white font-medium">{stmt.readinessScore}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      stmt.readinessScore >= 80 ? "bg-emerald-500" : stmt.readinessScore >= 50 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${stmt.readinessScore}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-red-400">{stmt.blockingIssues}</div>
                  <div className="text-[10px] text-white/40">Blocking Issues</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-amber-400">{stmt.unapprovedJournals}</div>
                  <div className="text-[10px] text-white/40">Unapproved Journals</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-orange-400">{stmt.missingAdjustments}</div>
                  <div className="text-[10px] text-white/40">Missing Adjustments</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
