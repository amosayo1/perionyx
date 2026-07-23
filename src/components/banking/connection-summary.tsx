"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";
import { Check, Building2, Landmark, Wallet, RefreshCw, DollarSign, Globe, Shield } from "lucide-react";
import type { ConnectionState, DiscoveredAccount } from "./types";

interface ConnectionSummaryProps {
  state: ConnectionState;
  accounts: DiscoveredAccount[];
  onConfirm: () => void;
  onBack: () => void;
  className?: string;
}

const STEP_SUMMARIES = [
  { key: "region", icon: Globe, label: "Region" },
  { key: "country", icon: Globe, label: "Country" },
  { key: "provider", icon: Building2, label: "Provider" },
  { key: "institution", icon: Landmark, label: "Institution" },
  { key: "accounts", icon: Wallet, label: "Accounts" },
  { key: "sync", icon: RefreshCw, label: "Sync" },
  { key: "currencies", icon: DollarSign, label: "Currencies" },
  { key: "permissions", icon: Shield, label: "Permissions" },
] as const;

export const ConnectionSummary = memo(function ConnectionSummary({
  state,
  accounts,
  onConfirm,
  onBack,
  className,
}: ConnectionSummaryProps) {
  const selectedAccounts = accounts.length > 0 ? accounts : state.accounts.filter((a) => a.selected);

  return (
    <div className={cn("space-y-4", className)} role="group" aria-label="Connection summary">
      <div className="flex items-center gap-2">
        <Check className="h-5 w-5 text-gold" aria-hidden="true" />
        <h2 className="text-lg font-medium text-white/[0.87]">Review Connection</h2>
      </div>
      <p className="text-sm text-white/[0.5]">Review your connection configuration before finalizing.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {STEP_SUMMARIES.map(({ key, icon: Icon, label }) => {
          let value = "";
          switch (key) {
            case "region": value = state.region?.name ?? ""; break;
            case "country": value = state.country?.name ?? ""; break;
            case "provider": value = state.provider?.name ?? ""; break;
            case "institution": value = state.institution?.name ?? ""; break;
            case "accounts": value = `${selectedAccounts.length} accounts selected`; break;
            case "sync": value = `${state.syncConfig.mode} sync, ${state.syncConfig.historicalImport} history`; break;
            case "currencies": value = [...new Set(state.accounts.map((a) => a.currency))].join(", "); break;
            case "permissions": value = "Read accounts, balances, transactions"; break;
          }
          if (!value) return null;

          return (
            <div key={key} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <Icon className="h-4 w-4 text-white/[0.4] shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/[0.4]">{label}</p>
                <p className="text-sm text-white/[0.87] truncate">{value}</p>
              </div>
              <Check className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
            </div>
          );
        })}
      </div>

      {selectedAccounts.length > 0 && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <h3 className="mb-2 text-xs font-medium text-white/[0.5] uppercase tracking-wider">Selected Accounts</h3>
          <div className="space-y-2">
            {selectedAccounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between text-sm">
                <span className="text-white/[0.87]">{acc.name}</span>
                <span className="text-white/[0.5]">{acc.balance}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between border-t border-white/[0.06] pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] px-5 py-2.5 text-sm font-medium text-white/[0.7] transition-colors hover:bg-white/[0.04]"
        >
          Go Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Confirm & Connect
        </button>
      </div>
    </div>
  );
});
