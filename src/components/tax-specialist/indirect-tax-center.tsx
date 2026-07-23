"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Percent, Plus, AlertTriangle, CheckCircle, Clock, FileText,
  TrendingUp, TrendingDown, Globe, ChevronRight,
} from "lucide-react";

interface JurisdictionSummary {
  jurisdiction: string;
  taxType: string;
  collected: number;
  paid: number;
  net: number;
  rate: number;
  status: "compliant" | "pending" | "overdue";
}

interface TaxReturn {
  id: string;
  jurisdiction: string;
  taxType: string;
  period: string;
  status: "draft" | "submitted" | "filed" | "overdue";
  totalLiability: number;
  dueDate: string;
}

interface Exception {
  id: string;
  description: string;
  jurisdiction: string;
  severity: "high" | "medium" | "low";
  status: "open" | "investigating" | "resolved";
}

export function IndirectTaxCenter() {
  const [jurisdictions, setJurisdictions] = useState<JurisdictionSummary[]>([]);
  const [returns, setReturns] = useState<TaxReturn[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [jurRes, retRes, excRes] = await Promise.all([
          fetch("/api/tax/indirect-tax/jurisdictions").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/indirect-tax/returns").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/indirect-tax/exceptions").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (jurRes) setJurisdictions(jurRes.jurisdictions ?? []);
        if (retRes) setReturns(retRes.returns ?? []);
        if (excRes) setExceptions(excRes.exceptions ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultJurisdictions: JurisdictionSummary[] = [
    { jurisdiction: "US - California", taxType: "Sales Tax", collected: 320000, paid: 45000, net: 275000, rate: 7.25, status: "compliant" },
    { jurisdiction: "US - New York", taxType: "Sales Tax", collected: 280000, paid: 38000, net: 242000, rate: 8.0, status: "compliant" },
    { jurisdiction: "UK", taxType: "VAT", collected: 450000, paid: 120000, net: 330000, rate: 20.0, status: "pending" },
    { jurisdiction: "Germany", taxType: "VAT", collected: 380000, paid: 95000, net: 285000, rate: 19.0, status: "compliant" },
    { jurisdiction: "Singapore", taxType: "GST", collected: 210000, paid: 62000, net: 148000, rate: 9.0, status: "overdue" },
    { jurisdiction: "Australia", taxType: "GST", collected: 290000, paid: 78000, net: 212000, rate: 10.0, status: "compliant" },
  ];

  const defaultReturns: TaxReturn[] = [
    { id: "1", jurisdiction: "UK", taxType: "VAT", period: "Q1 2026", status: "submitted", totalLiability: 330000, dueDate: "2026-07-31" },
    { id: "2", jurisdiction: "Germany", taxType: "VAT", period: "Q1 2026", status: "filed", totalLiability: 285000, dueDate: "2026-07-15" },
    { id: "3", jurisdiction: "Singapore", taxType: "GST", period: "Q1 2026", status: "overdue", totalLiability: 148000, dueDate: "2026-07-20" },
    { id: "4", jurisdiction: "Australia", taxType: "GST", period: "Q1 2026", status: "draft", totalLiability: 212000, dueDate: "2026-08-28" },
    { id: "5", jurisdiction: "US - California", taxType: "Sales Tax", period: "Jun 2026", status: "filed", totalLiability: 275000, dueDate: "2026-07-31" },
  ];

  const defaultExceptions: Exception[] = [
    { id: "1", description: "Exempt supply misclassified in SG system", jurisdiction: "Singapore", severity: "high", status: "investigating" },
    { id: "2", description: "Missing input tax credit documentation DE", jurisdiction: "Germany", severity: "medium", status: "open" },
    { id: "3", description: "Reverse charge not applied on digital services UK", jurisdiction: "UK", severity: "high", status: "open" },
  ];

  const totalCollected = defaultJurisdictions.reduce((s, j) => s + j.collected, 0);
  const totalPaid = defaultJurisdictions.reduce((s, j) => s + j.paid, 0);
  const totalNet = totalCollected - totalPaid;

  const statusColor = (status: string) => {
    switch (status) {
      case "compliant":
      case "filed":
      case "resolved": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "submitted":
      case "investigating": return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "pending":
      case "draft": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      case "overdue": return "text-red-400 bg-red-500/20 border-red-500/30";
      default: return "text-white/40 bg-white/5 border-white/10";
    }
  };

  const severityColor = (sev: string) => {
    switch (sev) {
      case "high": return "text-red-400";
      case "medium": return "text-amber-400";
      default: return "text-white/50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Indirect Tax Center</h1>
          <p className="text-sm text-white/60 mt-1">VAT/GST/Sales tax management across jurisdictions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">
          <Plus className="w-4 h-4" />
          New Return
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Collected", value: `$${(totalCollected / 1000).toFixed(0)}K`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total Input Tax", value: `$${(totalPaid / 1000).toFixed(0)}K`, icon: TrendingDown, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Net Liability", value: `$${(totalNet / 1000).toFixed(0)}K`, icon: Percent, color: "text-gold-500", bg: "bg-gold-500/10" },
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

      <div className="bg-white/5 border border-white/10 rounded-xl">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Jurisdiction Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-white/50 font-medium p-4">Jurisdiction</th>
                <th className="text-left text-xs text-white/50 font-medium p-4">Tax Type</th>
                <th className="text-right text-xs text-white/50 font-medium p-4">Collected</th>
                <th className="text-right text-xs text-white/50 font-medium p-4">Input Tax</th>
                <th className="text-right text-xs text-white/50 font-medium p-4">Net</th>
                <th className="text-right text-xs text-white/50 font-medium p-4">Rate</th>
                <th className="text-center text-xs text-white/50 font-medium p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {defaultJurisdictions.map((j, i) => (
                <motion.tr
                  key={j.jurisdiction}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-white">{j.jurisdiction}</td>
                  <td className="p-4 text-white/60">{j.taxType}</td>
                  <td className="p-4 text-right text-white">${j.collected.toLocaleString()}</td>
                  <td className="p-4 text-right text-white/60">${j.paid.toLocaleString()}</td>
                  <td className="p-4 text-right text-gold-500 font-medium">${j.net.toLocaleString()}</td>
                  <td className="p-4 text-right text-white/60">{j.rate}%</td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(j.status)}`}>
                      {j.status.toUpperCase()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Returns</h2>
          </div>
          <div className="divide-y divide-white/5">
            {defaultReturns.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-white/50" />
                  <div>
                    <div className="text-sm text-white">{r.jurisdiction} - {r.taxType}</div>
                    <div className="text-xs text-white/50">{r.period} &middot; Due: {r.dueDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gold-500 font-medium">${(r.totalLiability / 1000).toFixed(0)}K</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(r.status)}`}>
                    {r.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Exceptions</h2>
          </div>
          <div className="divide-y divide-white/5">
            {defaultExceptions.length === 0 ? (
              <div className="p-6 text-center text-sm text-white/40">No active exceptions</div>
            ) : (
              defaultExceptions.map((e) => (
                <div key={e.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${severityColor(e.severity)}`} />
                      <div>
                        <div className="text-sm text-white">{e.description}</div>
                        <div className="text-xs text-white/50 mt-1">{e.jurisdiction}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(e.status)}`}>
                      {e.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
