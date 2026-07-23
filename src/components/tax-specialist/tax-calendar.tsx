"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Clock, AlertTriangle,
  CheckCircle, FileText, CreditCard, Scale, Search,
} from "lucide-react";

interface CalendarDeadline {
  id: string;
  name: string;
  dueDate: string;
  type: "filing" | "payment" | "assessment" | "audit" | "appeal";
  jurisdiction: string;
  status: "upcoming" | "overdue" | "completed";
  priority: "high" | "medium" | "low";
}

const typeIcons: Record<string, typeof FileText> = {
  filing: FileText,
  payment: CreditCard,
  assessment: Scale,
  audit: Search,
  appeal: AlertTriangle,
};

const typeColors: Record<string, string> = {
  filing: "text-blue-400",
  payment: "text-emerald-400",
  assessment: "text-purple-400",
  audit: "text-amber-400",
  appeal: "text-red-400",
};

export function TaxCalendar() {
  const [deadlines, setDeadlines] = useState<CalendarDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/tax/calendar/deadlines").then((r) => (r.ok ? r.json() : null));
        if (res) setDeadlines(res.deadlines ?? []);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const defaultDeadlines: CalendarDeadline[] = [
    { id: "1", name: "US Federal Corporate Return", dueDate: "2026-04-15", type: "filing", jurisdiction: "US-Federal", status: "completed", priority: "high" },
    { id: "2", name: "UK VAT Q1 Return", dueDate: "2026-07-31", type: "filing", jurisdiction: "UK", status: "upcoming", priority: "high" },
    { id: "3", name: "Germany Trade Tax Payment", dueDate: "2026-08-15", type: "payment", jurisdiction: "DE", status: "upcoming", priority: "medium" },
    { id: "4", name: "Singapore GST F5", dueDate: "2026-07-20", type: "filing", jurisdiction: "SG", status: "overdue", priority: "high" },
    { id: "5", name: "Transfer Pricing Documentation", dueDate: "2026-12-31", type: "assessment", jurisdiction: "Multi", status: "upcoming", priority: "medium" },
    { id: "6", name: "US Federal Estimated Tax Q3", dueDate: "2026-09-15", type: "payment", jurisdiction: "US-Federal", status: "upcoming", priority: "high" },
    { id: "7", name: "Australia GST BAS", dueDate: "2026-07-28", type: "filing", jurisdiction: "AU", status: "upcoming", priority: "medium" },
    { id: "8", name: "UK Corporation Tax Payment", dueDate: "2026-01-01", type: "payment", jurisdiction: "UK", status: "completed", priority: "high" },
    { id: "9", name: "Tax Audit - DE GmbH", dueDate: "2026-10-15", type: "audit", jurisdiction: "DE", status: "upcoming", priority: "medium" },
    { id: "10", name: "Appeal Deadline - SG Assessment", dueDate: "2026-08-30", type: "appeal", jurisdiction: "SG", status: "upcoming", priority: "high" },
  ];

  const items = deadlines.length > 0 ? deadlines : defaultDeadlines;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const getDeadlinesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return items.filter((d) => d.dueDate === dateStr);
  };

  const overdue = items.filter((d) => d.status === "overdue");
  const upcoming = items.filter((d) => d.status === "upcoming").sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "overdue": return "text-red-400 bg-red-500/20 border-red-500/30";
      default: return "text-amber-400 bg-amber-500/20 border-amber-500/30";
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case "high": return "border-l-red-400";
      case "medium": return "border-l-amber-400";
      default: return "border-l-white/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tax Calendar</h1>
          <p className="text-sm text-white/60 mt-1">Filing deadlines, payment due dates, and compliance obligations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Deadline
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Add Deadline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Name</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-gold-500" placeholder="Deadline name" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Due Date</label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Type</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500">
                <option value="filing">Filing</option>
                <option value="payment">Payment</option>
                <option value="assessment">Assessment</option>
                <option value="audit">Audit</option>
                <option value="appeal">Appeal</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Jurisdiction</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-gold-500" placeholder="US-Federal" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Priority</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 bg-gold-500 text-black rounded-lg text-sm font-medium hover:bg-gold-400 transition-colors">Save Deadline</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4 text-white/60" />
              </button>
              <h3 className="text-sm font-semibold text-white">{monthName}</h3>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs text-white/40 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayDeadlines = getDeadlinesForDay(day);
                const today = new Date();
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                return (
                  <div
                    key={day}
                    className={`min-h-[2.5rem] p-1 rounded-lg text-xs ${
                      isToday ? "bg-gold-500/20 border border-gold-500/40" :
                      dayDeadlines.length > 0 ? "bg-white/5" : ""
                    }`}
                  >
                    <div className={`text-right ${isToday ? "text-gold-500 font-bold" : "text-white/50"}`}>{day}</div>
                    {dayDeadlines.map((d) => (
                      <div key={d.id} className={`w-full h-1 rounded-full mt-0.5 ${
                        d.status === "overdue" ? "bg-red-400" :
                        d.status === "completed" ? "bg-emerald-400" : "bg-amber-400"
                      }`} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {overdue.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Overdue ({overdue.length})
              </h3>
              <div className="space-y-2">
                {overdue.map((d) => {
                  const Icon = typeIcons[d.type] || FileText;
                  return (
                    <div key={d.id} className={`bg-white/5 rounded-lg p-3 border-l-2 ${priorityColor(d.priority)}`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${typeColors[d.type]}`} />
                        <span className="text-xs text-white">{d.name}</span>
                      </div>
                      <div className="text-[10px] text-white/40 mt-1">{d.jurisdiction} &middot; {d.dueDate}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-500" />
              Upcoming ({upcoming.length})
            </h3>
            <div className="space-y-2">
              {upcoming.slice(0, 8).map((d) => {
                const Icon = typeIcons[d.type] || FileText;
                return (
                  <div key={d.id} className={`bg-white/5 rounded-lg p-3 border-l-2 ${priorityColor(d.priority)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${typeColors[d.type]}`} />
                        <span className="text-xs text-white">{d.name}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusColor(d.status)}`}>
                        {d.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/40 mt-1">{d.jurisdiction} &middot; {d.dueDate}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
