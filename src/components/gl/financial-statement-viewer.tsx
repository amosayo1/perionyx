"use client";

import { useState, memo } from "react";
import { cn } from "@/lib/utils";
import type { FinancialStatement, StatementType } from "./gl-types";

interface FinancialStatementViewerProps {
  statements: FinancialStatement[];
  className?: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const TABS: { key: StatementType; label: string }[] = [
  { key: "balance-sheet", label: "Balance Sheet" },
  { key: "income-statement", label: "Income Statement" },
  { key: "cash-flow", label: "Cash Flow" },
];

export const FinancialStatementViewer = memo(function FinancialStatementViewer({ statements, className }: FinancialStatementViewerProps) {
  const [activeTab, setActiveTab] = useState<StatementType>("balance-sheet");
  const current = statements.find((s) => s.type === activeTab);

  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/40", className)}>
      <div className="border-b border-zinc-800/60">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors",
                activeTab === tab.key
                  ? "border-b-2 border-[#d4af37] text-[#d4af37]"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {!current ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-zinc-500">No {activeTab.replace(/-/g, " ")} data available</p>
          </div>
        ) : (
          <>
            {current.totalAssets !== undefined && (
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/5 p-3 text-center">
                  <p className="text-[11px] text-zinc-500">Total Assets</p>
                  <p className="text-lg font-bold text-[#d4af37]">{formatCurrency(current.totalAssets ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                  <p className="text-[11px] text-zinc-500">Total Liabilities</p>
                  <p className="text-lg font-bold text-amber-400">{formatCurrency(current.totalLiabilities ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                  <p className="text-[11px] text-zinc-500">Net Income</p>
                  <p className={cn("text-lg font-bold", (current.netIncome ?? 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {formatCurrency(current.netIncome ?? 0)}
                  </p>
                </div>
              </div>
            )}

            {current.operatingCashFlow !== undefined && (
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-center">
                  <p className="text-[11px] text-zinc-500">Operating CF</p>
                  <p className="text-lg font-bold text-blue-400">{formatCurrency(current.operatingCashFlow ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-center">
                  <p className="text-[11px] text-zinc-500">Investing CF</p>
                  <p className="text-lg font-bold text-purple-400">{formatCurrency(current.investingCashFlow ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                  <p className="text-[11px] text-zinc-500">Financing CF</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(current.financingCashFlow ?? 0)}</p>
                </div>
              </div>
            )}

            {current.sections.map((section, si) => (
              <div key={si} className="mb-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">{section.name}</h4>
                <div className="space-y-0.5">
                  {section.items.map((item, ii) => (
                    <div
                      key={ii}
                      className="flex items-center justify-between rounded-md px-3 py-1.5 transition-colors hover:bg-zinc-800/30"
                      style={{ paddingLeft: `${16 + (item.indent ?? 0) * 16}px` }}
                    >
                      <div className="flex items-center gap-2">
                        {item.accountNumber && (
                          <span className="text-[10px] font-mono text-zinc-600">{item.accountNumber}</span>
                        )}
                        <span className={cn("text-sm", item.indent === 0 ? "font-semibold text-white" : "text-zinc-300")}>
                          {item.label}
                        </span>
                      </div>
                      <span className={cn("text-sm font-mono", item.amount >= 0 ? "text-white" : "text-red-400")}>
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
});
