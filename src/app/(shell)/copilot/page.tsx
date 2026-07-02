"use client";

import { useState, useRef, useCallback } from "react";
import { CopilotLayout } from "@/components/copilot/copilot-layout";
import { CopilotHeader } from "@/components/copilot/copilot-header";
import { ConversationWorkspace } from "@/components/copilot/conversation-workspace";
import { CommandCenterPanel } from "@/components/copilot/command-center-panel";
import { IntelligenceQuestions } from "@/components/copilot/intelligence-questions";
import { KnowledgeIndexPanel } from "@/components/copilot/knowledge-index-panel";
import type { PersonaRole } from "@/modules/copilot/command-center";

export default function CopilotPage() {
  const workspaceRef = useRef<{ createNewConversation: () => void } | null>(null);
  const [persona, setPersona] = useState<PersonaRole>("CFO");

  const handleNewConversation = useCallback(() => {
    workspaceRef.current?.createNewConversation();
  }, []);

  const handleQuestionSelect = useCallback((text: string) => {
    // Dispatch a custom event that the conversation-workspace can listen for
    const event = new CustomEvent("copilot:ask", { detail: { text, persona } });
    window.dispatchEvent(event);
  }, [persona]);

  return (
    <CopilotLayout>
      <CopilotHeader onNewConversation={handleNewConversation} />
      <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr_220px] gap-4">
        {/* Left: Command Center + Intelligence Questions */}
        <div className="hidden xl:flex flex-col gap-4">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
            <CommandCenterPanel selected={persona} onSelect={setPersona} />
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
            <IntelligenceQuestions persona={persona} onSelect={handleQuestionSelect} />
          </div>
        </div>

        {/* Center: Conversation Workspace */}
        <div className="min-w-0">
          <ConversationWorkspace ref={workspaceRef} persona={persona} />
        </div>

        {/* Right: Knowledge Index */}
        <div className="hidden xl:flex flex-col gap-4">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
            <KnowledgeIndexPanel />
          </div>

          {/* Quick stats */}
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-semibold">Active Persona</p>
              <div className="flex items-center gap-2 rounded-lg bg-[#d4af37]/5 border border-[#d4af37]/10 px-2.5 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white">{persona}</p>
                  <p className="text-[10px] text-zinc-500">Intelligence Profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Insights Section */}
      <EnterpriseInsightsSection persona={persona} onSelect={handleQuestionSelect} />
    </CopilotLayout>
  );
}

function EnterpriseInsightsSection({
  persona,
  onSelect,
}: {
  persona: PersonaRole;
  onSelect: (text: string) => void;
}) {
  const briefings = [
    {
      title: "Daily Treasury Summary",
      prompt: "Generate a daily treasury briefing",
      description: "Cash position, pending approvals, risk alerts, and today's activity",
    },
    {
      title: "Weekly Treasury Report",
      prompt: "Generate a weekly treasury report",
      description: "Weekly transaction volume, approval trends, risk summary",
    },
    {
      title: "Monthly Financial Health",
      prompt: "Generate a monthly executive briefing",
      description: "Comprehensive monthly analysis across all modules",
    },
    {
      title: "Risk Digest",
      prompt: "Summarize current risk posture",
      description: "Open alerts, unresolved incidents, policy violations",
    },
    {
      title: "FX Exposure Summary",
      prompt: "Summarize FX exposure",
      description: "Multi-currency exposure, rate trends, hedging recommendations",
    },
    {
      title: "Audit Highlights",
      prompt: "Summarize recent audit activity",
      description: "Recent audit events, compliance status, policy changes",
    },
    {
      title: "Liquidity Outlook",
      prompt: "Analyze liquidity position",
      description: "Current liquidity, projections, recommendations",
    },
    {
      title: "Approval Performance",
      prompt: "Show approval performance metrics",
      description: "Approval times, bottlenecks, escalation trends",
    },
  ];

  const [visibleCount, setVisibleCount] = useState(4);

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Enterprise Insights</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            AI-generated executive summaries. Ask Copilot to generate any of these.
          </p>
        </div>
        <button
          onClick={() => setVisibleCount(visibleCount === briefings.length ? 4 : briefings.length)}
          className="text-[11px] font-medium text-[#d4af37] hover:text-[#d4af37]/80 transition-colors"
        >
          {visibleCount === briefings.length ? "Show less" : "Show all"}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {briefings.slice(0, visibleCount).map((b) => (
          <button
            key={b.title}
            onClick={() => onSelect(b.prompt)}
            className="group rounded-xl border border-white/[0.06] bg-zinc-900/40 p-3 text-left transition-all hover:bg-zinc-900/60 hover:border-[#d4af37]/20"
          >
            <p className="text-xs font-medium text-white group-hover:text-[#d4af37] transition-colors">{b.title}</p>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{b.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

