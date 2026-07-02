"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { useOnboarding } from "./onboarding-context";

const RECOMMENDATIONS: Array<{ id: string; label: string; module: string; description: string }> = [
  { id: "rec-dashboard", label: "View Executive Dashboard", module: "Dashboard", description: "Check cash position, pending approvals, and risk KPIs" },
  { id: "rec-transactions", label: "Create a Payment", module: "Transactions", description: "Test multi-currency payment with policy and approval routing" },
  { id: "rec-approvals", label: "Review Pending Approvals", module: "Approvals", description: "See how approval chains work with role-based routing" },
  { id: "rec-risk", label: "Explore Risk Alerts", module: "Risk", description: "View auto-generated compliance and AML risk incidents" },
  { id: "rec-scenario", label: "Run a Business Scenario", module: "Scenarios", description: "Execute pre-built workflows like High-Value Supplier Payment" },
  { id: "rec-copilot", label: "Ask Copilot", module: "Copilot", description: "Query treasury data using natural language" },
];

export function SmartRecommendation({ currentModule }: { currentModule?: string }) {
  const { completedTasks, addCompletedTask } = useOnboarding();
  const completedIds = new Set(completedTasks.map((t) => t.id));

  const suggestions = RECOMMENDATIONS.filter((r) => !completedIds.has(r.id)).slice(0, 2);

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#d4af37]/10 bg-gradient-to-r from-[#d4af37]/[0.04] to-transparent p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-[#d4af37]" />
        <span className="text-xs font-semibold text-white">Recommended Next Steps</span>
      </div>
      <div className="space-y-1.5">
        {suggestions.map((rec) => (
          <button
            key={rec.id}
            onClick={() => addCompletedTask({ id: rec.id, label: rec.label, module: rec.module })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-white/[0.04]"
          >
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#d4af37]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-200 truncate">{rec.label}</p>
              <p className="text-[10px] text-zinc-500 truncate">{rec.description}</p>
            </div>
            <span className="text-[10px] text-zinc-600 shrink-0">{rec.module}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
