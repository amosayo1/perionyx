"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "../../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../../components/enterprise/enterprise-page-header";
import { Loader2, Calendar } from "lucide-react";

interface CalendarEntry {
  date: string;
  count: number;
  amount: string;
}

interface CalendarData {
  summary: { totalScheduled: number; totalAmount: string };
  calendar: CalendarEntry[];
}

function fmt(n: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(n));
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isWeekend(d: string) {
  const day = new Date(d + "T00:00:00").getDay();
  return day === 0 || day === 6;
}

export default function PaymentCalendarPage() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/ap/reports/payment-calendar", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        setData(j.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <EnterprisePageHeader title="Payment Calendar" description="Upcoming scheduled payments" />
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer>
        <EnterprisePageHeader title="Payment Calendar" description="Upcoming scheduled payments" />
        <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">{error || "No data"}</div>
      </PageContainer>
    );
  }

  const maxAmount = Math.max(...data.calendar.map((c) => parseFloat(c.amount)), 1);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Payment Calendar" description="Upcoming scheduled payments by date" />

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-5">
          <h3 className="text-xs text-gray-500">TOTAL SCHEDULED</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-100">{data.summary.totalScheduled}</p>
          <p className="text-xs text-gray-500">invoices</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-[#1a1a24] p-5">
          <h3 className="text-xs text-gray-500">TOTAL AMOUNT</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-100">{fmt(data.summary.totalAmount)}</p>
          <p className="text-xs text-gray-500">due within 90 days</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-800 bg-[#1a1a24] p-5">
        <h3 className="mb-4 text-xs font-medium text-gray-500">PAYMENT TIMELINE</h3>
        <div className="space-y-2">
          {data.calendar.map((entry) => {
            const amount = parseFloat(entry.amount);
            const barPct = (amount / maxAmount) * 100;
            const weekend = isWeekend(entry.date);
            return (
              <div key={entry.date} className={`flex items-center gap-4 ${weekend ? "opacity-50" : ""}`}>
                <div className="w-28 shrink-0 text-xs text-gray-400">{formatDate(entry.date)}</div>
                <div className="flex-1">
                  <div className="h-5 overflow-hidden rounded bg-gray-800">
                    <div
                      className="h-full rounded bg-blue-600 transition-all"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 shrink-0 text-right font-mono text-xs text-gray-300">{fmt(entry.amount)}</div>
                <div className="w-12 shrink-0 text-right text-[11px] text-gray-500">{entry.count}</div>
              </div>
            );
          })}
        </div>
        {data.calendar.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">No upcoming payments in the next 90 days</p>
        )}
      </div>
    </PageContainer>
  );
}
