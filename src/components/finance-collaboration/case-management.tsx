"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen, Plus, Search, Filter, ChevronDown, X, Users, FileText,
  CheckCircle, Clock, AlertTriangle, Eye, MessageSquareText, Activity, XCircle
} from "lucide-react";

type CaseStatus = "open" | "in_progress" | "awaiting_input" | "escalated" | "resolved" | "closed";
type CasePriority = "critical" | "high" | "medium" | "low";

interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  type: string;
  owner: string;
  participantCount: number;
  evidenceCount: number;
  createdAt: string;
}

interface Participant {
  name: string;
  role: string;
}

interface CaseDetail {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  type: string;
  owner: string;
  participants: Participant[];
  comments: { id: string; author: string; content: string; timestamp: string }[];
  evidence: { id: string; title: string; type: string; timestamp: string }[];
}

const statusColors: Record<CaseStatus, string> = {
  open: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-amber-500/20 text-amber-400",
  awaiting_input: "bg-purple-500/20 text-purple-400",
  escalated: "bg-red-500/20 text-red-400",
  resolved: "bg-emerald-500/20 text-emerald-400",
  closed: "bg-white/10 text-white/50",
};

const priorityColors: Record<CasePriority, string> = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-emerald-500/20 text-emerald-400",
};

const statusIcon: Record<CaseStatus, typeof FileText> = {
  open: AlertTriangle,
  in_progress: Activity,
  awaiting_input: Clock,
  escalated: AlertTriangle,
  resolved: CheckCircle,
  closed: XCircle,
};

const defaultCases: Case[] = [
  { id: "C-001", title: "Ledger Discrepancy in EMEA Region", description: "Unexplained variance between GL and sub-ledger for Q2", status: "in_progress", priority: "critical", type: "Reconciliation", owner: "Alice Chen", participantCount: 4, evidenceCount: 7, createdAt: "2026-07-14" },
  { id: "C-002", title: "Counterparty Risk Assessment - ABC Corp", description: "Review counterparty exposure limits for top supplier", status: "open", priority: "high", type: "Risk Assessment", owner: "Bob Martinez", participantCount: 2, evidenceCount: 3, createdAt: "2026-07-15" },
  { id: "C-003", title: "Cash Concentration Limit Violation", description: "Bank balance at JPMorgan exceeded policy limit of $500M", status: "escalated", priority: "critical", type: "Policy Violation", owner: "Carol Nguyen", participantCount: 5, evidenceCount: 12, createdAt: "2026-07-10" },
  { id: "C-004", title: "FX Hedging Strategy Review Q3", description: "Review and approve FX hedging strategy for Q3", status: "awaiting_input", priority: "high", type: "Strategy", owner: "David Kim", participantCount: 6, evidenceCount: 9, createdAt: "2026-07-12" },
  { id: "C-005", title: "Vendor Payment Discrepancy", description: "Duplicate payment flagged for vendor #4401", status: "open", priority: "medium", type: "Payment", owner: "Ella Johansson", participantCount: 3, evidenceCount: 4, createdAt: "2026-07-16" },
  { id: "C-006", title: "Treasury Policy Compliance Review", description: "Quarterly compliance check against updated treasury policies", status: "resolved", priority: "low", type: "Compliance", owner: "Frank Okafor", participantCount: 4, evidenceCount: 6, createdAt: "2026-07-08" },
  { id: "C-007", title: "Intercompany Balance Dispute", description: "Resolve $2.3M difference between US and Germany entities", status: "in_progress", priority: "high", type: "Reconciliation", owner: "Grace Liu", participantCount: 3, evidenceCount: 5, createdAt: "2026-07-13" },
  { id: "C-008", title: "Credit Limit Increase Request", description: "Top customer requesting 30% credit limit increase", status: "open", priority: "medium", type: "Credit", owner: "Henry Schmidt", participantCount: 2, evidenceCount: 2, createdAt: "2026-07-16" },
];

const defaultDetail: CaseDetail = {
  id: "C-001",
  title: "Ledger Discrepancy in EMEA Region",
  description: "Unexplained variance between GL and sub-ledger totaling $847K for Q2 2026. EMEA team requested urgent investigation.",
  status: "in_progress",
  priority: "critical",
  type: "Reconciliation",
  owner: "Alice Chen",
  participants: [
    { name: "Alice Chen", role: "Lead Investigator" },
    { name: "Bob Martinez", role: "Data Analyst" },
    { name: "Carol Nguyen", role: "EMEA Controller" },
    { name: "Diana Lopez", role: "Risk Manager" },
  ],
  comments: [
    { id: "c1", author: "Alice Chen", content: "Initial review shows the variance is concentrated in the German entity. Requesting sub-ledger export.", timestamp: "2 hours ago" },
    { id: "c2", author: "Carol Nguyen", content: "Sub-ledger data for Germany has been exported and uploaded. It shows a posting in July that should have been attributed to June.", timestamp: "1 hour ago" },
    { id: "c3", author: "Bob Martinez", content: "Confirmed: the July posting needs to be reclassified. Variance reduces to $23K after correction.", timestamp: "30 min ago" },
  ],
  evidence: [
    { id: "ev1", title: "GL Export Q2 2026", type: "Ledger", timestamp: "2 days ago" },
    { id: "ev2", title: "Sub-Ledger Germany", type: "Sub-ledger", timestamp: "1 day ago" },
    { id: "ev3", title: "Reclassification Journal Entry", type: "Journal", timestamp: "30 min ago" },
  ],
};

