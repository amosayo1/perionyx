"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ListTodo, AlertTriangle, Clock, CheckCircle, ChevronRight, User, ArrowRight, Filter, X, Search
} from "lucide-react";

type Priority = "critical" | "high" | "medium" | "low";
type ItemStatus = "pending" | "in_progress" | "completed" | "overdue";

interface QueueItem {
  id: string;
  queueName: string;
  type: string;
  title: string;
  priority: Priority;
  status: ItemStatus;
  assignee: string;
  caseTitle: string;
  dueDate: string;
}

interface Queue {
  name: string;
  type: string;
  itemCount: number;
  priorityItems: number;
  overdueItems: number;
}

const priorityColors: Record<Priority, string> = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-orange-500/20 text-orange-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-emerald-500/20 text-emerald-400",
};

const statusIcon: Record<ItemStatus, typeof Clock> = {
  pending: Clock,
  in_progress: AlertTriangle,
  completed: CheckCircle,
  overdue: AlertTriangle,
};

const defaultQueues: Queue[] = [
  { name: "Reconciliation Review", type: "Approval", itemCount: 12, priorityItems: 3, overdueItems: 1 },
  { name: "Risk Assessment Queue", type: "Evaluation", itemCount: 8, priorityItems: 2, overdueItems: 0 },
  { name: "Evidence Verification", type: "Audit", itemCount: 15, priorityItems: 5, overdueItems: 2 },
  { name: "Recommendation Review", type: "Approval", itemCount: 6, priorityItems: 1, overdueItems: 0 },
  { name: "Approval Workflow", type: "Approval", itemCount: 20, priorityItems: 7, overdueItems: 3 },
  { name: "Exception Handling", type: "Investigation", itemCount: 9, priorityItems: 4, overdueItems: 2 },
];

const defaultItems: QueueItem[] = [
  { id: "Q1", queueName: "Reconciliation Review", type: "Approval", title: "Approve Q2 GL reconciliation report", priority: "critical", status: "pending", assignee: "Alice Chen", caseTitle: "Q2 Ledger Close", dueDate: "2026-07-18" },
  { id: "Q2", queueName: "Risk Assessment Queue", type: "Evaluation", title: "Evaluate ABC Corp counterparty risk", priority: "high", status: "pending", assignee: "Bob Martinez", caseTitle: "Counterparty ABC Corp", dueDate: "2026-07-20" },
  { id: "Q3", queueName: "Evidence Verification", type: "Audit", title: "Verify sub-ledger evidence for Germany", priority: "high", status: "in_progress", assignee: "Carol Nguyen", caseTitle: "Ledger Discrepancy EMEA", dueDate: "2026-07-19" },
  { id: "Q4", queueName: "Recommendation Review", type: "Approval", title: "Approve EUR hedge ratio increase to 80%", priority: "high", status: "pending", assignee: "David Kim", caseTitle: "FX Strategy Review", dueDate: "2026-07-21" },
  { id: "Q5", queueName: "Approval Workflow", type: "Approval", title: "Approve wire transfer $450K to vendor 4401", priority: "medium", status: "pending", assignee: "Frank Okafor", caseTitle: "Vendor Payment", dueDate: "2026-07-22" },
  { id: "Q6", queueName: "Exception Handling", type: "Investigation", title: "Investigate cash concentration breach", priority: "critical", status: "overdue", assignee: "Diana Lopez", caseTitle: "Cash Concentration Alert", dueDate: "2026-07-15" },
  { id: "Q7", queueName: "Reconciliation Review", type: "Approval", title: "Review intercompany balance dispute", priority: "high", status: "pending", assignee: "Grace Liu", caseTitle: "Intercompany Dispute", dueDate: "2026-07-22" },
  { id: "Q8", queueName: "Evidence Verification", type: "Audit", title: "Verify policy compliance evidence", priority: "medium", status: "completed", assignee: "Henry Schmidt", caseTitle: "Compliance Review", dueDate: "2026-07-16" },
  { id: "Q9", queueName: "Approval Workflow", type: "Approval", title: "Approve credit limit increase for top customer", priority: "high", status: "pending", assignee: "Grace Liu", caseTitle: "Credit Limit Increase", dueDate: "2026-07-23" },
  { id: "Q10", queueName: "Reconciliation Review", type: "Approval", title: "Approve Q3 budget realignment", priority: "low", status: "pending", assignee: "Alice Chen", caseTitle: "Budget Realignment", dueDate: "2026-07-28" },
];

