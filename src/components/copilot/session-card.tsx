"use client";

import { MessageSquare } from "lucide-react";
import type { Session } from "./types";

export function SessionCard({ session }: { session: Session }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 transition-all hover:bg-zinc-900/60 hover:border-white/[0.1]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MessageSquare className="h-4 w-4 shrink-0 text-zinc-500" />
          <span className="text-sm font-medium text-white truncate">{session.title}</span>
        </div>
        <span className="text-[10px] text-zinc-700 shrink-0">{session.messageCount} msgs</span>
      </div>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{session.preview}</p>
      <p className="text-[10px] text-zinc-700 mt-2">{session.date}</p>
    </div>
  );
}
