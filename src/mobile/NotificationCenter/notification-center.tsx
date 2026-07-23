"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Bell, AlertCircle, AlertTriangle, Info, CheckCheck,
  ArrowUpRight, Archive, X,
} from "lucide-react";

export interface MobileNotification {
  id: string;
  type: "critical" | "warning" | "info" | "approval" | "compliance";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  deepLink?: string;
  actionLabel?: string;
}

const typeConfig = {
  critical: { icon: AlertCircle, color: "text-red-400", border: "border-l-red-500", bg: "bg-red-500/[0.03]" },
  warning: { icon: AlertTriangle, color: "text-amber-400", border: "border-l-amber-500", bg: "bg-amber-500/[0.02]" },
  info: { icon: Info, color: "text-blue-400", border: "border-l-blue-500", bg: "bg-blue-500/[0.02]" },
  approval: { icon: Bell, color: "text-[#d4af37]", border: "border-l-[#d4af37]", bg: "bg-[#d4af37]/[0.02]" },
  compliance: { icon: CheckCheck, color: "text-emerald-400", border: "border-l-emerald-500", bg: "bg-emerald-500/[0.02]" },
};

export function NotificationCenter({
  notifications,
  onMarkRead,
  onArchive,
  onDeepLink,
  onAction,
  className,
}: {
  notifications: MobileNotification[];
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDeepLink: (url: string) => void;
  onAction?: (id: string) => void;
  className?: string;
}) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const filtered = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const priorityOrder = { critical: 0, warning: 1, approval: 2, compliance: 3, info: 4 };
  const sorted = [...filtered].sort((a, b) => (priorityOrder[a.type] ?? 99) - (priorityOrder[b.type] ?? 99));

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn("rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors", filter === "all" ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-zinc-500")}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn("rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors", filter === "unread" ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-zinc-500")}
          >
            Unread ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => notifications.filter((n) => !n.isRead).forEach((n) => onMarkRead(n.id))}
            className="text-[11px] text-[#d4af37] active:text-[#d4af37]/60"
          >
            Mark all read
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {sorted.map((n) => {
          const cfg = typeConfig[n.type];
          const Icon = cfg.icon;

          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "relative mb-2 rounded-2xl border border-white/[0.06] border-l-[3px] p-4",
                cfg.border,
                cfg.bg,
                !n.isRead && "bg-white/[0.02]",
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", cfg.color)} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-sm font-medium", n.isRead ? "text-zinc-400" : "text-zinc-200")}>
                      {n.title}
                    </span>
                    {!n.isRead && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#d4af37]" />}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">{n.message}</p>
                  <span className="mt-1 block text-[9px] text-zinc-600">{n.timestamp}</span>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {n.actionLabel && onAction && (
                      <button
                        onClick={() => onAction(n.id)}
                        className="rounded-xl bg-[#d4af37]/10 px-3.5 py-1.5 text-[11px] font-medium text-[#d4af37] active:bg-[#d4af37]/20 min-h-[32px]"
                      >
                        {n.actionLabel}
                      </button>
                    )}
                    {n.deepLink && (
                      <button
                        onClick={() => onDeepLink(n.deepLink!)}
                        className="flex items-center gap-1 rounded-xl bg-zinc-800 px-3.5 py-1.5 text-[11px] text-zinc-400 active:bg-zinc-700 min-h-[32px]"
                      >
                        <ArrowUpRight className="h-3 w-3" />
                        View
                      </button>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => onMarkRead(n.id)}
                        className="rounded-xl bg-zinc-800 px-3.5 py-1.5 text-[11px] text-zinc-500 active:bg-zinc-700 min-h-[32px]"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => onArchive(n.id)}
                      className="flex items-center gap-1 rounded-xl bg-zinc-800 px-3.5 py-1.5 text-[11px] text-zinc-500 active:bg-zinc-700 min-h-[32px]"
                      aria-label="Archive notification"
                    >
                      <Archive className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {sorted.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Bell className="h-8 w-8 text-zinc-700" />
          <p className="text-sm text-zinc-600">No notifications</p>
          {filter === "unread" && (
            <button onClick={() => setFilter("all")} className="text-[11px] text-[#d4af37]">
              View all notifications
            </button>
          )}
        </div>
      )}
    </div>
  );
}
