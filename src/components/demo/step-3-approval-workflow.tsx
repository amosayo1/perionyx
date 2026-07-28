"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type ApprovalStage = {
  role: string;
  user: string;
  initial: string;
  status: "approved" | "pending" | "waiting";
  time: string;
};

const initialStages: ApprovalStage[] = [
  { role: "Compliance Officer", user: "David Chen", initial: "DC", status: "pending", time: "—" },
  { role: "CFO Review", user: "Michael Roberts", initial: "MR", status: "waiting", time: "—" },
  { role: "Treasury", user: "Awaiting approval", initial: "—", status: "waiting", time: "—" },
];

type NotificationEvent = {
  id: string;
  text: string;
  time: string;
  read: boolean;
};

const typedNotifications: NotificationEvent[] = [
  { id: "n1", text: "David Chen was notified of pending review", time: "2:14 PM", read: false },
];

export function Step3ApprovalWorkflow() {
  const [stages, setStages] = useState<ApprovalStage[]>(initialStages);
  const [notifications, setNotifications] = useState<NotificationEvent[]>(typedNotifications);
  const [phase, setPhase] = useState<"sending" | "waiting" | "approved">("sending");
  const [visibleComments, setVisibleComments] = useState(0);
  const [currentTime, setCurrentTime] = useState("2:14 PM");

  // Real-time timestamp updates
  useEffect(() => {
    const times = ["2:14 PM", "2:15 PM", "2:16 PM", "2:17 PM", "2:18 PM"];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % times.length;
      setCurrentTime(times[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("waiting"), 1200);
    const t2 = setTimeout(() => setPhase("approved"), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Notification/review animation sequence
  useEffect(() => {
    if (phase === "approved") {
      const t1 = setTimeout(() => {
        setStages((prev) =>
          prev.map((s, i) =>
            i === 0 ? { ...s, status: "approved" as const, time: "2:16 PM" } : s
          )
        );
      }, 200);
      const t2 = setTimeout(() => setVisibleComments(1), 500);
      const t3 = setTimeout(() => setVisibleComments(2), 1200);
      const t4 = setTimeout(() => setVisibleComments(3), 1900);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [phase]);

  // Notification animations
  useEffect(() => {
    if (phase === "waiting") {
      const t = setTimeout(() => {
        setNotifications((prev) => [
          ...prev,
          { id: "n2", text: "Compliance Officer is reviewing documentation", time: currentTime, read: true },
        ]);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [phase, currentTime]);

  const comments = [
    { user: "Sarah Johnson", text: "Vendor documentation verified. SOW and assessment attached.", time: "2:15 PM" },
    { user: "David Chen", text: "Risk assessment looks good. Documentation is complete. Approved.", time: "2:16 PM" },
    { user: "Michael Roberts", text: "Awaiting CFO review — escalated for final approval.", time: "2:17 PM" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Approval timeline — 3 cols */}
        <div className="lg:col-span-3 space-y-2">
          {/* Status banner */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 border ${
              phase === "approved"
                ? "bg-gold/5 border-gold/10"
                : phase === "waiting"
                ? "bg-amber-500/5 border-amber-500/10"
                : "bg-zinc-800/40 border-white/[0.06]"
            }`}
          >
            {phase === "sending" ? (
              <>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs text-blue-400 font-medium">Sending notifications to approvers...</span>
              </>
            ) : phase === "waiting" ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-400 font-medium">Waiting for approval — Compliance Officer reviewing</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-xs text-gold font-medium">Compliance approved — escalated to CFO</span>
              </>
            )}
          </motion.div>

          {/* Approval stages */}
          {stages.map((s, i) => (
            <motion.div
              key={s.role}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.25, duration: 0.4 }}
              className="relative flex gap-4 pb-5 last:pb-0"
            >
              {/* Connector */}
              {i < stages.length - 1 && (
                <div className={`absolute left-[19px] top-10 bottom-0 w-px ${
                  stages[i].status === "approved" || (stages[i].status === "pending" && phase === "approved")
                    ? "bg-gold/40"
                    : stages[i].status === "pending"
                    ? "bg-amber-500/30"
                    : "bg-white/[0.06]"
                }`} />
              )}

              {/* Avatar circle */}
              <div className={`relative z-10 w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                s.status === "approved" ? "bg-gold/10 border-2 border-gold/40" :
                s.status === "pending" ? "bg-amber-500/10 border-2 border-amber-500/30" :
                "bg-zinc-800 border-2 border-zinc-700"
              }`}>
                {s.status === "approved" ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                    strokeLinejoin="round" className="text-gold"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                ) : s.status === "pending" ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                )}
              </div>

              <div className="flex-1 pt-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{s.role}</span>
                    {/* Avatar badge */}
                    {s.status !== "waiting" && s.initial !== "—" && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center"
                      >
                        <span className="text-[8px] font-semibold text-zinc-300">{s.initial}</span>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {s.status === "approved" && (
                      <span className="text-[10px] text-gold font-mono">{s.time}</span>
                    )}
                    {s.status === "pending" && (
                      <span className="text-[10px] text-zinc-600 font-mono">{currentTime}</span>
                    )}
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                      s.status === "approved" ? "bg-gold/10 text-gold" :
                      s.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                      "bg-zinc-800 text-zinc-600"
                    }`}>
                      {s.status === "approved" ? "Approved" : s.status === "pending" ? "In Review" : "Pending"}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-zinc-500">{s.user}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right: Notifications + Activity — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Notification center */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Notifications</h4>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold/10 text-gold font-mono">
                  {notifications.filter((n) => !n.read).length} new
                </span>
              )}
            </div>
            <div className="space-y-2">
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.3, duration: 0.3 }}
                  className={`flex items-start gap-2.5 px-3 py-2 rounded-lg ${
                    !n.read ? "bg-gold/5 border border-gold/10" : ""
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    n.text.includes("approved") ? "bg-gold/10" :
                    n.text.includes("notified") ? "bg-blue-500/10" : "bg-zinc-800"
                  }`}>
                    {n.text.includes("approved") ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gold"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{n.text}</p>
                    <span className="text-[10px] text-zinc-600 font-mono">{n.time}</span>
                  </div>
                </motion.div>
              ))}

              {phase === "sending" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-2"
                >
                  <div className="w-3 h-3 rounded-full border-2 border-zinc-600 border-t-gold animate-spin" />
                  <span className="text-[11px] text-zinc-600">Notifying next approver...</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Activity thread */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Activity</h4>
            <div className="space-y-3">
              {comments.slice(0, visibleComments).map((c, i) => (
                <motion.div
                  key={c.user + c.time}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 border border-zinc-500 shrink-0 mt-0.5 flex items-center justify-center">
                    <span className="text-[8px] font-semibold text-zinc-300">
                      {c.user.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-300">{c.user}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">{c.time}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{c.text}</p>
                  </div>
                </motion.div>
              ))}
              {visibleComments < comments.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-3 py-1"
                >
                  <div className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" />
                  <span className="text-[10px] text-zinc-600">Waiting for activity...</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {phase === "approved" && visibleComments === 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-gold/5 border border-gold/10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-xs text-gold">Compliance approved — payment routed to CFO for final review</span>
        </motion.div>
      )}
    </motion.div>
  );
}
