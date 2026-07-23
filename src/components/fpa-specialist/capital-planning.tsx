"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, Plus, Search, Filter, TrendingUp, AlertTriangle,
  ChevronRight, Target, CheckCircle, Clock, XCircle, Building2,
} from "lucide-react";

interface CapitalPlan {
  id: string;
  name: string;
  totalBudget: number;
  allocatedBudget: number;
  fiscalYear: string;
  status: "draft" | "active" | "completed";
}

interface InvestmentProposal {
  id: string;
  name: string;
  type: "expansion" | "technology" | "infrastructure" | "acquisition" | "rd";
  cost: number;
  roi: number;
  risk: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected" | "in-review";
  expectedPayback: string;
}

interface CreateProposalForm {
  name: string;
  type: string;
  cost: string;
  roi: string;
  risk: string;
  expectedPayback: string;
}

const typeColors: Record<string, string> = {
  expansion: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  technology: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  infrastructure: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  acquisition: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  rd: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const statusColors: Record<string, string> = {
  pending: "bg-white/10 text-white/60 border-white/20",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  "in-review": "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const riskColors: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

export function CapitalPlanning() {
  const [plans, setPlans] = useState<CapitalPlan[]>([]);
  const [proposals, setProposals] = useState<InvestmentProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateProposalForm>({ name: "", type: "technology", cost: "", roi: "", risk: "medium", expectedPayback: "" });

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, proposalsRes] = await Promise.all([
          fetch("/api/fpa/capital/plans").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/fpa/capital/proposals").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (plansRes) setPlans(plansRes.plans ?? []);
        if (proposalsRes) setProposals(proposalsRes.proposals ?? []);
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const formatCurrency = (n: number) => `$${(n / 1000000).toFixed(2)}M`;

  const filteredProposals = proposals.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/fpa/capital/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cost: parseFloat(form.cost), roi: parseFloat(form.roi) }),
      });
      if (res.ok) {
        const data = await res.json();
        setProposals((prev) => [...prev, data.proposal]);
        setShowCreate(false);
        setForm({ name: "", type: "technology", cost: "", roi: "", risk: "medium", expectedPayback: "" });
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Capital Planning</h1>
          <p className="text-sm text-white/60 mt-1">Capital budgets, investment proposals and ROI analysis</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="text-sm font-medium text-white">{p.name}</div>
            <div className="text-xs text-white/50 mt-1">{p.fiscalYear}</div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div className="text-[10px] text-white/40">Total Budget</div>
                <div className="text-lg font-bold text-gold-500">{formatCurrency(p.totalBudget)}</div>
              </div>
              <div>
                <div className="text-[10px] text-white/40">Allocated</div>
                <div className="text-lg font-bold text-blue-400">{formatCurrency(p.allocatedBudget)}</div>
              </div>
            </div>
            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-500 rounded-full"
                style={{ width: `${Math.min((p.allocatedBudget / p.totalBudget) * 100, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-white/40 mt-1">{((p.allocatedBudget / p.totalBudget) * 100).toFixed(0)}% allocated</div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search proposals..."
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
        ) : filteredProposals.length === 0 ? (
          <div className="text-sm text-white/40 py-8 text-center">No proposals found</div>
        ) : (
          filteredProposals.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-white">{p.name}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[p.type]}`}>{p.type.toUpperCase()}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[p.status]}`}>{p.status.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">Payback: {p.expectedPayback}</div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-white/50">Cost</div>
                    <div className="text-sm font-medium text-white">{formatCurrency(p.cost)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/50">ROI</div>
                    <div className="text-sm font-medium text-emerald-400">{p.roi}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/50">Risk</div>
                    <div className={`text-sm font-medium ${riskColors[p.risk]}`}>{p.risk.toUpperCase()}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" role="button" tabIndex={0} onClick={() => setShowCreate(false)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowCreate(false); } }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-charcoal-900 border border-white/10 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-4">New Investment Proposal</h3>
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
                  <option value="expansion">Expansion</option>
                  <option value="technology">Technology</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="acquisition">Acquisition</option>
                  <option value="rd">R&D</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Cost ($)</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">ROI (%)</label>
                  <input
                    type="number"
                    value={form.roi}
                    onChange={(e) => setForm({ ...form, roi: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Risk</label>
                  <select
                    value={form.risk}
                    onChange={(e) => setForm({ ...form, risk: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Payback Period</label>
                  <input
                    type="text"
                    value={form.expectedPayback}
                    onChange={(e) => setForm({ ...form, expectedPayback: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50"
                    placeholder="e.g. 18 months"
                  />
                </div>
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
