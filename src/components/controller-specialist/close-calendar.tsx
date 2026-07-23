"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

interface CalendarPeriod {
  id: string;
  name: string;
  period: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
  progress: number;
  startDate: string;
  endDate: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const statusDot: Record<string, string> = {
  NOT_STARTED: "bg-white/30",
  IN_PROGRESS: "bg-blue-400",
  COMPLETED: "bg-emerald-400",
  DELAYED: "bg-red-400",
};

const statusLabel: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DELAYED: "Delayed",
};

export function CloseCalendar() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [periods, setPeriods] = useState<CalendarPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/controller/close/calendar");
        if (res.ok) {
          const data = await res.json();
          setPeriods(data.periods ?? []);
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const displayPeriods = periods.length > 0 ? periods : [
    { id: "1", name: "Dec 2025 Month-End", period: "Dec 2025", status: "IN_PROGRESS" as const, progress: 68, startDate: "2026-01-02", endDate: "2026-01-08" },
    { id: "2", name: "Nov 2025 Month-End", period: "Nov 2025", status: "DELAYED" as const, progress: 85, startDate: "2025-12-01", endDate: "2025-12-12" },
    { id: "3", name: "Oct 2025 Month-End", period: "Oct 2025", status: "COMPLETED" as const, progress: 100, startDate: "2025-11-01", endDate: "2025-11-07" },
    { id: "4", name: "Q4 2025 Quarter-End", period: "Q4 2025", status: "NOT_STARTED" as const, progress: 0, startDate: "2026-01-05", endDate: "2026-01-15" },
    { id: "5", name: "Jan 2026 Month-End", period: "Jan 2026", status: "NOT_STARTED" as const, progress: 0, startDate: "2026-02-02", endDate: "2026-02-06" },
  ];

  const getPeriodsForMonth = (month: number) => {
    return displayPeriods.filter((p) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);
      return start <= monthEnd && end >= monthStart;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Close Calendar</h1>
          <p className="text-sm text-white/60 mt-1">Visual overview of close periods by month</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentYear((y) => y - 1)}
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-white font-medium text-lg w-16 text-center">{currentYear}</span>
          <button
            onClick={() => setCurrentYear((y) => y + 1)}
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        {Object.entries(statusLabel).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${statusDot[key]}`} />
            <span className="text-white/60">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MONTHS.map((month, i) => {
          const monthPeriods = getPeriodsForMonth(i);
          return (
            <motion.div
              key={month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[180px]"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{month}</h3>
                {monthPeriods.length > 0 && (
                  <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                    {monthPeriods.length} period{monthPeriods.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {monthPeriods.length === 0 ? (
                <div className="text-xs text-white/50 py-8 text-center">No close periods</div>
              ) : (
                <div className="space-y-2">
                  {monthPeriods.map((period) => (
                    <div
                      key={period.id}
                      className="bg-white/5 rounded-lg p-2.5 border border-white/5 hover:border-white/20 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-2 h-2 rounded-full ${statusDot[period.status]}`} />
                        <span className="text-xs text-white font-medium truncate">{period.name}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mb-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gold-500 transition-all"
                          style={{ width: `${period.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white/40">{period.progress}%</span>
                        <span className="text-[10px] text-white/40">
                          {period.startDate} → {period.endDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
