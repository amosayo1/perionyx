"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Control, ControlTest } from "./compliance-types";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const RESULT_STYLES: Record<string, string> = {
  pass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  fail: "border-red-500/20 bg-red-500/10 text-red-400",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  "not-tested": "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

const TYPE_STYLES: Record<string, string> = {
  preventive: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  detective: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  corrective: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  compensating: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
};

export const ControlDashboard = memo(function ControlDashboard({
  controls, tests,
}: {
  controls: Control[];
  tests: ControlTest[];
}) {
  const passed = controls.filter(c => c.lastResult === "pass").length;
  const failed = controls.filter(c => c.lastResult === "fail").length;
  const warning = controls.filter(c => c.lastResult === "warning").length;
  const notTested = controls.filter(c => !c.lastResult || c.lastResult === "not-tested").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{passed}</p>
          <p className="text-[11px] text-emerald-400/70">Passed</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{failed}</p>
          <p className="text-[11px] text-red-400/70">Failed</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{warning}</p>
          <p className="text-[11px] text-amber-400/70">Warning</p>
        </div>
        <div className="rounded-lg border border-zinc-500/20 bg-zinc-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-zinc-400">{notTested}</p>
          <p className="text-[11px] text-zinc-400/70">Not Tested</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Control</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Type</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Frequency</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Last Result</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Owner</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Tests</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {controls.map(c => {
              const controlTests = tests.filter(t => t.controlId === c.id);
              return (
                <tr key={c.id} className="transition-colors hover:bg-zinc-800/40">
                  <td className="max-w-[200px] truncate px-4 py-3 text-sm text-white">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize", TYPE_STYLES[c.type])}>
                      {c.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize text-zinc-400">{c.frequency}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize", RESULT_STYLES[c.lastResult ?? "not-tested"])}>
                      {c.lastResult ?? "not-tested"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">{c.owner}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {controlTests.length > 0 ? (
                      <div className="space-y-1">
                        {controlTests.map(t => (
                          <div key={t.id} className="flex items-center gap-2">
                            <span className={cn("h-1.5 w-1.5 rounded-full", t.result === "pass" ? "bg-emerald-500" : t.result === "fail" ? "bg-red-500" : t.result === "warning" ? "bg-amber-500" : "bg-zinc-500")} />
                            <span className="text-[11px] text-zinc-500">{formatDate(t.testDate)}</span>
                            <span className="text-[11px] text-zinc-500">by {t.tester}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-600">No tests</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});
