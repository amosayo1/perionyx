"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function CopilotHeader({ onNewConversation }: { onNewConversation?: () => void }) {
  const [creating, setCreating] = useState(false);

  const handleNewConversation = async () => {
    setCreating(true);
    try {
      if (onNewConversation) {
        onNewConversation();
      } else {
        const res = await fetch("/api/v1/copilot/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          toast.success("New session created");
        } else {
          toast.error("Failed to create session");
        }
      }
    } catch {
      toast.error("Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20">
            <Sparkles className="h-4 w-4 text-[#d4af37]" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Copilot</h1>
        </div>
        <p className="max-w-2xl text-sm text-zinc-500 leading-relaxed">
          Enterprise financial intelligence layer. Understands every module — Treasury, Payments, Ledger, Approvals, Policies, Risk, Audit, Reports, Platform Health, Integrations, and Developer APIs.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 text-xs bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20 hover:bg-[#d4af37]/20"
          onClick={handleNewConversation}
          disabled={creating}
        >
          {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />}
          New Session
        </Button>
      </div>
    </div>
  );
}
