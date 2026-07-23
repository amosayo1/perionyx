"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";
import { Check, Building2, Activity, Clock, Calendar, Shield } from "lucide-react";
import type { BankProvider, BankInstitution, SyncConfig } from "./types";

interface ConnectionCompleteProps {
  provider: BankProvider;
  institution: BankInstitution;
  syncConfig: SyncConfig;
  onFinish: () => void;
  className?: string;
}

export const ConnectionComplete = memo(function ConnectionComplete({
  provider,
  institution,
  syncConfig,
  onFinish,
  className,
}: ConnectionCompleteProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="h-10 w-10 text-emerald-400" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-medium text-white/[0.87]">Connection Complete</h2>
        <p className="text-sm text-white/[0.5] max-w-sm">
          Your bank connection has been successfully configured and is now active.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-xs text-white/[0.4] uppercase tracking-wider mb-2">
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Connection</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] text-sm font-bold text-white/[0.3]">
              {institution.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white/[0.87]">{institution.name}</p>
              <p className="text-xs text-white/[0.5]">via {provider.name}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-xs text-white/[0.4] uppercase tracking-wider mb-2">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Health</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Activity className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/[0.87]">Excellent</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">97%</span>
              </div>
              <p className="text-xs text-white/[0.5]">All systems operational</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-xs text-white/[0.4] uppercase tracking-wider mb-2">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Last Sync</span>
          </div>
          <p className="text-sm font-medium text-white/[0.87]">Just now</p>
          <p className="text-xs text-white/[0.5]">Initial sync completed</p>
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-xs text-white/[0.4] uppercase tracking-wider mb-2">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Next Sync</span>
          </div>
          <p className="text-sm font-medium text-white/[0.87]">
            {syncConfig.mode === "realtime" ? "Continuous" : syncConfig.mode === "hourly" ? "In ~1 hour" : "In ~24 hours"}
          </p>
          <p className="text-xs text-white/[0.5]">
            {syncConfig.mode === "daily" ? "Daily sync scheduled" : `${syncConfig.mode} mode`}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gold/[0.15] bg-gold/[0.03] p-3">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-gold shrink-0" aria-hidden="true" />
          <span className="text-white/[0.7]">
            Capabilities enabled: Balances, Transactions, Account Discovery, Statements
          </span>
        </div>
      </div>

      <div className="flex justify-center border-t border-white/[0.06] pt-6">
        <button
          type="button"
          onClick={onFinish}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Go to Connection Dashboard
        </button>
      </div>
    </div>
  );
});
