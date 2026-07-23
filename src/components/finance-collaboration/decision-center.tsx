"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Scale, ThumbsUp, ThumbsDown, Plus, Users, Target, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, ArrowLeftRight, FileText, Clock, Activity, Eye
} from "lucide-react";

type DecisionStatus = "proposed" | "reviewing" | "approved" | "rejected" | "implemented" | "overturned";
type DecisionType = "hedging" | "investment" | "credit" | "policy" | "payment" | "risk" | "strategy" | "compliance";

interface Decision {
  id: string;
  type: DecisionType;
  title: string;
  description: string;
  status: DecisionStatus;
  approvals: number;
  rejections: number;
  alternatives: string[];
  impact: string;
  proposedBy: string;
  caseTitle: string;
  createdAt: string;
  approvers: { name: string; verdict: "approved" | "rejected"; timestamp: string }[];
}

const typeColors: Record<DecisionType, string> = {
  hedging: "bg-blue-500/20 text-blue-400",
  investment: "bg-purple-500/20 text-purple-400",
  credit: "bg-emerald-500/20 text-emerald-400",
  policy: "bg-amber-500/20 text-amber-400",
  payment: "bg-rose-500/20 text-rose-400",
  risk: "bg-orange-500/20 text-orange-400",
  strategy: "bg-indigo-500/20 text-indigo-400",
  compliance: "bg-cyan-500/20 text-cyan-400",
};

const statusColors: Record<DecisionStatus, string> = {
  proposed: "bg-blue-500/20 text-blue-400",
  reviewing: "bg-amber-500/20 text-amber-400",
  approved: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
  implemented: "bg-gold-500/20 text-gold-400",
  overturned: "bg-purple-500/20 text-purple-400",
};

const defaultDecisions: Decision[] = [
  {
    id: "D1", type: "hedging", title: "Approve GBP forward contract for $25M position",
    description: "Executive GBP/USD forward contract to hedge unhedged GBP position ahead of BOE decision.",
    status: "reviewing", approvals: 2, rejections: 0,
    alternatives: ["Wait for BOE decision then hedge", "Use options instead of forwards", "Partial hedge of $15M only"],
    impact: "Reduces GBP downside risk by up to $1.2M", proposedBy: "David Kim",
    caseTitle: "FX Strategy Review", createdAt: "2026-07-17",
    approvers: [
      { name: "Alice Chen", verdict: "approved", timestamp: "2 hours ago" },
      { name: "Bob Martinez", verdict: "approved", timestamp: "30 min ago" },
    ],
  },
  {
    id: "D2", type: "risk", title: "Increase EUR hedge ratio from 70% to 80%",
    description: "Policy compliance action to bring EUR hedge ratio within policy targets.",
    status: "approved", approvals: 3, rejections: 0,
    alternatives: ["Maintain current ratio and accept penalty", "Phase increase over 90 days"],
    impact: "Reduces EUR exposure risk by $37M", proposedBy: "Policy Engine",
    caseTitle: "Policy Compliance Review", createdAt: "2026-07-16",
    approvers: [
      { name: "Carol Nguyen", verdict: "approved", timestamp: "1 day ago" },
      { name: "David Kim", verdict: "approved", timestamp: "1 day ago" },
      { name: "Alice Chen", verdict: "approved", timestamp: "12 hours ago" },
    ],
  },
  {
    id: "D3", type: "credit", title: "Increase customer credit limit by 30%",
    description: "Top customer requesting increase from $10M to $13M based on strong payment history.",
    status: "proposed", approvals: 0, rejections: 0,
    alternatives: ["Increase by 15% only", "Maintain current limit", "Increase limit with additional collateral"],
    impact: "Enables $3M additional revenue opportunity", proposedBy: "Grace Liu",
    caseTitle: "Credit Limit Increase", createdAt: "2026-07-16",
    approvers: [],
  },
  {
    id: "D4", type: "payment", title: "Approve wire transfer $450K to vendor #4401",
    description: "Payment for Q2 services rendered. Flagged for manual review due to amount threshold.",
    status: "approved", approvals: 2, rejections: 0,
    alternatives: ["Split payment into two smaller transfers", "Delay payment to next cycle"],
    impact: "Clears outstanding accounts payable", proposedBy: "Ella Johansson",
    caseTitle: "Vendor Payment", createdAt: "2026-07-15",
    approvers: [
      { name: "Frank Okafor", verdict: "approved", timestamp: "1 day ago" },
      { name: "Alice Chen", verdict: "approved", timestamp: "1 day ago" },
    ],
  },
  {
    id: "D5", type: "policy", title: "Update cash concentration limit to $550M",
    description: "Proposal to increase concentration limit due to organic cash growth in primary accounts.",
    status: "rejected", approvals: 0, rejections: 2,
    alternatives: ["Maintain $500M limit and diversify", "Increase to $525M instead"],
    impact: "Reduces operational burden of frequent diversifications", proposedBy: "Treasury Team",
    caseTitle: "Cash Concentration Alert", createdAt: "2026-07-14",
    approvers: [
      { name: "Carol Nguyen", verdict: "rejected", timestamp: "3 days ago" },
      { name: "Risk Committee", verdict: "rejected", timestamp: "2 days ago" },
    ],
  },
  {
    id: "D6", type: "strategy", title: "Adopt quarterly FX rebalancing cycle",
    description: "Move from annual to quarterly rebalancing to improve hedge effectiveness.",
    status: "implemented", approvals: 3, rejections: 1,
    alternatives: ["Semi-annual rebalancing", "Monthly rebalancing with automated triggers"],
    impact: "Reduces hedge ratio drift by 60%", proposedBy: "David Kim",
    caseTitle: "FX Strategy Review", createdAt: "2026-07-13",
    approvers: [
      { name: "Alice Chen", verdict: "approved", timestamp: "5 days ago" },
      { name: "Carol Nguyen", verdict: "rejected", timestamp: "4 days ago" },
      { name: "CFO", verdict: "approved", timestamp: "3 days ago" },
      { name: "Risk Committee", verdict: "approved", timestamp: "2 days ago" },
    ],
  },
];

