"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ExternalLink, ArrowLeft } from "lucide-react";
import { TimelineView, type TimelineEventData } from "@/components/enterprise/timeline-view";
import { GraphView, type GraphNode } from "@/components/enterprise/graph-view";
import { TrustIndicator } from "@/components/enterprise/trust-indicator";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function InvestigationPage() {
  const { data: session } = useSession();
  const isSandbox = session?.user?.isSandbox === true;

  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEventData[] | null>(null);
  const [graphData, setGraphData] = useState<GraphNode | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txDuration, setTxDuration] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    const txId = transactionId.trim();
    if (!txId) return;

    setLoading(true);
    setError(null);
    setTimeline(null);
    setGraphData(null);

    try {
      const res = await fetch("/api/v1/copilot/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.message ?? "Transaction not found");
        return;
      }

      const data = await res.json();
      setTimeline(data.timeline?.events ?? []);
      setTxStatus(data.timeline?.status ?? null);
      setTxDuration(data.timeline?.duration ?? null);
      setGraphData(data.graph ?? null);
      setCurrentStep(0);
    } catch {
      setError("Failed to investigate transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4af37] mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
          Investigation Workspace
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Trace & Investigate</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Trace the complete lifecycle of any transaction — from creation through policy, approval, ledger, settlement, and audit.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Input
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Enter Transaction ID (e.g. TXN-1044 or full ID)..."
          className="flex-1 border-white/[0.06] bg-zinc-900/60 text-sm text-white placeholder:text-zinc-600"
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !transactionId.trim()}
          className="h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 hover:bg-[#d4af37]/20"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-2 text-xs font-medium">Trace</span>
        </Button>
      </div>

      {isSandbox && (
        <TrustIndicator level="simulated" source="Sandbox" showLabel />
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {timeline && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Timeline */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
            <TimelineView
              events={timeline}
              title="Transaction Lifecycle"
              duration={txDuration ?? undefined}
              status={txStatus ?? undefined}
              stepMode
              currentStep={currentStep}
              onStepChange={setCurrentStep}
            />
          </div>

          {/* Graph */}
          <div className="space-y-4">
            {graphData && (
              <GraphView root={graphData} />
            )}

            {/* Quick actions */}
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-semibold mb-3">Quick Actions</p>
              <div className="space-y-1.5">
                <Link
                  href={`/transactions/${transactionId}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Transaction Details
                </Link>
                <Link
                  href={`/audit-logs`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Audit Trail
                </Link>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("copilot:ask", {
                      detail: { text: `Investigate transaction ${transactionId} — trace its full lifecycle` },
                    }));
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ask Copilot About This Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!timeline && !error && !loading && (
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-8 text-center">
          <p className="text-sm text-zinc-500">
            Enter a Transaction ID above to trace its complete lifecycle.
          </p>
        </div>
      )}
    </div>
  );
}
