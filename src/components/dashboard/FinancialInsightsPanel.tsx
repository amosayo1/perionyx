import * as React from "react";

export function FinancialInsightsPanel({
  insights,
}: {
  insights: { label: string; value: string; trend?: "up" | "down" | null; }[];
}) {
  return (
    <div className="rounded-[28px] border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.02)] px-8 py-6 shadow-[0_8px_32px_rgba(212,175,55,0.08)] flex flex-col gap-4">
      <div className="text-xs font-bold uppercase tracking-[0.22em] text-perionyx-text-subtle mb-2">Treasury Insights</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insights.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-lg font-extrabold text-perionyx-gold drop-shadow-[0_1px_8px_rgba(212,175,55,0.10)]">{item.value}</span>
            <span className="text-xs text-perionyx-text-muted uppercase tracking-widest">{item.label}</span>
            {item.trend === "up" && <span className="ml-1 text-green-500 animate-bounce">▲</span>}
            {item.trend === "down" && <span className="ml-1 text-red-500 animate-bounce">▼</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
