"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain, Search, X, FolderOpen, FileText, Scale, Clock, Users,
  Shield, AlertTriangle, ThumbsUp, Eye, Database
} from "lucide-react";

type MemoryType = "case_context" | "decision_history" | "risk_context" | "policy_context" | "specialist_knowledge" | "evidence_reference" | "workflow_state";

interface MemoryEntry {
  id: string;
  type: MemoryType;
  contextKey: string;
  contextValue: string;
  sourceSpecialist: string;
  entityLinks: string[];
  timestamp: string;
  summary: string;
}

const typeMeta: Record<MemoryType, { icon: typeof Database; color: string; label: string }> = {
  case_context: { icon: FolderOpen, color: "text-gold-500", label: "Case Context" },
  decision_history: { icon: Scale, color: "text-rose-400", label: "Decision History" },
  risk_context: { icon: AlertTriangle, color: "text-orange-400", label: "Risk Context" },
  policy_context: { icon: Shield, color: "text-purple-400", label: "Policy Context" },
  specialist_knowledge: { icon: Users, color: "text-blue-400", label: "Specialist Knowledge" },
  evidence_reference: { icon: FileText, color: "text-amber-400", label: "Evidence Reference" },
  workflow_state: { icon: Clock, color: "text-cyan-400", label: "Workflow State" },
};

const defaultMemory: MemoryEntry[] = [
  { id: "M1", type: "case_context", contextKey: "Ledger Discrepancy EMEA - Root Cause", contextValue: "Germany sub-ledger posting misattributed to July instead of June. Correcting entry reduces variance from $847K to $23K.", sourceSpecialist: "Alice Chen", entityLinks: ["C-001", "EV2"], timestamp: "2026-07-17T10:00:00Z", summary: "Root cause identified for EMEA ledger discrepancy" },
  { id: "M2", type: "decision_history", contextKey: "GBP Forward Contract - Approval Rationale", contextValue: "Approved $25M GBP forward at 1.2850. Decision based on BOE rate decision risk (9.2% implied vol) and unhedged exposure policy limit.", sourceSpecialist: "David Kim", entityLinks: ["D1", "R1"], timestamp: "2026-07-17T09:30:00Z", summary: "GBP forward contract approved with rationale" },
  { id: "M3", type: "risk_context", contextKey: "EUR Hedge Ratio Breach - Policy Impact", contextValue: "EUR hedge ratio at 70%, policy target 80%. Breach duration: 14 days. Risk level elevated but within tolerance.", sourceSpecialist: "Policy Engine", entityLinks: ["C-006", "R2", "D2"], timestamp: "2026-07-16T14:00:00Z", summary: "EUR hedge ratio breach monitored for 14 days" },
  { id: "M4", type: "policy_context", contextKey: "Cash Concentration Limit - Interpretation", contextValue: "JPMorgan balance at $425M vs $500M limit. Limit includes all operating accounts. Diversification threshold triggers at 85% utilization.", sourceSpecialist: "Carol Nguyen", entityLinks: ["C-003", "R3", "D5"], timestamp: "2026-07-16T11:00:00Z", summary: "Cash concentration policy interpretation documented" },
  { id: "M5", type: "specialist_knowledge", contextKey: "Counterparty ABC Corp - Credit Assessment Notes", contextValue: "ABC Corp has strong payment history but recent industry headwinds. Recommend ongoing monitoring but no immediate downgrade.", sourceSpecialist: "Bob Martinez", entityLinks: ["C-002"], timestamp: "2026-07-15T16:00:00Z", summary: "Credit assessment notes for ABC Corp" },
  { id: "M6", type: "decision_history", contextKey: "EUR Hedge Ratio Increase - Rejected Alternative", contextValue: "Alternative to phase increase over 90 days was rejected due to policy compliance urgency. Full increase to 80% required immediately.", sourceSpecialist: "Risk Committee", entityLinks: ["D2", "R2"], timestamp: "2026-07-15T10:00:00Z", summary: "Phased approach rejected for EUR hedge increase" },
  { id: "M7", type: "evidence_reference", contextKey: "Duplicate Payment Flag - Methodology", contextValue: "Payment Engine flagged duplicate using invoice number + amount matching. False positive rate: 2.3%. Vendor #4401 flagged for $450K.", sourceSpecialist: "Payment Engine", entityLinks: ["C-005", "EV9"], timestamp: "2026-07-15T09:00:00Z", summary: "Duplicate payment detection methodology" },
  { id: "M8", type: "workflow_state", contextKey: "FX Strategy Review - Approval Workflow", contextValue: "Three-stage approval: Treasury Specialist → Risk Manager → CFO. Currently at Risk Manager stage (pending).", sourceSpecialist: "System", entityLinks: ["C-004", "D1"], timestamp: "2026-07-17T08:00:00Z", summary: "FX strategy review workflow state" },
  { id: "M9", type: "case_context", contextKey: "Credit Limit Increase - Customer History", contextValue: "Customer has 5 years clean payment history, current limit $10M, utilization 72%. Requested increase to $13M (30%).", sourceSpecialist: "Grace Liu", entityLinks: ["C-008", "D3"], timestamp: "2026-07-16T13:00:00Z", summary: "Customer credit history and limit request details" },
  { id: "M10", type: "specialist_knowledge", contextKey: "Intercompany Balance - Historical Pattern", contextValue: "US-Germany intercompany differences have historically averaged $1.8M at quarter-end. Current $2.3M is 28% above historical average.", sourceSpecialist: "Grace Liu", entityLinks: ["C-007"], timestamp: "2026-07-14T15:00:00Z", summary: "Historical intercompany variance pattern documented" },
  { id: "M11", type: "decision_history", contextKey: "USD Treasury Duration - Extension Decision", contextValue: "Decision to extend duration rejected due to near-term rate uncertainty. Awaiting Q3 CPI data before re-evaluating.", sourceSpecialist: "Investment Committee", entityLinks: ["R4"], timestamp: "2026-07-14T11:00:00Z", summary: "Duration extension decision deferred" },
  { id: "M12", type: "evidence_reference", contextKey: "GL Export EMEA Q2 - Trust Score", contextValue: "Export integrity verified: hash match, row count 12,847, date range 2026-04-01 to 2026-06-30. Trust score: 98%.", sourceSpecialist: "Alice Chen", entityLinks: ["EV1", "C-001"], timestamp: "2026-07-15T10:00:00Z", summary: "GL export integrity verified with hash match" },
];

