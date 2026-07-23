"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  Clock,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";

interface Exception {
  id: string;
  exceptionType: string;
  severity: string;
  status: string;
  sourceSystem: string;
  description: string;
  amount: number;
  currency: string;
  varianceAmount: number | null;
  assignedTo: string | null;
  createdAt: string;
}

export function ExceptionWorkspace() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/reconciliation/exceptions")
      .then((r) => r.json())
      .then((data) => setExceptions(data.exceptions ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? exceptions
    : exceptions.filter((e) => e.severity === filter);

  const severityColors: Record<string, string> = {
    CRITICAL: "bg-red-500/10 text-red-400",
    HIGH: "bg-orange-500/10 text-orange-400",
    MEDIUM: "bg-amber-500/10 text-amber-400",
    LOW: "bg-blue-500/10 text-blue-400",
  };

  const statusColors: Record<string, string> = {
    OPEN: "bg-white/10 text-white/60",
    INVESTIGATING: "bg-blue-500/10 text-blue-400",
    RESOLVED: "bg-green-500/10 text-green-400",
    ESCALATED: "bg-red-500/10 text-red-400",
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-white/5" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Exception Workspace</h1>
          <p className="mt-1 text-sm text-white/60">
            {exceptions.length} exceptions across all cases
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              filter === f
                ? "bg-gold-500 text-black"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Exception List */}
      <div className="space-y-2">
        {filtered.map((exception, i) => (
          <motion.div
            key={exception.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-2 ${severityColors[exception.severity] ?? "bg-white/10"}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {exception.exceptionType.replace(/_/g, " ")}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-xs ${statusColors[exception.status] ?? "bg-white/10 text-white/60"}`}>
                    {exception.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-white/40 line-clamp-1">
                  {exception.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  ${exception.amount.toLocaleString()}
                </p>
                {exception.varianceAmount && exception.varianceAmount !== 0 && (
                  <p className="text-xs text-amber-400">
                    Variance: ${exception.varianceAmount.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">{exception.sourceSystem}</p>
                <p className="text-xs text-white/40">
                  {new Date(exception.createdAt).toLocaleDateString()}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-white/40" />
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm text-white/40">No exceptions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
