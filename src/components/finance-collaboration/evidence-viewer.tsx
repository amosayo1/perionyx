"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileSearch, FileText, BookOpen, FileSpreadsheet, Shield, AlertTriangle, CheckCircle,
  XCircle, Search, Filter, X, ThumbsUp, ThumbsDown, Eye, GitBranch
} from "lucide-react";

type EvidenceType = "ledger" | "transaction" | "report" | "policy" | "journal" | "correspondence" | "screenshot" | "other";
type VerificationStatus = "unverified" | "verified" | "disputed" | "pending";

interface EvidenceItem {
  id: string;
  type: EvidenceType;
  title: string;
  source: string;
  confidence: number;
  verificationStatus: VerificationStatus;
  caseTitle: string;
  timestamp: string;
  description: string;
  duplicateOf?: string;
}

const typeMeta: Record<EvidenceType, { icon: typeof FileText; color: string; label: string }> = {
  ledger: { icon: BookOpen, color: "text-gold-500", label: "Ledger" },
  transaction: { icon: FileText, color: "text-blue-400", label: "Transaction" },
  report: { icon: FileSpreadsheet, color: "text-emerald-400", label: "Report" },
  policy: { icon: Shield, color: "text-purple-400", label: "Policy" },
  journal: { icon: FileText, color: "text-amber-400", label: "Journal" },
  correspondence: { icon: Eye, color: "text-cyan-400", label: "Correspondence" },
  screenshot: { icon: Eye, color: "text-rose-400", label: "Screenshot" },
  other: { icon: FileText, color: "text-white/40", label: "Other" },
};

const verificationColors: Record<VerificationStatus, string> = {
  unverified: "bg-white/10 text-white/50",
  verified: "bg-emerald-500/20 text-emerald-400",
  disputed: "bg-red-500/20 text-red-400",
  pending: "bg-amber-500/20 text-amber-400",
};

const defaultEvidence: EvidenceItem[] = [
  { id: "EV1", type: "ledger", title: "GL Export Q2 2026 - EMEA", source: "ERP System", confidence: 98, verificationStatus: "verified", caseTitle: "Ledger Discrepancy EMEA", timestamp: "2 days ago", description: "Complete GL export for EMEA region for Q2 2026" },
  { id: "EV2", type: "journal", title: "Germany Sub-Ledger Data", source: "SAP", confidence: 95, verificationStatus: "verified", caseTitle: "Ledger Discrepancy EMEA", timestamp: "1 day ago", description: "Sub-ledger export from German entity showing July posting misattribution" },
  { id: "EV3", type: "report", title: "Reconciliation Variance Report", source: "Reconciliation Engine", confidence: 88, verificationStatus: "pending", caseTitle: "Ledger Discrepancy EMEA", timestamp: "1 day ago", description: "Automated variance report showing $847K discrepancy" },
  { id: "EV4", type: "transaction", title: "Wire Transfer #4401 History", source: "Bank Portal", confidence: 99, verificationStatus: "verified", caseTitle: "Vendor Payment Discrepancy", timestamp: "3 days ago", description: "Full transaction history for vendor #4401 for last 12 months" },
  { id: "EV5", type: "policy", title: "Cash Concentration Policy v4.2", source: "Policy Engine", confidence: 100, verificationStatus: "verified", caseTitle: "Cash Concentration Alert", timestamp: "5 days ago", description: "Current cash concentration policy with $500M limit" },
  { id: "EV6", type: "report", title: "Daily Cash Position Report", source: "Treasury System", confidence: 92, verificationStatus: "disputed", caseTitle: "Cash Concentration Alert", timestamp: "2 days ago", description: "Daily cash position showing JPMorgan balance at $525M" },
  { id: "EV7", type: "correspondence", title: "Credit Application - Top Customer", source: "Sales Team", confidence: 85, verificationStatus: "pending", caseTitle: "Credit Limit Increase", timestamp: "1 day ago", description: "Formal credit limit increase request with supporting documents" },
  { id: "EV8", type: "ledger", title: "FX Forward Contracts Register", source: "Treasury System", confidence: 97, verificationStatus: "verified", caseTitle: "FX Strategy Review", timestamp: "4 days ago", description: "Current FX forward positions and maturity schedule" },
  { id: "EV9", type: "transaction", title: "Duplicate Payment Flag Report", source: "Payment Engine", confidence: 78, verificationStatus: "unverified", caseTitle: "Vendor Payment Discrepancy", timestamp: "1 day ago", description: "Flagged duplicate payment of $450K to vendor #4401" },
  { id: "EV10", type: "report", title: "Counterparty Credit Report ABC Corp", source: "Dun & Bradstreet", confidence: 94, verificationStatus: "verified", caseTitle: "Counterparty ABC Corp", timestamp: "6 days ago", description: "Credit rating and risk assessment for ABC Corp" },
  { id: "EV11", type: "ledger", title: "GL Export Q2 2026 - APAC (Duplicate)", source: "ERP System", confidence: 98, verificationStatus: "disputed", caseTitle: "Ledger Discrepancy EMEA", timestamp: "2 days ago", description: "Potential duplicate of EV1 - APAC vs EMEA region", duplicateOf: "EV1" },
];