export function DecisionCenter() {
  const [decisions, setDecisions] = useState<Decision[]>(defaultDecisions);
  const [filter, setFilter] = useState<DecisionStatus | "all">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", type: "strategy" as DecisionType, proposedBy: "", caseTitle: "", impact: "" });

  const statuses: (DecisionStatus | "all")[] = ["all", "proposed", "reviewing", "approved", "rejected", "implemented", "overturned"];

  const filtered = decisions.filter((d) => filter === "all" || d.status === filter);

  const handleCreate = () => {
    if (!formData.title || !formData.proposedBy) return;
    const newDecision: Decision = {
      id: `D${decisions.length + 1}`,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      status: "proposed",
      approvals: 0,
      rejections: 0,
      alternatives: [],
      impact: formData.impact || "TBD",
      proposedBy: formData.proposedBy,
      caseTitle: formData.caseTitle,
      createdAt: new Date().toISOString().split("T")[0],
      approvers: [],
    };
    setDecisions((prev) => [newDecision, ...prev]);
    setShowCreateForm(false);
    setFormData({ title: "", description: "", type: "strategy", proposedBy: "", caseTitle: "", impact: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Decision Center</h1>
          <p className="text-sm text-white/60 mt-1">Track approvals, rejections, and implemented decisions</p>
        </div>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors">
          <Plus className="w-4 h-4" /> New Decision
        </button>
      </div>

      <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit overflow-x-auto">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors capitalize whitespace-nowrap ${filter === s ? "bg-gold-500 text-black font-medium" : "text-white/50 hover:text-white"}`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {showCreateForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create Decision</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-white/60">Title</label>
              <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Decision title" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as DecisionType })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/20">
                <option value="hedging">Hedging</option>
                <option value="investment">Investment</option>
                <option value="credit">Credit</option>
                <option value="policy">Policy</option>
                <option value="payment">Payment</option>
                <option value="risk">Risk</option>
                <option value="strategy">Strategy</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Proposed By</label>
              <input value={formData.proposedBy} onChange={(e) => setFormData({ ...formData, proposedBy: e.target.value })} placeholder="Your name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Case</label>
              <input value={formData.caseTitle} onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })} placeholder="Related case" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Expected Impact</label>
              <input value={formData.impact} onChange={(e) => setFormData({ ...formData, impact: e.target.value })} placeholder="e.g. Reduces risk by $X" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/60">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Decision description" rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20 resize-none" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={handleCreate} className="bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors">Create Decision</button>
            <button onClick={() => setShowCreateForm(false)} className="bg-white/5 text-white/60 px-4 py-2 rounded-lg text-sm hover:text-white transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {filtered.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeColors[d.type]}`}>{d.type}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[d.status]}`}>{d.status}</span>
                </div>
                <div className="text-sm font-semibold text-white">{d.title}</div>
                <div className="text-xs text-white/50 mt-1">{d.description}</div>
                <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                  <span>Proposed by: {d.proposedBy}</span>
                  <span>{d.caseTitle}</span>
                  <span>{d.createdAt}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-emerald-400 text-sm"><ThumbsUp className="w-3 h-3" />{d.approvals}</span>
                  <span className="flex items-center gap-1 text-red-400 text-sm"><ThumbsDown className="w-3 h-3" />{d.rejections}</span>
                </div>
                <div className="text-xs text-white/40 mt-1">Impact: {d.impact}</div>
              </div>
            </div>

            {d.alternatives.length > 0 && (
              <div className="bg-white/5 rounded-lg p-3 mb-3">
                <div className="text-xs font-medium text-white/60 mb-2">Alternatives Considered</div>
                <div className="flex flex-wrap gap-2">
                  {d.alternatives.map((alt, j) => (
                    <span key={j} className="text-[10px] text-white/50 bg-white/5 px-2 py-1 rounded">{alt}</span>
                  ))}
                </div>
              </div>
            )}

            {d.approvers.length > 0 && (
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs font-medium text-white/60 mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Approval Chain</div>
                <div className="space-y-1">
                  {d.approvers.map((a, j) => (
                    <div key={j} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {a.verdict === "approved" ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                        <span className="text-white/80">{a.name}</span>
                      </div>
                      <span className="text-white/40">{a.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