export function EnterpriseMemory() {
  const [memory] = useState<MemoryEntry[]>(defaultMemory);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MemoryType | "all">("all");
  const [selected, setSelected] = useState<MemoryEntry | null>(null);

  const types: (MemoryType | "all")[] = ["all", "case_context", "decision_history", "risk_context", "policy_context", "specialist_knowledge", "evidence_reference", "workflow_state"];

  const filtered = memory.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (search && !m.summary.toLowerCase().includes(search.toLowerCase()) && !m.contextKey.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Enterprise Memory</h1>
          <p className="text-sm text-white/60 mt-1">Persistent knowledge graph of case context, decisions, and specialist insights</p>
        </div>
        <div className="text-sm text-white/40">{memory.length} entries</div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search memory..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
          {search && <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 cursor-pointer" onClick={() => setSearch("")} />}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${typeFilter === t ? "bg-gold-500 text-black font-medium" : "bg-white/5 text-white/50 hover:text-white"}`}
          >
            {t === "all" ? "All Types" : t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {filtered.map((m, i) => {
            const meta = typeMeta[m.type];
            const Icon = meta.icon;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-colors ${selected?.id === m.id ? "border-gold-500/50" : "border-white/10 hover:bg-white/10"}`}
                onClick={() => setSelected(m)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/10 ${meta.color}`}>{meta.label}</span>
                    </div>
                    <div className="text-sm font-medium text-white">{m.contextKey}</div>
                    <div className="text-xs text-white/50 mt-1">{m.summary}</div>
                    <div className="flex items-center gap-2 text-[10px] text-white/40 mt-1">
                      <Users className="w-3 h-3" />
                      <span>{m.sourceSpecialist}</span>
                      <span className="ml-auto">{new Date(m.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-4">
          {selected ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                {(() => {
                  const meta = typeMeta[selected.type];
                  const Icon = meta.icon;
                  return <><Icon className={`w-4 h-4 ${meta.color}`} /><span className={`text-xs ${meta.color}`}>{meta.label}</span></>;
                })()}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{selected.contextKey}</h3>
              <div className="bg-white/5 rounded-lg p-3 mb-3">
                <div className="text-xs text-white/60 mb-1">Context Value</div>
                <div className="text-xs text-white/80 leading-relaxed">{selected.contextValue}</div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">Source</span>
                  <span className="text-white">{selected.sourceSpecialist}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Timestamp</span>
                  <span className="text-white">{new Date(selected.timestamp).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-1">Entity Links</span>
                  <div className="flex flex-wrap gap-1">
                    {selected.entityLinks.map((link, j) => (
                      <span key={j} className="text-[10px] bg-white/5 text-gold-500 px-2 py-0.5 rounded">{link}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <Brain className="w-12 h-12 text-white/40 mx-auto mb-2" />
              <p className="text-sm text-white/50">Select a memory entry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
