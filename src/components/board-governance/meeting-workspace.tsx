"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Users, FileText, CheckCircle, Clock, Plus, X,
  ChevronRight, AlertTriangle, Scale,
} from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  type: "board" | "committee" | "special" | "annual";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  date: string;
  time: string;
  attendees: number;
  location: string;
  agendaCount: number;
}

interface MeetingDetail {
  meeting: Meeting;
  agenda: { id: string; title: string; presenter: string; duration: string; type: string }[];
  resolutions: { id: string; title: string; status: string; votesFor: number; votesAgainst: number }[];
  actions: { id: string; title: string; assignee: string; dueDate: string; status: string }[];
}

export function MeetingWorkspace() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selected, setSelected] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ title: "", type: "board" as Meeting["type"], date: "", time: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/board/meetings").then((r) => (r.ok ? r.json() : null));
        if (res) setMeetings(res.meetings ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultMeetings: Meeting[] = [
    { id: "1", title: "Q2 2026 Board Meeting", type: "board", status: "scheduled", date: "2026-07-25", time: "09:00", attendees: 12, location: "Boardroom A", agendaCount: 8 },
    { id: "2", title: "Audit Committee - July", type: "committee", status: "scheduled", date: "2026-07-22", time: "14:00", attendees: 5, location: "Virtual", agendaCount: 5 },
    { id: "3", title: "Risk Committee Review", type: "committee", status: "completed", date: "2026-07-15", time: "10:00", attendees: 6, location: "Boardroom B", agendaCount: 6 },
    { id: "4", title: "Annual General Meeting", type: "annual", status: "completed", date: "2026-06-15", time: "09:00", attendees: 45, location: "Grand Hall", agendaCount: 12 },
    { id: "5", title: "Special Board Session - Budget", type: "special", status: "scheduled", date: "2026-08-01", time: "11:00", attendees: 10, location: "Boardroom A", agendaCount: 4 },
  ];

  const defaultDetail: MeetingDetail = {
    meeting: defaultMeetings[0],
    agenda: [
      { id: "1", title: "Call to Order & Quorum", presenter: "Chairperson", duration: "5 min", type: "procedural" },
      { id: "2", title: "Approval of Previous Minutes", presenter: "Secretary", duration: "10 min", type: "procedural" },
      { id: "3", title: "FY26 Budget Presentation", presenter: "CFO", duration: "30 min", type: "presentation" },
      { id: "4", title: "Risk Framework Update", presenter: "CRO", duration: "20 min", type: "presentation" },
      { id: "5", title: "Audit Findings Review", presenter: "Audit Chair", duration: "25 min", type: "review" },
      { id: "6", title: "Strategic Initiatives Update", presenter: "CEO", duration: "20 min", type: "presentation" },
      { id: "7", title: "Resolution: Budget Approval", presenter: "CFO", duration: "15 min", type: "vote" },
      { id: "8", title: "Any Other Business", presenter: "Chairperson", duration: "10 min", type: "procedural" },
    ],
    resolutions: [
      { id: "1", title: "Approve FY26 Annual Budget", status: "pending", votesFor: 0, votesAgainst: 0 },
      { id: "2", title: "Ratify Audit Committee Charter Amendment", status: "pending", votesFor: 0, votesAgainst: 0 },
    ],
    actions: [
      { id: "1", title: "Circulate final budget presentation", assignee: "CFO", dueDate: "2026-07-22", status: "pending" },
      { id: "2", title: "Prepare audit findings report", assignee: "Internal Audit", dueDate: "2026-07-23", status: "completed" },
    ],
  };

  const displayMeetings = meetings.length > 0 ? meetings : defaultMeetings;

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/board/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMeeting),
      });
      if (res.ok) {
        const created = await res.json();
        setMeetings((prev) => [...prev, created]);
        setShowCreate(false);
        setNewMeeting({ title: "", type: "board", date: "", time: "" });
      }
    } catch {
      // handle error
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Meeting Workspace</h1>
          <p className="text-sm text-white/60 mt-1">Board and committee meeting management</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {displayMeetings.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(selected?.meeting.id === m.id ? null : { ...defaultDetail, meeting: m })}
              className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-colors ${selected?.meeting.id === m.id ? "border-gold-500/50 bg-gold-500/5" : "border-white/10 hover:bg-white/10"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  m.type === "board" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                  m.type === "committee" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  m.type === "annual" ? "bg-gold-500/20 text-gold-500 border-gold-500/30" :
                  "bg-purple-500/20 text-purple-400 border-purple-500/30"
                }`}>{m.type.toUpperCase()}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  m.status === "scheduled" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                  m.status === "completed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  m.status === "in-progress" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                  "bg-red-500/20 text-red-400 border-red-500/30"
                }`}>{m.status.toUpperCase()}</span>
              </div>
              <div className="text-sm text-white font-medium">{m.title}</div>
              <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{m.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.time}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{m.attendees}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">{selected.meeting.title}</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div><span className="text-xs text-white/50 block">Date</span><span className="text-sm text-white">{selected.meeting.date}</span></div>
                  <div><span className="text-xs text-white/50 block">Time</span><span className="text-sm text-white">{selected.meeting.time}</span></div>
                  <div><span className="text-xs text-white/50 block">Location</span><span className="text-sm text-white">{selected.meeting.location}</span></div>
                  <div><span className="text-xs text-white/50 block">Attendees</span><span className="text-sm text-white">{selected.meeting.attendees}</span></div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-gold-500" /> Agenda ({selected.agenda.length} items)</h3>
                <div className="space-y-2">
                  {selected.agenda.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                      <span className="text-xs text-white/40 w-6">{i + 1}.</span>
                      <div className="flex-1">
                        <div className="text-sm text-white">{a.title}</div>
                        <div className="text-xs text-white/50">{a.presenter} &middot; {a.duration}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        a.type === "vote" ? "bg-gold-500/20 text-gold-500 border-gold-500/30" :
                        a.type === "presentation" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                        a.type === "review" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                        "bg-white/10 text-white/50 border-white/10"
                      }`}>{a.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Scale className="w-4 h-4 text-gold-500" /> Resolutions</h3>
                  <div className="space-y-2">
                    {selected.resolutions.map((r) => (
                      <div key={r.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm text-white">{r.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-amber-500/20 text-amber-400 border-amber-500/30">{r.status.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-gold-500" /> Action Items</h3>
                  <div className="space-y-2">
                    {selected.actions.map((a) => (
                      <div key={a.id} className="bg-white/5 rounded-lg p-3">
                        <div className="text-sm text-white">{a.title}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-white/50">{a.assignee} &middot; Due {a.dueDate}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            a.status === "completed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                            "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}>{a.status.toUpperCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <Calendar className="w-12 h-12 text-white/40 mb-4" />
              <p className="text-white/50">Select a meeting to view details</p>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Schedule Meeting</h3>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 block mb-1">Title</label>
                <input value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Type</label>
                <select value={newMeeting.type} onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value as Meeting["type"] })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500">
                  <option value="board">Board</option>
                  <option value="committee">Committee</option>
                  <option value="special">Special</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 block mb-1">Date</label>
                  <input type="date" value={newMeeting.date} onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
                </div>
                <div>
                  <label className="text-xs text-white/50 block mb-1">Time</label>
                  <input type="time" value={newMeeting.time} onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-gold-500" />
                </div>
              </div>
              <button onClick={handleCreate} className="w-full bg-gold-500 text-black py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Schedule Meeting</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
