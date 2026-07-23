"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, AlertTriangle, Shield, TrendingUp, Calendar,
  RefreshCw, CheckCircle2, XCircle, Clock,
} from "lucide-react";

interface DebtInstrument {
  id: string;
  name: string;
  type: string;
  issuer: string;
  principal: number;
  outstanding: number;
  interestRate: number;
  maturityDate: string;
  utilization: number;
  status: "active" | "matured" | " callable";
  covenants: { name: string; threshold: number; current: number; compliant: boolean }[];
}

interface DebtSummary {
  totalPrincipal: number;
  totalOutstanding: number;
  weightedAvgRate: number;
  nearestMaturity: string;
  healthScore: number;
  covenantBreaches: number;
  alerts: { id: string; title: string; severity: string; dueDate: string }[];
  maturitySchedule: { year: string; amount: number; count: number }[];
}

export function DebtManagement() {
  const [instruments, setInstruments] = useState<DebtInstrument[]>([]);
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [instRes, sumRes] = await Promise.all([
          fetch("/api/treasury/debt/instruments").then((r) => r.ok ? r.json() : null),
          fetch("/api/treasury/debt/summary").then((r) => r.ok ? r.json() : null),
        ]);
        if (instRes) setInstruments(instRes.instruments ?? []);
        if (sumRes) setSummary(sumRes);
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const s = summary ?? {
    totalPrincipal: 1850000000, totalOutstanding: 1420000000, weightedAvgRate: 4.25,
    nearestMaturity: "2027-03-15", healthScore: 85, covenantBreaches: 0,
    alerts: [
      { id: "1", title: "Revolver maturity in 8 months - refinance planning needed", severity: "medium", dueDate: "2027-03-15" },
      { id: "2", title: "Debt-to-EBITDA approaching covenant threshold", severity: "low", dueDate: "2026-09-30" },
    ],
    maturitySchedule: [
      { year: "2027", amount: 250000000, count: 2 },
      { year: "2028", amount: 400000000, count: 3 },
      { year: "2029", amount: 350000000, count: 2 },
      { year: "2030", amount: 420000000, count: 2 },
    ],
  };

  const displayInstruments = instruments.length > 0 ? instruments : [
    { id: "1", name: "Senior Term Loan A", type: "Term Loan", issuer: "Syndicate Bank", principal: 500000000, outstanding: 425000000, interestRate: 3.75, maturityDate: "2029-06-30", utilization: 85, status: "active", covenants: [
      { name: "Debt-to-EBITDA", threshold: 3.5, current: 2.8, compliant: true },
      { name: "Interest Coverage", threshold: 3.0, current: 4.2, compliant: true },
    ]},
    { id: "2", name: "Revolving Credit Facility", type: "Revolver", issuer: "JPMorgan Chase", principal: 300000000, outstanding: 120000000, interestRate: 2.50, maturityDate: "2027-03-15", utilization: 40, status: "active", covenants: [
      { name: "Leverage Ratio", threshold: 4.0, current: 3.2, compliant: true },
    ]},
    { id: "3", name: "Senior Unsecured Notes", type: "Bond", issuer: "Capital Markets", principal: 600000000, outstanding: 600000000, interestRate: 5.125, maturityDate: "2030-09-15", utilization: 100, status: "active", covenants: [
      { name: "Debt-to-EBITDA", threshold: 3.5, current: 2.8, compliant: true },
      { name: "Fixed Charge Coverage", threshold: 1.5, current: 2.1, compliant: true },
    ]},
    { id: "4", name: "Mezzanine Facility", type: "Mezzanine", issuer: "Alt Capital", principal: 200000000, outstanding: 175000000, interestRate: 8.50, maturityDate: "2028-12-31", utilization: 87.5, status: "active", covenants: [
      { name: "Debt-to-EBITDA", threshold: 4.0, current: 3.6, compliant: true },
    ]},
    { id: "5", name: "Working Capital Line", type: "Line of Credit", issuer: "HSBC", principal: 250000000, outstanding: 100000000, interestRate: 2.25, maturityDate: "2027-06-30", utilization: 40, status: "active", covenants: [
      { name: "Current Ratio", threshold: 1.2, current: 1.8, compliant: true },
    ]},
  ];

  const fmt = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
    return `$${v.toLocaleString()}`;
  };

  const healthColor = (v: number) => v >= 80 ? "text-emerald-400" : v >= 60 ? "text-amber-400" : "text-red-400";
  const sevColor: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-orange-500/20 text-orange-400", medium: "bg-amber-500/20 text-amber-400", low: "bg-emerald-500/20 text-emerald-400" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Debt Management</h1>
          <p className="text-sm text-white/60 mt-1">Debt instruments, covenants, and maturity tracking</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Outstanding", value: fmt(s.totalOutstanding), icon: CreditCard, color: "text-gold-500", bg: "bg-gold-500/10" },
          { label: "Weighted Avg Rate", value: `${s.weightedAvgRate}%`, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Health Score", value: `${s.healthScore}%`, icon: Shield, color: healthColor(s.healthScore), bg: "bg-emerald-500/10" },
          { label: "Covenant Breaches", value: s.covenantBreaches, icon: AlertTriangle, color: s.covenantBreaches > 0 ? "text-red-400" : "text-emerald-400", bg: s.covenantBreaches > 0 ? "bg-red-500/10" : "bg-emerald-500/10" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
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
          {displayInstruments.map((inst, i) => (
            <motion.div key={inst.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{inst.name}</div>
                    <div className="text-xs text-white/50 flex items-center gap-2 mt-0.5">
                      <span>{inst.type}</span>
                      <span className="text-white/50">·</span>
                      <span>{inst.issuer}</span>
                      <span className="text-white/50">·</span>
                      <span>{inst.interestRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/50">Outstanding</div>
                  <div className="text-sm font-bold text-white">{fmt(inst.outstanding)}</div>
                  <div className="text-xs text-white/40">of {fmt(inst.principal)}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white/50">Utilization</span>
                  <span className="text-xs text-white font-medium">{inst.utilization}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className={`h-2 rounded-full ${inst.utilization > 85 ? "bg-red-500" : inst.utilization > 60 ? "bg-amber-500" : "bg-gold-500"}`} style={{ width: `${inst.utilization}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-xs text-white/50">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Maturity: {inst.maturityDate}</span>
              </div>

              <div className="border-t border-white/5 pt-3">
                <div className="text-xs font-medium text-white/60 mb-2">Covenants</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inst.covenants.map((cov) => (
                    <div key={cov.name} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        {cov.compliant ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                        <span className="text-xs text-white">{cov.name}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium ${cov.compliant ? "text-emerald-400" : "text-red-400"}`}>{cov.current}</span>
                        <span className="text-xs text-white/40"> / {cov.threshold}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Maturity Schedule</h3>
            <div className="space-y-3">
              {s.maturitySchedule.map((m) => (
                <div key={m.year}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/60">{m.year}</span>
                    <span className="text-xs text-white font-medium">{fmt(m.amount)} ({m.count} instruments)</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gold-500" style={{ width: `${(m.amount / 500000000) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Debt Alerts</h3>
            <div className="space-y-2">
              {s.alerts.map((alert) => (
                <div key={alert.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm text-white">{alert.title}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${sevColor[alert.severity]}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/40 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due: {alert.dueDate}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-gold-500" />
              <h3 className="text-sm font-semibold text-white">Debt Health</h3>
            </div>
            <div className="flex items-center justify-center mb-3">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" initial={{ strokeDasharray: "0 314" }} animate={{ strokeDasharray: `${(s.healthScore / 100) * 314} 314` }} transition={{ duration: 1.2 }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${healthColor(s.healthScore)}`}>{s.healthScore}%</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/50 text-center">Based on covenant compliance, maturity profile, and cost optimization</p>
          </div>
        </div>
      </div>
    </div>
  );
}
