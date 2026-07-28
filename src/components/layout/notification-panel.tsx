"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
  type?: string;
  href?: string;
}

interface NotificationPanelProps {
  maxVisible?: number;
  className?: string;
}

export function NotificationPanel({ maxVisible = 5, className }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/v1/notifications?limit=10", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const items: Notification[] = (data?.items ?? data ?? []).map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          read: n.read ?? false,
          createdAt: n.createdAt,
          type: n.type,
          href: n.href,
        }));
        setNotifications(items);
        setUnreadCount(items.filter((n: Notification) => !n.read).length);
      })
      .catch(() => {});
  }, [open]);

  const markAllRead = () => {
    fetch("/api/v1/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    }).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative h-9 w-9 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04]", className)}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-black">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-[rgba(10,10,10,0.98)] border border-white/[0.08] shadow-xl">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] text-gold hover:text-gold/80">
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-zinc-600">No notifications yet</p>
          ) : (
            notifications.slice(0, maxVisible).map((n) => (
              <DropdownMenuItem key={n.id} asChild className="px-0 py-0">
                <Link
                  href={n.href ?? "/notifications"}
                  className={cn(
                    "flex flex-col gap-0.5 px-4 py-3 text-sm transition-colors hover:bg-white/[0.04]",
                    !n.read && "bg-gold/[0.02] border-l-2 border-l-gold",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm", !n.read ? "text-white font-medium" : "text-zinc-400")}>
                      {n.title}
                    </span>
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />}
                  </div>
                  {n.message && <span className="text-xs text-zinc-500 line-clamp-2">{n.message}</span>}
                  <span className="text-[10px] text-zinc-700">
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="flex items-center justify-center gap-1 text-xs text-zinc-400 py-2">
            <ExternalLink className="h-3 w-3" />
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
