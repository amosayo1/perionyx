"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Terminal, FileText, Scale, Clock } from "lucide-react";

interface Message {
  id: string;
  role: "agent" | "user" | "system";
  content: string;
  timestamp?: string;
  agentName?: string;
  evidence?: Array<{ id: string; label: string; type?: string }>;
  decisions?: Array<{ id: string; label: string; outcome?: string }>;
}

interface AgentConversationProps {
  messages: Message[];
  className?: string;
}

const ROLE_CONFIG: Record<Message["role"], { icon: typeof Bot; label: string; bg: string; text: string; border: string }> = {
  agent: {
    icon: Bot,
    label: "Agent",
    bg: "bg-gold/10",
    text: "text-gold",
    border: "border-gold/20",
  },
  user: {
    icon: User,
    label: "User",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  system: {
    icon: Terminal,
    label: "System",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    border: "border-zinc-500/20",
  },
};

function formatTimestamp(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AgentConversation({ messages, className }: AgentConversationProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 overflow-y-auto rounded-2xl border border-white/[0.09] bg-[#111118] p-4",
        "max-h-[600px] min-h-[300px]",
        className,
      )}
    >
      <AnimatePresence initial={false}>
        {messages.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-sm text-zinc-500">No messages yet.</p>
          </div>
        )}
        {messages.map((msg) => {
          const config = ROLE_CONFIG[msg.role];
          const RoleIcon = config.icon;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <div className="flex items-start gap-3">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", config.bg, config.border)}>
                  <RoleIcon className={cn("h-4 w-4", config.text)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", config.text)}>
                      {msg.agentName ?? config.label}
                    </span>
                    {msg.timestamp && (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 rounded-xl rounded-tl-sm border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{msg.content}</p>
                  </div>

                  {msg.evidence && msg.evidence.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.evidence.map((ev) => (
                        <span
                          key={ev.id}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[10px] font-medium text-amber-400"
                        >
                          <FileText className="h-2.5 w-2.5" />
                          {ev.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {msg.decisions && msg.decisions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.decisions.map((dec) => (
                        <span
                          key={dec.id}
                          className="inline-flex items-center gap-1 rounded-md border border-purple-500/20 bg-purple-500/5 px-2 py-0.5 text-[10px] font-medium text-purple-400"
                        >
                          <Scale className="h-2.5 w-2.5" />
                          {dec.label}
                          {dec.outcome && (
                            <span className="text-purple-500/60">— {dec.outcome}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
