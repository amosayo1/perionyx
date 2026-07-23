"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, X, Calendar, Clock, CheckCircle, BarChart3, Shield,
} from "lucide-react";

interface Committee {
  id: string;
  name: string;
  type: "audit" | "compensation" | "nominating" | "risk" | "executive" | "other";
  chair: string;
  meetingFrequency: string;
  memberCount: number;
  status: "active" | "inactive";
  lastMeeting: string;
  nextMeeting: string;
  performanceScore: number;
}

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  attendanceRate: number;
}

export function CommitteeWorkspace() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [selected, setSelected] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCommittee, setNewCommittee] = useState({ name: "", type: "other" as Committee["type"], chair: "", meetingFrequency: "Quarterly" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/board/committees").then((r) => (r.ok ? r.json() : null));
        if (res) setCommittees(res.committees ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultCommittees: Committee[] = [
    { id: "1", name: "Audit Committee", type: "audit", chair: "Michael Torres", meetingFrequency: "Quarterly", memberCount: 4, status: "active", lastMeeting: "2026-06-10", nextMeeting: "2026-07-22", performanceScore: 92 },
    { id: "2", name: "Compensation Committee", type: "compensation", chair: "James Wilson", meetingFrequency: "Semi-Annual", memberCount: 3, status: "active", lastMeeting: "2026-05-15", nextMeeting: "2026-08-15", performanceScore: 88 },
    { id: "3", name: "Nominating & Governance", type: "nominating", chair: "Elena Volkov", meetingFrequency: "Quarterly", memberCount: 4, status: "active", lastMeeting: "2026-06-01", nextMeeting: "2026-09-01", performanceScore: 85 },
    { id: "4", name: "Risk Committee", type: "risk", chair: "Priya Sharma", meetingFrequency: "Quarterly", memberCount: 5, status: "active", lastMeeting: "2026-07-15", nextMeeting: "2026-07-28", performanceScore: 90 },
    { id: "5", name: "Executive Committee", type: "executive", chair: "Sarah Chen", meetingFrequency: "Monthly", memberCount: 3, status: "active", lastMeeting: "2026-07-01", nextMeeting: "2026-08-01", performanceScore: 95 },
  ];

  const defaultMembers: CommitteeMember[] = [
    { id: "1", name: "Michael Torres", role: "Chair", attendanceRate: 100 },
    { id: "2", name: "Priya Sharma", role: "Member", attendanceRate: 95 },
    { id: "3", name: "James Wilson", role: "Member", attendanceRate: 88 },
    { id: "4", name: "Elena Volkov", role: "Member", attendanceRate: 97 },
  ];

  const displayCommittees = committees.length > 0 ? committees : defaultCommittees;

  const typeIcons: Record<string, typeof Shield> = {
    audit: Shield, compensation: Users, nominating: Users, risk: Shield, executive: Users, other: Users,
  };

  const typeColors: Record<string, string> = {
    audit: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    compensation: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    nominating: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    risk: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    executive: "bg-gold-500/20 text-gold-500 border-gold-500/30",
    other: "bg-white/10 text-white/60 border-white/10",
  };

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/board/committees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCommittee),
      });
      if (res.ok) {
        const created = await res.json();
        setCommittees((prev) => [...prev, created]);
        setShowCreate(false);
        setNewCommittee({ name: "", type: "other", chair: "", meetingFrequency: "Quarterly" });
      }
    } catch {
      // handle error
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Committee Workspace</h1>
          <p className="text-sm text-white/60 mt-1">Board committee management and performance</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">
          <Plus className="w-4 h-4" /> New Committee
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {displayCommittees.map((c, i) => {
          const Icon = typeIcons[c.type] || Users;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => setSelected(c)} className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-colors ${selected?.id === c.id ? "border-gold-500/50 bg-gold-500/5" : "border-white/10 hover:bg-white/10"}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Icon className="w-4 h-4 text-gold-500" /></div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[c.type]}`}>{c.type.toUpperCase()}</span>
              </div>
              <div className="text-sm text-white font-medium">{c.name}</div>
              <div className="text-xs text-white/50 mt-1">Chair: {c.chair}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-white/40 flex items-center gap-1"><Users className="w-3 h-3" />{c.memberCount}</span>
                <span className="text-xs text-white/40 flex items-center gap-1"><Calendar className="w-3 h-3" />{c.meetingFrequency}</span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-white/40">Performance</span>
                  <span className="text-[10px] text-gold-500">{c.performanceScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-500 rounded-full" style={{ width: `${c.performanceScore}%` }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">{selected.name}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><span className="text-xs text-white/50 block">Chair</span><span className="text-sm text-white">{selected.chair}</span></div>
              <div><span className="text-xs text-white/50 block">Type</span><span className="text-sm text-white capitalize">{selected.type}</span></div>
              <div><span className="text-xs text-white/50 block">Meeting Frequency</span><span className="text-sm text-white">{selected.meetingFrequency}</span></div>
              <div><span className="text-xs text-white/50 block">Members</span><span className="text-sm text-white">{selected.memberCount}</span></div>
              <div><span className="text-xs text-white/50 block">Last Meeting</span><span className="text-sm text-white">{selected.lastMeeting}</span></div>
              <div><span className="text-xs text-white/50 block">Next Meeting</span><span className="text-sm text-white">{selected.nextMeeting}</span></div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${selected.status === "active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/10 text-white/50 border-white/10"}`}>{selected.status.toUpperCase()}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-gold-500" /> Committee Members</h3>
            <div className="space-y-3">
              {defaultMembers.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">{m.name}</div>
                    <div className="text-xs text-white/50">{m.role}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.attendanceRate >= 90 ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${m.attendanceRate}%` }} />
                    </div>
                    <span className="text-xs text-white/50">{m.attendanceRate}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">New Committee</h3>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 block mb-1">Name</label>
                <input value={newCommittee.name} onChange={(e) => setNewCommittee({ ...newCommittee, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Type</label>
                <select value={newCommittee.type} onChange={(e) => setNewCommittee({ ...newCommittee, type: e.target.value as Committee["type"] })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500">
                  <option value="audit">Audit</option>
                  <option value="compensation">Compensation</option>
                  <option value="nominating">Nominating & Governance</option>
                  <option value="risk">Risk</option>
                  <option value="executive">Executive</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Chair</label>
                <input value={newCommittee.chair} onChange={(e) => setNewCommittee({ ...newCommittee, chair: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Meeting Frequency</label>
                <select value={newCommittee.meetingFrequency} onChange={(e) => setNewCommittee({ ...newCommittee, meetingFrequency: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500">
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Semi-Annual">Semi-Annual</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
              <button onClick={handleCreate} className="w-full bg-gold-500 text-black py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Create Committee</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
