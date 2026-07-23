"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDateTime } from "@/lib/format";
import { Check, CheckCheck, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

type NotificationRow = {
  id: string;
  eventType: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

function NotificationItem({ n, onMarkRead }: { n: NotificationRow; onMarkRead: (id: string) => void }) {
  return (
    <div
      className={`flex items-start gap-4 border-b border-[rgba(255,255,255,0.04)] p-4 transition ${
        !n.read ? "bg-[rgba(212,175,55,0.03)]" : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-perionyx-gold" />}
          <h3 className={`text-sm ${n.read ? "text-perionyx-text-muted" : "font-medium text-perionyx-text-primary"}`}>
            {n.link ? (
              <Link href={n.link} className="hover:text-perionyx-gold">{n.title}</Link>
            ) : (
              n.title
            )}
          </h3>
        </div>
        {n.message && (
          <p className={`mt-1 text-xs ${n.read ? "text-perionyx-text-subtle" : "text-perionyx-text-muted"}`}>
            {n.message}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] text-perionyx-text-subtle">{formatDateTime(n.createdAt)}</span>
          <Badge variant="outline" className="text-[9px]">{n.eventType.replace(/_/g, " ")}</Badge>
        </div>
      </div>
      {!n.read && (
        <button
          onClick={() => onMarkRead(n.id)}
          className="shrink-0 rounded-full p-1.5 text-perionyx-text-muted hover:bg-[rgba(212,175,55,0.1)] hover:text-perionyx-gold"
          title="Mark as read"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadFilter, setUnreadFilter] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (signal?: AbortSignal, cursorVal?: string | null, unreadOnly?: boolean) => {
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (cursorVal) params.set("cursor", cursorVal);
      if (unreadOnly) params.set("unreadOnly", "true");
      const res = await fetch(`/api/v1/notifications?${params}`, { credentials: "include", signal });
      if (signal?.aborted) return null;
      if (!res.ok) return { items: [], nextCursor: undefined };
      return (await res.json()) as { items: NotificationRow[]; nextCursor?: string };
    } catch {
      return { items: [], nextCursor: undefined };
    }
  }, []);

  const fetchInitial = useCallback(async (signal?: AbortSignal, unreadOnly = false) => {
    setLoading(true);
    const result = await load(signal, undefined, unreadOnly);
    if (!signal?.aborted) {
      setItems(result?.items ?? []);
      setCursor(result?.nextCursor ?? null);
      setHasMore(!!result?.nextCursor);
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void fetchInitial(ac.signal, unreadFilter));
    return () => ac.abort();
  }, [fetchInitial, unreadFilter]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoadingMore(true);
          const ac = new AbortController();
          void load(ac.signal, cursor, unreadFilter).then((result) => {
            if (!ac.signal.aborted) {
              setItems((prev) => [...prev, ...(result?.items ?? [])]);
              setCursor(result?.nextCursor ?? null);
              setHasMore(!!result?.nextCursor);
              setLoadingMore(false);
            }
          });
        }
      },
      { threshold: 0.1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [cursor, hasMore, loading, loadingMore, load, unreadFilter]);

  const handleMarkRead = useCallback(async (id: string) => {
    await fetch("/api/v1/notifications", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await fetch("/api/v1/notifications", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Notifications</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">All system notifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={unreadFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setUnreadFilter(!unreadFilter)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {unreadFilter ? "Unread only" : "All"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void handleMarkAllRead()} className="gap-2">
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>
      </div>

      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">
            {unreadFilter ? "Unread" : "All notifications"}
          </CardTitle>
          <CardDescription className="text-perionyx-text-muted">
            {items.length} notification{items.length !== 1 ? "s" : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No notifications" description={unreadFilter ? "All caught up!" : "No notifications yet."} />
            </div>
          ) : (
            <div>
              {items.map((n) => (
                <NotificationItem key={n.id} n={n} onMarkRead={handleMarkRead} />
              ))}
              {hasMore && (
                <div ref={loaderRef} className="flex justify-center p-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
