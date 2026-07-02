"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/format";

type NotificationRow = {
  id: string;
  eventType: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const [notifRes, countRes] = await Promise.all([
        fetch("/api/v1/notifications?limit=10&unreadOnly=true", { credentials: "include", signal }),
        fetch("/api/v1/notifications?count=true", { credentials: "include", signal }),
      ]);
      if (signal?.aborted) return;
      const notifData = (await notifRes.json()) as { items: NotificationRow[] };
      const countData = (await countRes.json()) as { count: number };
      setItems(notifData.items ?? []);
      setUnreadCount(countData.count ?? 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  // Refresh when dropdown opens
  useEffect(() => {
    if (open) {
      const ac = new AbortController();
      startTransition(() => void load(ac.signal));
      return () => ac.abort();
    }
  }, [open, load]);

  const handleMarkRead = useCallback(async (id: string) => {
    await fetch("/api/v1/notifications", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await fetch("/api/v1/notifications", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setItems([]);
    setUnreadCount(0);
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3 text-perionyx-text-muted hover:text-perionyx-text-primary"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-perionyx-gold text-[9px] font-bold text-black">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-[rgba(10,10,10,0.98)] border border-[rgba(255,255,255,0.08)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <span className="text-xs uppercase tracking-[0.32em] text-perionyx-text-subtle">Notifications</span>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={() => void handleMarkAllRead()}
                className="text-[10px] text-perionyx-gold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[320px]">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-perionyx-text-muted">
              No notifications yet
            </div>
          ) : (
            items.slice(0, 10).map((n) => (
              <div key={n.id} className="group relative border-b border-[rgba(255,255,255,0.04)] last:border-0">
                <DropdownMenuItem
                  className="flex flex-col items-start gap-1 px-4 py-3"
                  onClick={() => {
                    if (!n.read) void handleMarkRead(n.id);
                  }}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-medium text-perionyx-text-primary">{n.title}</span>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-perionyx-gold" />
                    )}
                  </div>
                  {n.message && (
                    <span className="line-clamp-2 text-xs text-perionyx-text-muted">{n.message}</span>
                  )}
                  <span className="text-[10px] text-perionyx-text-subtle">{formatDateTime(n.createdAt)}</span>
                </DropdownMenuItem>
              </div>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center">
          <Link href="/notifications" className="flex items-center gap-2 text-xs text-perionyx-gold">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
