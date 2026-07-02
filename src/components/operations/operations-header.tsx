"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Command } from "lucide-react";
import { toast } from "sonner";
import { ExportButton } from "@/components/export/ExportButton";

export function OperationsHeader() {
  const router = useRouter();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Operations Center
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 leading-relaxed">
          Monitor operational health, identify bottlenecks, resolve exceptions, and keep
          enterprise money moving safely.
        </p>
        <p className="mt-2 text-xs text-zinc-600 font-mono">
          {dateStr} — {timeStr}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ExportButton type="operations" label="Export" size="sm" />
        <button
          type="button"
          onClick={() => { router.refresh(); toast.success("Operations data refreshed"); }}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-transparent px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-white/[0.04] active:scale-[0.97]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
        <button
          type="button"
          onClick={() => toast.info("Command palette: press ⌘K to search")}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-transparent px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-white/[0.04] active:scale-[0.97]"
        >
          <Command className="h-3.5 w-3.5" />
          <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-[10px] text-zinc-400">
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  );
}