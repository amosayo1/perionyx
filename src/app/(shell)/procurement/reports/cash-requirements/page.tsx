"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "../../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../../components/enterprise/enterprise-page-header";
import { Loader2, TrendingUp } from "lucide-react";

interface ForecastEntry {
  period: string;
  amount: string;
  invoiceCount: number;
}

interface CashData {
  summary: { totalRequired: string; peakPeriod: string; avgWeekly: string };
  forecast: ForecastEntry[];
}

function fmt(n: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(n));
}

function formatPeriod(p: string) {
  // Handles both "2026-W29" (week) and "2026-07" (month) formats
  if (p.includes("-W")) {
    const [year, week] = p.split("-W");
    return `Week ${parseInt(week)}, ${year}`;
  }
  const [year, month] = p.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function CashRequirementsPage() {
  const [data, setData] = useState<CashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<"WEEK" | "MONTH">("WEEK");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/ap/reports/cash-requirements?groupBy=${groupBy}`, { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        setData(j.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [groupBy]);

  if (loading) {
    return (
      <PageContainer>
        <EnterprisePageHeader title="Cash Requirements" description="Forecasted cash needs" />
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer>
        <EnterprisePageHeader title="Cash Requirements" description="Forecasted cash needs" />
        <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">{error || "No data"}</div>
      </PageContainer>
    );
  }

  const maxAmount = Math.max(...data.forecast.map((f) => parseFloat(f.amount)), 1);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Cash Requirements" description="Forecasted unpaid liabilities by period" />

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-5">
          <h3 className="text-xs text-gray-500">TOTAL REQUIRED</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-100">{fmt(data.summary.totalRequired)}</p>
          <p className="text-xs text-gray-500">within 90 days</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-5">
          <h3 className="text-xs text-gray-500">PEAK PERIOD</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-100">{formatPeriod(data.summary.peakPeriod)}</p>
          <p className="text-xs text-gray-500">highest cash need</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-5">
          <h3 className="text-xs text-gray-500">AVERAGE PER PERIOD</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-100">{fmt(data.summary.avgWeekly)}</p>
          <p className="text-xs text-gray-500">mean payment load</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span className="text-xs text-gray-500">Group by:</span>
        {(["WEEK", "MONTH"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGroupBy(g)}
            className={`rounded-lg border px-3 py-1 text-xs transition ${
              groupBy === g
                ? "border-blue-900/50 bg-blue-950/30 text-blue-400"
                : "border-gray-800 bg-[#1a1a24] text-gray-400 hover:bg-gray-800"
            }`}
          >
            {g === "WEEK" ? "Weekly" : "Monthly"}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-gray-800 bg-[#1a1a24] p-5">
        <h3 className="mb-4 text-xs font-medium text-gray-500">CASH FORECAST</h3>
        <div className="space-y-2">
          {data.forecast.map((f) => {
            const amount = parseFloat(f.amount);
            const barPct = (amount / maxAmount) * 100;
            return (
              <div key={f.period} className="flex items-center gap-4">
                <div className="w-32 shrink-0 text-xs text-gray-400">{formatPeriod(f.period)}</div>
                <div className="flex-1">
                  <div className="h-5 overflow-hidden rounded bg-gray-800">
                    <div
                      className="h-full rounded bg-amber-600 transition-all"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 shrink-0 text-right font-mono text-xs text-gray-300">{fmt(f.amount)}</div>
                <div className="w-12 shrink-0 text-right text-[11px] text-gray-500">{f.invoiceCount}</div>
              </div>
            );
          })}
        </div>
        {data.forecast.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">No upcoming liabilities in the next 90 days</p>
        )}
      </div>
    </PageContainer>
  );
}