export function EvidenceViewer() {
  const [evidence, setEvidence] = useState<EvidenceItem[]>(defaultEvidence);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EvidenceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"confidence" | "timestamp">("confidence");

  const types: (EvidenceType | "all")[] = ["all", "ledger", "transaction", "report", "policy", "journal", "correspondence", "screenshot", "other"];

  const filtered = evidence
    .filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (statusFilter !== "all" && e.verificationStatus !== statusFilter) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.caseTitle.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => sortBy === "confidence" ? b.confidence - a.confidence : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const updateStatus = (id: string, status: VerificationStatus) => {
    setEvidence((prev) => prev.map((e) => e.id === id ? { ...e, verificationStatus: status } : e));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Evidence Viewer</h1>
          <p className="text-sm text-white/60 mt-1">Browse, verify, and dispute evidence across cases</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/40">
          {evidence.filter((e) => e.verificationStatus === "unverified").length} unverified
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search evidence..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
          {search && <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 cursor-pointer" onClick={() => setSearch("")} />}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "confidence" | "timestamp")} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/20">
          <option value="confidence">Sort by Confidence</option>
          <option value="timestamp">Sort by Date</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${typeFilter === t ? "bg-gold-500 text-black font-medium" : "bg-white/5 text-white/50 hover:text-white"}`}
          >
            {t === "all" ? "All Types" : t}
          </button>
        ))}
      </div>

      <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
        {(["all", "unverified", "pending", "verified", "disputed"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors capitalize ${statusFilter === s ? "bg-gold-500 text-black font-medium" : "text-white/50 hover:text-white"}`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((ev, i) => {
          const meta = typeMeta[ev.type];
          const Icon = meta.icon;
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white/5 border rounded-xl p-5 ${ev.duplicateOf ? "border-orange-500/30" : "border-white/10"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">{meta.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${verificationColors[ev.verificationStatus]}`}>{ev.verificationStatus}</span>
                    </div>
                    <div className="text-sm font-medium text-white">{ev.title}</div>
                    <div className="text-xs text-white/50 mt-1">{ev.description}</div>
                    <div className="flex items-center gap-3 text-[10px] text-white/40 mt-1">
                      <span>Source: {ev.source}</span>
                      <span>{ev.timestamp}</span>
                      <span>Case: {ev.caseTitle}</span>
                    </div>
                    {ev.duplicateOf && (
                      <div className="flex items-center gap-1 text-[10px] text-orange-400 mt-1">
                        <GitBranch className="w-3 h-3" />
                        Possible duplicate of {ev.duplicateOf}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-gold-500">{ev.confidence}%</div>
                  <div className="text-[10px] text-white/40">Confidence</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                {ev.verificationStatus !== "verified" && (
                  <button onClick={() => updateStatus(ev.id, "verified")} className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors">
                    <CheckCircle className="w-3 h-3" /> Verify
                  </button>
                )}
                {ev.verificationStatus !== "disputed" && (
                  <button onClick={() => updateStatus(ev.id, "disputed")} className="flex items-center gap-1 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors">
                    <XCircle className="w-3 h-3" /> Dispute
                  </button>
                )}
                {ev.verificationStatus !== "pending" && ev.verificationStatus !== "unverified" && (
                  <button onClick={() => updateStatus(ev.id, "pending")} className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition-colors">
                    <AlertTriangle className="w-3 h-3" /> Flag
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
