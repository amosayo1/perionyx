"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, User, Lightbulb, Loader2 } from "lucide-react";
import { STEP_PALETTE } from "./types";
import type { StepPaletteItem } from "./types";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
}

interface Suggestion {
  label: string;
  action: "add_step" | "set_name" | "set_trigger" | "set_category";
  payload?: Record<string, unknown>;
}

const AI_SUGGESTIONS = [
  {
    title: "Generate an approval workflow",
    prompt: "Create a multi-level approval workflow for high-value transactions with AI risk assessment and notifications.",
  },
  {
    title: "Suggest missing steps",
    prompt: "Review the current workflow and suggest missing compliance or notification steps for a financial approval process.",
  },
  {
    title: "Optimize this workflow",
    prompt: "Analyze this workflow for bottlenecks and suggest optimizations to reduce approval time and improve efficiency.",
  },
  {
    title: "Create reconciliation workflow",
    prompt: "Generate a treasury reconciliation workflow that matches bank statements with ledger entries and handles exceptions.",
  },
];

export function AiAssistant({
  isOpen,
  onClose,
  onAddStep,
  onSetName,
  onSetTrigger,
  onSetCategory,
  currentStepCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddStep: (item: StepPaletteItem) => void;
  onSetName: (name: string) => void;
  onSetTrigger: (trigger: string) => void;
  onSetCategory: (category: string) => void;
  currentStepCount: number;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I can help you build financial workflows. Try one of the suggestions below or ask me anything.",
      suggestions: AI_SUGGESTIONS.map((s) => ({
        label: s.title,
        action: "add_step" as const,
      })),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSuggestion = async (suggestion: Suggestion) => {
    const aiSuggestion = AI_SUGGESTIONS.find((s) => s.title === suggestion.label);
    if (!aiSuggestion) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: aiSuggestion.title },
      {
        role: "assistant",
        content: "",
        suggestions: [],
      },
    ]);

    setIsLoading(true);

    setTimeout(() => {
      if (aiSuggestion.title === "Generate an approval workflow") {
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = {
            role: "assistant",
            content: `Here's a recommended workflow structure for high-value payment approvals:

**1. Risk Assessment** — Evaluate transaction risk using policy engine
**2. AI Review** — Get AI-powered risk recommendation
**3. Dual Approval** — Requires two parallel approvers
**4. Executive Sign-Off** — Final approval from admin
**5. Execute Payment** — Process via payment connector
**6. Send Notification** — Confirm completion

I've started adding the first steps to your workflow. You can adjust the configuration in the property panel.`,
            suggestions: [
              { label: "Add Approval Step", action: "add_step", payload: { type: "approval" } },
              { label: "Add AI Review", action: "add_step", payload: { type: "ai_recommendation" } },
              { label: "Set trigger to Scheduled", action: "set_trigger", payload: { trigger: "scheduled" } },
            ],
          };
          return newMsgs;
        });
        onSetName("High-Value Payment Approval");
        onSetCategory("approval");
      } else if (aiSuggestion.title === "Suggest missing steps") {
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = {
            role: "assistant",
            content: `Based on your current workflow (${currentStepCount} steps), I recommend adding:

**1. Policy Evaluation** — Ensures compliance before proceeding
**2. Notification Step** — Keeps stakeholders informed of status changes
**3. Audit Log Entry** — Records each action for compliance

Consider adding a conditional branch if different amounts require different approval paths.`,
            suggestions: [
              { label: "Add Policy Check", action: "add_step", payload: { type: "policy_evaluation" } },
              { label: "Add Notification", action: "add_step", payload: { type: "notification" } },
              { label: "Add Conditional Branch", action: "add_step", payload: { type: "conditional" } },
            ],
          };
          return newMsgs;
        });
      } else if (aiSuggestion.title === "Optimize this workflow") {
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = {
            role: "assistant",
            content: `Analysis of your workflow:

**Bottlenecks identified:**
- Sequential approvals can be parallelized for steps that don't depend on each other
- Consider adding timeout limits to prevent stalled workflows

**Recommendations:**
1. Add an AI recommendation step early to pre-screen transactions
2. Set timeouts on approval steps (e.g., 24h auto-escalation)
3. Add a notification step after each approval to keep requesters informed
4. Consider a conditional branch for low-value vs high-value paths`,
            suggestions: [
              { label: "Add AI Review", action: "add_step", payload: { type: "ai_recommendation" } },
              { label: "Add Notification", action: "add_step", payload: { type: "notification" } },
              { label: "Add Conditional", action: "add_step", payload: { type: "conditional" } },
            ],
          };
          return newMsgs;
        });
      } else if (aiSuggestion.title === "Create reconciliation workflow") {
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = {
            role: "assistant",
            content: `Here's a treasury reconciliation workflow:

**1. Fetch Bank Statements** — Sync via Plaid connector
**2. Fetch Ledger Entries** — Get unreconciled entries
**3. Auto-Match** — Run policy matching rules
**4. Exception Decision** — Route based on match results
**5. Notify Exceptions** — Alert team to unmatched items
**6. Generate Report** — Produce reconciliation summary

This can run on a scheduled trigger (e.g., daily at 6 AM).`,
            suggestions: [
              { label: "Add Connector Step", action: "add_step", payload: { type: "connector_execution" } },
              { label: "Add Policy Check", action: "add_step", payload: { type: "policy_evaluation" } },
              { label: "Set schedule (daily)", action: "set_trigger", payload: { trigger: "scheduled" } },
            ],
          };
          return newMsgs;
        });
        onSetName("Daily Treasury Reconciliation");
        onSetCategory("financial");
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
      { role: "assistant", content: "Thinking...", suggestions: [] },
    ]);

    setIsLoading(true);

    try {
      const aiRes = await fetch("/api/automation-studio/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are PERIONYX AI, a financial workflow automation assistant.
The user is building a workflow in an enterprise treasury automation platform.
Available step types: ${STEP_PALETTE.map((s) => s.label).join(", ")}.
Available trigger types: manual, scheduled, webhook, treasury_event, connector_event, approval_event, ai_event, policy_violation.

The user asks: "${userMsg}"

Respond with helpful, concise advice. Keep it under 200 words.
At the end, if relevant, suggest 1-3 action items prefixed with |SUGGEST|.

Example format:
|SUGGEST|Add Approval Step|add_step
|SUGGEST|Set trigger to Scheduled|set_trigger

Return only the response text and suggestions, no markdown formatting.`,
                },
              ],
            },
          ],
        }),
      });

      if (!aiRes.ok) throw new Error("API error");

      const aiData = await aiRes.json();
      const aiText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      const suggestionLines: string[] = [];
      const responseLines: string[] = [];
      for (const line of aiText.split("\n")) {
        if (line.startsWith("|SUGGEST|")) {
          suggestionLines.push(line);
        } else {
          responseLines.push(line);
        }
      }

      const suggestions: Suggestion[] = suggestionLines.map((line) => {
        const parts = line.split("|").filter(Boolean);
        if (parts.length >= 3) {
          const [, label, action] = parts;
          return {
            label,
            action: action as Suggestion["action"],
            payload: {},
          };
        }
        return { label: parts[1] ?? "Apply", action: "add_step" as const };
      });

      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          role: "assistant",
          content: responseLines.join("\n").trim() || "I'm not sure how to help with that. Try one of the suggestions above.",
          suggestions: suggestions.length > 0 ? suggestions : undefined,
        };
        return newMsgs;
      });
    } catch {
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          role: "assistant",
          content: "I can help you build workflows. Try asking me to generate a specific workflow or suggest improvements.",
          suggestions: AI_SUGGESTIONS.map((s) => ({
            label: s.title,
            action: "add_step" as const,
          })),
        };
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionAction = (suggestion: Suggestion) => {
    if (suggestion.action === "add_step") {
      const type = (suggestion.payload?.type as string) ?? "approval";
      const paletteItem = STEP_PALETTE.find((p) => p.type === type) ?? STEP_PALETTE[0];
      onAddStep(paletteItem);
    } else if (suggestion.action === "set_name" && suggestion.payload?.name) {
      onSetName(suggestion.payload.name as string);
    } else if (suggestion.action === "set_trigger" && suggestion.payload?.trigger) {
      onSetTrigger(suggestion.payload.trigger as string);
    } else if (suggestion.action === "set_category" && suggestion.payload?.category) {
      onSetCategory(suggestion.payload.category as string);
    } else {
      const paletteItem = STEP_PALETTE.find((p) =>
        suggestion.label.toLowerCase().includes(p.label.toLowerCase()),
      );
      if (paletteItem) {
        onAddStep(paletteItem);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-96 flex-col rounded-xl border border-white/[0.08] bg-[#0d0d0d] shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-white">AI Assistant</span>
        </div>
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:text-zinc-300">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex h-80 flex-col overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-[#d4af37]/10 text-zinc-200"
                  : "bg-zinc-900/60 text-zinc-300"
              }`}>
                {msg.content === "Thinking..." ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  msg.content.split("\n").map((line, j) => (
                    <p key={j} className={line.startsWith("**") ? "font-semibold text-white mt-2 first:mt-0" : line.startsWith("- ") ? "ml-3 text-zinc-400" : ""}>
                      {line.replace(/\*\*/g, "")}
                    </p>
                  ))
                )}
              </div>
              {msg.role === "user" && (
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/20 text-[#d4af37]">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
            {msg.suggestions && msg.suggestions.length > 0 && msg.content !== "Thinking..." && (
              <div className="mt-2 ml-8 flex flex-wrap gap-1.5">
                {msg.suggestions.map((s, j) => (
                  <button
                    key={j}
                    onClick={() => handleSuggestionAction(s)}
                    className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-2.5 py-1 text-[10px] text-emerald-400 transition-colors hover:bg-emerald-950/50"
                  >
                    <Lightbulb className="h-3 w-3" />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask AI about workflows..."
            className="flex-1 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d4af37]/50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37] text-black transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
