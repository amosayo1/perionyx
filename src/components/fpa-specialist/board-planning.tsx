"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, Calendar, TrendingUp, DollarSign, AlertTriangle,
  ChevronRight, BarChart3, CheckCircle, Clock, Eye,
} from "lucide-react";

interface PlanningPack {
  id: string;
  name: string;
  type: "forecast-summary" | "budget-review" | "scenario-package" | "strategic-report";
  period: string;
  status: "draft" | "final" | "presented";
  lastUpdated: string;
  pageCount: number;
  sections: string[];
}

const typeColors: Record<string, string> = {
  "forecast-summary": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "budget-review": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "scenario-package": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "strategic-report": "bg-gold-500/20 text-gold-500 border-gold-500/30",
};

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/60 border-white/20",
  final: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  presented: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const typeIcons: Record<string, typeof TrendingUp> = {
  "forecast-summary": TrendingUp,
  "budget-review": DollarSign,
  "scenario-package": AlertTriangle,
  "strategic-report": FileText,
};

export function BoardPlanning() {
  const [packs, setPacks] = useState<PlanningPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fpa/board/packs");
        if (res.ok) {
          const data = await res.json();
          setPacks(data.packs ?? []);
        }
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Board Planning</h1>
          <p className="text-sm text-white/60 mt-1">Board planning packs, forecast summaries and strategic reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Packs", value: packs.length || 4, icon: FileText, color: "text-gold-500", bg: "bg-gold-500/10" },
          { label: "Finalized", value: packs.filter((p) => p.status === "final").length || 2, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "In Progress", value: packs.filter((p) => p.status === "draft").length || 1, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Presented", value: packs.filter((p) => p.status === "presented").length || 1, icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{loading ? "—" : card.value}</div>
            <div className="text-xs text-white/50 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/3" />
            </div>
          ))
        ) : packs.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <FileText className="w-12 h-12 text-white/40 mb-3" />
            <div className="text-sm text-white/40">No planning packs yet</div>
          </div>
        ) : (
          packs.map((pack, i) => {
            const Icon = typeIcons[pack.type] || FileText;
            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5 text-gold-500 shrink-0" />
                      <div className="text-sm font-medium text-white">{pack.name}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[pack.type]}`}>{pack.type.replace("-", " ").toUpperCase()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[pack.status]}`}>{pack.status.toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-white/50">{pack.period} &middot; {pack.pageCount} pages &middot; Updated {pack.lastUpdated}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {pack.sections.map((s, j) => (
                        <span key={j} className="text-[10px] px-2 py-0.5 bg-white/5 text-white/40 border border-white/10 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                      <Eye className="w-4 h-4 text-white/60" />
                    </button>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                      <Download className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
