"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  SlidersHorizontal, Plus, Search, Filter, Target, TrendingUp,
  ChevronRight, BarChart3, AlertTriangle, CheckCircle,
} from "lucide-react";

interface Driver {
  id: string;
  name: string;
  category: "revenue" | "cost" | "volume" | "rate" | "efficiency";
  unit: string;
  defaultValue: number;
  currentValue: number;
  description: string;
}

interface SensitivityResult {
  driver: string;
  lowImpact: number;
  midImpact: number;
  highImpact: number;
}

interface CreateDriverForm {
  name: string;
  category: string;
  unit: string;
  defaultValue: string;
  description: string;
}

const categoryColors: Record<string, string> = {
  revenue: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cost: "bg-red-500/20 text-red-400 border-red-500/30",
  volume: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  rate: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  efficiency: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export function DriverBuilder() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selected, setSelected] = useState<Driver | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateDriverForm>({ name: "", category: "revenue", unit: "%", defaultValue: "", description: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fpa/drivers");
        if (res.ok) {
          const data = await res.json();
          setDrivers(data.drivers ?? []);
        }
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    const id = selected?.id;
    if (!id) return;
    async function loadSensitivity() {
      try {
        const res = await fetch(`/api/fpa/drivers/${id}/sensitivity`);
        if (res.ok) {
          const data = await res.json();
          setSensitivity(data.sensitivity ?? []);
        }
      } catch { /* defaults */ }
    }
    loadSensitivity();
  }, [selected]);

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/fpa/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, defaultValue: parseFloat(form.defaultValue) }),
      });
      if (res.ok) {
        const data = await res.json();
        setDrivers((prev) => [...prev, data.driver]);
        setShowCreate(false);
        setForm({ name: "", category: "revenue", unit: "%", defaultValue: "", description: "" });
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Driver Builder</h1>
          <p className="text-sm text-white/60 mt-1">Planning drivers, assumptions and sensitivity analysis</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Driver
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search drivers..."
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
            <div className="text-sm text-white/40 py-8 text-center">No drivers found</div>
          ) : (
            filtered.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(d)}
                className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-all ${
                  selected?.id === d.id ? "border-gold-500/50 bg-gold-500/5" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{d.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[d.category]}`}>{d.category.toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-white/50 mt-2">{d.unit}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-white/50">Current</div>
                    <div className="text-sm font-medium text-gold-500">{d.currentValue}{d.unit}</div>
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
                    <p className="text-xs text-white/50 mt-1">{selected.description}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[selected.category]}`}>{selected.category.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-white/50">Default Value</div>
                    <div className="text-xl font-bold text-white mt-1">{selected.defaultValue}{selected.unit}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Current Value</div>
                    <div className="text-xl font-bold text-gold-500 mt-1">{selected.currentValue}{selected.unit}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Unit</div>
                    <div className="text-xl font-bold text-blue-400 mt-1">{selected.unit}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-gold-500" />
                  <h3 className="text-sm font-semibold text-white">Sensitivity Analysis</h3>
                </div>
                {sensitivity.length === 0 ? (
                  <div className="text-sm text-white/40 py-4 text-center">No sensitivity data</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-xs text-white/50 font-medium py-2">Driver</th>
                          <th className="text-right text-xs text-emerald-400 font-medium py-2">Low Impact</th>
                          <th className="text-right text-xs text-blue-400 font-medium py-2">Mid Impact</th>
                          <th className="text-right text-xs text-red-400 font-medium py-2">High Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sensitivity.map((s, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="py-2 text-white">{s.driver}</td>
                            <td className="py-2 text-right text-emerald-400">{s.lowImpact > 0 ? "+" : ""}{s.lowImpact.toFixed(1)}%</td>
                            <td className="py-2 text-right text-blue-400">{s.midImpact > 0 ? "+" : ""}{s.midImpact.toFixed(1)}%</td>
                            <td className="py-2 text-right text-red-400">{s.highImpact > 0 ? "+" : ""}{s.highImpact.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <SlidersHorizontal className="w-12 h-12 text-white/40 mb-3" />
              <div className="text-sm text-white/40">Select a driver to view details</div>
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
            <h3 className="text-lg font-semibold text-white mb-4">New Driver</h3>
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
                <label className="text-xs text-white/50 mb-1 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                >
                  <option value="revenue">Revenue</option>
                  <option value="cost">Cost</option>
                  <option value="volume">Volume</option>
                  <option value="rate">Rate</option>
                  <option value="efficiency">Efficiency</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Unit</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Default Value</label>
                  <input
                    type="number"
                    value={form.defaultValue}
                    onChange={(e) => setForm({ ...form, defaultValue: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                  rows={2}
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
