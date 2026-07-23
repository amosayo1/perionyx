"use client";

import { AnimatedDialog } from "@/components/enterprise/motion/animated-dialog";
import { cn } from "@/lib/utils";
import type { ReportRow } from "@/modules/financial-reporting/types";
import { FileText, ExternalLink } from "lucide-react";

interface DrillDownModalProps {
  row: ReportRow | null;
  onClose: () => void;
}

export function DrillDownModal({ row, onClose }: DrillDownModalProps) {
  if (!row) return null;

  const sources = row.sourceReferences ?? [];

  return (
    <AnimatedDialog
      open={!!row}
      onClose={onClose}
      title={`Source Transactions — ${row.label}`}
      size="xl"
    >
      <div className="px-6 py-4">
        {sources.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <FileText className="mb-2 h-6 w-6 text-zinc-700" />
            <p className="text-sm text-zinc-500">No source transactions available for this row.</p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs text-zinc-500">{sources.length} source transaction{sources.length !== 1 ? "s" : ""}</p>
            <div className="overflow-hidden rounded-lg border border-white/[0.06]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-zinc-900/60 text-[11px] text-zinc-500">
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Reference #</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 text-right font-medium">Amount</th>
                    <th className="w-10 px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => (
                    <tr
                      key={source.id}
                      className="border-b border-white/[0.03] transition-colors last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-2.5 text-xs text-zinc-400">
                        {new Date(source.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-white">{source.number}</td>
                      <td className="px-3 py-2.5">
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] capitalize text-zinc-400">
                          {source.type.replace(/-/g, " ")}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-2.5 text-xs text-zinc-400">{source.description}</td>
                      <td className={cn(
                        "px-3 py-2.5 text-right text-xs tabular-nums",
                        source.amount >= 0 ? "text-zinc-300" : "text-red-400",
                      )}>
                        {source.amount < 0 ? "(" : ""}${Math.abs(source.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}{source.amount < 0 ? ")" : ""}
                      </td>
                      <td className="px-3 py-2.5">
                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex text-zinc-600 transition-colors hover:text-zinc-300"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {row.variance && Object.keys(row.variance).length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Object.entries(row.variance).map(([key, val]) => (
              <div key={key} className="rounded-lg bg-zinc-900/40 p-3">
                <p className="text-[11px] capitalize text-zinc-500">{key} Variance</p>
                <p className={cn(
                  "mt-0.5 text-sm font-medium",
                  val >= 0 ? "text-emerald-400" : "text-red-400",
                )}>
                  {val >= 0 ? "+" : ""}${Math.abs(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AnimatedDialog>
  );
}
