"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wrench, Plus, Search, ChevronRight, AlertTriangle, Clock,
  CheckCircle, TrendingUp, XCircle, ArrowUpRight,
} from "lucide-react";

interface RemediationTask {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done" | "blocked";
  assignee: string;
  dueDate: string;
}

interface RemediationPlan {
  id: string;
  title: string;
  status: "not-started" | "in-progress" | "completed" | "overdue" | "escalated";
  progress: number;
  owner: string;
  targetDate: string;
  findingRef: string;
  tasks: RemediationTask[];
  escalated: boolean;
}

interface VelocityMetric {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
}

const statusColors: Record<string, string> = {
  "not-started": "bg-white/10 text-white/60 border-white/20",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  escalated: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const taskStatusColors: Record<string, string> = {
  todo: "bg-white/10 text-white/50",
  "in-progress": "bg-blue-500/20 text-blue-400",
  done: "bg-emerald-500/20 text-emerald-400",
  blocked: "bg-red-500/20 text-red-400",
};

export function RemediationCenter() {
  const [plans, setPlans] = useState<RemediationPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<RemediationPlan | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/audit/remediation");
        if (res.ok) {
          const data = await res.json();
          setPlans(data.plans ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = plans.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase()) ||
      p.findingRef.toLowerCase().includes(search.toLowerCase()),
  );

  const velocityMetrics: VelocityMetric[] = [
    { label: "Avg Resolution Time", value: "12 days", trend: "down" },
    { label: "On-Time Rate", value: "87%", trend: "up" },
    { label: "Open This Month", value: "9", trend: "flat" },
    { label: "Completed This Month", value: "14", trend: "up" },
  ];

  const handleEscalate = async (id: string) => {
    try {
      await fetch(`/api/audit/remediation/${id}/escalate`, { method: "POST" });
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, status: "escalated" as const, escalated: true } : p)));
    } catch {
      // silently fail
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Remediation Center</h1>
          <p className="text-sm text-white/60 mt-1">Track remediation plans and measure resolution velocity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {velocityMetrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="text-xs text-white/50 mb-1">{m.label}</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{m.value}</span>
              {m.trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-400" />}
              {m.trend === "down" && <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search remediation plans..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50"
          />
        </div>
        <div className="text-sm text-white/40">{filtered.length} plans</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-2">
          {filtered.length === 0 && !loading ? (
            <div className="text-sm text-white/40 py-8 text-center">No remediation plans found</div>
          ) : (
            filtered.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedPlan(plan)}
                className={`bg-white/5 border rounded-lg p-4 cursor-pointer transition-colors hover:bg-white/10 ${
                  selectedPlan?.id === plan.id ? "border-gold-500/50" : "border-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Wrench className="w-5 h-5 text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-white font-medium truncate">{plan.title}</div>
                      <div className="text-xs text-white/50 mt-0.5">{plan.owner} &middot; Target: {plan.targetDate} &middot; Ref: {plan.findingRef}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-500 rounded-full transition-all" style={{ width: `${plan.progress}%` }} />
                      </div>
                      <div className="text-[10px] text-white/40 text-right mt-0.5">{plan.progress}%</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[plan.status]}`}>{plan.status}</span>
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="space-y-4">
          {selectedPlan ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{selectedPlan.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[selectedPlan.status]}`}>{selectedPlan.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-white/50">Owner:</span> <span className="text-white ml-1">{selectedPlan.owner}</span></div>
                <div><span className="text-white/50">Target:</span> <span className="text-white ml-1">{selectedPlan.targetDate}</span></div>
                <div><span className="text-white/50">Ref:</span> <span className="text-white ml-1">{selectedPlan.findingRef}</span></div>
                <div><span className="text-white/50">Progress:</span> <span className="text-white ml-1">{selectedPlan.progress}%</span></div>
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">Progress</div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-500 rounded-full transition-all" style={{ width: `${selectedPlan.progress}%` }} />
                </div>
              </div>
              {!selectedPlan.escalated && selectedPlan.status !== "completed" && (
                <button
                  onClick={() => handleEscalate(selectedPlan.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-sm hover:bg-orange-500/30 transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Escalate
                </button>
              )}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Tasks ({selectedPlan.tasks.length})</h4>
                <div className="space-y-2">
                  {selectedPlan.tasks.map((task) => (
                    <div key={task.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white">{task.title}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${taskStatusColors[task.status]}`}>{task.status}</span>
                      </div>
                      <div className="text-[10px] text-white/40 mt-1">{task.assignee} &middot; {task.dueDate}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-sm text-white/40">
              Select a plan to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
