"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "../../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../../components/enterprise/enterprise-page-header";
import { Loader2 } from "lucide-react";

interface AgingSummary {
  totalOutstanding: string;
  current: string;
  days30: string;
  days60: string;
  days90: string;
  days120Plus: string;
}

interface VendorAging {
  vendorId: string;
  vendorName: string;
  total: string;
  current: string;
  days30: string;
  days60: string;
  days90: string;
  days120Plus: string;
}

const BUCKET_COLORS = {
  current: "bg-emerald-500",
  days30: "bg-blue-500",
  days60: "bg-amber-500",
  days90: "bg-orange-500",
  days120Plus: "bg-red-500",
};

function fmt(n: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(n));
}

function pct(part: number, total: number) {
  return total > 0 ? ((part / total) * 100).toFixed(1) : "0";
}

export default function AgingPage() {
  const [data, setData] = useState<{ summary: AgingSummary; vendors: VendorAging[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/ap/reports/aging", { credentials: "include", cache: "no-store" })
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
        <EnterprisePageHeader title="AP Aging Report" description="Outstanding payables by aging bucket" />
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer>
        <EnterprisePageHeader title="AP Aging Report" description="Outstanding payables by aging bucket" />
        <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">{error || "No data"}</div>
      </PageContainer>
    );
  }

  const total = parseFloat(data.summary.totalOutstanding);
  const buckets = [
    { key: "current", label: "Current", value: parseFloat(data.summary.current), color: BUCKET_COLORS.current },
    { key: "days30", label: "1–30 Days", value: parseFloat(data.summary.days30), color: BUCKET_COLORS.days30 },
    { key: "days60", label: "31–60 Days", value: parseFloat(data.summary.days60), color: BUCKET_COLORS.days60 },
    { key: "days90", label: "61–90 Days", value: parseFloat(data.summary.days90), color: BUCKET_COLORS.days90 },
    { key: "days120Plus", label: "90+ Days", value: parseFloat(data.summary.days120Plus), color: BUCKET_COLORS.days120Plus },
  ];

  return (
    <PageContainer>
      <EnterprisePageHeader title="AP Aging Report" description="Outstanding payables by aging bucket" />

      <div className="mt-6 rounded-lg border border-gray-800 bg-[#1a1a24] p-5">
        <h3 className="mb-3 text-xs font-medium text-gray-500">TOTAL OUTSTANDING</h3>
        <p className="text-3xl font-semibold text-gray-100">{fmt(data.summary.totalOutstanding)}</p>

        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-gray-800">
          {buckets.map((b) => (
            <div
              key={b.key}
              className={`${b.color} transition-all`}
              style={{ width: `${pct(b.value, total)}%` }}
              title={`${b.label}: ${fmt(String(b.value))}`}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-4">
          {buckets.map((b) => (
            <div key={b.key} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-sm ${b.color}`} />
              <span className="text-[11px] text-gray-500">{b.label}</span>
              <span className="text-[11px] font-medium text-gray-300">{fmt(String(b.value))}</span>
              <span className="text-[11px] text-gray-600">({pct(b.value, total)}%)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-800 bg-[#1a1a24]">
            <tr className="text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium text-right">Current</th>
              <th className="px-4 py-3 font-medium text-right">1–30</th>
              <th className="px-4 py-3 font-medium text-right">31–60</th>
              <th className="px-4 py-3 font-medium text-right">61–90</th>
              <th className="px-4 py-3 font-medium text-right">90+</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-[#1a1a24]">
            {data.vendors.map((v) => (
              <tr key={v.vendorId} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-xs text-gray-300">{v.vendorName}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-gray-200">{fmt(v.total)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">{fmt(v.current)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-blue-400">{fmt(v.days30)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-amber-400">{fmt(v.days60)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-orange-400">{fmt(v.days90)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-red-400">{fmt(v.days120Plus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
