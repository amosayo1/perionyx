"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ExportButton } from "@/components/export/ExportButton";

const dateRangeOptions = [
  { label: "This Month", months: 0 },
  { label: "Last Month", months: -1 },
  { label: "This Quarter", months: -3 },
  { label: "This Year", months: -12 },
] as const;

export function ExecutiveHeader() {
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  const [dateRangeIdx, setDateRangeIdx] = useState(0);
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const range = dateRangeOptions[dateRangeIdx];
  const periodStart = new Date(now.getFullYear(), now.getMonth() + range.months, 1);
  const periodEnd = now;

  const periodStr = `${periodStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })} – ${periodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

  const cycleDateRange = useCallback(() => {
    setDateRangeIdx((prev) => (prev + 1) % dateRangeOptions.length);
  }, []);

  const toggleSchedule = useCallback(() => {
    setScheduled((prev) => {
      const next = !prev;
      toast.success(next ? "Weekly report scheduled for Monday 9:00 AM" : "Schedule cancelled");
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Executive Insights
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 leading-relaxed">
          Enterprise financial intelligence and strategic treasury performance.
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
          <Calendar className="h-3.5 w-3.5" />
          <span>{periodStr}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ExportButton type="insights" label="Export" size="sm" />

        <button
          type="button"
          onClick={cycleDateRange}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-transparent px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-white/[0.04] active:scale-[0.97]"
        >
          <Calendar className="h-3.5 w-3.5" />
          {range.label}
        </button>

        <button
          type="button"
          onClick={toggleSchedule}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.97] ${
            scheduled
              ? "border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]"
              : "border-white/[0.06] bg-transparent text-zinc-300 hover:bg-white/[0.04]"
          }`}
        >
          {scheduled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          {scheduled ? "Scheduled" : "Schedule"}
        </button>

        <button
          type="button"
          onClick={() => { router.refresh(); toast.success("Insights refreshed"); }}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-transparent px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-white/[0.04] active:scale-[0.97]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>
    </div>
  );
}