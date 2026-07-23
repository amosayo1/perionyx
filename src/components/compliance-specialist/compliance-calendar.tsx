"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users,
  AlertTriangle, FileText, Award, ClipboardCheck, PresentationIcon,
} from "lucide-react";

interface Deadline {
  id: string;
  title: string;
  type: "filing" | "certification" | "review" | "assessment" | "board_meeting";
  date: string;
  time?: string;
  description: string;
  owner: string;
}

const typeColors: Record<string, string> = {
  filing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  certification: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  assessment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  board_meeting: "bg-gold-500/20 text-gold-500 border-gold-500/30",
};

const typeIcons: Record<string, typeof Calendar> = {
  filing: FileText,
  certification: Award,
  review: ClipboardCheck,
  assessment: AlertTriangle,
  board_meeting: Users,
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function ComplianceCalendar() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/compliance/calendar");
        if (res.ok) {
          const data = await res.json();
          setDeadlines(data.deadlines ?? []);
        }
      } catch {
        // defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
  };

  const getDeadlinesForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return deadlines.filter((d) => d.date === dateStr);
  };

  const selectedDeadlines = selectedDate
    ? deadlines.filter((d) => d.date === selectedDate)
    : [];

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Compliance Calendar</h1>
          <p className="text-sm text-white/60 mt-1">Track deadlines, filings, and regulatory dates</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Deadline
        </button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Add Deadline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 block mb-1">Title</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Deadline title" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Type</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                <option value="filing">Filing</option>
                <option value="certification">Certification</option>
                <option value="review">Review</option>
                <option value="assessment">Assessment</option>
                <option value="board_meeting">Board Meeting</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Date</label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Owner</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30" placeholder="Owner" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Time</label>
              <input type="time" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/50 block mb-1">Description</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 h-20" placeholder="Description" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400">Save</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm hover:bg-white/10">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-white/60" />
              </button>
              <h2 className="text-lg font-semibold text-white">{monthName} {currentYear}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs text-white/40 py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayDeadlines = getDeadlinesForDate(day);
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`relative p-2 rounded-lg text-sm text-center transition-colors ${
                      isSelected
                        ? "bg-gold-500/20 text-gold-500 border border-gold-500/30"
                        : isToday
                          ? "bg-white/10 text-white border border-white/20"
                          : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {day}
                    {dayDeadlines.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayDeadlines.slice(0, 3).map((d, j) => (
                          <div key={j} className="w-1 h-1 rounded-full bg-gold-500" />
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
          <h3 className="text-lg font-semibold text-white">
            {selectedDate ? `Deadlines for ${selectedDate}` : "Upcoming Deadlines"}
          </h3>
          <div className="space-y-2">
            {(selectedDate ? selectedDeadlines : deadlines.slice(0, 8)).map((deadline) => {
              const Icon = typeIcons[deadline.type] ?? Calendar;
              return (
                <div key={deadline.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-gold-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">{deadline.title}</div>
                      <div className="text-xs text-white/50 mt-0.5">{deadline.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[deadline.type]}`}>
                          {deadline.type.replace(/_/g, " ").toUpperCase()}
                        </span>
                        <span className="text-xs text-white/40">{deadline.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {!selectedDate && deadlines.length === 0 && !loading && (
              <div className="text-sm text-white/40 py-4">No upcoming deadlines</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
