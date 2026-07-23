"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, Plus, Search, Filter, ChevronRight, Clock, User, AlertTriangle,
  CheckCircle, Paperclip, Link2,
} from "lucide-react";

interface Obligation {
  id: string;
  name: string;
  description: string;
  type: "regulatory" | "contractual" | "internal" | "industry";
  status: "pending" | "in_progress" | "completed" | "overdue" | "waived";
  owner: string;
  dueDate: string;
  evidenceCount: number;
  dependencies: string[];
}

const statusColors: Record<string, string> = {
  pending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  waived: "bg-white/10 text-white/40 border-white/20",
};

const typeColors: Record<string, string> = {
  regulatory: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  contractual: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  internal: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  industry: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function ObligationCenter() {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/compliance/obligations");
        if (res.ok) {
          const data = await res.json();
          setObligations(data.obligations ?? []);
        }
      } catch {
        // defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = obligations.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.type.toLowerCase().includes(search.toLowerCase())
  );

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Obligation Center</h1>
          <p className="text-sm text-white/60 mt-1">Track and manage compliance obligations</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Obligation
        </button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Create Obligation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 block mb-1">Name</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Obligation name" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Type</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="regulatory">Regulatory</option>
                <option value="contractual">Contractual</option>
                <option value="internal">Internal</option>
                <option value="industry">Industry</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 block mb-1">Description</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 h-20" placeholder="Obligation description" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Owner</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Owner" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Due Date</label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
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
            placeholder="Search obligations..."
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
          <div className="text-center py-12 text-white/40">No obligations found</div>
        ) : (
          filtered.map((obligation, i) => {
            const overdue = obligation.status === "overdue" || isOverdue(obligation.dueDate);
            return (
              <motion.div
                key={obligation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white/5 border rounded-xl p-4 hover:bg-white/8 transition-colors cursor-pointer ${overdue ? "border-red-500/30" : "border-white/10"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ClipboardList className={`w-5 h-5 ${overdue ? "text-red-400" : "text-emerald-400"}`} />
                    <div>
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        {obligation.name}
                        {overdue && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                      </div>
                      <div className="text-xs text-white/50 mt-0.5">{obligation.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[obligation.type]}`}>
                      {obligation.type.toUpperCase()}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[obligation.status]}`}>
                      {obligation.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {obligation.owner}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {obligation.dueDate}</span>
                  <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" /> {obligation.evidenceCount} evidence</span>
                  {obligation.dependencies.length > 0 && (
                    <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> {obligation.dependencies.length} dependencies</span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
