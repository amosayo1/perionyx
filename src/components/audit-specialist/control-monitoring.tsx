"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Plus, X, Search, ChevronRight, CheckCircle, XCircle,
  Clock, User, Shield,
} from "lucide-react";

interface Control {
  id: string;
  name: string;
  type: "preventive" | "detective" | "corrective" | "compensating";
  category: string;
  frequency: string;
  owner: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  effectivenessScore: number;
  lastTested: string;
  status: "effective" | "ineffective" | "not-tested" | "partially-effective";
}

interface TestRecord {
  id: string;
  date: string;
  tester: string;
  result: "pass" | "fail" | "partial";
  notes: string;
}

const typeColors: Record<string, string> = {
  preventive: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  detective: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  corrective: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  compensating: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const riskColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const statusIcons: Record<string, typeof CheckCircle> = {
  effective: CheckCircle,
  ineffective: XCircle,
  "not-tested": Clock,
  "partially-effective": Shield,
};

const mockTestHistory: TestRecord[] = [
  { id: "t1", date: "2026-07-10", tester: "Sarah Chen", result: "pass", notes: "All criteria met" },
  { id: "t2", date: "2026-06-15", tester: "James Wilson", result: "pass", notes: "Operating as designed" },
  { id: "t3", date: "2026-05-12", tester: "Sarah Chen", result: "fail", notes: "Exception found in approval workflow" },
  { id: "t4", date: "2026-04-08", tester: "James Wilson", result: "pass", notes: "No exceptions" },
];

export function ControlMonitoring() {
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newControl, setNewControl] = useState({ name: "", type: "preventive" as Control["type"], category: "", frequency: "quarterly", owner: "", riskLevel: "medium" as Control["riskLevel"] });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/audit/controls");
        if (res.ok) {
          const data = await res.json();
          setControls(data.controls ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = controls.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/audit/controls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newControl),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewControl({ name: "", type: "preventive", category: "", frequency: "quarterly", owner: "", riskLevel: "medium" });
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Control Monitoring</h1>
          <p className="text-sm text-white/60 mt-1">Track and test internal controls across the organization</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Control
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search controls..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50"
          />
        </div>
        <div className="text-sm text-white/40">{filtered.length} controls</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-2">
          {filtered.length === 0 && !loading ? (
            <div className="text-sm text-white/40 py-8 text-center">No controls found</div>
          ) : (
            filtered.map((control, i) => {
              const StatusIcon = statusIcons[control.status];
              return (
                <motion.div
                  key={control.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedControl(control)}
                  className={`bg-white/5 border rounded-lg p-4 cursor-pointer transition-colors hover:bg-white/10 ${
                    selectedControl?.id === control.id ? "border-gold-500/50" : "border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusIcon className={`w-5 h-5 shrink-0 ${
                        control.status === "effective" ? "text-emerald-400" :
                        control.status === "ineffective" ? "text-red-400" :
                        control.status === "not-tested" ? "text-white/40" : "text-yellow-400"
                      }`} />
                      <div className="min-w-0">
                        <div className="text-sm text-white font-medium truncate">{control.name}</div>
                        <div className="text-xs text-white/50 mt-0.5">{control.category} &middot; {control.frequency} &middot; {control.owner}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[control.type]}`}>{control.type}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskColors[control.riskLevel]}`}>{control.riskLevel}</span>
                      <div className="text-right w-12">
                        <div className="text-xs text-white/50">Score</div>
                        <div className={`text-sm font-bold ${control.effectivenessScore >= 80 ? "text-emerald-400" : control.effectivenessScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                          {control.effectivenessScore}%
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="space-y-4">
          {selectedControl ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{selectedControl.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[selectedControl.type]}`}>{selectedControl.type}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-white/50">Category:</span> <span className="text-white ml-1">{selectedControl.category}</span></div>
                <div><span className="text-white/50">Frequency:</span> <span className="text-white ml-1">{selectedControl.frequency}</span></div>
                <div><span className="text-white/50">Owner:</span> <span className="text-white ml-1">{selectedControl.owner}</span></div>
                <div><span className="text-white/50">Last Tested:</span> <span className="text-white ml-1">{selectedControl.lastTested}</span></div>
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">Effectiveness</div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    selectedControl.effectivenessScore >= 80 ? "bg-emerald-400" : selectedControl.effectivenessScore >= 60 ? "bg-yellow-400" : "bg-red-400"
                  }`} style={{ width: `${selectedControl.effectivenessScore}%` }} />
                </div>
                <div className="text-right text-xs text-white/50 mt-1">{selectedControl.effectivenessScore}%</div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Test History</h4>
                <div className="space-y-2">
                  {mockTestHistory.map((t) => (
                    <div key={t.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white">{t.date}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          t.result === "pass" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                          t.result === "fail" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                          "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}>{t.result}</span>
                      </div>
                      <div className="text-xs text-white/50 mt-1">{t.tester} &middot; {t.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-sm text-white/40">
              Select a control to view details
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
                <h3 className="text-lg font-semibold text-white">New Control</h3>
                <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <input value={newControl.name} onChange={(e) => setNewControl({ ...newControl, name: e.target.value })} placeholder="Control name" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50" />
              <select value={newControl.type} onChange={(e) => setNewControl({ ...newControl, type: e.target.value as Control["type"] })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50">
                <option value="preventive">Preventive</option>
                <option value="detective">Detective</option>
                <option value="corrective">Corrective</option>
                <option value="compensating">Compensating</option>
              </select>
              <input value={newControl.category} onChange={(e) => setNewControl({ ...newControl, category: e.target.value })} placeholder="Category" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50" />
              <select value={newControl.frequency} onChange={(e) => setNewControl({ ...newControl, frequency: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50">
                <option value="continuous">Continuous</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
              <input value={newControl.owner} onChange={(e) => setNewControl({ ...newControl, owner: e.target.value })} placeholder="Owner" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50" />
              <select value={newControl.riskLevel} onChange={(e) => setNewControl({ ...newControl, riskLevel: e.target.value as Control["riskLevel"] })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button onClick={handleCreate} className="w-full py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Create Control</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
