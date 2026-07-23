"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

export function SandboxEntryButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEnter = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/sandbox-login", { method: "POST" });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const body = await res.json();
        setError(body?.error?.message ?? "Failed to enter sandbox");
        setLoading(false);
      }
    } catch {
      setError("Failed to connect. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col gap-2">
      <button
        onClick={handleEnter}
        disabled={loading}
        className={`inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 text-[#d4af37] hover:bg-[#d4af37]/10 hover:border-[#d4af37]/30 transition-all duration-200 disabled:opacity-50 ${className ?? ""}`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Entering..." : "Explore Interactive Sandbox"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
