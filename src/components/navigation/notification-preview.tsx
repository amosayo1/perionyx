"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck, ChevronRight, AlertTriangle, Info, CheckCircle2, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message?: string;
  type?: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

interface NotificationPreviewProps {
  maxPreview?: number;
  className?: string;
}

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  approval_requested: { icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10" },
  approval_granted: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  approval_rejected: { icon: X, color: "text-red-400", bg: "bg-red-500/10" },
  transaction_failed: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  sync_completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  alert: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
};

export const NotificationPreview = memo(function NotificationPreview({
  maxPreview = 5,
  className,
}: NotificationPreviewProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [data, countRes] = await Promise.all([
          fetch("/api/v1/notifications?limit=10&unreadOnly=true"),
          fetch("/api/v1/notifications?count=true"),
        ]);
        if (data.ok) {
          const json = await data.json();
          setNotifications(Array.isArray(json) ? json : json.items ?? []);
        }
        if (countRes.ok) {
          const json = await countRes.json();
          setUnreadCount(typeof json === "number" ? json : json.count ?? 0);
        }
      } catch { /* ignore */ }
    };
    void fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const display = notifications.slice(0, maxPreview);
  const criticalCount = notifications.filter((n) => n.type === "approval_requested" || n.type === "transaction_failed").length;

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/60 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            role="button"
            tabIndex={-1}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(false); }}
            aria-label="Close notifications"
          />
          <div className="absolute right-0 top-10 z-50 w-80 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-zinc-200">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-gold-500/10 px-1.5 py-0.5 text-[10px] text-gold">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button className="text-[10px] text-zinc-500 hover:text-zinc-300" aria-label="Mark all as read" onClick={() => setUnreadCount(0)}>
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                )}
                <button className="text-[10px] text-zinc-500 hover:text-zinc-300" onClick={() => setOpen(false)} aria-label="Close notifications">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {criticalCount > 0 && (
              <div className="border-b border-zinc-800/60 bg-red-500/5 px-4 py-2">
                <p className="text-[11px] text-red-400">{criticalCount} require attention</p>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto">
              {display.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                    <CheckCircle2 className="h-5 w-5 text-zinc-600" />
                  </div>
                  <p className="text-[12px] text-zinc-500">All caught up</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/40">
                  {display.map((n) => {
                    const tc = n.type ? typeConfig[n.type] : undefined;
                    const Icon = tc?.icon ?? Bell;
                    return (
                      <Link
                        key={n.id}
                        href={n.href ?? "/notifications"}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-zinc-800/30",
                          !n.read && "bg-gold-500/[0.02]",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", tc?.bg ?? "bg-zinc-800")}>
                          <Icon className={cn("h-3.5 w-3.5", tc?.color ?? "text-zinc-400")} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn("truncate text-[12px]", n.read ? "text-zinc-400" : "text-zinc-200 font-medium")}>
                            {n.title}
                          </p>
                          {n.message && (
                            <p className="mt-0.5 line-clamp-2 text-[11px] text-zinc-500">{n.message}</p>
                          )}
                          <p className="mt-1 text-[10px] text-zinc-600">
                            {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 h-3 w-3 shrink-0 text-zinc-600" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/notifications"
              className="flex items-center justify-center gap-1 border-t border-zinc-800 px-4 py-2.5 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
              onClick={() => setOpen(false)}
            >
              View all notifications
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
});
