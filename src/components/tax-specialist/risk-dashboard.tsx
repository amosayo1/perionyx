"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, AlertTriangle, CheckCircle, TrendingUp, Globe,
  FileText, Calculator, ArrowRightLeft, Clock, Shield,
} from "lucide-react";

interface RiskCategory {
  name: string;
  score: number;
  maxScore: number;
  status: "low" | "medium" | "high" | "critical";
  items: RiskItem[];
}

interface RiskItem {
  id: string;
  description: string;
  jurisdiction: string;
  exposure: number;
  likelihood: "low" | "medium" | "high";
  status: "open" | "mitigating" | "mitigated";
}

interface HealthScore {
  overall: number;
  grade: string;
  trend: "improving" | "stable" | "declining";
}

export function RiskDashboard() {
  const [categories, setCategories] = useState<RiskCategory[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, healthRes] = await Promise.all([
          fetch("/api/tax/risk/categories").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/risk/health").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (catRes) setCategories(catRes.categories ?? []);
        if (healthRes) setHealthScore(healthRes);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultCategories: RiskCategory[] = [
    {
      name: "Jurisdiction Risk", score: 72, maxScore: 100, status: "medium",
      items: [
        { id: "1", description: "SG GST filing overdue - potential penalties", jurisdiction: "SG", exposure: 85000, likelihood: "high", status: "open" },
        { id: "2", description: "DE trade tax rate change impact unassessed", jurisdiction: "DE", exposure: 120000, likelihood: "medium", status: "mitigating" },
      ],
    },
    {
      name: "Filing Risk", score: 65, maxScore: 100, status: "medium",
      items: [
        { id: "3", description: "Australia BAS filing approaching deadline", jurisdiction: "AU", exposure: 42000, likelihood: "medium", status: "open" },
        { id: "4", description: "UK VAT reconciliation incomplete for Q1", jurisdiction: "UK", exposure: 28000, likelihood: "medium", status: "mitigating" },
      ],
    },
    {
      name: "Provision Risk", score: 88, maxScore: 100, status: "low",
      items: [
        { id: "5", description: "Deferred tax asset recognition under review", jurisdiction: "US", exposure: 65000, likelihood: "low", status: "mitigated" },
      ],
    },
    {
      name: "Transfer Pricing Risk", score: 55, maxScore: 100, status: "high",
      items: [
        { id: "6", description: "US-SG margin outside arm's length range", jurisdiction: "SG", exposure: 350000, likelihood: "high", status: "open" },
        { id: "7", description: "Master file documentation incomplete", jurisdiction: "Multi", exposure: 150000, likelihood: "medium", status: "mitigating" },
      ],
    },
    {
      name: "Documentation Risk", score: 70, maxScore: 100, status: "medium",
      items: [
        { id: "8", description: "DE GmbH local file overdue", jurisdiction: "DE", exposure: 45000, likelihood: "medium", status: "open" },
      ],
    },
    {
      name: "Exposure Risk", score: 82, maxScore: 100, status: "low",
      items: [
        { id: "9", description: "Total unmitigated tax exposure $885K across jurisdictions", jurisdiction: "Multi", exposure: 885000, likelihood: "low", status: "mitigating" },
      ],
    },
  ];

  const defaultHealth: HealthScore = { overall: 72, grade: "B", trend: "improving" };

  const cats = categories.length > 0 ? categories : defaultCategories;
  const health = healthScore ?? defaultHealth;

  const statusColor = (status: string) => {
    switch (status) {
      case "low": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "medium": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      case "high": return "text-red-400 bg-red-500/20 border-red-500/30";
      case "critical": return "text-red-400 bg-red-500/30 border-red-500/40";
      default: return "text-white/40 bg-white/5 border-white/10";
    }
  };

  const itemStatusColor = (status: string) => {
    switch (status) {
      case "mitigated": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "mitigating": return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      default: return "text-red-400 bg-red-500/20 border-red-500/30";
    }
  };

  const totalExposure = cats.reduce((s, c) => s + c.items.filter((i) => i.status === "open").reduce((a, i) => a + i.exposure, 0), 0);

  const gradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-400";
    if (grade.startsWith("B")) return "text-gold-500";
    if (grade.startsWith("C")) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tax Risk Dashboard</h1>
          <p className="text-sm text-white/60 mt-1">Risk assessment across jurisdictions, filings, provisions, and transfer pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
        >
          <div className={`text-4xl font-bold ${gradeColor(health.grade)} mb-1`}>{loading ? "\u2014" : health.overall}</div>
          <div className="text-xs text-white/50">Tax Health Score</div>
          <div className="text-xs text-white/40 mt-1">Grade: {health.grade} &middot; {health.trend}</div>
        </motion.div>
        {[
          { label: "Open Risks", value: cats.reduce((s, c) => s + c.items.filter((i) => i.status === "open").length, 0), icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Mitigating", value: cats.reduce((s, c) => s + c.items.filter((i) => i.status === "mitigating").length, 0), icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Total Exposure", value: `$${(totalExposure / 1000).toFixed(0)}K`, icon: ShieldAlert, color: "text-gold-500", bg: "bg-gold-500/10" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.05 }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cats.map((cat, ci) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl"
            >
              <div className="p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gold-500" />
                  <span className="text-sm font-semibold text-white">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cat.status === "low" ? "bg-emerald-400" :
                        cat.status === "medium" ? "bg-amber-400" :
                        cat.status === "high" ? "bg-red-400" : "bg-red-500"
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/50">{cat.score}/{cat.maxScore}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(cat.status)}`}>
                    {cat.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {cat.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                        item.likelihood === "high" ? "text-red-400" :
                        item.likelihood === "medium" ? "text-amber-400" : "text-white/50"
                      }`} />
                      <div>
                        <div className="text-sm text-white">{item.description}</div>
                        <div className="text-xs text-white/50 mt-1">{item.jurisdiction} &middot; Exposure: ${(item.exposure / 1000).toFixed(0)}K</div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${itemStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Risk Heatmap</h3>
            <div className="grid grid-cols-3 gap-2">
              {cats.map((cat) => (
                <div key={cat.name} className={`p-2 rounded-lg text-center ${
                  cat.status === "high" ? "bg-red-500/20" :
                  cat.status === "medium" ? "bg-amber-500/20" :
                  "bg-emerald-500/20"
                }`}>
                  <div className={`text-lg font-bold ${
                    cat.status === "high" ? "text-red-400" :
                    cat.status === "medium" ? "text-amber-400" :
                    "text-emerald-400"
                  }`}>{cat.score}</div>
                  <div className="text-[10px] text-white/50 truncate">{cat.name.replace(" Risk", "")}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Risk Summary</h3>
            <div className="space-y-3">
              {[
                { label: "Total Risk Items", value: cats.reduce((s, c) => s + c.items.length, 0) },
                { label: "Open Items", value: cats.reduce((s, c) => s + c.items.filter((i) => i.status === "open").length, 0) },
                { label: "High Likelihood", value: cats.reduce((s, c) => s + c.items.filter((i) => i.likelihood === "high").length, 0) },
                { label: "Mitigated", value: cats.reduce((s, c) => s + c.items.filter((i) => i.status === "mitigated").length, 0) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-xs text-white/50">{row.label}</span>
                  <span className="text-sm text-white font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
