"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Scale, Plus, X, CheckCircle, AlertTriangle, Clock, Vote, Users,
} from "lucide-react";

interface Resolution {
  id: string;
  title: string;
  type: "ordinary" | "special" | "circular";
  status: "draft" | "proposed" | "voting" | "passed" | "failed" | "withdrawn";
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  proposedBy: string;
  meetingDate: string;
  description: string;
}

export function ResolutionCenter() {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newRes, setNewRes] = useState({ title: "", type: "ordinary" as Resolution["type"], description: "", proposedBy: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/board/resolutions").then((r) => (r.ok ? r.json() : null));
        if (res) setResolutions(res.resolutions ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultResolutions: Resolution[] = [
    { id: "1", title: "Approve FY26 Annual Budget", type: "ordinary", status: "voting", votesFor: 8, votesAgainst: 1, abstentions: 2, proposedBy: "CFO", meetingDate: "2026-07-25", description: "Resolution to approve the annual operating and capital budget for fiscal year 2026." },
    { id: "2", title: "Ratify Audit Committee Charter Amendment", type: "special", status: "proposed", votesFor: 0, votesAgainst: 0, abstentions: 0, proposedBy: "Audit Chair", meetingDate: "2026-07-25", description: "Amendment to expand Audit Committee oversight to include cybersecurity governance." },
    { id: "3", title: "Approve Executive Compensation Package", type: "ordinary", status: "passed", votesFor: 10, votesAgainst: 0, abstentions: 1, proposedBy: "Compensation Chair", meetingDate: "2026-06-15", description: "Annual executive compensation review and approval." },
    { id: "4", title: "Authorize Share Buyback Program", type: "special", status: "passed", votesFor: 9, votesAgainst: 2, abstentions: 0, proposedBy: "CEO", meetingDate: "2026-05-20", description: "Authorization of $50M share repurchase program over 12 months." },
    { id: "5", title: "Approve New Data Center Investment", type: "ordinary", status: "failed", votesFor: 5, votesAgainst: 4, abstentions: 2, proposedBy: "CTO", meetingDate: "2026-04-20", description: "Capital expenditure approval for $12M data center expansion." },
  ];

  const displayResolutions = resolutions.length > 0 ? resolutions : defaultResolutions;

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/board/resolutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRes),
      });
      if (res.ok) {
        const created = await res.json();
        setResolutions((prev) => [...prev, created]);
        setShowCreate(false);
        setNewRes({ title: "", type: "ordinary", description: "", proposedBy: "" });
      }
    } catch {
      // handle error
    }
  };

  const typeColors: Record<string, string> = {
    ordinary: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    special: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    circular: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const statusColors: Record<string, string> = {
    draft: "bg-white/10 text-white/60 border-white/10",
    proposed: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    voting: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    passed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    withdrawn: "bg-white/10 text-white/50 border-white/10",
  };

  const totalVoters = (r: Resolution) => r.votesFor + r.votesAgainst + r.abstentions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Resolution Center</h1>
          <p className="text-sm text-white/60 mt-1">Board resolutions, voting, and tracking</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">
          <Plus className="w-4 h-4" /> New Resolution
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Resolutions", value: displayResolutions.length, color: "text-white" },
          { label: "Passed", value: displayResolutions.filter((r) => r.status === "passed").length, color: "text-emerald-400" },
          { label: "Pending Vote", value: displayResolutions.filter((r) => r.status === "voting" || r.status === "proposed").length, color: "text-amber-400" },
          { label: "Failed", value: displayResolutions.filter((r) => r.status === "failed").length, color: "text-red-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-white/50 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        {displayResolutions.map((r, i) => {
          const total = totalVoters(r);
          const forPct = total > 0 ? (r.votesFor / total) * 100 : 0;
          const againstPct = total > 0 ? (r.votesAgainst / total) * 100 : 0;
          const abstainPct = total > 0 ? (r.abstentions / total) * 100 : 0;

          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[r.type]}`}>{r.type.toUpperCase()}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[r.status]}`}>{r.status.toUpperCase()}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{r.title}</h3>
                  <p className="text-xs text-white/50 mt-1">{r.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                    <span>Proposed by: {r.proposedBy}</span>
                    <span>Meeting: {r.meetingDate}</span>
                  </div>
                </div>
                {r.status === "passed" && <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />}
                {r.status === "failed" && <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />}
                {r.status === "voting" && <Vote className="w-6 h-6 text-blue-400 flex-shrink-0" />}
              </div>

              {total > 0 && (
                <div>
                  <div className="flex h-3 rounded-full overflow-hidden mb-2">
                    <div className="bg-emerald-500 transition-all" style={{ width: `${forPct}%` }} />
                    <div className="bg-red-500 transition-all" style={{ width: `${againstPct}%` }} />
                    <div className="bg-white/20 transition-all" style={{ width: `${abstainPct}%` }} />
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" />For: {r.votesFor}</span>
                    <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" />Against: {r.votesAgainst}</span>
                    <span className="flex items-center gap-1 text-white/50"><span className="w-2 h-2 rounded-full bg-white/20" />Abstain: {r.abstentions}</span>
                    <span className="text-white/40 ml-auto">Total voters: {total}</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a24] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">New Resolution</h3>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 block mb-1">Title</label>
                <input value={newRes.title} onChange={(e) => setNewRes({ ...newRes, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Type</label>
                <select value={newRes.type} onChange={(e) => setNewRes({ ...newRes, type: e.target.value as Resolution["type"] })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500">
                  <option value="ordinary">Ordinary</option>
                  <option value="special">Special</option>
                  <option value="circular">Circular</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Description</label>
                <textarea value={newRes.description} onChange={(e) => setNewRes({ ...newRes, description: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500 resize-none" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Proposed By</label>
                <input value={newRes.proposedBy} onChange={(e) => setNewRes({ ...newRes, proposedBy: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
              </div>
              <button onClick={handleCreate} className="w-full bg-gold-500 text-black py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Create Resolution</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
