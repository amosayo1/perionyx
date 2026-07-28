"use client";

import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Loader2 } from "lucide-react";

type ConversationSummary = { id: string; title: string; messageCount: number; updatedAt: string; };

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  loading,
}: {
  conversations: ConversationSummary[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  loading?: boolean;
}) {
  return (
    <div className="space-y-1">
      <button
        onClick={onNew}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
      >
        <Plus className="h-3.5 w-3.5" />
        New conversation
      </button>
      <div className="h-px bg-white/[0.06] my-2" />
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
        </div>
      ) : conversations.length === 0 ? (
        <p className="text-[11px] text-zinc-600 text-center py-4">No conversations yet</p>
      ) : (
        conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors",
              c.id === activeId
                ? "bg-gold/10 text-gold"
                : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0 flex-1 truncate">{c.title}</div>
            <span className="shrink-0 text-[10px] text-zinc-700">{c.messageCount}</span>
          </button>
        ))
      )}
    </div>
  );
}
