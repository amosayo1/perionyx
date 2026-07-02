"use client";

import { useState } from "react";

type Transaction = {
  id: string;
  type: string;
  status: string;
  primaryAmount: string;
  currency: string;
  createdAt: string;
};

export function CashFlowChart({ transactions }: { transactions: Transaction[] }) {
  const [view, setView] = useState<"inflow" | "outflow" | "both">("both");

  if (transactions.length === 0) {
    return <p className="text-sm text-white/40">No transaction data available for cash flow</p>;
  }

  const inflow = transactions
    .filter((t) => t.type === "credit" || t.type === "CREDIT")
    .map((t) => Math.abs(Number(t.primaryAmount)));
  const outflow = transactions
    .filter((t) => t.type === "debit" || t.type === "DEBIT")
    .map((t) => Math.abs(Number(t.primaryAmount)));

  const maxVal = Math.max(
    ...(view === "outflow" ? outflow : inflow),
    ...(view === "both" ? [...inflow, ...outflow] : []),
    1
  );

  const w = 400;
  const h = 120;

  const makePath = (data: number[], color: string) => {
    if (data.length < 2) return null;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v / maxVal) * (h - 8)) - 4;
      return `${x},${y}`;
    }).join(" ");
    return (
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
        opacity="0.8"
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {(["inflow", "outflow", "both"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition ${
              view === v
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="block" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <line
              key={pct}
              x1={0}
              y1={h * (1 - pct)}
              x2={w}
              y2={h * (1 - pct)}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
          ))}
          {view !== "outflow" && makePath(inflow, "#d4af37")}
          {view !== "inflow" && makePath(outflow, "#ef4444")}
          {view === "both" && inflow.length >= 2 && outflow.length >= 2 && (
            <>
              <rect x={4} y={h + 4} width={8} height={8} rx={2} fill="#d4af37" />
              <text x={14} y={h + 12} className="fill-white/40 text-[10px]" fontSize="10">
                Inflow
              </text>
              <rect x={60} y={h + 4} width={8} height={8} rx={2} fill="#ef4444" />
              <text x={70} y={h + 12} className="fill-white/40 text-[10px]" fontSize="10">
                Outflow
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
