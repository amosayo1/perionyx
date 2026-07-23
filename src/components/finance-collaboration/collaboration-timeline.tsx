"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock, Users, ThumbsUp, FileText, CheckCircle, MessageSquareText, Search, Scale, AlertTriangle, Filter, X, Calendar
} from "lucide-react";

type EventType = "assignment" | "recommendation" | "evidence" | "approval" | "comment" | "investigation" | "decision" | "escalation";

interface TimelineEvent {
  id: string;
  type: EventType;
  description: string;
  caseTitle: string;
  source: string;
  specialist: string;
  timestamp: string;
  date: string;
}

const eventMeta: Record<EventType, { icon: typeof Clock; color: string; label: string }> = {
  assignment: { icon: Users, color: "text-purple-400", label: "Assignment" },
  recommendation: { icon: ThumbsUp, color: "text-indigo-400", label: "Recommendation" },
  evidence: { icon: FileText, color: "text-amber-400", label: "Evidence" },
  approval: { icon: CheckCircle, color: "text-emerald-400", label: "Approval" },
  comment: { icon: MessageSquareText, color: "text-blue-400", label: "Comment" },
  investigation: { icon: Search, color: "text-cyan-400", label: "Investigation" },
  decision: { icon: Scale, color: "text-rose-400", label: "Decision" },
  escalation: { icon: AlertTriangle, color: "text-red-400", label: "Escalation" },
};

const defaultEvents: TimelineEvent[] = [
  { id: "1", type: "decision", description: "FX hedging strategy approved for Q3", caseTitle: "FX Strategy Review", source: "System", specialist: "AI Decision Engine", timestamp: "10 min ago", date: "2026-07-17" },
  { id: "2", type: "assignment", description: "Assigned review of counterparty risk limits", caseTitle: "Counterparty Risk Assessment", source: "Treasury Specialist", specialist: "Bob Martinez", timestamp: "25 min ago", date: "2026-07-17" },
  { id: "3", type: "evidence", description: "Uploaded ledger reconciliation report", caseTitle: "Ledger Discrepancy #43021", source: "Reconciliation Engine", specialist: "Alice Chen", timestamp: "1 hour ago", date: "2026-07-17" },
  { id: "4", type: "comment", description: "Added meeting notes re: credit limit increase", caseTitle: "Credit Limit Review", source: "Senior Analyst", specialist: "Carol Nguyen", timestamp: "2 hours ago", date: "2026-07-17" },
  { id: "5", type: "escalation", description: "Cash concentration limit breached in EMEA", caseTitle: "Cash Concentration Alert", source: "Policy Engine", specialist: "System", timestamp: "3 hours ago", date: "2026-07-17" },
  { id: "6", type: "investigation", description: "Started investigation on payment anomaly", caseTitle: "Vendor Payment Anomaly", source: "Risk Manager", specialist: "Diana Lopez", timestamp: "5 hours ago", date: "2026-07-17" },
  { id: "7", type: "recommendation", description: "Increase EUR hedge ratio from 70% to 80%", caseTitle: "FX Strategy Review", source: "AI Engine", specialist: "System", timestamp: "8 hours ago", date: "2026-07-17" },
  { id: "8", type: "approval", description: "Wire transfer approved: $450K to vendor #4401", caseTitle: "Vendor Payment", source: "Approval Chain", specialist: "Frank Okafor", timestamp: "12 hours ago", date: "2026-07-17" },
  { id: "9", type: "assignment", description: "Assigned to investigate Q2 GL variance", caseTitle: "Ledger Discrepancy #43021", source: "Controller", specialist: "Alice Chen", timestamp: "1 day ago", date: "2026-07-16" },
  { id: "10", type: "evidence", description: "Sub-ledger Germany exported to case", caseTitle: "Ledger Discrepancy #43021", source: "EMEA Controller", specialist: "Carol Nguyen", timestamp: "1 day ago", date: "2026-07-16" },
  { id: "11", type: "decision", description: "Credit limit increase approved for top customer", caseTitle: "Credit Limit Review", source: "Credit Committee", specialist: "Grace Liu", timestamp: "1 day ago", date: "2026-07-16" },
  { id: "12", type: "comment", description: "Reviewed preliminary findings, need additional data", caseTitle: "Counterparty Risk Assessment", source: "Senior Analyst", specialist: "Bob Martinez", timestamp: "2 days ago", date: "2026-07-15" },
];

const eventTypes: EventType[] = ["assignment", "recommendation", "evidence", "approval", "comment", "investigation", "decision", "escalation"];

type FilterState = {
  types: Set<EventType>;
  search: string;
};

export function CollaborationTimeline() {
  const [filters, setFilters] = useState<FilterState>({ types: new Set(eventTypes), search: "" });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const toggleType = (t: EventType) => {
    const next = new Set(filters.types);
    if (next.has(t)) next.delete(t); else next.add(t);
    setFilters({ ...filters, types: next });
  };

  const selectAll = () => setFilters({ ...filters, types: new Set(eventTypes) });
  const clearAll = () => setFilters({ ...filters, types: new Set<EventType>() });

  const filtered = defaultEvents.filter((e) => {
    if (!filters.types.has(e.type)) return false;
    if (filters.search && !e.description.toLowerCase().includes(filters.search.toLowerCase()) && !e.caseTitle.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Collaboration Timeline</h1>
          <p className="text-sm text-white/60 mt-1">Unified timeline of all finance collaboration events</p>
        </div>
        <button onClick={() => setShowFilterPanel(!showFilterPanel)} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search events or cases..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20"
          />
          {filters.search && (
            <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 cursor-pointer" onClick={() => setFilters({ ...filters, search: "" })} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/40" />
          <span className="text-sm text-white/50">Past 7 days</span>
        </div>
      </div>

      {showFilterPanel && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Filter by Event Type</h3>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-white/50 hover:text-white transition-colors">Select All</button>
              <button onClick={clearAll} className="text-xs text-white/50 hover:text-white transition-colors">Clear</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((t) => {
              const meta = eventMeta[t];
              const active = filters.types.has(t);
              return (
                <button key={t} onClick={() => toggleType(t)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${active ? "bg-white/10 text-white" : "bg-white/5 text-white/40"}`}>
                  <meta.icon className={`w-3.5 h-3.5 ${active ? meta.color : ""}`} />
                  {meta.label}
                  {active && <X className="w-3 h-3 ml-1" onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleType(t); }} />}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-white/5" />
        <div className="space-y-0">
          {filtered.map((event, i) => {
            const meta = eventMeta[event.type];
            const Icon = meta.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="relative flex items-start gap-4 pb-6"
              >
                <div className="relative z-10 w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/10 ${meta.color}`}>{meta.label}</span>
                    <span className="text-xs text-white/40">{event.timestamp}</span>
                  </div>
                  <div className="text-sm text-white">{event.description}</div>
                  <div className="text-xs text-white/50 mt-1">Case: {event.caseTitle}</div>
                  <div className="flex items-center gap-3 text-[10px] text-white/40 mt-1">
                    <span>Source: {event.source}</span>
                    <span>Specialist: {event.specialist}</span>
                    <span>{event.date}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
