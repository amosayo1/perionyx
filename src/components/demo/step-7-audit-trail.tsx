"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type AuditEvent = {
  action: string;
  user: string;
  role: string;
  time: string;
  ip: string;
  device: string;
  ref: string;
  triggeredPolicy?: string;
  before?: string;
  after?: string;
};

const events: AuditEvent[] = [
  {
    action: "Payment Requested",
    user: "Sarah Johnson",
    role: "Finance Manager",
    time: "2:14 PM",
    ip: "10.0.1.45",
    device: "Chrome 124 / macOS 15.4",
    ref: "TXN-0421",
    before: "—",
    after: "Awaiting Policy Evaluation",
  },
  {
    action: "Policy Engine Evaluated",
    user: "System",
    role: "Automated",
    time: "2:14 PM",
    ip: "—",
    device: "Policy Engine v2.1",
    ref: "POL-3",
    triggeredPolicy: "Wire Transfer Limit, New Vendor Policy",
    before: "Awaiting Policy Evaluation",
    after: "Pending Approval (2 required)",
  },
  {
    action: "Compliance Approved",
    user: "David Chen",
    role: "Compliance Officer",
    time: "2:16 PM",
    ip: "10.0.1.82",
    device: "Safari 18 / macOS 15.4",
    ref: "APPROVAL-01",
    triggeredPolicy: "New Vendor Policy",
    before: "Pending Compliance",
    after: "Compliance Approved",
  },
  {
    action: "CFO Approved",
    user: "Michael Roberts",
    role: "Chief Financial Officer",
    time: "2:18 PM",
    ip: "10.0.1.12",
    device: "Chrome 124 / Windows 11",
    ref: "APPROVAL-02",
    triggeredPolicy: "Wire Transfer Limit",
    before: "Pending CFO Review",
    after: "Fully Approved",
  },
  {
    action: "Ledger Posted",
    user: "System",
    role: "Automated",
    time: "2:19 PM",
    ip: "—",
    device: "Ledger Service",
    ref: "JE-2026-0421",
    before: "Approved (unposted)",
    after: "Posted — Balanced",
  },
  {
    action: "Treasury Executed",
    user: "System",
    role: "Automated",
    time: "2:19 PM",
    ip: "—",
    device: "Treasury Engine",
    ref: "WIRE-88492",
    before: "Queued",
    after: "Confirmed — Funds Sent",
  },
  {
    action: "Audit Record Finalized",
    user: "System",
    role: "Automated",
    time: "2:19 PM",
    ip: "—",
    device: "Audit Service",
    ref: "AUD-2026-0421",
    before: "Recording",
    after: "Complete — 7 events",
  },
];

function EventRow({ event, index, visible }: { event: AuditEvent; index: number; visible: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -10 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full grid grid-cols-5 gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
          expanded
            ? "bg-[#d4af37]/5 border border-[#d4af37]/20"
            : "hover:bg-white/[0.02] border border-transparent"
        }`}
      >
        <div className="col-span-2 flex items-center gap-2.5">
          {/* Git-style indicator */}
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-zinc-600" />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={expanded ? "text-[#d4af37]" : "text-zinc-600"}>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
            </svg>
          </div>
          <span className="text-xs text-zinc-300">{event.action}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500">{event.user}</span>
        </div>
        <span className="text-xs text-zinc-500 font-mono">{event.time}</span>
        <span className="text-[11px] text-zinc-600 font-mono flex items-center gap-1">
          {expanded && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d4af37]">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
          {event.ref}
        </span>
      </button>

      {/* Expandable detail — Git-style commit detail */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="ml-8 mb-2 px-4 py-3 rounded-lg bg-black/60 border border-white/[0.04]"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">User</span>
              <p className="text-xs text-zinc-400 mt-0.5">{event.user}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Role</span>
              <p className="text-xs text-zinc-400 mt-0.5">{event.role}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">IP Address</span>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{event.ip || "—"}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Device</span>
              <p className="text-xs text-zinc-400 mt-0.5">{event.device}</p>
            </div>
          </div>

          {(event.triggeredPolicy || event.before) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3 pt-3 border-t border-white/[0.04]">
              {event.triggeredPolicy && (
                <div>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Triggered Policy</span>
                  <p className="text-xs text-zinc-400 mt-0.5">{event.triggeredPolicy}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Before</span>
                <p className="text-xs text-zinc-400 mt-0.5">{event.before || "—"}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">After</span>
                <p className="text-xs text-[#d4af37] mt-0.5">{event.after || "—"}</p>
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-white/[0.04] text-[10px] text-zinc-600 font-mono">
            Commit: {event.ref} | Timestamp: {event.time} UTC
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function Step7AuditTrail() {
  const [visibleEvents, setVisibleEvents] = useState(0);

  useEffect(() => {
    const timers = events.map((_, i) =>
      setTimeout(() => setVisibleEvents(i + 1), 400 + i * 350)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-sm overflow-hidden shadow-2xl">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <div className="w-2 h-2 rounded-full bg-zinc-600" />
          <span className="ml-2 text-xs text-zinc-500 font-mono">Audit Trail — TXN-0421</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-zinc-600 font-mono">
              {visibleEvents} / {events.length} events
            </span>
            <button className="px-2 py-1 text-[10px] font-medium rounded-md bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
              Export
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Git-style header */}
          <div className="flex items-center gap-2 mb-4 px-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
            </svg>
            <span className="text-[11px] text-zinc-600 font-mono">main</span>
            <span className="text-[11px] text-zinc-700">|</span>
            <span className="text-[11px] text-zinc-600 font-mono">TXN-0421</span>
          </div>

          {/* Events */}
          <div className="space-y-0.5">
            {events.slice(0, visibleEvents).map((event, i) => (
              <EventRow key={event.ref} event={event} index={i} visible={true} />
            ))}
          </div>

          {/* Footer */}
          {visibleEvents === events.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 px-3 py-2 flex items-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#d4af37]/60">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[11px] text-[#d4af37]/60 font-mono">
                7 events recorded • Audit complete • Chain of custody preserved
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
