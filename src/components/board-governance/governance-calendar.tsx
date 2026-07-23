"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, ChevronLeft, ChevronRight, Clock, Users, AlertTriangle,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "board-meeting" | "committee-meeting" | "deadline" | "filing" | "review";
  time: string;
  duration: string;
}

export function GovernanceCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/board/calendar").then((r) => (r.ok ? r.json() : null));
        if (res) setEvents(res.events ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultEvents: CalendarEvent[] = [
    { id: "1", title: "Q2 Board Meeting", date: "2026-07-25", type: "board-meeting", time: "09:00", duration: "4h" },
    { id: "2", title: "Audit Committee", date: "2026-07-22", type: "committee-meeting", time: "14:00", duration: "2h" },
    { id: "3", title: "Risk Committee", date: "2026-07-28", type: "committee-meeting", time: "10:00", duration: "2h" },
    { id: "4", title: "Board Pack Distribution Deadline", date: "2026-07-23", type: "deadline", time: "17:00", duration: "—" },
    { id: "5", title: "SOX Compliance Filing", date: "2026-07-31", type: "filing", time: "23:59", duration: "—" },
    { id: "6", title: "Executive Committee", date: "2026-08-01", type: "committee-meeting", time: "11:00", duration: "1.5h" },
    { id: "7", title: "Annual Governance Review", date: "2026-08-15", type: "review", time: "09:00", duration: "3h" },
    { id: "8", title: "Compensation Committee", date: "2026-08-15", type: "committee-meeting", time: "14:00", duration: "2h" },
    { id: "9", title: "Board Self-Assessment Due", date: "2026-08-31", type: "deadline", time: "23:59", duration: "—" },
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return displayEvents.filter((e) => e.date === dateStr);
  };

  const typeColors: Record<string, string> = {
    "board-meeting": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "committee-meeting": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    deadline: "bg-red-500/20 text-red-400 border-red-500/30",
    filing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    review: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  const typeLabels: Record<string, string> = {
    "board-meeting": "Board", "committee-meeting": "Committee", deadline: "Deadline", filing: "Filing", review: "Review",
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const upcomingEvents = displayEvents.filter((e) => new Date(e.date) >= today).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Governance Calendar</h1>
          <p className="text-sm text-white/60 mt-1">Board meetings, deadlines, and governance events</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
               <button onClick={prevMonth} aria-label="Previous month" className="text-white/40 hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <h2 className="text-lg font-semibold text-white">{monthName}</h2>
               <button onClick={nextMonth} aria-label="Next month" className="text-white/40 hover:text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs text-white/40 py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

                return (
                  <div key={day} className={`aspect-square rounded-lg p-1 ${isToday ? "bg-gold-500/20 border border-gold-500/30" : "bg-white/5 border border-white/5 hover:bg-white/10"} transition-colors`}>
                    <div className={`text-xs ${isToday ? "text-gold-500 font-bold" : "text-white/60"}`}>{day}</div>
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div key={e.id} className={`text-[8px] px-1 py-0.5 rounded border truncate ${typeColors[e.type]}`}>
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && <div className="text-[8px] text-white/40">+{dayEvents.length - 2}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Upcoming Events</h3>
            <div className="space-y-2">
              {upcomingEvents.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[e.type]}`}>{typeLabels[e.type]}</span>
                  </div>
                  <div className="text-sm text-white">{e.title}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{e.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Legend</h3>
            <div className="space-y-2">
              {Object.entries(typeLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[key]}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
