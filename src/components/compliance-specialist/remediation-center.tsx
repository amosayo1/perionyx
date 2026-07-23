"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wrench, Search, Filter, ChevronRight, Clock, User, AlertTriangle,
  CheckCircle, ArrowUpRight, FileText,
} from "lucide-react";

interface Remediation {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "completed" | "overdue" | "escalated";
  progress: number;
  owner: string;
  targetDate: string;
  violationId: string;
  priority: "critical" | "high" | "medium" | "low";
}

const statusColors: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  escalated: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function RemediationCenter() {
  const [items, setItems] = useState<Remediation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/compliance/remediation");
        if (res.ok) {
          const data = await res.json();
          setItems(data.remediations ?? []);
        }
      } catch {
        // defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = items.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.owner.toLowerCase().includes(search.toLowerCase())
  );

  const handleEscalate = async (id: string) => {
    try {
      await fetch(`/api/compliance/remediation/${id}/escalate`, { method: "POST" });
      setItems((prev) => prev.map((r) => r.id === id ? { ...r, status: "escalated" as const } : r));
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Remediation Center</h1>
          <p className="text-sm text-white/60 mt-1">Track and manage compliance remediation efforts</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/30"
            placeholder="Search remediations..."
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse h-20" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-white/40">No remediation items found</div>
        ) : (
          filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-rose-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="text-xs text-white/50 mt-0.5">{item.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityColors[item.priority]}`}>
                    {item.priority.toUpperCase()}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[item.status]}`}>
                    {item.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <div className="w-16">
                    <div className="flex justify-between text-[10px] text-white/40 mb-0.5">
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.progress >= 100 ? "bg-emerald-500" : item.progress >= 50 ? "bg-gold-500" : "bg-orange-500"
                        }`}
                        style={{ width: `${Math.min(item.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  {item.status !== "completed" && item.status !== "escalated" && (
                    <button
                      onClick={() => handleEscalate(item.id)}
                      className="p-1.5 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition-colors"
                      title="Escalate"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-orange-400" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.owner}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Target: {item.targetDate}</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Violation: {item.violationId}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
