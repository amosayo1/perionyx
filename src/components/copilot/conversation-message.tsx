"use client";

import { cn } from "@/lib/utils";
import { CitationBadge } from "./citation-badge";
import { TypingIndicator } from "./typing-indicator";
import { Bot, User, ArrowRight, Loader2, Lightbulb, ShieldCheck } from "lucide-react";
import type { Message } from "./types";

export function ConversationMessage({
  message,
  isLast,
  streaming,
  onFollowUp,
}: {
  message: Message;
  isLast?: boolean;
  streaming?: boolean;
  onFollowUp?: (text: string) => void;
}) {
  const isAssistant = message.role === "assistant";

  // Extract structured sections from the response
  const hasSources = isAssistant && message.citations && message.citations.length > 0;
  const hasFollowUps = isAssistant && message.followUps && message.followUps.length > 0;

  return (
    <div className={cn("flex gap-3 px-4 py-3", isAssistant ? "bg-white/[0.02]" : "")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isAssistant ? "bg-[#d4af37]/10 text-[#d4af37]" : "bg-zinc-800 text-zinc-400",
        )}
      >
        {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">
            {isAssistant ? "PERIONYX Intelligence" : "You"}
          </span>
          <span className="text-[10px] text-zinc-700">{message.timestamp || message.createdAt || ""}</span>
          {isAssistant && hasSources && (
            <span className="text-[10px] text-zinc-600 font-medium">
              · {message.citations!.length} source{message.citations!.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {streaming && !message.content ? (
            <TypingIndicator />
          ) : (
            message.content
          )}
        </div>

        {/* Sources section */}
        {hasSources && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-zinc-600 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Sources:
            </span>
            {message.citations!.map((c) => (
              <CitationBadge key={c} label={c} />
            ))}
          </div>
        )}

        {/* Recommended actions */}
        {isAssistant && message.content.toLowerCase().includes("recommend") && (
          <div className="flex items-center gap-1.5 pt-1">
            <Lightbulb className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] text-amber-400/80 font-medium">Action recommended</span>
          </div>
        )}

        {/* Follow-up questions */}
        {hasFollowUps && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="text-[10px] text-zinc-600 font-medium w-full">Follow-up questions:</span>
            {message.followUps!.map((f) => (
              <button
                key={f}
                onClick={() => onFollowUp?.(f)}
                className="group inline-flex items-center gap-1 rounded-full border border-white/[0.06] bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-500 transition-all hover:border-[#d4af37]/20 hover:text-[#d4af37]"
              >
                {f}
                <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