export function CaseManagement() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", type: "", owner: "", priority: "medium" as CasePriority });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/finance/cases");
        if (res.ok) setCases((await res.json()).cases ?? []);
      } catch { /* defaults */ } finally { setLoading(false); }
    }
    load();
  }, []);

  const display = cases.length > 0 ? cases : defaultCases;

  const filtered = display.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateCase = () => {
    if (!formData.title || !formData.type || !formData.owner) return;
    const newCase: Case = {
      id: `C-${String(display.length + 1).padStart(3, "0")}`,
      title: formData.title,
      description: formData.description,
      status: "open",
      priority: formData.priority,
      type: formData.type,
      owner: formData.owner,
      participantCount: 1,
      evidenceCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCases((prev) => [newCase, ...prev]);
    setShowCreateForm(false);
    setFormData({ title: "", description: "", type: "", owner: "", priority: "medium" });
  };

  const statuses: (CaseStatus | "all")[] = ["all", "open", "in_progress", "awaiting_input", "escalated", "resolved", "closed"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Case Management</h1>
          <p className="text-sm text-white/60 mt-1">Track and manage finance collaboration cases</p>
        </div>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors">
          <Plus className="w-4 h-4" /> New Case
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20"
          />
          {searchQuery && (
            <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 cursor-pointer" onClick={() => setSearchQuery("")} />
          )}
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors capitalize ${statusFilter === s ? "bg-gold-500 text-black font-medium" : "text-white/50 hover:text-white"}`}
            >
              {s === "all" ? "All" : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {showCreateForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create New Case</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-white/60">Title</label>
              <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Case title" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Type</label>
              <input value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="e.g. Reconciliation, Risk Assessment" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Owner</label>
              <input value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} placeholder="Assignee name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as CasePriority })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/20">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/60">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Case description" rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20 resize-none" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={handleCreateCase} className="bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors">Create Case</button>
            <button onClick={() => setShowCreateForm(false)} className="bg-white/5 text-white/60 px-4 py-2 rounded-lg text-sm hover:text-white transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-colors ${selectedCase?.id === c.id ? "border-gold-500/50" : "border-white/10 hover:bg-white/10"}`}
              onClick={() => setSelectedCase({
                ...defaultDetail,
                id: c.id,
                title: c.title,
                description: c.description,
                status: c.status,
                priority: c.priority,
                type: c.type,
                owner: c.owner,
              })}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>{c.status.replace(/_/g, " ")}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityColors[c.priority]}`}>{c.priority.toUpperCase()}</span>
                    <span className="text-xs text-white/40">{c.type}</span>
                  </div>
                  <div className="text-sm font-medium text-white">{c.title}</div>
                  <div className="text-xs text-white/40 mt-1">Owner: {c.owner}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-white/40"><Users className="w-3 h-3 inline mr-1" />{c.participantCount}</span>
                    <span className="text-[10px] text-white/40"><FileText className="w-3 h-3 inline mr-1" />{c.evidenceCount} evidence</span>
                    <span className="text-[10px] text-white/40">{c.createdAt}</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-white/50 shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          {selectedCase ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[selectedCase.status]}`}>{selectedCase.status.replace(/_/g, " ")}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityColors[selectedCase.priority]}`}>{selectedCase.priority.toUpperCase()}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{selectedCase.title}</h3>
              <p className="text-xs text-white/50 mb-3">{selectedCase.description}</p>
              <div className="text-xs text-white/40 mb-3">Owner: {selectedCase.owner} | Type: {selectedCase.type}</div>

              <div className="mb-4">
                <div className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Participants</div>
                <div className="space-y-1">
                  {selectedCase.participants.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-white/80">{p.name}</span>
                      <span className="text-white/40">{p.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1"><MessageSquareText className="w-3 h-3" /> Comments</div>
                <div className="space-y-2">
                  {selectedCase.comments.map((c) => (
                    <div key={c.id} className="bg-white/5 rounded-lg p-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/80">{c.author}</span>
                        <span className="text-white/40">{c.timestamp}</span>
                      </div>
                      <div className="text-xs text-white/60 mt-1">{c.content}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1"><FileText className="w-3 h-3" /> Evidence</div>
                <div className="space-y-1">
                  {selectedCase.evidence.map((ev, i) => (
                    <div key={i} className="text-xs text-white/50 flex items-center gap-2">
                      <Eye className="w-3 h-3 text-gold-500" />
                      <span>{ev.title}</span>
                      <span className="text-white/40">({ev.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <FolderOpen className="w-12 h-12 text-white/40 mx-auto mb-2" />
              <p className="text-sm text-white/50">Select a case to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
