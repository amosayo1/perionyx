"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Plus, Search, Filter, TrendingUp, TrendingDown, Minus,
  ChevronRight, AlertTriangle, CheckCircle, Target,
} from "lucide-react";

interface VarianceAnalysis {
  id: string;
  name: string;
  type: "budget" | "forecast" | "prior-period" | "rolling";
  period: string;
  overallVariance: number;
  overallVariancePercent: number;
  keyDrivers: string[];
  rootCauses: string[];
  status: "draft" | "completed" | "reviewed";
}

interface CreateVarianceForm {
  name: string;
  type: string;
  period: string;
}

const typeColors: Record<string, string> = {
  budget: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  forecast: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "prior-period": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  rolling: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/60 border-white/20",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  reviewed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export function VarianceCenter() {
  const [analyses, setAnalyses] = useState<VarianceAnalysis[]>([]);
  const [selected, setSelected] = useState<VarianceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateVarianceForm>({ name: "", type: "budget", period: "Q1 2026" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fpa/variance");
        if (res.ok) {
          const data = await res.json();
          setAnalyses(data.analyses ?? []);
        }
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = analyses.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (n: number) => {
    const abs = Math.abs(n);
    const prefix = n < 0 ? "-" : "";
    return `${prefix}$${(abs / 1000000).toFixed(2)}M`;
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/fpa/variance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyses((prev) => [...prev, data.analysis]);
        setShowCreate(false);
        setForm({ name: "", type: "budget", period: "Q1 2026" });
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Variance Analysis</h1>
          <p className="text-sm text-white/60 mt-1">Budget vs actual, forecast variance and root cause analysis</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Analysis
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search analyses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/3" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-sm text-white/40 py-8 text-center">No variance analyses found</div>
        ) : (
          filtered.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(a)}
              className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-all ${
                selected?.id === a.id ? "border-gold-500/50 bg-gold-500/5" : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-white">{a.name}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[a.type]}`}>{a.type.toUpperCase()}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[a.status]}`}>{a.status.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">{a.period} &middot; Key drivers: {a.keyDrivers.join(", ")}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold ${a.overallVariancePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {a.overallVariancePercent > 0 ? "+" : ""}{a.overallVariancePercent.toFixed(1)}%
                  </div>
                  <div className="text-xs text-white/50">{formatCurrency(a.overallVariance)}</div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{selected.name}</h2>
              <p className="text-xs text-white/50 mt-1">{selected.period} &middot; {selected.type.charAt(0).toUpperCase() + selected.type.slice(1)} Variance</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[selected.status]}`}>{selected.status.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-xs text-white/50">Overall Variance</div>
              <div className={`text-2xl font-bold mt-1 ${selected.overallVariancePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {selected.overallVariancePercent > 0 ? "+" : ""}{selected.overallVariancePercent.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50">Variance Amount</div>
              <div className="text-2xl font-bold text-white mt-1">{formatCurrency(selected.overallVariance)}</div>
            </div>
            <div>
              <div className="text-xs text-white/50">Key Drivers</div>
              <div className="text-lg font-bold text-gold-500 mt-1">{selected.keyDrivers.length}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Key Drivers</h3>
              <div className="flex flex-wrap gap-2">
                {selected.keyDrivers.map((d, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-gold-500/10 text-gold-500 border border-gold-500/20 rounded-full">{d}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Root Causes</h3>
              <div className="space-y-2">
                {selected.rootCauses.map((rc, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                    <span>{rc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" role="button" tabIndex={0} onClick={() => setShowCreate(false)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowCreate(false); } }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-charcoal-900 border border-white/10 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-4">New Variance Analysis</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                >
                  <option value="budget">Budget Variance</option>
                  <option value="forecast">Forecast Variance</option>
                  <option value="prior-period">Prior Period</option>
                  <option value="rolling">Rolling</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Period</label>
                <input
                  type="text"
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400">
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
