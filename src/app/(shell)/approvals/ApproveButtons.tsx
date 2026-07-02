"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

export default function ApproveButtons({ transactionId }: { transactionId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function doAction(action: "approve" | "reject") {
    setLoading(action);
    setMessage(null);
    setStatus("idle");
    try {
      const url = `/api/v1/transactions/${transactionId}/${action}`;
      const body = action === "reject" ? { reason: "Rejected via UI" } : undefined;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(
          action === "approve"
            ? "Transaction approved successfully"
            : "Transaction rejected",
        );
      } else {
        setStatus("error");
        setMessage(json?.message ?? "Request failed");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message ?? String(err));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => doAction("approve")}
          disabled={loading !== null}
          className="flex-1 gap-2 bg-[#d4af37] text-white hover:bg-[#d4af37]"
        >
          {loading === "approve" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {loading === "approve" ? "Approving..." : "Approve"}
        </Button>
        <Button
          onClick={() => doAction("reject")}
          disabled={loading !== null}
          variant="outline"
          className="flex-1 gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          {loading === "reject" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          {loading === "reject" ? "Rejecting..." : "Reject"}
        </Button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
            status === "success"
              ? "bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37]"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {status === "success" ? (
            <Check className="h-4 w-4 shrink-0" />
          ) : (
            <X className="h-4 w-4 shrink-0" />
          )}
          {message}
        </div>
      )}
    </div>
  );
}
