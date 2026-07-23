"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GitBranch, Plus, Search, Filter, TrendingUp, TrendingDown, Minus,
  ChevronRight, Play, BarChart3, AlertTriangle, CheckCircle, Target,
} from "lucide-react";
import { EnterpriseForm, EnterpriseField, EnterpriseSection } from "@/components/enterprise/forms";

interface Scenario {
  id: string;
  name: string;
  type: "base" | "best" | "worst" | "stress" | "custom";
  status: "draft" | "active" | "completed" | "archived";
  probability: number;
  description: string;
  createdAt: string;
}

interface ScenarioResult {
  metric: string;
  base: number;
  best: number;
  worst: number;
}

interface ScenarioAssumption {
  id: string;
  driver: string;
  baseValue: number;
  bestValue: number;
  worstValue: number;
  unit: string;
}

interface ExecuteForm {
  scenarioId: string;
  name: string;
  type: string;
  description: string;
}

const typeColors: Record<string, string> = {
  base: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  best: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  worst: "bg-red-500/20 text-red-400 border-red-500/30",
  stress: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  custom: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/60 border-white/20",
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  archived: "bg-white/5 text-white/40 border-white/10",
};

export function ScenarioModeling() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selected, setSelected] = useState<Scenario | null>(null);
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [assumptions, setAssumptions] = useState<ScenarioAssumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<ExecuteForm>({ scenarioId: "", name: "", type: "base", description: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/fpa/scenarios");
        if (res.ok) {
          const data = await res.json();
          setScenarios(data.scenarios ?? []);
        }
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    const id = selected?.id;
    if (!id) return;
    async function loadDetail() {
      try {
        const [resultsRes, assumptionsRes] = await Promise.all([
          fetch(`/api/fpa/scenarios/${id}/results`).then((r) => (r.ok ? r.json() : null)),
          fetch(`/api/fpa/scenarios/${id}/assumptions`).then((r) => (r.ok ? r.json() : null)),
        ]);
        if (resultsRes) setResults(resultsRes.results ?? []);
        if (assumptionsRes) setAssumptions(assumptionsRes.assumptions ?? []);
      } catch { /* defaults */ }
    }
    loadDetail();
  }, [selected]);

  const filtered = scenarios.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/fpa/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setScenarios((prev) => [...prev, data.scenario]);
        setShowCreate(false);
        setForm({ scenarioId: "", name: "", type: "base", description: "" });
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Scenario Modeling</h1>
          <p className="text-sm text-white/60 mt-1">What-if analysis, sensitivity modeling and scenario planning</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Scenario
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search scenarios..."
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
            <div className="text-sm text-white/40 py-8 text-center">No scenarios found</div>
          ) : (
            filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(s)}
                className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-all ${
                  selected?.id === s.id ? "border-gold-500/50 bg-gold-500/5" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{s.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[s.type]}`}>{s.type.toUpperCase()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[s.status]}`}>{s.status.toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-white/50 mt-2">{s.description}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-white/50">Probability</div>
                    <div className={`text-sm font-medium ${s.probability >= 70 ? "text-emerald-400" : s.probability >= 40 ? "text-amber-400" : "text-red-400"}`}>
                      {s.probability}%
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
                    <p className="text-xs text-white/50 mt-1">{selected.description}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[selected.status]}`}>{selected.status.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[selected.type]}`}>{selected.type.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-white/50">Probability: {selected.probability}%</div>
                  <div className="text-xs text-white/50">Created: {selected.createdAt}</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Scenario Results</h3>
                {results.length === 0 ? (
                  <div className="text-sm text-white/40 py-4 text-center">No results yet — run scenario</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-xs text-white/50 font-medium py-2">Metric</th>
                          <th className="text-right text-xs text-blue-400 font-medium py-2">Base</th>
                          <th className="text-right text-xs text-emerald-400 font-medium py-2">Best</th>
                          <th className="text-right text-xs text-red-400 font-medium py-2">Worst</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="py-2 text-white">{r.metric}</td>
                            <td className="py-2 text-right text-blue-400">{r.base.toLocaleString()}</td>
                            <td className="py-2 text-right text-emerald-400">{r.best.toLocaleString()}</td>
                            <td className="py-2 text-right text-red-400">{r.worst.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Assumptions</h3>
                {assumptions.length === 0 ? (
                  <div className="text-sm text-white/40 py-4 text-center">No assumptions configured</div>
                ) : (
                  <div className="space-y-2">
                    {assumptions.map((a) => (
                      <div key={a.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="text-sm text-white">{a.driver}</div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-blue-400">Base: {a.baseValue}{a.unit}</span>
                          <span className="text-emerald-400">Best: {a.bestValue}{a.unit}</span>
                          <span className="text-red-400">Worst: {a.worstValue}{a.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">
                <Play className="w-4 h-4" /> Execute Scenario
              </button>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <GitBranch className="w-12 h-12 text-white/40 mb-3" />
              <div className="text-sm text-white/40">Select a scenario to view details</div>
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
                if (!form.name.trim()) errors.push({ field: "scenario-name", message: "Scenario name is required" });
                return errors;
              }}
            >
              <EnterpriseSection config={{ id: "scenario-info", title: "Scenario Configuration", description: "Define scenario parameters and assumptions" }}>
                <EnterpriseField label="Scenario Name" htmlFor="scenario-name" required>
                  <input
                    id="scenario-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    data-field="scenario-name"
                    placeholder="e.g. Q3 Revenue Stress Test"
                  />
                </EnterpriseField>
                <EnterpriseField label="Type" htmlFor="scenario-type">
                  <select
                    id="scenario-type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    data-field="scenario-type"
                  >
                    <option value="base">Base</option>
                    <option value="best">Best Case</option>
                    <option value="worst">Worst Case</option>
                    <option value="stress">Stress</option>
                    <option value="custom">Custom</option>
                  </select>
                </EnterpriseField>
                <EnterpriseField label="Description" htmlFor="scenario-description" optional>
                  <textarea
                    id="scenario-description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    rows={3}
                    data-field="scenario-description"
                    placeholder="Describe the scenario assumptions and purpose"
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
