"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";
import { Check, X, Minus, Shield, Zap, Clock } from "lucide-react";
import type { BankProvider } from "./types";

interface ProviderComparisonCardProps {
  providers: BankProvider[];
  className?: string;
}

const COMPARISON_FEATURES = [
  { key: "Balances", label: "Balances" },
  { key: "Transactions", label: "Transactions" },
  { key: "Payments", label: "Payments" },
  { key: "Identity", label: "Identity" },
  { key: "Historical Sync", label: "Historical Sync" },
  { key: "Real-time", label: "Real-time" },
  { key: "Webhooks", label: "Webhooks" },
  { key: "Account Discovery", label: "Account Discovery" },
  { key: "Statements", label: "Statements" },
];

export const ProviderComparisonCard = memo(function ProviderComparisonCard({
  providers,
  className,
}: ProviderComparisonCardProps) {
  const displayProviders = providers.slice(0, 4);

  return (
    <div className={cn("space-y-3", className)} role="group" aria-label="Provider comparison">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-gold" aria-hidden="true" />
        <h3 className="text-sm font-medium text-white/[0.87]">Provider Comparison</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs" role="table">
          <thead>
            <tr>
              <th className="text-left text-white/[0.4] font-medium pb-2 pr-4 whitespace-nowrap" role="columnheader">Feature</th>
              {displayProviders.map((p) => (
                <th key={p.id} className="text-center text-white/[0.7] font-medium pb-2 px-3 whitespace-nowrap" role="columnheader">
                  {p.name}
                  {p.recommended && (
                    <span className="ml-1 rounded bg-gold/[0.1] px-1.5 py-0.5 text-[9px] text-gold">Best</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_FEATURES.map((feature) => (
              <tr key={feature.key} className="border-t border-white/[0.04]">
                <td className="py-2 pr-4 text-white/[0.5] whitespace-nowrap">{feature.label}</td>
                {displayProviders.map((p) => {
                  const hasFeature = p.capabilities.includes(feature.key);
                  return (
                    <td key={p.id} className="py-2 px-3 text-center">
                      {hasFeature ? (
                        <Check className="mx-auto h-3.5 w-3.5 text-emerald-400" aria-label={`${p.name} supports ${feature.label}`} />
                      ) : (
                        <X className="mx-auto h-3.5 w-3.5 text-white/[0.2]" aria-label={`${p.name} does not support ${feature.label}`} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t border-white/[0.08]">
              <td className="py-2 pr-4 text-white/[0.5] whitespace-nowrap">Rating</td>
              {displayProviders.map((p) => (
                <td key={p.id} className="py-2 px-3 text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Zap className="h-3 w-3 text-amber-400" aria-hidden="true" />
                    <span className="text-white/[0.7]">{p.enterpriseRating}/5</span>
                  </span>
                </td>
              ))}
            </tr>
            <tr className="border-t border-white/[0.08]">
              <td className="py-2 pr-4 text-white/[0.5] whitespace-nowrap">Coverage</td>
              {displayProviders.map((p) => (
                <td key={p.id} className="py-2 px-3 text-center text-white/[0.5] text-[10px]">
                  {p.supportedBankCount.toLocaleString()} inst.
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {providers.length > 4 && (
        <p className="text-center text-[10px] text-white/[0.3]">
          +{providers.length - 4} more providers available
        </p>
      )}
    </div>
  );
});
