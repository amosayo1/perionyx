"use client";

import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function SandboxBanner() {
  const { data: session } = useSession();
  const isSandbox = session?.user?.isSandbox === true;

  if (!isSandbox) return null;

  return (
    <div className="relative z-40 flex items-center justify-center gap-2.5 border-b border-gold/10 bg-gradient-to-r from-gold/5 via-gold/8 to-gold/5 px-6 py-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
        Interactive Sandbox
      </span>
      <span className="hidden text-[11px] text-zinc-400 sm:inline">
        You are exploring a simulated enterprise environment. External integrations are simulated. Changes may be reset periodically.
      </span>
      <span className="inline text-[11px] text-zinc-500 sm:hidden">
        Simulated environment
      </span>
    </div>
  );
}

export function SandboxSidebarBadge() {
  const { data: session } = useSession();
  const isSandbox = session?.user?.isSandbox === true;

  if (!isSandbox) return null;

  return (
    <div className="px-5 pb-2">
      <div className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1",
        "border-gold/15 bg-gold/5",
      )}>
        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gold/80">Sandbox</span>
      </div>
    </div>
  );
}
