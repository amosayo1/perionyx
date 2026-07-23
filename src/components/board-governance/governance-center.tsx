"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Crown, CheckCircle, Clock, AlertTriangle, Plus, X,
  Building2, Calendar, Shield, Vote,
} from "lucide-react";

interface BoardMember {
  id: string;
  name: string;
  title: string;
  status: "active" | "inactive" | "resigned";
  attendanceRate: number;
  votingRights: boolean;
  sinceDate: string;
  committee?: string;
}

interface BoardInfo {
  name: string;
  chairman: string;
  formationDate: string;
  memberCount: number;
  meetingFrequency: string;
  jurisdiction: string;
}

export function GovernanceCenter() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [boardInfo, setBoardInfo] = useState<BoardInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", title: "", votingRights: true });

  useEffect(() => {
    async function load() {
      try {
        const [membersRes, infoRes] = await Promise.all([
          fetch("/api/board/members").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/board/info").then((r) => (r.ok ? r.json() : null)),
        ]);
        if (membersRes) setMembers(membersRes.members ?? []);
        if (infoRes) setBoardInfo(infoRes);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultMembers: BoardMember[] = [
    { id: "1", name: "Sarah Chen", title: "Chairperson", status: "active", attendanceRate: 100, votingRights: true, sinceDate: "2020-03-15", committee: "Executive" },
    { id: "2", name: "Michael Torres", title: "Vice Chairperson", status: "active", attendanceRate: 95, votingRights: true, sinceDate: "2019-06-01", committee: "Audit" },
    { id: "3", name: "Priya Sharma", title: "Independent Director", status: "active", attendanceRate: 92, votingRights: true, sinceDate: "2021-01-10", committee: "Risk" },
    { id: "4", name: "James Wilson", title: "Independent Director", status: "active", attendanceRate: 88, votingRights: true, sinceDate: "2022-04-20", committee: "Compensation" },
    { id: "5", name: "Elena Volkov", title: "Non-Executive Director", status: "active", attendanceRate: 97, votingRights: true, sinceDate: "2018-09-01", committee: "Nominating" },
    { id: "6", name: "David Kim", title: "CFO (Ex-Officio)", status: "active", attendanceRate: 100, votingRights: false, sinceDate: "2023-01-01" },
    { id: "7", name: "Rachel Adams", title: "Independent Director", status: "inactive", attendanceRate: 75, votingRights: true, sinceDate: "2020-07-01", committee: "Audit" },
  ];

  const defaultBoardInfo: BoardInfo = {
    name: "Global Corp Board of Directors",
    chairman: "Sarah Chen",
    formationDate: "2015-01-01",
    memberCount: 7,
    meetingFrequency: "Quarterly",
    jurisdiction: "Delaware, USA",
  };

  const info = boardInfo ?? defaultBoardInfo;
  const displayMembers = members.length > 0 ? members : defaultMembers;

  const handleCreateMember = async () => {
    try {
      const res = await fetch("/api/board/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });
      if (res.ok) {
        const created = await res.json();
        setMembers((prev) => [...prev, created]);
        setShowCreateMember(false);
        setNewMember({ name: "", title: "", votingRights: true });
      }
    } catch {
      // handle error
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Board Governance Center</h1>
          <p className="text-sm text-white/60 mt-1">Board member management and governance structure</p>
        </div>
        <button
          onClick={() => setShowCreateMember(true)}
          className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3"><Crown className="w-5 h-5 text-blue-400" /></div>
          <div className="text-2xl font-bold text-white">{info.memberCount}</div>
          <div className="text-xs text-white/50 mt-1">Board Members</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3"><CheckCircle className="w-5 h-5 text-emerald-400" /></div>
          <div className="text-2xl font-bold text-white">{displayMembers.filter((m) => m.status === "active").length}</div>
          <div className="text-xs text-white/50 mt-1">Active Members</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center mb-3"><Vote className="w-5 h-5 text-gold-500" /></div>
          <div className="text-2xl font-bold text-white">{displayMembers.filter((m) => m.votingRights).length}</div>
          <div className="text-xs text-white/50 mt-1">Voting Members</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3"><Clock className="w-5 h-5 text-orange-400" /></div>
          <div className="text-2xl font-bold text-white">{info.meetingFrequency}</div>
          <div className="text-xs text-white/50 mt-1">Meeting Frequency</div>
        </motion.div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gold-500" />
          <h2 className="text-lg font-semibold text-white">Board Information</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div><span className="text-xs text-white/50 block">Board Name</span><span className="text-sm text-white">{info.name}</span></div>
          <div><span className="text-xs text-white/50 block">Chairman</span><span className="text-sm text-white">{info.chairman}</span></div>
          <div><span className="text-xs text-white/50 block">Formation Date</span><span className="text-sm text-white">{info.formationDate}</span></div>
          <div><span className="text-xs text-white/50 block">Jurisdiction</span><span className="text-sm text-white">{info.jurisdiction}</span></div>
          <div><span className="text-xs text-white/50 block">Meeting Frequency</span><span className="text-sm text-white">{info.meetingFrequency}</span></div>
          <div><span className="text-xs text-white/50 block">Total Members</span><span className="text-sm text-white">{info.memberCount}</span></div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Board Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-white/50 font-medium px-4 py-3">Name</th>
                <th className="text-left text-xs text-white/50 font-medium px-4 py-3">Title</th>
                <th className="text-left text-xs text-white/50 font-medium px-4 py-3">Status</th>
                <th className="text-left text-xs text-white/50 font-medium px-4 py-3">Attendance</th>
                <th className="text-left text-xs text-white/50 font-medium px-4 py-3">Voting</th>
                <th className="text-left text-xs text-white/50 font-medium px-4 py-3">Committee</th>
                <th className="text-left text-xs text-white/50 font-medium px-4 py-3">Since</th>
              </tr>
            </thead>
            <tbody>
              {displayMembers.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{m.title}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      m.status === "active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                      m.status === "inactive" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                      "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}>{m.status.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.attendanceRate >= 90 ? "bg-emerald-400" : m.attendanceRate >= 75 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${m.attendanceRate}%` }} />
                      </div>
                      <span className="text-xs text-white/60">{m.attendanceRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {m.votingRights ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="text-xs text-white/40">No</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/70">{m.committee ?? "\u2014"}</td>
                  <td className="px-4 py-3 text-xs text-white/50">{m.sinceDate}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Board Member</h3>
              <button onClick={() => setShowCreateMember(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 block mb-1">Full Name</label>
                <input value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Title</label>
                <input value={newMember.title} onChange={(e) => setNewMember({ ...newMember, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={newMember.votingRights} onChange={(e) => setNewMember({ ...newMember, votingRights: e.target.checked })} className="rounded" />
                <label className="text-sm text-white/70">Voting Rights</label>
              </div>
              <button onClick={handleCreateMember} className="w-full bg-gold-500 text-black py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Add Member</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
