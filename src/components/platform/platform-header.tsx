"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, Calendar } from "lucide-react";
import { toast } from "sonner";
import { ExportButton } from "@/components/export/ExportButton";

const dateRangeOptions = ["Today", "Last 7 Days", "Last 30 Days", "Last 90 Days"];

export function PlatformHeader() {
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  const [dateRangeIdx, setDateRangeIdx] = useState(2);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const cycleDateRange = useCallback(() => {
    setDateRangeIdx((prev) => (prev + 1) % dateRangeOptions.length);
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Platform Health</h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 leading-relaxed">
          Monitor the health, availability, and operational status of enterprise platform services.
        </p>
        <p className="mt-2 text-xs text-zinc-600 font-mono">
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ExportButton type="platform" label="Export" size="sm" />
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { router.refresh(); toast.success("Platform health updated"); }}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => toast.info("PERIONYX v1.0.0 — 99.97% uptime — 8 services operational — 0 active incidents")}>
          <Info className="h-3.5 w-3.5" />
          System Info
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={cycleDateRange}>
          <Calendar className="h-3.5 w-3.5" />
          {dateRangeOptions[dateRangeIdx]}
        </Button>
      </div>
    </div>
  );
}