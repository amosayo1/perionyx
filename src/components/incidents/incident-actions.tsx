"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  ArrowUpRight,
  MessageSquare,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export function IncidentActions() {
  const [loading, setLoading] = useState<string | null>(null);

  const actions = [
    { id: "assign", label: "Assign", icon: UserPlus },
    { id: "escalate", label: "Escalate", icon: ArrowUpRight, variant: "warning" as const },
    { id: "comment", label: "Add Note", icon: MessageSquare },
    { id: "resolve", label: "Resolve", icon: CheckCircle2, variant: "primary" as const },
    { id: "reopen", label: "Reopen", icon: RotateCcw },
    { id: "close", label: "Close", icon: XCircle },
  ];

  const handleAction = (id: string) => {
    setLoading(id);
    setTimeout(() => setLoading(null), 800);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        const isPrimary = action.variant === "primary";
        const isWarning = action.variant === "warning";
        return (
          <Button
            key={action.id}
            variant={isPrimary ? "default" : "outline"}
            size="sm"
            className={`gap-1.5 text-xs ${
              isWarning ? "border-amber-500/20 text-amber-400 hover:bg-amber-500/10" : ""
            } ${isPrimary ? "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20 hover:bg-[#d4af37]/20" : ""}`}
            disabled={loading === action.id}
            onClick={() => handleAction(action.id)}
          >
            <Icon className={`h-3.5 w-3.5 ${loading === action.id ? "animate-spin" : ""}`} />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
