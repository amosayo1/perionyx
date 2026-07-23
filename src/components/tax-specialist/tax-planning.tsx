"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target, Plus, TrendingUp, Lightbulb, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, DollarSign, Clock, BarChart3,
} from "lucide-react";

interface PlanningScenario {
  id: string;
  name: string;
  type: "restructuring" | "incentive" | "restructuring" | "entity-optimization" | "credit-claim";
  status: "draft" | "analyzing" | "approved" | "implemented";
  projectedImpact: number;
  estimatedSavings: number;
  riskLevel: "low" | "medium" | "high";
  timeline: string;
}

interface Recommendation {
  id: string;
  title: string;
  category: string;
  confidence: number;
  status: "new" | "reviewed" | "accepted" | "rejected";
  estimatedSavings: number;
  description: string;
}

export function TaxPlanning() {
  const [scenarios, setScenarios] = useState<PlanningScenario[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [scRes, recRes] = await Promise.all([
          fetch("/api/tax/planning/scenarios").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/planning/recommendations").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (scRes) setScenarios(scRes.scenarios ?? []);
        if (recRes) setRecommendations(recRes.recommendations ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultScenarios: PlanningScenario[] = [
    { id: "1", name: "APAC Entity Restructuring", type: "restructuring", status: "analyzing", projectedImpact: -2800000, estimatedSavings: 420000, riskLevel: "medium", timeline: "Q3 2026 - Q1 2027" },
    { id: "2", name: "R&D Tax Credit Optimization", type: "credit-claim", status: "approved", projectedImpact: 1500000, estimatedSavings: 315000, riskLevel: "low", timeline: "FY2026" },
    { id: "3", name: "Patent Box Regime - IE", type: "incentive", status: "draft", projectedImpact: 800000, estimatedSavings: 104000, riskLevel: "low", timeline: "FY2027" },
    { id: "4", name: "Transfer Pricing Method Review", type: "entity-optimization", status: "analyzing", projectedImpact: -500000, estimatedSavings: 85000, riskLevel: "high", timeline: "Q4 2026" },
    { id: "5", name: "Green Energy Tax Incentives", type: "incentive", status: "draft", projectedImpact: 2200000, estimatedSavings: 440000, riskLevel: "low", timeline: "FY2026-2028" },
  ];

  const defaultRecommendations: Recommendation[] = [
    { id: "1", title: "Claim R&D credits for AI platform development", category: "Credits", confidence: 92, status: "new", estimatedSavings: 315000, description: "Qualifying activities identified in AI/ML development team expenses for FY2026." },
    { id: "2", title: "Establish IP holding entity in Ireland", category: "Structuring", confidence: 78, status: "reviewed", estimatedSavings: 104000, description: "Patent box regime offers 6.25% effective rate on qualifying IP income." },
    { id: "3", title: "Accelerate deferred tax asset recognition", category: "Provision", confidence: 85, status: "accepted", estimatedSavings: 85000, description: "New revenue forecasts support recognition of previously unrecognized DTA." },
    { id: "4", title: "Review SG intercompany pricing margin", category: "Transfer Pricing", confidence: 70, status: "new", estimatedSavings: 52000, description: "Current margin at 7.1% exceeds arm's length range of 3-6%. Adjustment recommended." },
    { id: "5", title: "Elect into UK full expensing regime", category: "Incentive", confidence: 88, status: "accepted", estimatedSavings: 180000, description: "FY2026 capital expenditure qualifies for 100% first-year deduction." },
  ];

  const scenariosData = defaultScenarios;
  const recsData = defaultRecommendations;

  const totalSavings = scenariosData.reduce((s, sc) => s + sc.estimatedSavings, 0);

  const statusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "implemented":
      case "accepted": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "analyzing":
      case "reviewed": return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "draft":
      case "new": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      case "rejected": return "text-red-400 bg-red-500/20 border-red-500/30";
      default: return "text-white/40 bg-white/5 border-white/10";
    }
  };

  const riskColor = (risk: string) => {
    switch (risk) {
      case "high": return "text-red-400 bg-red-500/20 border-red-500/30";
      case "medium": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      default: return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tax Planning</h1>
          <p className="text-sm text-white/60 mt-1">Planning scenarios, optimization recommendations, and savings analysis</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Scenario
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Scenarios", value: scenariosData.filter((s) => s.status !== "implemented").length, icon: Target, color: "text-gold-500", bg: "bg-gold-500/10" },
          { label: "Total Estimated Savings", value: `$${(totalSavings / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Open Recommendations", value: recsData.filter((r) => r.status === "new").length, icon: Lightbulb, color: "text-purple-400", bg: "bg-purple-500/10" },
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
            <div className="text-2xl font-bold text-white">{loading ? "\u2014" : card.value}</div>
            <div className="text-xs text-white/50 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Create Planning Scenario</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Scenario Name</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-gold-500" placeholder="e.g. APAC Restructuring" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Type</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500">
                <option value="restructuring">Restructuring</option>
                <option value="incentive">Incentive</option>
                <option value="credit-claim">Credit Claim</option>
                <option value="entity-optimization">Entity Optimization</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Timeline</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-gold-500" placeholder="Q3 2026" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Save Scenario</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Planning Scenarios</h2>
        </div>
        <div className="divide-y divide-white/5">
          {scenariosData.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Target className="w-5 h-5 text-gold-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{s.name}</div>
                  <div className="text-xs text-white/50">{s.timeline}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <div className={`text-sm font-medium ${s.estimatedSavings > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    ${Math.abs(s.estimatedSavings / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-white/50">Savings</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskColor(s.riskLevel)}`}>
                  {s.riskLevel.toUpperCase()}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(s.status)}`}>
                  {s.status.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Recommendations</h2>
        </div>
        <div className="divide-y divide-white/5">
          {recsData.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-white">{r.title}</div>
                    <div className="text-xs text-white/50 mt-1">{r.description}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-white/40">{r.category}</span>
                      <span className="text-[10px] text-white/40">Confidence: {r.confidence}%</span>
                      <span className="text-[10px] text-emerald-400">${(r.estimatedSavings / 1000).toFixed(0)}K savings</span>
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(r.status)}`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
