"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useDemo } from "./demo-provider";

function AnimatedCounter({ from, to, prefix = "", suffix = "", decimals = 0 }: {
  from: number; to: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    const diff = to - from;
    const steps = 50;
    let current = from;
    const interval = setInterval(() => {
      current += diff / steps;
      if (Math.abs(current - to) < 0.01) { current = to; clearInterval(interval); }
      setDisplay(current);
    }, 30);
    return () => clearInterval(interval);
  }, [from, to]);

  return <span>{prefix}{display.toFixed(decimals)}{suffix}</span>;
}

type MetricCard = {
  label: string;
  old: number;
  new_: number;
  prefix: string;
  suffix?: string;
  decimals?: number;
  icon: string;
};

const metrics: MetricCard[] = [
  { label: "Total Balance", old: 4280000, new_: 3940000, prefix: "$", decimals: 0, icon: "bank" },
  { label: "Pending Approvals", old: 4, new_: 3, prefix: "", icon: "clock" },
  { label: "Audit Events (Today)", old: 12, new_: 19, prefix: "", suffix: "", decimals: 0, icon: "shield" },
  { label: "Completed Payments", old: 8, new_: 9, prefix: "", icon: "check" },
];

type NotificationItem = {
  id: string;
  text: string;
  time: string;
  type: "approval" | "payment" | "audit" | "system";
  read: boolean;
};

const activityItems = [
  { text: "Payment to Stratum Security completed", time: "2:19 PM", type: "success" as const },
  { text: "Audit record generated for TXN-0421", time: "2:19 PM", type: "info" as const },
  { text: "Pending approvals decreased to 3", time: "2:18 PM", type: "info" as const },
  { text: "Operating balance updated: -$340,000.00", time: "2:19 PM", type: "info" as const },
  { text: "Journal entry JE-2026-0421 posted", time: "2:19 PM", type: "info" as const },
];

export function Step8DashboardUpdated() {
  const { transactionId, notificationCount, setNotificationCount } = useDemo();
  const [showUpdates, setShowUpdates] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowUpdates(true), 400);
    setTimeout(() => { setNotificationCount(3); setShowNotifications(true); }, 1500);
  }, [setNotificationCount]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: "n1", text: "Wire confirmed — Stratum Security ($340K)", time: "2:19 PM", type: "payment", read: false },
    { id: "n2", text: "Audit record finalized — 7 events captured", time: "2:19 PM", type: "audit", read: false },
    { id: "n3", text: "Balance alert: Operating Account debited", time: "2:19 PM", type: "system", read: false },
  ]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setNotificationCount(0);
  }, [setNotificationCount]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-sm overflow-hidden shadow-2xl">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <span className="ml-2 text-xs text-zinc-500 font-mono">Treasury Dashboard</span>
          {showUpdates && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto text-[10px] px-2 py-0.5 rounded bg-gold/10 text-gold"
            >
              Updated just now
            </motion.span>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Metric cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.5 }}
                className="rounded-xl border border-white/[0.06] bg-black/40 p-4 relative overflow-hidden"
              >
                {/* Subtle background icon */}
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gold/[0.02]" />

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-zinc-500">{m.label}</span>
                  <span className="text-[10px] text-zinc-700 font-mono">{m.icon === "bank" ? "$$$" : "~"}</span>
                </div>

                <div className="flex items-baseline gap-2">
                  <div className="text-lg font-semibold text-white font-mono">
                    {showUpdates ? (
                      <AnimatedCounter
                        from={m.old}
                        to={m.new_}
                        prefix={m.prefix}
                        suffix={m.suffix || ""}
                        decimals={m.decimals ?? 0}
                      />
                    ) : (
                      `${m.prefix}${m.old.toLocaleString()}`
                    )}
                  </div>
                  {showUpdates && m.old !== m.new_ && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-[10px] font-mono ${
                        m.new_ < m.old ? "text-red-400" : "text-gold"
                      }`}
                    >
                      {m.new_ < m.old ? "↓" : "↑"} {Math.abs(m.new_ - m.old).toLocaleString()}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Two-column layout for activity + notifications */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent activity */}
            <div>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-3 block">Recent Activity</span>
              <div className="space-y-1.5">
                {activityItems.map((a, i) => (
                  <motion.div
                    key={a.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: showUpdates ? 1 : 0, x: showUpdates ? 0 : -10 }}
                    transition={{ delay: 0.6 + i * 0.12, duration: 0.4 }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      a.type === "success" ? "bg-gold" : "bg-zinc-500"
                    }`} />
                    <span className="text-xs text-zinc-400">{a.text}</span>
                    <span className="text-[10px] text-zinc-600 ml-auto font-mono">{a.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Notification center */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Notifications</span>
                {showNotifications && notificationCount > 0 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={markAllRead}
                    className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Mark all read
                  </motion.button>
                )}
              </div>

              {showNotifications ? (
                <div className="space-y-1.5">
                  {notifications.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        !n.read
                          ? "bg-gold/5 border border-gold/10"
                          : "bg-black/20 hover:bg-black/40 border border-transparent"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        n.type === "payment" ? "bg-blue-500/10" :
                        n.type === "audit" ? "bg-gold/10" :
                        n.type === "system" ? "bg-amber-500/10" : "bg-zinc-800"
                      }`}>
                        {n.type === "payment" ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400"><rect x="3" y="8" width="18" height="14" rx="2" /><line x1="3" y1="12" x2="21" y2="12" /></svg>
                        ) : n.type === "audit" ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${!n.read ? "text-zinc-300" : "text-zinc-500"}`}>{n.text}</p>
                        <span className="text-[10px] text-zinc-600 font-mono">{n.time}</span>
                      </div>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-6 text-center text-[11px] text-zinc-700">
                  No new notifications
                </div>
              )}
            </div>
          </div>

          {/* Summary bar */}
          {showUpdates && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold/5 border border-gold/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
              <span className="text-xs text-gold">
                Dashboard fully updated — {notificationCount} new notification{notificationCount !== 1 ? "s" : ""}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
