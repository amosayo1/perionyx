"use client";

import { cn } from "@/lib/utils";
import { memo, useState, useMemo } from "react";
import { Search, Check, Wallet, Building2, TrendingUp, PiggyBank, CreditCard, Landmark, DollarSign } from "lucide-react";
import { getMockAccounts } from "./data";
import type { DiscoveredAccount, AccountType } from "./types";

interface AccountSelectorProps {
  accounts?: DiscoveredAccount[];
  selected: DiscoveredAccount[];
  onToggle: (account: DiscoveredAccount) => void;
  onComplete: () => void;
  className?: string;
}

const ACCOUNT_TYPE_CONFIG: Record<AccountType, { label: string; icon: typeof Wallet; color: string }> = {
  operating: { label: "Operating", icon: Wallet, color: "text-blue-400" },
  payroll: { label: "Payroll", icon: Building2, color: "text-cyan-400" },
  treasury: { label: "Treasury", icon: TrendingUp, color: "text-emerald-400" },
  investment: { label: "Investment", icon: Landmark, color: "text-purple-400" },
  credit: { label: "Credit", icon: CreditCard, color: "text-amber-400" },
  savings: { label: "Savings", icon: PiggyBank, color: "text-pink-400" },
  escrow: { label: "Escrow", icon: DollarSign, color: "text-orange-400" },
};

export const AccountSelector = memo(function AccountSelector({
  accounts,
  selected,
  onToggle,
  onComplete,
  className,
}: AccountSelectorProps) {
  const [search, setSearch] = useState("");
  const allAccounts = useMemo(() => accounts ?? getMockAccounts(), [accounts]);

  const grouped = useMemo(() => {
    const filtered = allAccounts.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase()),
    );
    const groups: Record<string, DiscoveredAccount[]> = {};
    const order: AccountType[] = ["operating", "payroll", "treasury", "investment", "credit", "savings", "escrow"];
    for (const type of order) {
      const items = filtered.filter((a) => a.type === type);
      if (items.length > 0) groups[type] = items;
    }
    return groups;
  }, [allAccounts, search]);

  return (
    <div className={cn("space-y-4", className)} role="group" aria-label="Select accounts">
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-gold" aria-hidden="true" />
        <h2 className="text-lg font-medium text-white/[0.87]">Select Accounts</h2>
        {selected.length > 0 && (
          <span className="rounded bg-gold/[0.1] px-2 py-0.5 text-xs text-gold">{selected.length} selected</span>
        )}
      </div>
      <p className="text-sm text-white/[0.5]">Select the accounts you want to connect. You can add or remove accounts later.</p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/[0.3]" aria-hidden="true" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search accounts..."
          className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] py-2.5 pl-10 pr-4 text-sm text-white/[0.87] placeholder:text-white/[0.3] focus:border-gold/50 focus:outline-none"
          aria-label="Search accounts"
        />
      </div>

      <div className="space-y-4">
        {(Object.entries(ACCOUNT_TYPE_CONFIG) as [AccountType, typeof ACCOUNT_TYPE_CONFIG[AccountType]][]).map(([type, config]) => {
          const items = grouped[type];
          if (!items?.length) return null;
          const Icon = config.icon;

          return (
            <div key={type}>
              <div className="mb-2 flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} aria-hidden="true" />
                <h3 className="text-xs font-medium text-white/[0.5] uppercase tracking-wider">{config.label}</h3>
              </div>
              <div className="space-y-2">
                {items.map((account) => {
                  const isSelected = selected.some((a) => a.id === account.id);
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => onToggle(account)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                        isSelected
                          ? "border-gold bg-gold/[0.05]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]",
                      )}
                      aria-pressed={isSelected}
                    >
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded border transition-colors",
                        isSelected
                          ? "border-gold bg-gold/10"
                          : "border-white/[0.06] bg-white/[0.02]",
                      )}>
                        {isSelected
                          ? <Check className="h-4 w-4 text-gold" />
                          : <span className="text-xs text-white/[0.3]">{account.accountNumber.slice(-2)}</span>
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={cn("text-sm", isSelected ? "text-gold font-medium" : "text-white/[0.87]")}>
                            {account.name}
                          </span>
                          <span className="text-sm font-medium text-white/[0.7]">{account.balance}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/[0.4]">
                          <span>{account.accountNumber}</span>
                          <span>·</span>
                          <span>{account.currency}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="flex justify-end border-t border-white/[0.06] pt-4">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Continue ({selected.length} selected)
          </button>
        </div>
      )}
    </div>
  );
});
