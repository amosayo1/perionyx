"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck, Archive, ArrowUpRight, AlertCircle, AlertTriangle, Info } from "lucide-react";

interface MobileNotification {
  id: string;
  type: "critical" | "warning" | "info" | "approval" | "compliance";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  deepLink?: string;
  actionLabel?: string;
}

interface MobileNotificationCenterProps {
  notifications: MobileNotification[];
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDeepLink: (url: string) => void;
  onAction: (id: string) => void;
  className?: string;
}

const typeIcons = {
  critical: <AlertCircle className="h-4 w-4 text-red-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  info: <Info className="h-4 w-4 text-blue-400" />,
  approval: <Bell className="h-4 w-4 text-gold" />,
  compliance: <CheckCheck className="h-4 w-4 text-emerald-400" />,
};

const typeBorders = {
  critical: "border-l-red-500/50",
  warning: "border-l-amber-500/50",
  info: "border-l-blue-500/50",
  approval: "border-l-gold/50",
  compliance: "border-l-emerald-500/50",
};

export function MobileNotificationCenter({
  notifications,
  onMarkRead,
  onArchive,
  onDeepLink,
  onAction,
  className,
}: MobileNotificationCenterProps) {
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={cn("flex flex-col", className)}>
      {unread > 0 && (
        <div className="flex items-center justify-between px-1 pb-2">
          <span className="text-[11px] text-zinc-500">{unread} unread</span>
          <button
            onClick={() => notifications.filter((n) => !n.isRead).forEach((n) => onMarkRead(n.id))}
            className="text-[11px] text-gold active:text-gold/60"
          >
            Mark all read
          </button>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "relative mb-2 rounded-xl border border-white/[0.06] border-l-4 pl-3 pr-3 py-3",
              typeBorders[n.type],
              !n.isRead && "bg-white/[0.02]",
            )}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">{typeIcons[n.type]}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-sm font-medium", n.isRead ? "text-zinc-400" : "text-zinc-200")}>
                    {n.title}
                  </span>
                  {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-gold" />}
                </div>
                <p className="mt-0.5 text-[12px] text-zinc-500">{n.message}</p>
                <span className="mt-1 block text-[10px] text-zinc-600">{n.timestamp}</span>

                <div className="mt-2 flex flex-wrap gap-2">
                  {n.actionLabel && (
                    <button
                      onClick={() => onAction(n.id)}
                      className="rounded-lg bg-gold/10 px-3 py-1.5 text-[11px] font-medium text-gold active:bg-gold/20"
                    >
                      {n.actionLabel}
                    </button>
                  )}
                  {n.deepLink && (
                    <button
                      onClick={() => onDeepLink(n.deepLink!)}
                      className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] text-zinc-400 active:bg-zinc-700"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      View
                    </button>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      className="rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] text-zinc-500 active:bg-zinc-700"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => onArchive(n.id)}
                    className="rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] text-zinc-500 active:bg-zinc-700"
                    aria-label="Archive"
                  >
                    <Archive className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12">
          <Bell className="h-8 w-8 text-zinc-700" />
          <p className="text-sm text-zinc-600">No notifications</p>
        </div>
      )}
    </div>
  );
}
