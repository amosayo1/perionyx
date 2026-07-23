"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, Clock, AlertTriangle, CheckCircle, XCircle, Calendar, ArrowRight, User,
} from "lucide-react";

type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";
type TaskPriority = "critical" | "high" | "medium" | "low";

interface Assignment {
  id: string;
  fromSpecialist: string;
  toSpecialist: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  caseTitle: string;
}

const statusColors: Record<TaskStatus, string> = {
  pending: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-amber-500/20 text-amber-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  overdue: "bg-red-500/20 text-red-400",
};

const priorityColors: Record<TaskPriority, string> = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-emerald-500/20 text-emerald-400",
};

const columns: { status: TaskStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "in_progress", label: "In Progress" },
  { status: "completed", label: "Completed" },
  { status: "overdue", label: "Overdue" },
];

const defaultAssignments: Assignment[] = [
  { id: "A1", fromSpecialist: "Carol Nguyen", toSpecialist: "Alice Chen", title: "Review Q2 ledger discrepancy evidence", description: "Analyze the GL vs sub-ledger variances for EMEA region", priority: "critical", status: "in_progress", dueDate: "2026-07-18", caseTitle: "Ledger Discrepancy EMEA" },
  { id: "A2", fromSpecialist: "System", toSpecialist: "Bob Martinez", title: "Complete counterparty risk assessment", description: "Finish the risk exposure analysis for ABC Corp", priority: "high", status: "pending", dueDate: "2026-07-20", caseTitle: "Counterparty Risk ABC" },
  { id: "A3", fromSpecialist: "Alice Chen", toSpecialist: "Diana Lopez", title: "Verify cash concentration numbers", description: "Confirm the EMEA bank balances from three sources", priority: "high", status: "pending", dueDate: "2026-07-19", caseTitle: "Cash Concentration Alert" },
  { id: "A4", fromSpecialist: "David Kim", toSpecialist: "Frank Okafor", title: "Prepare FX hedging proposal", description: "Draft the Q3 FX hedging strategy presentation", priority: "medium", status: "in_progress", dueDate: "2026-07-21", caseTitle: "FX Strategy Review" },
  { id: "A5", fromSpecialist: "Ella Johansson", toSpecialist: "Grace Liu", title: "Review vendor payment history", description: "Check the last 12 months of payment patterns for vendor #4401", priority: "medium", status: "completed", dueDate: "2026-07-16", caseTitle: "Vendor Payment Discrepancy" },
  { id: "A6", fromSpecialist: "System", toSpecialist: "Henry Schmidt", title: "Update credit limit model parameter", description: "Recalibrate the credit scoring model with latest data", priority: "low", status: "pending", dueDate: "2026-07-25", caseTitle: "Credit Limit Model Update" },
  { id: "A7", fromSpecialist: "Alice Chen", toSpecialist: "Bob Martinez", title: "Urgent: Review policy violation details", description: "Immediately assess the cash concentration limit breach", priority: "critical", status: "overdue", dueDate: "2026-07-15", caseTitle: "Cash Concentration Alert" },
  { id: "A8", fromSpecialist: "Carol Nguyen", toSpecialist: "David Kim", title: "Finalize Q3 hedging strategy", description: "Complete the FX hedging strategy for submission", priority: "high", status: "overdue", dueDate: "2026-07-14", caseTitle: "FX Strategy Review" },
  { id: "A9", fromSpecialist: "Frank Okafor", toSpecialist: "Grace Liu", title: "Resolve intercompany balance dispute", description: "Engage with US & Germany entities to resolve difference", priority: "high", status: "in_progress", dueDate: "2026-07-22", caseTitle: "Intercompany Balance Dispute" },
];

export function AssignmentBoard() {
  const [assignments, setAssignments] = useState<Assignment[]>(defaultAssignments);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", fromSpecialist: "", toSpecialist: "", caseTitle: "", priority: "medium" as TaskPriority, dueDate: "" });

  const grouped = columns.map((col) => ({
    ...col,
    items: assignments.filter((a) => a.status === col.status),
  }));

  const handleCreateAssignment = () => {
    if (!formData.title || !formData.toSpecialist || !formData.caseTitle) return;
    const newAssignment: Assignment = {
      id: `A${assignments.length + 1}`,
      fromSpecialist: formData.fromSpecialist || "System",
      toSpecialist: formData.toSpecialist,
      title: formData.title,
      description: formData.description || formData.title,
      priority: formData.priority,
      status: "pending",
      dueDate: formData.dueDate || "N/A",
      caseTitle: formData.caseTitle,
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    setShowCreateForm(false);
    setFormData({ title: "", description: "", fromSpecialist: "", toSpecialist: "", caseTitle: "", priority: "medium", dueDate: "" });
  };

  const moveStatus = (id: string, newStatus: TaskStatus) => {
    setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Assignment Board</h1>
          <p className="text-sm text-white/60 mt-1">Kanban-style task assignments for finance specialists</p>
        </div>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors">
          <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

      {showCreateForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-white/60">Title</label>
              <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Task title" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Assign To</label>
              <input value={formData.toSpecialist} onChange={(e) => setFormData({ ...formData, toSpecialist: e.target.value })} placeholder="Recipient name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Assign From</label>
              <input value={formData.fromSpecialist} onChange={(e) => setFormData({ ...formData, fromSpecialist: e.target.value })} placeholder="Your name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Case</label>
              <input value={formData.caseTitle} onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })} placeholder="Related case" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/20">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Due Date</label>
              <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/20" />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-white/60">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Task description" rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20 resize-none" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={handleCreateAssignment} className="bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors">Create Assignment</button>
            <button onClick={() => setShowCreateForm(false)} className="bg-white/5 text-white/60 px-4 py-2 rounded-lg text-sm hover:text-white transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {grouped.map((col) => (
          <div key={col.status}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">{col.label}</h2>
              <span className="text-xs text-white/40">{col.items.length}</span>
            </div>
            <div className="space-y-3">
              {col.items.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center gap-1 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityColors[a.priority]}`}>{a.priority.toUpperCase()}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[a.status]}`}>{a.status.replace(/_/g, " ")}</span>
                  </div>
                  <div className="text-sm font-medium text-white mb-1">{a.title}</div>
                  <div className="text-xs text-white/50 mb-2">{a.caseTitle}</div>
                  <div className="flex items-center text-xs text-white/40 mb-2">
                    <User className="w-3 h-3 mr-1" />
                    {a.fromSpecialist} <ArrowRight className="w-3 h-3 mx-1" /> {a.toSpecialist}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <Calendar className="w-3 h-3" />
                    {a.dueDate}
                  </div>
                  {col.status !== "completed" && (
                    <div className="flex items-center gap-1 mt-3 pt-2 border-t border-white/10">
                      {col.status === "pending" && <button onClick={() => moveStatus(a.id, "in_progress")} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Start</button>}
                      {col.status === "in_progress" && <button onClick={() => moveStatus(a.id, "completed")} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Complete</button>}
                      {(col.status === "pending" || col.status === "in_progress") && <span className="text-white/40 mx-2">|</span>}
                      {col.status === "overdue" && <button onClick={() => moveStatus(a.id, "in_progress")} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">Re-open</button>}
                      {col.status === "overdue" && <span className="text-white/40 mx-2">|</span>}
                      <button onClick={() => moveStatus(a.id, "pending")} className="text-xs text-white/40 hover:text-white transition-colors">Reset</button>
                    </div>
                  )}
                </motion.div>
              ))}
              {col.items.length === 0 && (
                <div className="text-sm text-white/50 py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                  No {col.label.toLowerCase()} items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
