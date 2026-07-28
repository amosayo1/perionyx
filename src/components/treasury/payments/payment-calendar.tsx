"use client";

import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { MOCK_CALENDAR_EVENTS } from "./data";
import type { CalendarEvent } from "./types";
import {
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
} from "lucide-react";

type ViewMode = "today" | "week" | "month" | "upcoming";

const EVENT_TYPE_COLORS: Record<CalendarEvent["type"], string> = {
  large_payment: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  payroll: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  tax: "bg-red-500/10 text-red-400 border-red-500/20",
  debt: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  treasury: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  intercompany: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  recurring: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  settlement: "bg-green-500/10 text-green-400 border-green-500/20",
};

const PRIORITY_COLORS: Record<CalendarEvent["priority"], string> = {
  urgent: "text-red-400",
  high: "text-amber-400",
  normal: "text-zinc-400",
  low: "text-zinc-600",
};

const STATUS_COLORS: Record<CalendarEvent["status"], string> = {
  draft: "text-zinc-500 bg-zinc-500/10",
  pending_approval: "text-amber-400 bg-amber-500/10",
  approved: "text-blue-400 bg-blue-500/10",
  queued: "text-purple-400 bg-purple-500/10",
  processing: "text-cyan-400 bg-cyan-500/10",
  settled: "text-emerald-400 bg-emerald-500/10",
  failed: "text-red-400 bg-red-500/10",
  cancelled: "text-zinc-600 bg-zinc-500/10",
};

function formatCurrency(value: number): string {
  return `$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateHeader(date: Date): string {
  const today = new Date(2026, 5, 15);
  const tomorrow = new Date(2026, 5, 16);
  const yesterday = new Date(2026, 5, 14);
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getDayEvents(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter(
    (e) => new Date(e.date).toDateString() === date.toDateString(),
  );
}

function groupEventsByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = new Date(event.date).toDateString();
    const existing = map.get(key);
    if (existing) existing.push(event);
    else map.set(key, [event]);
  }
  return map;
}

const VIEW_OPTIONS: { key: ViewMode; label: string; icon: typeof List }[] = [
  { key: "today", label: "Today", icon: Clock },
  { key: "week", label: "Week", icon: List },
  { key: "month", label: "Month", icon: CalendarDays },
  { key: "upcoming", label: "Upcoming", icon: AlertCircle },
];

export function PaymentCalendar({ className }: { className?: string }) {
  const [view, setView] = useState<ViewMode>("today");
  const [offset, setOffset] = useState(0);

  const referenceDate = useMemo(() => {
    const d = new Date(2026, 5, 15);
    if (view === "today") {
      d.setDate(d.getDate() + offset);
    } else if (view === "week") {
      d.setDate(d.getDate() + offset * 7);
    } else if (view === "month") {
      d.setMonth(d.getMonth() + offset);
    }
    return d;
  }, [view, offset]);

  const visibleEvents = useMemo(() => {
    if (view === "today") {
      return getDayEvents(MOCK_CALENDAR_EVENTS, referenceDate);
    }
    if (view === "week") {
      const start = new Date(referenceDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return MOCK_CALENDAR_EVENTS.filter((e) => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    }
    if (view === "month") {
      const year = referenceDate.getFullYear();
      const month = referenceDate.getMonth();
      return MOCK_CALENDAR_EVENTS.filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      });
    }
    return MOCK_CALENDAR_EVENTS.filter((e) => {
      const d = new Date(e.date);
      const today = new Date(2026, 5, 15);
      return d >= today;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [view, referenceDate]);

  const grouped = useMemo(() => groupEventsByDay(visibleEvents), [visibleEvents]);
  const sortedDays = useMemo(
    () =>
      Array.from(grouped.entries()).sort(
        (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
      ),
    [grouped],
  );

  const totalAmount = visibleEvents.reduce((s, e) => s + e.amount, 0);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-gold" />
          <h3 className="text-sm font-semibold text-white">Payment Calendar</h3>
          <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
            {visibleEvents.length} events
          </span>
          <span className="text-[11px] text-zinc-500">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {view !== "upcoming" && (
            <button
              onClick={() => setOffset((o) => o - 1)}
              className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <span className="min-w-[80px] text-center text-xs text-zinc-400">
            {view === "today"
              ? referenceDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : view === "month"
                ? referenceDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : view === "week"
                  ? `Week of ${referenceDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                  : ""}
          </span>
          {view !== "upcoming" && (
            <button
              onClick={() => setOffset((o) => o + 1)}
              className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div className="ml-2 flex rounded-lg border border-white/[0.06] bg-zinc-900 p-0.5">
            {VIEW_OPTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setView(key);
                  setOffset(0);
                }}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  view === key
                    ? "bg-gold/20 text-gold"
                    : "text-zinc-400 hover:text-white",
                )}
                aria-pressed={view === key}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {sortedDays.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-zinc-600">
            <CalendarDays className="h-8 w-8" />
            <p className="text-sm">No events for this period</p>
          </div>
        ) : (
          sortedDays.map(([dayKey, events]) => {
            const date = new Date(dayKey);
            const isToday = date.toDateString() === new Date(2026, 5, 15).toDateString();
            return (
              <div key={dayKey} className="border-b border-white/[0.06] last:border-b-0">
                <div
                  className={cn(
                    "sticky top-0 flex items-center gap-2 bg-zinc-900/95 px-5 py-2 backdrop-blur-sm",
                    isToday && "border-y border-gold/20",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isToday ? "text-gold" : "text-zinc-400",
                    )}
                  >
                    {formatDateHeader(date)}
                  </span>
                  <span className="text-[11px] text-zinc-600">
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {isToday && (
                    <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10px] text-gold">
                      Today
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-zinc-600">{events.length} events</span>
                </div>

                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold",
                          EVENT_TYPE_COLORS[event.type],
                        )}
                        title={event.type.replace("_", " ")}
                      >
                        {event.amount > 1000000
                          ? "H"
                          : event.amount > 100000
                            ? "M"
                            : event.amount > 10000
                              ? "L"
                              : "S"}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-zinc-200">
                          {event.label}
                        </span>
                        <span
                          className={cn(
                            "rounded border px-1.5 py-0.5 text-[10px] font-medium",
                            EVENT_TYPE_COLORS[event.type],
                          )}
                        >
                          {event.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                        <span>{event.entity}</span>
                        <span>{event.currency}</span>
                        <span className={PRIORITY_COLORS[event.priority]}>
                          {event.priority}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">
                        {formatCurrency(event.amount)}
                      </div>
                      <span
                        className={cn(
                          "inline-block rounded px-1.5 py-0.5 text-[10px] font-medium capitalize",
                          STATUS_COLORS[event.status],
                        )}
                      >
                        {event.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
