"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ApprovalMatrixError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error("Approval matrix error:", error); }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Approval Matrix Error</h1>
        <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
          Something went wrong loading the approval matrix.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#d4af37]/10 px-4 py-2.5 text-sm font-medium text-[#d4af37] border border-[#d4af37]/20 transition-all hover:bg-[#d4af37]/20"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
