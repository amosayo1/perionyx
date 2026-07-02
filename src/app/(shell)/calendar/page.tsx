"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDateTime } from "@/lib/format";
import { Sparkles, CalendarDays, Clock, FileCheck, RefreshCcw, Shield } from "lucide-react";
import { ExportButton } from "@/components/export/ExportButton";

type CalendarEvent = {
  id: string;
  title: string;
  type: "APPROVAL" | "RECONCILIATION" | "SETTLEMENT" | "AUDIT";
  date: string;
  description: string | null;
  status: string;
};

const typeConfig: Record<string, { label: string; icon: typeof CalendarDays; color: string }> = {
  APPROVAL: { label: "Approval Deadlines", icon: Clock, color: "text-perionyx-gold" },
  RECONCILIATION: { label: "Reconciliations", icon: RefreshCcw, color: "text-blue-400" },
  SETTLEMENT: { label: "Settlements", icon: FileCheck, color: "text-green-400" },
  AUDIT: { label: "Audits", icon: Shield, color: "text-purple-400" },
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/calendar", { credentials: "include", signal });
      if (signal?.aborted) return;
      const body = (await res.json()) as { items: CalendarEvent[] };
      setEvents(Array.isArray(body.items) ? body.items : []);
    } catch {
      // handled by empty state
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    startTransition(() => void load(ac.signal));
    return () => ac.abort();
  }, [load]);

  const generateEvents = useCallback(async () => {
    setGenerating(true);
    try {
      await fetch("/api/v1/calendar/generate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const ac = new AbortController();
      await load(ac.signal);
    } finally {
      setGenerating(false);
    }
  }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.type) ?? [];
      list.push(e);
      map.set(e.type, list);
    }
    return map;
  }, [events]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Calendar</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-perionyx-text-primary">Calendar</h1>
          <p className="mt-1 text-sm text-perionyx-text-muted">
            Upcoming events and deadlines ({events.length} events).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton type="calendar" />
          <Button onClick={() => void generateEvents()} disabled={generating}>
            <Sparkles className="mr-2 h-4 w-4" />
            {generating ? "Generating..." : "Auto-generate Events"}
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
          <CardContent className="p-6">
            <EmptyState
              title="No upcoming events"
              description="Generate events to populate the calendar."
              action={
                <Button size="sm" onClick={() => void generateEvents()}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Events
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {(["APPROVAL", "RECONCILIATION", "SETTLEMENT", "AUDIT"] as const).map((type) => {
            const cfg = typeConfig[type];
            const Icon = cfg.icon;
            const typeEvents = grouped.get(type) ?? [];
            if (typeEvents.length === 0) return null;

            return (
              <Card
                key={type}
                className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-medium text-perionyx-text-primary">
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                    {cfg.label}
                  </CardTitle>
                  <CardDescription className="text-perionyx-text-muted">
                    {typeEvents.length} event{typeEvents.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0 pb-3">
                  {typeEvents
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 10)
                    .map((e) => (
                      <div
                        key={e.id}
                        className="mx-3 rounded-lg border border-[rgba(212,175,55,0.12)] bg-perionyx-bg-surface px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-perionyx-text-primary truncate">{e.title}</div>
                            {e.description && (
                              <div className="text-xs text-perionyx-text-muted truncate">{e.description}</div>
                            )}
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {formatDateTime(e.date)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
