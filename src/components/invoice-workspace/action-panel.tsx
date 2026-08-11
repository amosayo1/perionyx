"use client";

import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { VendorInvoice, VendorInvoiceStatus } from "@/server/procurement/ap-repositories/types";
import type { ActionState } from "./types";

const ACTIONABLE_STATUSES: VendorInvoiceStatus[] = [
  "CAPTURED",
  "VALIDATED",
  "MATCHED",
  "PENDING_APPROVAL",
  "EXCEPTION",
];

const TERMINAL_STATUSES: VendorInvoiceStatus[] = [
  "APPROVED",
  "REJECTED",
  "PAID",
  "PARTIALLY_PAID",
  "VOIDED",
];

interface ActionPanelProps {
  invoice: VendorInvoice;
}

export function ActionPanel({ invoice }: ActionPanelProps) {
  const [approveState, setApproveState] = useState<ActionState>({ action: "approve", status: "idle", error: null });
  const [rejectState, setRejectState] = useState<ActionState>({ action: "reject", status: "idle", error: null });
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const isActionable = ACTIONABLE_STATUSES.includes(invoice.status);
  const isTerminal = TERMINAL_STATUSES.includes(invoice.status);

  const performAction = useCallback(async (action: string, body?: Record<string, unknown>) => {
    const setState = action === "approve" ? setApproveState : setRejectState;
    setState({ action, status: "loading", error: null });
    try {
      const res = await fetch(`/api/v1/ap/invoices/${invoice.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: { message: `Request failed (${res.status})` } }));
        throw new Error(errData.error?.message ?? `Action failed (${res.status})`);
      }
      setState({ action, status: "success", error: null });
      window.location.reload();
    } catch (err) {
      setState({ action, status: "error", error: err instanceof Error ? err.message : "An unexpected error occurred" });
    }
  }, [invoice.id]);

  const handleApprove = useCallback(() => {
    performAction("approve");
  }, [performAction]);

  const handleReject = useCallback(() => {
    if (!rejectReason.trim() || rejectReason.length < 10) return;
    performAction("reject", { reason: rejectReason });
    setRejectModalOpen(false);
    setRejectReason("");
  }, [performAction, rejectReason]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {isTerminal && (
          <div className="rounded-md bg-zinc-800/50 px-4 py-3 text-center">
            <p className="text-sm text-zinc-400">
              This invoice is <span className="font-medium text-white">{invoice.status.replace(/_/g, " ")}</span>.
              No further actions are available.
            </p>
          </div>
        )}

        {!isActionable && !isTerminal && (
          <div className="rounded-md bg-zinc-800/50 px-4 py-3 text-center">
            <p className="text-sm text-zinc-400">
              Actions are not available for invoices in <span className="font-medium text-white">{invoice.status.replace(/_/g, " ")}</span> status.
            </p>
          </div>
        )}

        {isActionable && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">
              Take action on this invoice. Actions are recorded in the audit trail.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={approveState.status === "loading"}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {approveState.status === "loading" ? "Approving..." : "Approve"}
              </button>

              <button
                onClick={() => setRejectModalOpen(true)}
                disabled={rejectState.status === "loading"}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {rejectState.status === "loading" ? "Rejecting..." : "Reject"}
              </button>
            </div>

            {approveState.status === "error" && (
              <p className="text-xs text-red-400">{approveState.error}</p>
            )}
            {rejectState.status === "error" && (
              <p className="text-xs text-red-400">{rejectState.error}</p>
            )}

            {approveState.status === "success" && (
              <p className="text-xs text-emerald-400">Invoice approved. Reloading...</p>
            )}
            {rejectState.status === "success" && (
              <p className="text-xs text-emerald-400">Invoice rejected. Reloading...</p>
            )}
          </div>
        )}

        {rejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setRejectModalOpen(false)}>
            <div
              className="w-full max-w-md rounded-xl border border-white/[0.06] bg-zinc-900 p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white">Reject Invoice</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Provide a reason for rejection (minimum 10 characters).
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="mt-4 w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
                rows={3}
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => { setRejectModalOpen(false); setRejectReason(""); }}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejectReason.trim().length < 10}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
