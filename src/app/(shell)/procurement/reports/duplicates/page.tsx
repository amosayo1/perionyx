"use client";

import { useState, useEffect, useCallback } from "react";
import { PageContainer } from "../../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../../components/enterprise/enterprise-page-header";
import { Loader2, AlertTriangle, RefreshCw, XCircle } from "lucide-react";

interface DuplicateSuspect {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  amount: string;
  duplicateConfidence: number;
  status: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function confidenceColor(c: number) {
  if (c >= 0.95) return "text-red-400";
  if (c >= 0.85) return "text-orange-400";
  return "text-amber-400";
}

function confidenceBadge(c: number) {
  if (c >= 0.95) return "bg-red-950/50 text-red-400 border-red-900/50";
  if (c >= 0.85) return "bg-orange-950/50 text-orange-400 border-orange-900/50";
  return "bg-amber-950/50 text-amber-400 border-amber-900/50";
}

export default function DuplicatesPage() {
  const [suspects, setSuspects] = useState<DuplicateSuspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const fetchSuspects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/ap/reports/duplicates", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setSuspects(j.data.duplicates);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSuspects(); }, [fetchSuspects]);

  const runScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/v1/ap/reports/duplicates/scan", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setScanResult(`Scanned ${j.data.scanned} invoices, flagged ${j.data.flagged} new duplicates`);
      await fetchSuspects();
    } catch (e) {
      setScanResult(`Scan failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setScanning(false);
    }
  };

  const dismiss = async (invoiceId: string) => {
    try {
      await fetch(`/api/v1/ap/reports/duplicates/${invoiceId}/dismiss`, {
        method: "POST",
        credentials: "include",
      });
      await fetchSuspects();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dismiss failed");
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <EnterprisePageHeader title="Duplicate Suspects" description="Invoices flagged as potential duplicates" />
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <EnterprisePageHeader title="Duplicate Suspects" description="Invoices flagged as potential duplicates" />

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={runScan}
          disabled={scanning}
          className="flex items-center gap-2 rounded-lg border border-blue-900/50 bg-blue-950/30 px-4 py-2 text-xs font-medium text-blue-400 transition hover:bg-blue-950/50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Scanning..." : "Run Duplicate Scan"}
        </button>
        {scanResult && (
          <span className="text-xs text-gray-400">{scanResult}</span>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-sm text-red-400">{error}</div>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-800 bg-[#1a1a24]">
            <tr className="text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Duplicate Of</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-[#1a1a24]">
            {suspects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  No duplicate suspects found. Run a scan to detect potential duplicates.
                </td>
              </tr>
            ) : (
              suspects.map((s) => {
                const conf = s.duplicateConfidence;
                const amount = parseFloat(s.amount);
                return (
                  <tr key={s.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{s.invoiceNumber}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{s.vendorName}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-200">
                      {fmt(amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${confidenceBadge(conf)}`}>
                        <AlertTriangle className="h-3 w-3" />
                        {(conf * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">—</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-gray-700 bg-gray-800 px-2 py-0.5 text-[11px] text-gray-400">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => dismiss(s.id)}
                        className="flex items-center gap-1 rounded border border-gray-800 px-2 py-1 text-[11px] text-gray-400 transition hover:bg-gray-800 hover:text-gray-200"
                        title="Dismiss as false positive"
                      >
                        <XCircle className="h-3 w-3" />
                        Dismiss
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
