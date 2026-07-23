"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, TrendingDown, Activity, ChevronRight,
  Search, Filter, X,
} from "lucide-react";

interface KPI {
  id: string;
  name: string;
  value: string;
  change: number;
  trend: "up" | "down" | "flat";
  status: "healthy" | "warning" | "critical";
  source: string;
  domain: string;
}

const specialistColors: Record<string, string> = {
  Treasury: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Controller: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Audit: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Compliance: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  Tax: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  FPandA: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Risk: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Governance: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

const statusColors: Record<string, string> = {
  healthy: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-red-400",
};

const statusBorders: Record<string, string> = {
  healthy: "border-emerald-500/30",
  warning: "border-amber-500/30",
  critical: "border-red-500/30",
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-white/5 animate-pulse rounded-lg ${className}`} />;
}

export function KPIExplorer() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [trendFilter, setTrendFilter] = useState<"up" | "down" | "flat" | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/executive/kpis");
        if (res.ok) {
          const json = await res.json();
          setKpis(json.kpis ?? []);
        } else {
          setKpis(getDefaultKPIs());
        }
      } catch {
        setKpis(getDefaultKPIs());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const sources = useMemo(() => Array.from(new Set(kpis.map((k) => k.source))), [kpis]);

  const filtered = useMemo(() => {
    return kpis.filter((k) => {
      if (search && !k.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (sourceFilter && k.source !== sourceFilter) return false;
      if (statusFilter && k.status !== statusFilter) return false;
      if (trendFilter && k.trend !== trendFilter) return false;
      return true;
    });
  }, [kpis, search, sourceFilter, statusFilter, trendFilter]);

  function clearFilters() {
    setSearch("");
    setSourceFilter(null);
    setStatusFilter(null);
    setTrendFilter(null);
  }

  const hasFilters = search || sourceFilter || statusFilter || trendFilter;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-gold-500" />
            KPI Explorer
          </h1>
          <p className="text-sm text-white/60 mt-1">Enterprise key performance indicators with drill-down</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search KPIs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50"
            />
          </div>
          <div className="flex gap-2">
            {sources.map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(sourceFilter === src ? null : src)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  sourceFilter === src
                    ? "bg-gold-500/20 text-gold-500 border-gold-500/30"
                    : "border-white/10 text-white/50 hover:bg-white/10"
                }`}
              >
                {src}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["healthy", "warning", "critical"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  statusFilter === s
                    ? s === "healthy" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : s === "warning" ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                    : "border-white/10 text-white/50 hover:bg-white/10"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {([
              { key: "up" as const, label: "Up", color: "text-emerald-400" },
              { key: "down" as const, label: "Down", color: "text-red-400" },
              { key: "flat" as const, label: "Flat", color: "text-white/50" },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTrendFilter(trendFilter === t.key ? null : t.key)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  trendFilter === t.key
                    ? `bg-white/10 ${t.color} border-white/20`
                    : "border-white/10 text-white/50 hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/50 hover:bg-white/10 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
        {hasFilters && (
          <div className="text-xs text-white/40 mt-2">{filtered.length} KPI{filtered.length !== 1 ? "s" : ""} found</div>
        )}
      </div>

      {/* KPI Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <Filter className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No KPIs match the current filters</p>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-gold-500 mt-2 hover:text-gold-400">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((kpi, i) => (
            <motion.a
              key={kpi.id}
              href={`/executive/drill-down?domain=${kpi.domain}&entityId=${kpi.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white/5 border rounded-xl p-4 hover:bg-white/10 transition-colors group cursor-pointer ${statusBorders[kpi.status] ?? "border-white/10"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusColors[kpi.status]}`} />
                  <span className="text-xs text-white/50">{kpi.source}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-gold-500 transition-colors" />
              </div>
              <div className="text-xl font-bold text-white mb-1">{kpi.value}</div>
              <div className="text-sm text-white/70 mb-2">{kpi.name}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : kpi.trend === "down" ? (
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Activity className="w-3.5 h-3.5 text-white/40" />
                  )}
                  <span className={`text-xs ${kpi.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {kpi.change >= 0 ? "+" : ""}{kpi.change}%
                  </span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${specialistColors[kpi.source] ?? "bg-white/10 text-white/50 border-white/20"}`}>
                  {kpi.source}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}

function getDefaultKPIs(): KPI[] {
  return [
    { id: "k1", name: "Cash Position", value: "$47.2M", change: 3.2, trend: "up", status: "healthy", source: "Treasury", domain: "treasury" },
    { id: "k2", name: "Liquidity Ratio", value: "2.4x", change: 4.3, trend: "up", status: "healthy", source: "Treasury", domain: "treasury" },
    { id: "k3", name: "DSO", value: "42 days", change: -2.1, trend: "down", status: "healthy", source: "Controller", domain: "controller" },
    { id: "k4", name: "Working Capital", value: "$18.6M", change: 1.8, trend: "up", status: "healthy", source: "Treasury", domain: "treasury" },
    { id: "k5", name: "Close Readiness", value: "94%", change: 2.1, trend: "up", status: "healthy", source: "Controller", domain: "controller" },
    { id: "k6", name: "Audit Score", value: "87/100", change: 0, trend: "flat", status: "healthy", source: "Audit", domain: "audit" },
    { id: "k7", name: "Compliance Score", value: "91/100", change: 3.4, trend: "up", status: "healthy", source: "Compliance", domain: "compliance" },
    { id: "k8", name: "Effective Tax Rate", value: "21.4%", change: -0.3, trend: "down", status: "healthy", source: "Tax", domain: "tax" },
    { id: "k9", name: "FX Exposure", value: "$12.4M", change: 8.7, trend: "up", status: "warning", source: "Risk", domain: "risk" },
    { id: "k10", name: "Opex Ratio", value: "34.2%", change: 1.1, trend: "up", status: "warning", source: "FPandA", domain: "fpa" },
    { id: "k11", name: "SOX Exceptions", value: "3", change: 50, trend: "up", status: "critical", source: "Audit", domain: "audit" },
    { id: "k12", name: "Policy Coverage", value: "89%", change: 2.3, trend: "up", status: "healthy", source: "Governance", domain: "governance" },
  ];
}
