"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calculator, Plus, ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  FileText, TrendingUp, RefreshCw, Clock,
} from "lucide-react";

interface Provision {
  id: string;
  name: string;
  provisionType: "current" | "deferred";
  fiscalYear: number;
  status: "draft" | "review" | "approved" | "filed";
  currentTax: number;
  deferredTax: number;
  effectiveRate: number;
  jurisdiction: string;
}

interface DeferredItem {
  id: string;
  description: string;
  temporaryDifference: number;
  taxRate: number;
  deferredLiability: number;
  reversalDate: string;
}

interface ReconciliationItem {
  label: string;
  currentYear: number;
  priorYear: number;
}

export function ProvisionCenter() {
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [deferredItems, setDeferredItems] = useState<DeferredItem[]>([]);
  const [reconciliation, setReconciliation] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedProvision, setExpandedProvision] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [provRes, defRes, reconRes] = await Promise.all([
          fetch("/api/tax/provisions").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/provisions/deferred").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/provisions/reconciliation").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (provRes) setProvisions(provRes.provisions ?? []);
        if (defRes) setDeferredItems(defRes.items ?? []);
        if (reconRes) setReconciliation(reconRes.items ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultProvisions: Provision[] = [
    { id: "1", name: "FY2026 Current Tax - US", provisionType: "current", fiscalYear: 2026, status: "review", currentTax: 2450000, deferredTax: 0, effectiveRate: 21.4, jurisdiction: "US-Federal" },
    { id: "2", name: "FY2026 Deferred Tax - US", provisionType: "deferred", fiscalYear: 2026, status: "draft", currentTax: 0, deferredTax: 380000, effectiveRate: 0, jurisdiction: "US-Federal" },
    { id: "3", name: "FY2026 Current Tax - UK", provisionType: "current", fiscalYear: 2026, status: "approved", currentTax: 890000, deferredTax: 0, effectiveRate: 25.0, jurisdiction: "UK" },
    { id: "4", name: "FY2026 Current Tax - DE", provisionType: "current", fiscalYear: 2026, status: "draft", currentTax: 620000, deferredTax: 0, effectiveRate: 29.8, jurisdiction: "DE" },
    { id: "5", name: "FY2026 Current Tax - SG", provisionType: "current", fiscalYear: 2026, status: "filed", currentTax: 310000, deferredTax: 0, effectiveRate: 17.0, jurisdiction: "SG" },
  ];

  const defaultDeferredItems: DeferredItem[] = [
    { id: "1", description: "Asset Revaluation Reserve", temporaryDifference: 1200000, taxRate: 21.4, deferredLiability: 256800, reversalDate: "2029-12-31" },
    { id: "2", description: "Accelerated Depreciation", temporaryDifference: 800000, taxRate: 21.4, deferredLiability: 171200, reversalDate: "2028-06-30" },
    { id: "3", description: "Provision for Restructuring", temporaryDifference: 350000, taxRate: 25.0, deferredLiability: 87500, reversalDate: "2027-12-31" },
  ];

  const defaultReconciliation: ReconciliationItem[] = [
    { label: "Statutory Tax Rate", currentYear: 21.0, priorYear: 21.0 },
    { label: "State & Local Tax Effect", currentYear: 3.2, priorYear: 3.1 },
    { label: "Non-Deductible Expenses", currentYear: 1.8, priorYear: 1.5 },
    { label: "Tax Credits", currentYear: -2.4, priorYear: -2.1 },
    { label: "Foreign Rate Differential", currentYear: -1.2, priorYear: -1.0 },
    { label: "Effective Tax Rate", currentYear: 21.4, priorYear: 21.5 },
  ];

  const provisionsData = defaultProvisions;
  const deferredData = defaultDeferredItems;
  const reconData = defaultReconciliation;

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "filed": return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "review": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      default: return "text-white/40 bg-white/5 border-white/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Provision Center</h1>
          <p className="text-sm text-white/60 mt-1">Tax provision management, deferred tax analysis, and reconciliation</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Provision
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Create Tax Provision</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Name</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-gold-500" placeholder="FY2026 Current Tax - ..." />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Type</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500">
                <option value="current">Current</option>
                <option value="deferred">Deferred</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Fiscal Year</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-gold-500" placeholder="2026" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Jurisdiction</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-gold-500" placeholder="US-Federal" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Tax Payable</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-gold-500" placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Effective Rate (%)</label>
              <input type="number" step="0.1" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-gold-500" placeholder="21.0" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Save Provision</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Tax Provisions</h2>
        </div>
        <div className="divide-y divide-white/5">
          {provisionsData.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedProvision(expandedProvision === p.id ? null : p.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Calculator className="w-5 h-5 text-gold-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{p.name}</div>
                    <div className="text-xs text-white/50">{p.jurisdiction} &middot; FY{p.fiscalYear}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-white font-medium">
                      {p.currentTax > 0 ? `$${(p.currentTax / 1000).toFixed(0)}K` : `\u2014`}
                    </div>
                    <div className="text-xs text-white/50">Current Tax</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-white font-medium">
                      {p.deferredTax > 0 ? `$${(p.deferredTax / 1000).toFixed(0)}K` : "\u2014"}
                    </div>
                    <div className="text-xs text-white/50">Deferred Tax</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-gold-500 font-medium">{p.effectiveRate > 0 ? `${p.effectiveRate}%` : "\u2014"}</div>
                    <div className="text-xs text-white/50">Eff. Rate</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(p.status)}`}>
                    {p.status.toUpperCase()}
                  </span>
                  {expandedProvision === p.id ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                </div>
              </div>
              {expandedProvision === p.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4"
                >
                  <div className="bg-white/5 rounded-lg p-4 text-xs text-white/60 space-y-2">
                    <div className="flex justify-between"><span>Jurisdiction</span><span className="text-white">{p.jurisdiction}</span></div>
                    <div className="flex justify-between"><span>Fiscal Year</span><span className="text-white">{p.fiscalYear}</span></div>
                    <div className="flex justify-between"><span>Current Tax</span><span className="text-white">${p.currentTax.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Deferred Tax</span><span className="text-white">${p.deferredTax.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Effective Rate</span><span className="text-gold-500">{p.effectiveRate}%</span></div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Deferred Tax Items</h2>
          </div>
          <div className="divide-y divide-white/5">
            {deferredData.map((d) => (
              <div key={d.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-white">{d.description}</div>
                    <div className="text-xs text-white/50 mt-1">Reversal: {d.reversalDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gold-500 font-medium">${(d.deferredLiability / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-white/50">Liability</div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/40">
                  <span>Temp. Diff: ${(d.temporaryDifference / 1000).toFixed(0)}K</span>
                  <span>Rate: {d.taxRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">ETR Reconciliation</h2>
          </div>
          <div className="p-4 space-y-3">
            {reconData.map((r) => (
              <div key={r.label} className={`flex justify-between items-center ${r.label === "Effective Tax Rate" ? "pt-2 border-t border-white/10" : ""}`}>
                <span className={`text-xs ${r.label === "Effective Tax Rate" ? "text-white font-semibold" : "text-white/50"}`}>{r.label}</span>
                <span className={`text-sm font-medium ${
                  r.label === "Effective Tax Rate" ? "text-gold-500" :
                  r.currentYear > 0 ? "text-red-400" : "text-emerald-400"
                }`}>
                  {r.currentYear > 0 ? "+" : ""}{r.currentYear}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
