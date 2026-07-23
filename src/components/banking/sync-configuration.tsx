"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";
import { RefreshCw, Clock, Calendar, History, Zap, Check } from "lucide-react";
import type { SyncConfig } from "./types";

interface SyncConfigurationProps {
  config: SyncConfig;
  onChange: (config: SyncConfig) => void;
  onContinue: () => void;
  className?: string;
}

const SYNC_MODES = [
  { value: "manual" as const, label: "Manual", description: "Sync only when you manually trigger it", icon: RefreshCw },
  { value: "hourly" as const, label: "Hourly", description: "Sync every hour", icon: Clock },
  { value: "daily" as const, label: "Daily", description: "Sync once per day (recommended)", icon: Calendar },
  { value: "realtime" as const, label: "Real-time", description: "Continuous sync via webhooks", icon: Zap },
];

const HISTORICAL_OPTIONS = [
  { value: "30days" as const, label: "30 Days", description: "Import last 30 days of transactions" },
  { value: "90days" as const, label: "90 Days", description: "Import last 90 days (recommended)" },
  { value: "1year" as const, label: "1 Year", description: "Import the last year" },
  { value: "all" as const, label: "All Available", description: "Import all historical data available" },
];

export const SyncConfiguration = memo(function SyncConfiguration({
  config,
  onChange,
  onContinue,
  className,
}: SyncConfigurationProps) {
  return (
    <div className={cn("space-y-6", className)} role="group" aria-label="Sync configuration">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-5 w-5 text-gold" aria-hidden="true" />
        <h2 className="text-lg font-medium text-white/[0.87]">Sync Configuration</h2>
      </div>
      <p className="text-sm text-white/[0.5]">Configure how often your banking data syncs and how much historical data to import.</p>

      <div>
        <h3 className="mb-3 text-sm font-medium text-white/[0.7]">Sync Frequency</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {SYNC_MODES.map((mode) => {
            const isSelected = config.mode === mode.value;
            const Icon = mode.icon;
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => onChange({ ...config, mode: mode.value })}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 text-left transition-all",
                  isSelected
                    ? "border-gold bg-gold/[0.05]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]",
                )}
                aria-pressed={isSelected}
              >
                <Icon className={cn(
                  "h-5 w-5 shrink-0 mt-0.5",
                  isSelected ? "text-gold" : "text-white/[0.4]",
                )} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", isSelected ? "text-gold" : "text-white/[0.87]")}>
                      {mode.label}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-gold" aria-hidden="true" />}
                  </div>
                  <p className="mt-0.5 text-xs text-white/[0.5]">{mode.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-white/[0.4]" aria-hidden="true" />
          <h3 className="text-sm font-medium text-white/[0.7]">Historical Import</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {HISTORICAL_OPTIONS.map((opt) => {
            const isSelected = config.historicalImport === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...config, historicalImport: opt.value })}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                  isSelected
                    ? "border-gold bg-gold/[0.05]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]",
                )}
                aria-pressed={isSelected}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md",
                  isSelected ? "bg-gold/10" : "bg-white/[0.04]",
                )}>
                  <span className={cn("text-xs font-medium", isSelected ? "text-gold" : "text-white/[0.4]")}>
                    {opt.label.split(" ")[0]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className={cn("text-sm", isSelected ? "text-gold font-medium" : "text-white/[0.87]")}>
                    {opt.label}
                  </span>
                  <p className="mt-0.5 text-xs text-white/[0.5]">{opt.description}</p>
                </div>
                {isSelected && <Check className="h-4 w-4 text-gold shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end border-t border-white/[0.06] pt-4">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Continue
        </button>
      </div>
    </div>
  );
});
