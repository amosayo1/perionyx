"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  RotateCcw, Repeat, Play, LogOut, X, Sparkles, ChevronUp, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ScenarioPanel } from "./scenario-panel";
import { IntelligenceDashboard } from "./intelligence-dashboard";

export function DemoController() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const isSandbox = session?.user?.isSandbox === true;
  if (!isSandbox) return null;

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/v1/sandbox/reset", { method: "POST" });
      if (res.ok) {
        toast.success("Workspace reset complete");
        router.refresh();
      } else {
        toast.error("Reset failed");
      }
    } catch {
      toast.error("Reset failed");
    } finally {
      setResetting(false);
    }
  };

  const handleRestartTour = () => {
    window.location.href = "/demo";
  };

  const handleExit = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="rounded-xl border border-[#d4af37]/15 bg-zinc-900/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-2 w-52 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="space-y-1">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
            >
              {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              Reset Workspace
            </button>
            <button
              onClick={() => router.push("/copilot")}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              <Repeat className="h-3.5 w-3.5" />
              Open Copilot
            </button>
            <IntelligenceDashboard />
            <button
              onClick={handleRestartTour}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              <Play className="h-3.5 w-3.5" />
              Restart Guided Tour
            </button>
            <div className="px-3 py-2">
              <ScenarioPanel />
            </div>
            <div className="h-px bg-white/[0.06] my-1" />
            <button
              onClick={handleExit}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              Exit Sandbox
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-gradient-to-r from-zinc-900/95 to-zinc-900/95 px-4 py-2.5 shadow-[0_4px_20px_rgba(212,175,55,0.12)] backdrop-blur-xl transition-all hover:border-[#d4af37]/30"
      >
        <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
        <span className="text-xs font-semibold text-[#d4af37]">Sandbox Controls</span>
        {open ? <X className="h-3 w-3 text-zinc-500" /> : <ChevronUp className="h-3 w-3 text-zinc-500" />}
      </button>
    </div>
  );
}
