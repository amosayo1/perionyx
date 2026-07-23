"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Timer, Plus, CheckCircle2, XCircle, Clock, AlertTriangle,
  TrendingUp, ChevronRight, Building2, Calendar, Loader2,
} from "lucide-react";

interface ClosePeriod {
  id: string;
  name: string;
  entity: string;
  period: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
  progress: number;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  estimatedCompletion: string;
  forecastScenario: "on_track" | "at_risk" | "delayed";
  departmentCompletions: { department: string; completion: number }[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  NOT_STARTED: { label: "Not Started", color: "text-white/50", bg: "bg-white/10" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/10" },
  COMPLETED: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  DELAYED: { label: "Delayed", color: "text-red-400", bg: "bg-red-500/10" },
};

const forecastColors: Record<string, string> = {
  on_track: "text-emerald-400",
  at_risk: "text-amber-400",
  delayed: "text-red-400",
};

export function CloseCommandCenter() {
  const [periods, setPeriods] = useState<ClosePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/controller/close/periods");
        if (res.ok) {
          const data = await res.json();
          setPeriods(data.periods ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const displayPeriods = periods.length > 0 ? periods : [
    {
      id: "1", name: "December 2025 Month-End", entity: "Consolidated", period: "Dec 2025",
      status: "IN_PROGRESS", progress: 68, totalTasks: 45, completedTasks: 31,
      blockedTasks: 2, overdueTasks: 1, estimatedCompletion: "2026-01-08",
      forecastScenario: "on_track" as const,
      departmentCompletions: [
        { department: "Treasury", completion: 90 },
        { department: "AP", completion: 75 },
        { department: "AR", completion: 60 },
        { department: "Tax", completion: 50 },
      ],
    },
    {
      id: "2", name: "Q4 2025 Quarter-End", entity: "Consolidated", period: "Q4 2025",
      status: "NOT_STARTED", progress: 0, totalTasks: 82, completedTasks: 0,
      blockedTasks: 0, overdueTasks: 0, estimatedCompletion: "2026-01-15",
      forecastScenario: "on_track" as const,
      departmentCompletions: [],
    },
    {
      id: "3", name: "November 2025 Month-End", entity: "Subsidiary US", period: "Nov 2025",
      status: "DELAYED", progress: 85, totalTasks: 38, completedTasks: 32,
      blockedTasks: 3, overdueTasks: 3, estimatedCompletion: "2025-12-12",
      forecastScenario: "delayed" as const,
      departmentCompletions: [
        { department: "Treasury", completion: 100 },
        { department: "AP", completion: 100 },
        { department: "AR", completion: 80 },
        { department: "Tax", completion: 60 },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Close Command Center</h1>
          <p className="text-sm text-white/60 mt-1">Manage and monitor financial close periods</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Close Period
        </button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Create Close Period</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/50 block mb-1">Period Name</label>
              <input
                type="text"
                placeholder="e.g. January 2026 Month-End"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Entity</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500">
                <option value="consolidated">Consolidated</option>
                <option value="us">Subsidiary US</option>
                <option value="uk">Subsidiary UK</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Period</label>
              <input
                type="month"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button className="bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">
              Create Period
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {displayPeriods.map((period, i) => {
          const st = statusConfig[period.status];
          return (
            <motion.div
              key={period.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center">
                    <Timer className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{period.name}</div>
                    <div className="text-xs text-white/50 flex items-center gap-2 mt-0.5">
                      <Building2 className="w-3 h-3" />
                      {period.entity}
                      <span className="text-white/50">·</span>
                      <Calendar className="w-3 h-3" />
                      {period.period}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>
                    {st.label}
                  </span>
                  <span className={`text-xs font-medium ${forecastColors[period.forecastScenario]}`}>
                    {period.forecastScenario === "on_track" ? "On Track" : period.forecastScenario === "at_risk" ? "At Risk" : "Delayed"}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white/50">Progress</span>
                  <span className="text-xs text-white font-medium">{period.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gold-500 transition-all"
                    style={{ width: `${period.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-white">{period.totalTasks}</div>
                  <div className="text-[10px] text-white/50">Total Tasks</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-emerald-400">{period.completedTasks}</div>
                  <div className="text-[10px] text-white/50">Completed</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-amber-400">{period.totalTasks - period.completedTasks - period.blockedTasks - period.overdueTasks}</div>
                  <div className="text-[10px] text-white/50">In Progress</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-red-400">{period.blockedTasks}</div>
                  <div className="text-[10px] text-white/50">Blocked</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-orange-400">{period.overdueTasks}</div>
                  <div className="text-[10px] text-white/50">Overdue</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-white/50 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Est. completion: {period.estimatedCompletion}
                </div>
                {period.departmentCompletions.length > 0 && (
                  <div className="flex items-center gap-2">
                    {period.departmentCompletions.map((d) => (
                      <div key={d.department} className="text-center">
                        <div className="text-[10px] text-white/40">{d.department}</div>
                        <div className="text-xs text-white font-medium">{d.completion}%</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
