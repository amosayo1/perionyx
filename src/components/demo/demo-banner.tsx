"use client";

import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";

export function DemoBanner() {
  const { data: session } = useSession();
  const isDemo = session?.user?.email === "demo@perionyx.dev";

  if (!isDemo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-perionyx-gold/30 bg-gradient-to-r from-amber-950/90 to-perionyx-bg-primary/95 px-4 py-2 shadow-[0_8px_32px_rgba(212,175,55,0.15)] backdrop-blur-xl">
      <Sparkles className="h-3.5 w-3.5 text-perionyx-gold" />
      <span className="text-xs font-semibold uppercase tracking-wider text-perionyx-gold">Demo Mode</span>
      <span className="mx-1 h-3 w-px bg-perionyx-gold/20" />
      <span className="text-[11px] text-perionyx-text-muted">Pre-seeded data — explore freely</span>
    </div>
  );
}
