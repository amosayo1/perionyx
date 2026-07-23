"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, listItem } from "@/components/enterprise/motion/tokens";
import { Send, Bot, User, Database, BarChart3, Clock } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "advisor" | "system";
  content: string;
  timestamp?: string;
  evidenceRefs?: string[];
  scenarioRefs?: string[];
}

interface ExecutiveChatProps {
  messages: ChatMessage[];
  onSend?: (content: string) => void;
  className?: string;
}

const ROLE_CONFIG: Record<string, { icon: typeof Bot; color: string; bg: string; label: string }> = {
  user: { icon: User, color: "text-blue-400", bg: "bg-blue-400/10", label: "You" },
  advisor: { icon: Bot, color: "text-[#d4af37]", bg: "bg-[#d4af37]/10", label: "Advisor" },
  system: { icon: Database, color: "text-zinc-400", bg: "bg-zinc-400/10", label: "System" },
};

function formatChatTimestamp(ts?: string): string {
  if (!ts) return "";
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function ExecutiveChat({ messages, onSend, className }: ExecutiveChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !onSend) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderContent = (content: string, evidenceRefs?: string[], scenarioRefs?: string[]) => {
    let parts: (string | React.ReactNode)[] = [content];

    if (evidenceRefs && evidenceRefs.length > 0) {
      evidenceRefs.forEach((ref) => {
        parts = parts.flatMap((part) => {
          if (typeof part !== "string") return [part];
          const segments = part.split(ref);
          if (segments.length === 1) return [part];
          return segments.flatMap((seg, i) => {
            const result: (string | React.ReactNode)[] = [];
            if (seg) result.push(seg);
            if (i < segments.length - 1) {
              result.push(
                <span
                  key={`evidence-${ref}-${i}`}
                  className="inline-flex items-center gap-0.5 rounded border border-[#d4af37]/20 bg-[#d4af37]/10 px-1 py-0 text-[10px] font-medium text-[#d4af37]"
                >
                  <Database className="h-2.5 w-2.5" />
                  {ref}
                </span>,
              );
            }
            return result;
          });
        });
      });
    }

    if (scenarioRefs && scenarioRefs.length > 0) {
      scenarioRefs.forEach((ref) => {
        parts = parts.flatMap((part) => {
          if (typeof part !== "string") return [part];
          const segments = part.split(ref);
          if (segments.length === 1) return [part];
          return segments.flatMap((seg, i) => {
            const result: (string | React.ReactNode)[] = [];
            if (seg) result.push(seg);
            if (i < segments.length - 1) {
              result.push(
                <span
                  key={`scenario-${ref}-${i}`}
                  className="inline-flex items-center gap-0.5 rounded border border-blue-400/20 bg-blue-400/10 px-1 py-0 text-[10px] font-medium text-blue-400"
                >
                  <BarChart3 className="h-2.5 w-2.5" />
                  {ref}
                </span>,
              );
            }
            return result;
          });
        });
      });
    }

    return parts;
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col rounded-2xl border border-white/[0.09] bg-[#101010] overflow-hidden",
        className,
      )}
    >
      <div className="border-b border-white/[0.06] px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Executive Chat</h3>
        <p className="text-xs text-zinc-500">Ask your CFO advisor anything</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 400 }}>
        <AnimatePresence>
          {messages.map((msg) => {
            const role = ROLE_CONFIG[msg.role] ?? ROLE_CONFIG.system;
            const RoleIcon = role.icon;
            const isUser = msg.role === "user";

            return (
              <motion.div
                key={msg.id}
                variants={listItem}
                initial="hidden"
                animate="visible"
                className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    role.bg,
                    role.color,
                  )}
                >
                  <RoleIcon className="h-3.5 w-3.5" />
                </div>

                <div className={cn("min-w-0 max-w-[80%]", isUser && "text-right")}>
                  <div className="mb-1 flex items-center gap-1.5">
                    {!isUser && <span className={cn("text-[10px] font-medium", role.color)}>{role.label}</span>}
                    {isUser && <span className="text-[10px] font-medium text-zinc-500">You</span>}
                    {msg.timestamp && (
                      <span className="flex items-center gap-0.5 text-[10px] text-zinc-600">
                        <Clock className="h-2.5 w-2.5" />
                        {formatChatTimestamp(msg.timestamp)}
                      </span>
                    )}
                  </div>

                  <div
                    className={cn(
                      "inline-block rounded-xl px-3 py-2 text-xs leading-relaxed",
                      isUser
                        ? "rounded-tr-sm bg-blue-500/15 text-zinc-200"
                        : "rounded-tl-sm bg-white/[0.05] text-zinc-300",
                    )}
                  >
                    <span className="whitespace-pre-wrap break-words">
                      {renderContent(msg.content, msg.evidenceRefs, msg.scenarioRefs)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {messages.length === 0 && (
          <div className="py-8 text-center">
            <Bot className="mx-auto mb-2 h-5 w-5 text-zinc-500" />
            <p className="text-xs text-zinc-500">Start a conversation with your advisor</p>
          </div>
        )}
      </div>

      {onSend && (
        <div className="border-t border-white/[0.06] px-4 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about treasury, risk, or recommendations..."
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-[#d4af37]/30 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/20 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex items-center justify-center rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-2 text-[#d4af37] hover:bg-[#d4af37]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
