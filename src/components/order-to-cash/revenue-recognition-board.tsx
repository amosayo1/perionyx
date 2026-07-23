"use client";

import type { RevenueSchedule } from "./o2c-types";
import { Calendar, TrendingUp } from "lucide-react";

interface RevenueRecognitionBoardProps {
  schedules: RevenueSchedule[];
  max?: number;
}

const methodStyles: Record<string, string> = {
  upfront: "bg-emerald-900/50 text-emerald-300",
  monthly: "bg-blue-900/50 text-blue-300",
  yearly: "bg-violet-900/50 text-violet-300",
  milestone: "bg-amber-900/50 text-amber-300",
  deferred: "bg-gray-700 text-gray-300",
};

export function RevenueRecognitionBoard({ schedules, max = 20 }: RevenueRecognitionBoardProps) {
  const displayed = schedules.slice(0, max);
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1a1a1a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Method</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Recognized</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Deferred</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {displayed.map((s) => {
            const progress = s.totalAmount > 0 ? (s.recognizedAmount / s.totalAmount) * 100 : 0;
            return (
              <tr key={s.id} className="hover:bg-gray-800/30">
                <td className="px-3 py-2 text-sm text-gray-200">{s.customerName}</td>
                <td className="px-3 py-2"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${methodStyles[s.method] || "bg-gray-700 text-gray-300"}`}>{s.method}</span></td>
                <td className="px-3 py-2 text-right text-sm text-gray-200">${(s.totalAmount / 1e3).toFixed(0)}K</td>
                <td className="px-3 py-2 text-right text-sm text-emerald-400">${(s.recognizedAmount / 1e3).toFixed(0)}K</td>
                <td className="px-3 py-2 text-right text-sm text-amber-400">${(s.deferredAmount / 1e3).toFixed(0)}K</td>
                <td className="px-3 py-2"><span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${s.status === "recognized" ? "bg-emerald-900/50 text-emerald-300" : s.status === "scheduled" ? "bg-blue-900/50 text-blue-300" : "bg-gray-700 text-gray-300"}`}>{s.status}</span></td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-gray-700">
                      <div className={`h-1.5 rounded-full ${progress >= 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400">{progress.toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
