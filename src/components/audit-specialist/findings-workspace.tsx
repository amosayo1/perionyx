"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Plus, X, Search, ChevronRight, FileText,
  DollarSign, Shield, Calendar, User,
} from "lucide-react";

interface Finding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  status: "open" | "in-progress" | "remediated" | "accepted" | "closed";
  type: string;
  owner: string;
  dueDate: string;
  discoveredDate: string;
  description: string;
  businessImpact: string;
  financialImpact: string;
  recommendation: string;
  evidence: string[];
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
  "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  remediated: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  accepted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  closed: "bg-white/10 text-white/40 border-white/20",
};

export function FindingsWorkspace() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newFinding, setNewFinding] = useState({ title: "", severity: "medium" as Finding["severity"], type: "", owner: "", dueDate: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/audit/findings");
        if (res.ok) {
          const data = await res.json();
          setFindings(data.findings ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = findings.filter(
    (f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) &&
      (filterSeverity === "all" || f.severity === filterSeverity) &&
      (filterStatus === "all" || f.status === filterStatus),
  );

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/audit/findings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFinding),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewFinding({ title: "", severity: "medium", type: "", owner: "", dueDate: "" });
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Findings Workspace</h1>
          <p className="text-sm text-white/60 mt-1">Track and manage audit findings to resolution</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Finding
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search findings..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50"
          />
        </div>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50">
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="informational">Informational</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50">
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="remediated">Remediated</option>
          <option value="accepted">Accepted</option>
          <option value="closed">Closed</option>
        </select>
        <div className="text-sm text-white/40">{filtered.length} findings</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-2">
          {filtered.length === 0 && !loading ? (
            <div className="text-sm text-white/40 py-8 text-center">No findings found</div>
          ) : (
            filtered.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedFinding(f)}
                className={`bg-white/5 border rounded-lg p-4 cursor-pointer transition-colors hover:bg-white/10 ${
                  selectedFinding?.id === f.id ? "border-gold-500/50" : "border-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <AlertTriangle className={`w-5 h-5 shrink-0 ${
                      f.severity === "critical" ? "text-red-400" :
                      f.severity === "high" ? "text-orange-400" :
                      f.severity === "medium" ? "text-yellow-400" :
                      f.severity === "low" ? "text-emerald-400" : "text-blue-400"
                    }`} />
                    <div className="min-w-0">
                      <div className="text-sm text-white font-medium truncate">{f.title}</div>
                      <div className="text-xs text-white/50 mt-0.5">{f.type} &middot; {f.owner} &middot; Due: {f.dueDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${severityColors[f.severity]}`}>{f.severity}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[f.status]}`}>{f.status}</span>
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="space-y-4">
          {selectedFinding ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{selectedFinding.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${severityColors[selectedFinding.severity]}`}>{selectedFinding.severity}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-white/50">Type:</span> <span className="text-white ml-1">{selectedFinding.type}</span></div>
                <div><span className="text-white/50">Owner:</span> <span className="text-white ml-1">{selectedFinding.owner}</span></div>
                <div><span className="text-white/50">Due:</span> <span className="text-white ml-1">{selectedFinding.dueDate}</span></div>
                <div><span className="text-white/50">Discovered:</span> <span className="text-white ml-1">{selectedFinding.discoveredDate}</span></div>
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">Description</div>
                <div className="text-sm text-white/80">{selectedFinding.description}</div>
              </div>
              {selectedFinding.businessImpact && (
                <div>
                  <div className="text-xs text-white/50 mb-1">Business Impact</div>
                  <div className="text-sm text-white/80">{selectedFinding.businessImpact}</div>
                </div>
              )}
              {selectedFinding.financialImpact && (
                <div className="flex items-center gap-2 p-3 bg-gold-500/10 border border-gold-500/20 rounded-lg">
                  <DollarSign className="w-4 h-4 text-gold-500" />
                  <div>
                    <div className="text-[10px] text-gold-500/70">Financial Impact</div>
                    <div className="text-sm text-gold-500 font-medium">{selectedFinding.financialImpact}</div>
                  </div>
                </div>
              )}
              {selectedFinding.recommendation && (
                <div>
                  <div className="text-xs text-white/50 mb-1">Recommendation</div>
                  <div className="text-sm text-white/80">{selectedFinding.recommendation}</div>
                </div>
              )}
              {selectedFinding.evidence.length > 0 && (
                <div>
                  <div className="text-xs text-white/50 mb-1">Evidence</div>
                  <div className="space-y-1">
                    {selectedFinding.evidence.map((e, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-white/60">
                        <FileText className="w-3 h-3" />
                        {e}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-sm text-white/40">
              Select a finding to view details
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a24] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">New Finding</h3>
                <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <input value={newFinding.title} onChange={(e) => setNewFinding({ ...newFinding, title: e.target.value })} placeholder="Finding title" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50" />
              <select value={newFinding.severity} onChange={(e) => setNewFinding({ ...newFinding, severity: e.target.value as Finding["severity"] })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="informational">Informational</option>
              </select>
              <input value={newFinding.type} onChange={(e) => setNewFinding({ ...newFinding, type: e.target.value })} placeholder="Type" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50" />
              <input value={newFinding.owner} onChange={(e) => setNewFinding({ ...newFinding, owner: e.target.value })} placeholder="Owner" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50" />
              <input type="date" value={newFinding.dueDate} onChange={(e) => setNewFinding({ ...newFinding, dueDate: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50" />
              <button onClick={handleCreate} className="w-full py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Create Finding</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