export function WorkQueue() {
  const [items, setItems] = useState<QueueItem[]>(defaultItems);
  const [search, setSearch] = useState("");
  const [queueFilter, setQueueFilter] = useState<string | null>(null);
  const [reassignTarget, setReassignTarget] = useState<Record<string, string>>({});

  const queues = defaultQueues;

  const filtered = items.filter((item) => {
    if (queueFilter && item.queueName !== queueFilter) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.caseTitle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const moveStatus = (id: string, newStatus: ItemStatus) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: newStatus } : i));
  };

  const reassign = (id: string) => {
    const target = reassignTarget[id];
    if (!target) return;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, assignee: target } : i));
    setReassignTarget((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Work Queue</h1>
          <p className="text-sm text-white/60 mt-1">Manage workflow queues and reassign items</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {queues.map((q, i) => (
          <motion.div
            key={q.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setQueueFilter(q.name === queueFilter ? null : q.name)}
          >
            <div className="text-lg font-bold text-white">{q.itemCount}</div>
            <div className="text-xs text-white/50 mt-1">{q.name}</div>
            <div className="flex items-center gap-2 mt-2 text-[10px]">
              {q.priorityItems > 0 && <span className="text-orange-400">{q.priorityItems} priority</span>}
              {q.overdueItems > 0 && <span className="text-red-400">{q.overdueItems} overdue</span>}
            </div>
            <div className="text-[10px] text-white/40 mt-1">{q.type}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search work items..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20" />
          {search && <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 cursor-pointer" onClick={() => setSearch("")} />}
        </div>
        {queueFilter && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <span className="text-sm text-white/60">Queue: </span>
            <span className="text-sm text-white font-medium">{queueFilter}</span>
            <X className="w-4 h-4 text-white/40 cursor-pointer" onClick={() => setQueueFilter(null)} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {filtered.map((item, i) => {
          const SIcon = statusIcon[item.status];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityColors[item.priority]}`}>{item.priority.toUpperCase()}</span>
                    <span className="text-xs text-white/40 flex items-center gap-1"><SIcon className="w-3 h-3" />{item.status.replace(/_/g, " ")}</span>
                  </div>
                  <div className="text-sm text-white font-medium">{item.title}</div>
                  <div className="text-xs text-white/50 mt-1">{item.caseTitle}</div>
                  <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                    <span><User className="w-3 h-3 inline mr-1" />{item.assignee}</span>
                    <span>{item.dueDate}</span>
                    <span>{item.queueName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "pending" && <button onClick={() => moveStatus(item.id, "in_progress")} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs hover:bg-blue-500/30 transition-colors">Start</button>}
                  {item.status === "in_progress" && <button onClick={() => moveStatus(item.id, "completed")} className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs hover:bg-emerald-500/30 transition-colors">Complete</button>}
                  {item.status === "overdue" && <button onClick={() => moveStatus(item.id, "in_progress")} className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs hover:bg-amber-500/30 transition-colors">Re-open</button>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                <span className="text-xs text-white/40">Reassign to:</span>
                <input
                  value={reassignTarget[item.id] || ""}
                  onChange={(e) => setReassignTarget({ ...reassignTarget, [item.id]: e.target.value })}
                  placeholder="Specialist name..."
                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white/80 placeholder:text-white/50 focus:outline-none focus:border-white/20 w-40"
                />
                <button onClick={() => reassign(item.id)} disabled={!reassignTarget[item.id]} className="text-xs bg-gold-500 text-black px-2 py-1 rounded font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <ArrowRight className="w-3 h-3 inline mr-1" />Reassign
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
