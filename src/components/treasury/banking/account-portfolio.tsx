"use client";

import { cn } from "@/lib/utils";
import type { AccountPortfolio } from "@/server/banking/workspace";

const purposeColors: Record<string, string> = {
  Operating: "border-l-emerald-500/50",
  Treasury: "border-l-gold/50",
  Payroll: "border-l-blue-500/50",
  Settlement: "border-l-purple-500/50",
  Reserve: "border-l-cyan-500/50",
  "Multi-Currency": "border-l-amber-500/50",
};

const roleColors: Record<string, string> = {
  "Primary Operating": "text-emerald-400",
  Disbursement: "text-blue-400",
  Concentration: "text-gold",
  Reserve: "text-cyan-400",
  Settlement: "text-purple-400",
};

interface AccountPortfolioProps {
  accounts: AccountPortfolio[];
  groupBy?: string;
  filter?: string;
  className?: string;
}

export function AccountPortfolio({ accounts, groupBy, className }: AccountPortfolioProps) {
  const grouped = groupBy ? groupAccounts(accounts, groupBy) : { "All Accounts": accounts };

  return (
    <div className={cn("space-y-6", className)}>
      {Object.entries(grouped).map(([group, groupAccounts]) => (
        <div key={group}>
          {groupBy && (
            <h3 className="mb-3 text-[13px] font-medium tracking-[0.08em] uppercase text-zinc-400">
              {group}
            </h3>
          )}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {groupAccounts.map((acc) => (
              <div
                key={acc.id}
                className={cn(
                  "rounded-lg border border-white/[0.06] border-l-2 bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-900/60",
                  purposeColors[acc.purpose] ?? "border-l-white/[0.06]",
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-white">{acc.name}</p>
                    <p className="text-[11px] text-zinc-500">{acc.institution}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-semibold text-white">
                      {acc.balance.toLocaleString("en-US", {
                        style: "currency",
                        currency: acc.currency,
                        minimumFractionDigits: 0,
                      })}
                    </p>
                    <p className={cn("text-[11px]", roleColors[acc.treasuryRole] ?? "text-zinc-400")}>
                      {acc.treasuryRole}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500">
                  <span>Entity: {acc.legalEntity}</span>
                  <span>Region: {acc.region}</span>
                  <span>Currency: {acc.currency}</span>
                  <span>Health: {acc.healthScore}/100</span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        acc.healthScore >= 80
                          ? "bg-emerald-500"
                          : acc.healthScore >= 50
                            ? "bg-amber-500"
                            : "bg-red-500",
                      )}
                      style={{ width: `${acc.healthScore}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      acc.status === "ACTIVE"
                        ? "text-emerald-400"
                        : acc.status === "DORMANT"
                          ? "text-amber-400"
                          : "text-red-400",
                    )}
                  >
                    {acc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupAccounts(accounts: AccountPortfolio[], by: string): Record<string, AccountPortfolio[]> {
  const grouped: Record<string, AccountPortfolio[]> = {};
  for (const acc of accounts) {
    const key = String((acc as unknown as Record<string, unknown>)[by] ?? "Other");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(acc);
  }
  return grouped;
}