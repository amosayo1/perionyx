"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft, Plus, AlertTriangle, CheckCircle, Shield, FileText,
  TrendingUp, Clock, ChevronDown, ChevronUp,
} from "lucide-react";

interface TransferPricingPolicy {
  id: string;
  name: string;
  entityFrom: string;
  entityTo: string;
  transactionType: string;
  method: string;
  riskLevel: "low" | "medium" | "high";
  armLengthRange: string;
  actualMargin: number;
  documentationStatus: "complete" | "in-progress" | "not-started";
  lastReview: string;
}

interface IntercompanyRule {
  id: string;
  rule: string;
  category: string;
  mandatory: boolean;
  status: "active" | "pending" | "inactive";
}

interface DocumentationItem {
  id: string;
  entity: string;
  type: string;
  status: "ready" | "in-progress" | "overdue" | "not-required";
  dueDate: string;
  jurisdiction: string;
}

export function TransferPricingCenter() {
  const [policies, setPolicies] = useState<TransferPricingPolicy[]>([]);
  const [rules, setRules] = useState<IntercompanyRule[]>([]);
  const [documentation, setDocumentation] = useState<DocumentationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [polRes, ruleRes, docRes] = await Promise.all([
          fetch("/api/tax/transfer-pricing/policies").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/transfer-pricing/rules").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/tax/transfer-pricing/documentation").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (polRes) setPolicies(polRes.policies ?? []);
        if (ruleRes) setRules(ruleRes.rules ?? []);
        if (docRes) setDocumentation(docRes.items ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultPolicies: TransferPricingPolicy[] = [
    { id: "1", name: "US-UK Services Fee", entityFrom: "US Corp", entityTo: "UK Ltd", transactionType: "Management Services", method: "Cost Plus", riskLevel: "low", armLengthRange: "8-12%", actualMargin: 10.2, documentationStatus: "complete", lastReview: "2026-03-15" },
    { id: "2", name: "US-DE Royalty License", entityFrom: "US Corp", entityTo: "DE GmbH", transactionType: "IP License", method: "CUP Method", riskLevel: "medium", armLengthRange: "5-8%", actualMargin: 6.5, documentationStatus: "in-progress", lastReview: "2026-01-20" },
    { id: "3", name: "US-SG Goods Transfer", entityFrom: "US Corp", entityTo: "SG Pte", transactionType: "Tangible Goods", method: "TNMM", riskLevel: "high", armLengthRange: "3-6%", actualMargin: 7.1, documentationStatus: "in-progress", lastReview: "2025-11-10" },
    { id: "4", name: "UK-AU Support Services", entityFrom: "UK Ltd", entityTo: "AU Pty", transactionType: "IT Support", method: "Cost Plus", riskLevel: "low", armLengthRange: "6-10%", actualMargin: 8.0, documentationStatus: "complete", lastReview: "2026-05-01" },
  ];

  const defaultRules: IntercompanyRule[] = [
    { id: "1", rule: "All intercompany transactions must be at arm's length", category: "Pricing", mandatory: true, status: "active" },
    { id: "2", rule: "Transfer pricing documentation must be maintained annually", category: "Documentation", mandatory: true, status: "active" },
    { id: "3", rule: "Material changes require board approval within 30 days", category: "Governance", mandatory: true, status: "active" },
    { id: "4", rule: "BEPS Action 13 compliant master file required", category: "Regulatory", mandatory: true, status: "pending" },
    { id: "5", rule: "Advance Pricing Agreements to be renewed before expiry", category: "Compliance", mandatory: false, status: "active" },
  ];

  const defaultDocumentation: DocumentationItem[] = [
    { id: "1", entity: "US Corp", type: "Master File", status: "ready", dueDate: "2026-12-31", jurisdiction: "US" },
    { id: "2", entity: "UK Ltd", type: "Local File", status: "in-progress", dueDate: "2026-09-30", jurisdiction: "UK" },
    { id: "3", entity: "DE GmbH", type: "Local File", status: "overdue", dueDate: "2026-06-30", jurisdiction: "DE" },
    { id: "4", entity: "SG Pte", type: "Country-by-Country Report", status: "in-progress", dueDate: "2026-10-31", jurisdiction: "SG" },
  ];

  const riskColor = (risk: string) => {
    switch (risk) {
      case "high": return "text-red-400 bg-red-500/20 border-red-500/30";
      case "medium": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      default: return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "complete":
      case "ready":
      case "active": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "in-progress":
      case "pending": return "text-amber-400 bg-amber-500/20 border-amber-500/30";
      case "overdue":
      case "not-started": return "text-red-400 bg-red-500/20 border-red-500/30";
      default: return "text-white/40 bg-white/5 border-white/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Transfer Pricing Center</h1>
          <p className="text-sm text-white/60 mt-1">Intercompany pricing policies, arm&apos;s length compliance, and documentation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Transfer Pricing Policies</h2>
        </div>
        <div className="divide-y divide-white/5">
          {defaultPolicies.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedPolicy(expandedPolicy === p.id ? null : p.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <ArrowRightLeft className="w-5 h-5 text-gold-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{p.name}</div>
                    <div className="text-xs text-white/50">{p.entityFrom} &rarr; {p.entityTo} &middot; {p.transactionType}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-white">{p.method}</div>
                    <div className="text-xs text-white/50">Method</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-gold-500 font-medium">{p.actualMargin}%</div>
                    <div className="text-xs text-white/50">{p.armLengthRange}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskColor(p.riskLevel)}`}>
                    {p.riskLevel.toUpperCase()}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(p.documentationStatus)}`}>
                    {p.documentationStatus.replace("-", " ").toUpperCase()}
                  </span>
                  {expandedPolicy === p.id ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                </div>
              </div>
              {expandedPolicy === p.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4"
                >
                  <div className="bg-white/5 rounded-lg p-4 text-xs text-white/60 space-y-2">
                    <div className="flex justify-between"><span>Transaction Type</span><span className="text-white">{p.transactionType}</span></div>
                    <div className="flex justify-between"><span>Pricing Method</span><span className="text-white">{p.method}</span></div>
                    <div className="flex justify-between"><span>Arm&apos;s Length Range</span><span className="text-white">{p.armLengthRange}</span></div>
                    <div className="flex justify-between"><span>Actual Margin</span><span className="text-gold-500">{p.actualMargin}%</span></div>
                    <div className="flex justify-between"><span>Last Review</span><span className="text-white">{p.lastReview}</span></div>
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
            <h2 className="text-sm font-semibold text-white">Intercompany Rules</h2>
          </div>
          <div className="divide-y divide-white/5">
            {defaultRules.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-white/50" />
                  <div>
                    <div className="text-sm text-white">{r.rule}</div>
                    <div className="text-xs text-white/50">{r.category}{r.mandatory ? " &middot; Mandatory" : ""}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(r.status)}`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Documentation Status</h2>
          </div>
          <div className="divide-y divide-white/5">
            {defaultDocumentation.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-white/50" />
                  <div>
                    <div className="text-sm text-white">{d.entity} - {d.type}</div>
                    <div className="text-xs text-white/50">{d.jurisdiction} &middot; Due: {d.dueDate}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor(d.status)}`}>
                  {d.status.replace("-", " ").toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
