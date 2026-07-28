"use client";

import { Sparkles } from "lucide-react";

export function PromptCard({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-zinc-900/40 px-3 py-2.5 text-left text-xs text-zinc-400 transition-all hover:bg-zinc-900/60 hover:border-gold/20 hover:text-gold"
    >
      <Sparkles className="h-3 w-3 shrink-0 text-zinc-600 group-hover:text-gold transition-colors" />
      <span className="leading-relaxed">{text}</span>
    </button>
  );
}
