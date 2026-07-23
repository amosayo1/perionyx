"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, Plus, Search, Filter, ChevronRight, Clock, User, Shield,
  FileText, ExternalLink, CheckCircle,
} from "lucide-react";

interface Violation {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  status: "open" | "in_progress" | "remediated" | "accepted" | "closed";
  type: string;
  owner: string;
  dueDate: string;
  riskRating: number;
  evidenceCount: number;
  impacts: string[];
  remediationPlan: string;
}

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  informational: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const statusColors: Record<string, string> = {
  open: "bg-red-500/20 text-red-400 border-red-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  remediated: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  accepted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  closed: "bg-white/10 text-white/40 border-white/20",
};

export function ViolationWorkspace() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/compliance/violations");
        if (res.ok) {
          const data = await res.json();
          setViolations(data.violations ?? []);
        }
      } catch {
        // defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = violations.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Violation Workspace</h1>
          <p className="text-sm text-white/60 mt-1">Track and remediate compliance violations</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Violation
        </button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Report Violation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 block mb-1">Title</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Violation title" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Severity</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="informational">Informational</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Type</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Violation type" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Owner</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Assigned owner" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Due Date</label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 block mb-1">Description</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 h-20" placeholder="Description" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 block mb-1">Remediation Plan</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 h-20" placeholder="Remediation plan" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400">Save</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm hover:bg-white/10">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/30"
            placeholder="Search violations..."
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
          <div className="text-center py-12 text-white/40">No violations found</div>
        ) : (
          filtered.map((violation, i) => (
            <motion.div
              key={violation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedViolation(selectedViolation?.id === violation.id ? null : violation)}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-sm font-medium text-white">{violation.title}</div>
                    <div className="text-xs text-white/50 mt-0.5">{violation.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${severityColors[violation.severity]}`}>
                    {violation.severity.toUpperCase()}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[violation.status]}`}>
                    {violation.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-500 rounded-full" style={{ width: `${violation.riskRating}%` }} />
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/50" />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {violation.owner}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {violation.dueDate}</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {violation.type}</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Risk: {violation.riskRating}/100</span>
              </div>
              {selectedViolation?.id === violation.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-white/40 text-xs mb-1">Impacts</div>
                      <div className="space-y-1">
                        {violation.impacts.map((impact, j) => (
                          <div key={j} className="flex items-center gap-1 text-white text-xs">
                            <ExternalLink className="w-3 h-3 text-orange-400" /> {impact}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1">Remediation Plan</div>
                      <div className="text-white text-xs">{violation.remediationPlan}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
