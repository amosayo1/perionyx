"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText, TrendingUp, TrendingDown, Calculator, Calendar,
  Target, AlertTriangle, CheckCircle, DollarSign, BarChart3,
} from "lucide-react";

interface ExecutiveSummary {
  effectiveTaxRate: number;
  etrTrend: "improving" | "stable" | "declining";
  deferredTaxPosition: number;
  deferredTaxTrend: "asset" | "liability";
  provisionStatus: string;
  totalProvision: number;
  filingsPending: number;
  filingsCompleted: number;
  planningSavings: number;
  activeRisks: number;
  boardSummary: string;
}

interface ETRDataPoint {
  period: string;
  rate: number;
}

interface FilingStatus {
  jurisdiction: string;
  status: "filed" | "pending" | "overdue";
  dueDate: string;
}

interface PlanningOpportunity {
  id: string;
  name: string;
  estimatedSavings: number;
  confidence: number;
}

export function ExecutiveTaxSummary() {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [etrTrend, setEtrTrend] = useState<ETRDataPoint[]>([]);
  const [filings, setFilings] = useState<FilingStatus[]>([]);
  const [opportunities, setOpportunities] = useState<PlanningOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sumRes, etrRes, filRes, oppRes] = await Promise.all([
          fetch("/api/tax/executive/summary").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/executive/etr-trend").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/executive/filings").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/executive/opportunities").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (sumRes) setSummary(sumRes);
        if (etrRes) setEtrTrend(etrRes.trend ?? []);
        if (filRes) setFilings(filRes.filings ?? []);
        if (oppRes) setOpportunities(oppRes.opportunities ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultSummary: ExecutiveSummary = {
    effectiveTaxRate: 21.4,
    etrTrend: "stable",
    deferredTaxPosition: 380000,
    deferredTaxTrend: "liability",
    provisionStatus: "In Progress",
    totalProvision: 4270000,
    filingsPending: 7,
    filingsCompleted: 18,
    planningSavings: 1359000,
    activeRisks: 3,
    boardSummary: "Tax position remains within target range. Key focus areas: US-SG transfer pricing adjustment, SG overdue filing resolution, and Q2 provision completion. Planning initiatives on track to deliver $1.4M in estimated annual savings.",
  };

  const defaultETR: ETRDataPoint[] = [
    { period: "Q1 2025", rate: 22.1 },
    { period: "Q2 2025", rate: 21.8 },
    { period: "Q3 2025", rate: 21.5 },
    { period: "Q4 2025", rate: 21.2 },
    { period: "Q1 2026", rate: 21.6 },
    { period: "Q2 2026", rate: 21.4 },
  ];

  const defaultFilings: FilingStatus[] = [
    { jurisdiction: "US-Federal", status: "filed", dueDate: "2026-04-15" },
    { jurisdiction: "UK", status: "pending", dueDate: "2026-07-31" },
    { jurisdiction: "Germany", status: "pending", dueDate: "2026-08-15" },
    { jurisdiction: "Singapore", status: "overdue", dueDate: "2026-07-20" },
    { jurisdiction: "Australia", status: "pending", dueDate: "2026-07-28" },
  ];

  const defaultOpps: PlanningOpportunity[] = [
    { id: "1", name: "R&D Tax Credit Optimization", estimatedSavings: 315000, confidence: 92 },
    { id: "2", name: "Green Energy Tax Incentives", estimatedSavings: 440000, confidence: 85 },
    { id: "3", name: "UK Full Expensing Election", estimatedSavings: 180000, confidence: 88 },
  ];

  const s = summary ?? defaultSummary;
  const etr = etrTrend.length > 0 ? etrTrend : defaultETR;
  const fil = filings.length > 0 ? filings : defaultFilings;
  const opps = opportunities.length > 0 ? opportunities : defaultOpps;

  const filingStatusColor = (status: string) => {
    switch (status) {
      case "filed": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "pending": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      case "overdue": return "text-red-400 bg-red-500/20 border-red-500/30";
      default: return "text-white/40 bg-white/5 border-white/10";
    }
  };

  const maxRate = Math.max(...etr.map((d) => d.rate));
  const minRate = Math.min(...etr.map((d) => d.rate));
  const range = maxRate - minRate || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Executive Tax Summary</h1>
          <p className="text-sm text-white/60 mt-1">C-suite tax intelligence, ETR trends, and strategic overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Effective Tax Rate", value: `${s.effectiveTaxRate}%`, sub: `Trend: ${s.etrTrend}`, icon: Percent, color: "text-gold-500", bg: "bg-gold-500/10" },
          { label: "Total Provision", value: `$${(s.totalProvision / 1000000).toFixed(1)}M`, sub: s.provisionStatus, icon: Calculator, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Deferred Tax Position", value: `$${(s.deferredTaxPosition / 1000).toFixed(0)}K`, sub: `${s.deferredTaxTrend}`, icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Planning Savings", value: `$${(s.planningSavings / 1000).toFixed(0)}K`, sub: `${opps.length} opportunities`, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
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
            <div className="text-xs text-white/40 mt-0.5">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">ETR Trend</h2>
          <div className="flex items-end gap-2 h-40">
            {etr.map((d, i) => {
              const height = ((d.rate - minRate + 0.5) / (range + 1)) * 100;
              return (
                <div key={d.period} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gold-500 font-medium">{d.rate}%</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 20)}%` }}
                    transition={{ delay: i * 0.1 }}
                    className="w-full bg-gold-500/30 rounded-t"
                  />
                  <span className="text-[9px] text-white/40 text-center leading-tight">{d.period}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">Filing Status</h2>
          <div className="space-y-2">
            {fil.map((f) => (
              <div key={f.jurisdiction} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  {f.status === "filed" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                   f.status === "overdue" ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                   <Calendar className="w-4 h-4 text-amber-400" />}
                  <span className="text-sm text-white">{f.jurisdiction}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/50">{f.dueDate}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${filingStatusColor(f.status)}`}>
                    {f.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">Planning Opportunities</h2>
          <div className="space-y-3">
            {opps.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-sm text-white">{o.name}</div>
                  <div className="text-xs text-white/50">Confidence: {o.confidence}%</div>
                </div>
                <span className="text-sm text-emerald-400 font-medium">${(o.estimatedSavings / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">Board Summary</h2>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-white/70 leading-relaxed">{s.boardSummary}</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">Filings Completed</span>
              <span className="text-sm text-emerald-400 font-medium">{s.filingsCompleted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">Filings Pending</span>
              <span className="text-sm text-amber-400 font-medium">{s.filingsPending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/50">Active Risks</span>
              <span className="text-sm text-red-400 font-medium">{s.activeRisks}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Percent(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
