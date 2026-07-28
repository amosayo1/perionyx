"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Plus, X, ChevronLeft, ChevronRight, Clock,
  Users, FileText, GraduationCap, AlertTriangle,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  type: "engagement" | "deadline" | "review" | "meeting" | "training" | "filing";
  date: string;
  time?: string;
  description?: string;
}

const eventTypeConfig: Record<string, { color: string; bg: string; icon: typeof Calendar }> = {
  engagement: { color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30", icon: FileText },
  deadline: { color: "text-red-400", bg: "bg-red-500/20 border-red-500/30", icon: AlertTriangle },
  review: { color: "text-purple-400", bg: "bg-purple-500/20 border-purple-500/30", icon: Clock },
  meeting: { color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30", icon: Users },
  training: { color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30", icon: GraduationCap },
  filing: { color: "text-gold-500", bg: "bg-gold-500/20 border-gold-500/30", icon: FileText },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function AuditCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", type: "engagement" as CalendarEvent["type"], date: "", time: "", description: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/audit/calendar");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/audit/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewEvent({ title: "", type: "engagement", date: "", time: "", description: "" });
      }
    } catch {
      // silently fail
    }
  };

  const selectedDayEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Audit Calendar</h1>
          <p className="text-sm text-white/60 mt-1">Schedule and track audit engagements, deadlines, and reviews</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {Object.entries(eventTypeConfig).map(([type, config]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full border ${config.bg}`} />
            <span className="text-[10px] text-white/50 capitalize">{type}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else { setCurrentMonth(currentMonth - 1); } }} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-lg font-semibold text-white">{MONTHS[currentMonth]} {currentYear}</h2>
              <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else { setCurrentMonth(currentMonth + 1); } }} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs text-white/40 py-2">{day}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = getEventsForDay(day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square p-1 rounded-lg text-sm transition-colors relative ${
                      isSelected ? "bg-gold-500/20 border border-gold-500/30" :
                      isToday ? "bg-white/10 border border-white/20" :
                      "hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-xs ${isToday ? "text-gold-500 font-bold" : "text-white"}`}>{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <div key={idx} className={`w-1.5 h-1.5 rounded-full ${eventTypeConfig[e.type].color.replace("text-", "bg-")}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">
              {selectedDate ? `Events on ${selectedDate}` : "Upcoming Events"}
            </h3>
            <div className="space-y-2">
              {(selectedDate ? selectedDayEvents : events.slice(0, 5)).length === 0 && !loading ? (
                <div className="text-xs text-white/40 py-4">No events</div>
              ) : (
                (selectedDate ? selectedDayEvents : events.slice(0, 5)).map((event) => {
                  const config = eventTypeConfig[event.type];
                  const Icon = config.icon;
                  return (
                    <div key={event.id} className={`border rounded-lg p-3 ${config.bg}`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${config.color} shrink-0`} />
                        <div className="text-sm text-white font-medium truncate">{event.title}</div>
                      </div>
                      <div className="text-[10px] text-white/50 mt-1">{event.date} {event.time ? `at ${event.time}` : ""}</div>
                      {event.description && <div className="text-xs text-white/60 mt-1">{event.description}</div>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a24] border border-white/10 rounded-xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Add Event</h3>
                <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50" />
              <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent["type"] })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50">
                <option value="engagement">Engagement</option>
                <option value="deadline">Deadline</option>
                <option value="review">Review</option>
                <option value="meeting">Meeting</option>
                <option value="training">Training</option>
                <option value="filing">Filing</option>
              </select>
              <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50" />
              <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-gold-500/50" />
              <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Description (optional)" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50 h-20 resize-none" />
              <button onClick={handleCreate} className="w-full py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Add Event</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
