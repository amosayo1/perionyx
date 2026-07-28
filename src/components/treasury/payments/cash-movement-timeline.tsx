"use client";

import { cn } from "@/lib/utils";
import { MOCK_CASH_MOVEMENT } from "./data";
import { ArrowUpRight, ArrowDownRight, Minus, DollarSign } from "lucide-react";

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs >= 1_000_000_000
    ? `$${(abs / 1_000_000_000).toFixed(2)}B`
    : abs >= 1_000_000
      ? `$${(abs / 1_000_000).toFixed(2)}M`
      : `$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return value < 0 ? `-${formatted}` : formatted;
}

function formatFullCurrency(value: number): string {
  return `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const maxAbsValue = Math.max(
  ...MOCK_CASH_MOVEMENT.map((m) => Math.max(m.inflow, m.outflow, Math.abs(m.net))),
);

export function CashMovementTimeline({ className }: { className?: string }) {
  const totalInflow = MOCK_CASH_MOVEMENT.reduce((s, m) => s + m.inflow, 0);
  const totalOutflow = MOCK_CASH_MOVEMENT.reduce((s, m) => s + m.outflow, 0);
  const finalBalance = MOCK_CASH_MOVEMENT[MOCK_CASH_MOVEMENT.length - 1].runningBalance;

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
        <DollarSign className="h-5 w-5 text-gold" />
        <h3 className="text-sm font-semibold text-white">Cash Movement Timeline</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Cash movement timeline">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs text-zinc-500">
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">Inflow</th>
              <th className="px-4 py-3 text-right font-medium">Outflow</th>
              <th className="px-4 py-3 text-right font-medium">Net</th>
              <th className="px-4 py-3 text-right font-medium">Running Balance</th>
              <th className="w-[200px] px-4 py-3 text-left font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CASH_MOVEMENT.map((movement) => {
              const isOpening = movement.category === "opening";
              const isClosing = movement.category === "closing";
              const isTotal = isOpening || isClosing;

              return (
                <tr
                  key={movement.category}
                  className={cn(
                    "border-b border-white/[0.06] text-sm transition-colors hover:bg-white/[0.02]",
                    isTotal && "bg-gold/5",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "font-medium",
                          isTotal ? "text-gold" : "text-zinc-200",
                        )}
                      >
                        {movement.label}
                      </span>
                      <span className="text-[11px] text-zinc-600">{movement.type}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {movement.inflow > 0 ? (
                      <span className="font-medium text-emerald-400">
                        {formatCurrency(movement.inflow)}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {movement.outflow > 0 ? (
                      <span className="font-medium text-red-400">
                        {formatCurrency(movement.outflow)}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {movement.net !== 0 ? (
                      <div className="flex items-center justify-end gap-1">
                        {movement.net > 0 ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            movement.net > 0 ? "text-emerald-400" : "text-red-400",
                          )}
                        >
                          {formatCurrency(movement.net)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          isTotal ? "text-gold" : "text-white",
                        )}
                      >
                        {formatFullCurrency(movement.runningBalance)}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {movement.inflow > 0 && (
                        <div
                          className="h-2 rounded-full bg-emerald-500/60 transition-all"
                          style={{
                            width: `${Math.max(4, (movement.inflow / maxAbsValue) * 100)}px`,
                          }}
                          role="img"
                          aria-label={`Inflow ${formatCurrency(movement.inflow)}`}
                        />
                      )}
                      {movement.outflow > 0 && (
                        <div
                          className="h-2 rounded-full bg-red-500/60 transition-all"
                          style={{
                            width: `${Math.max(4, (movement.outflow / maxAbsValue) * 100)}px`,
                          }}
                          role="img"
                          aria-label={`Outflow ${formatCurrency(movement.outflow)}`}
                        />
                      )}
                      {movement.inflow === 0 && movement.outflow === 0 && (
                        <Minus className="h-3 w-3 text-zinc-600" />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/[0.06] bg-white/[0.03] text-sm">
              <td className="px-4 py-3 font-semibold text-zinc-300">Total</td>
              <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                {formatCurrency(totalInflow)}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-red-400">
                {formatCurrency(totalOutflow)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1 font-semibold text-white">
                  {totalInflow - totalOutflow >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                  )}
                  {formatCurrency(totalInflow - totalOutflow)}
                </div>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gold">
                {formatFullCurrency(finalBalance)}
              </td>
              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
