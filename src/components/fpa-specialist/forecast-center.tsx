"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Plus, Search, Filter, GitBranch, Clock, Target,
  ChevronRight, BarChart3, FileText, AlertTriangle, CheckCircle,
} from "lucide-react";
import { EnterpriseForm, EnterpriseField, EnterpriseSection } from "@/components/enterprise/forms";

interface Forecast {
  id: string;
  name: string;
  type: "revenue" | "expense" | "cash" | "balance-sheet";
  horizon: string;
  status: "draft" | "submitted" | "approved" | "locked";
  accuracy: number;
  confidence: number;
  versions: number;
  lastUpdated: string;
}

interface ForecastVersion {
  id: string;
  version: number;
  date: string;
  author: string;
  accuracy: number;
}

interface CreateForecastForm {
  name: string;
  type: string;
  horizon: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/60 border-white/20",
  submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  locked: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const typeColors: Record<string, string> = {
  revenue: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  expense: "bg-red-500/20 text-red-400 border-red-500/30",
  cash: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "balance-sheet": "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function ForecastCenter() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [selected, setSelected] = useState<Forecast | null>(null);
  const [versions, setVersions] = useState<ForecastVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForecastForm>({ name: "", type: "revenue", horizon: "12 months" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fpa/forecasts");
        if (res.ok) {
          const data = await res.json();
          setForecasts(data.forecasts ?? []);
        }
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    const id = selected?.id;
    if (!id) return;
    async function loadVersions() {
      try {
        const res = await fetch(`/api/fpa/forecasts/${id}/versions`);
        if (res.ok) {
          const data = await res.json();
          setVersions(data.versions ?? []);
        }
      } catch { /* defaults */ }
    }
    loadVersions();
  }, [selected]);

  const filtered = forecasts.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/fpa/forecasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setForecasts((prev) => [...prev, data.forecast]);
        setShowCreate(false);
        setForm({ name: "", type: "revenue", horizon: "12 months" });
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Forecast Center</h1>
          <p className="text-sm text-white/60 mt-1">Revenue, expense and cash flow forecasting</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Forecast
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search forecasts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-sm text-white/40 py-8 text-center">No forecasts found</div>
          ) : (
            filtered.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(f)}
                className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-all ${
                  selected?.id === f.id ? "border-gold-500/50 bg-gold-500/5" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{f.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[f.type]}`}>{f.type.toUpperCase()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[f.status]}`}>{f.status.toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-white/50 mt-2">{f.horizon} &middot; v{f.versions} &middot; {f.accuracy}% accuracy</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-white/50">Confidence</div>
                    <div className={`text-sm font-medium ${f.confidence >= 90 ? "text-emerald-400" : f.confidence >= 70 ? "text-amber-400" : "text-red-400"}`}>
                      {f.confidence}%
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selected.name}</h2>
                    <p className="text-xs text-white/50 mt-1">{selected.horizon} &middot; {selected.type.charAt(0).toUpperCase() + selected.type.slice(1)} Forecast</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[selected.status]}`}>{selected.status.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-white/50">Accuracy</div>
                    <div className="text-xl font-bold text-gold-500 mt-1">{selected.accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Confidence</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">{selected.confidence}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Versions</div>
                    <div className="text-xl font-bold text-blue-400 mt-1">{selected.versions}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Horizon</div>
                    <div className="text-xl font-bold text-white mt-1">{selected.horizon}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gold-500" />
                  <h3 className="text-sm font-semibold text-white">Forecast Trend</h3>
                </div>
                <div className="h-32 flex items-end gap-1">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const h = 20 + Math.random() * 80;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gold-500/30 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                        <div className="text-[9px] text-white/50">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Versions</h3>
                {versions.length === 0 ? (
                  <div className="text-sm text-white/40 py-4 text-center">No version history</div>
                ) : (
                  <div className="space-y-2">
                    {versions.map((v) => (
                      <div key={v.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60">v{v.version}</div>
                          <div>
                            <div className="text-sm text-white">Version {v.version}</div>
                            <div className="text-xs text-white/50">{v.author} &middot; {v.date}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gold-500 font-medium">{v.accuracy}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <TrendingUp className="w-12 h-12 text-white/40 mb-3" />
              <div className="text-sm text-white/40">Select a forecast to view details</div>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" role="button" tabIndex={0} onClick={() => setShowCreate(false)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowCreate(false); } }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-charcoal-900 border border-white/10 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <EnterpriseForm
              onSubmit={handleCreate}
              autoSave
              submitLabel="Create"
              cancelLabel="Cancel"
              onCancel={() => setShowCreate(false)}
              validate={() => {
                const errors: { field: string; message: string }[] = [];
                if (!form.name.trim()) errors.push({ field: "forecast-name", message: "Forecast name is required" });
                return errors;
              }}
            >
              <EnterpriseSection config={{ id: "forecast-info", title: "Forecast Configuration", description: "Set up forecast parameters and horizon" }}>
                <EnterpriseField label="Forecast Name" htmlFor="forecast-name" required>
                  <input
                    id="forecast-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    data-field="forecast-name"
                    placeholder="e.g. FY2026 Revenue Forecast"
                  />
                </EnterpriseField>
                <EnterpriseField label="Type" htmlFor="forecast-type">
                  <select
                    id="forecast-type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    data-field="forecast-type"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                    <option value="cash">Cash</option>
                    <option value="balance-sheet">Balance Sheet</option>
                  </select>
                </EnterpriseField>
                <EnterpriseField label="Horizon" htmlFor="forecast-horizon">
                  <input
                    id="forecast-horizon"
                    type="text"
                    value={form.horizon}
                    onChange={(e) => setForm({ ...form, horizon: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    data-field="forecast-horizon"
                    placeholder="e.g. 12 months"
                  />
                </EnterpriseField>
              </EnterpriseSection>
            </EnterpriseForm>
          </motion.div>
        </div>
      )}
    </div>
  );
}
