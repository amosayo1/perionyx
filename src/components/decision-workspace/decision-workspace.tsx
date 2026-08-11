"use client";

/**
 * Phase 22.3 — Decision Workspace: main surface
 *
 * Three-zone layout (summary → evidence → actions) with keyboard-first
 * navigation. On small screens the reading order is summary → actions →
 * evidence so a reviewer can decide first and inspect second.
 */

import { useCallback, useMemo, useState } from "react";
import type { AvailableAction, DecisionWorkspaceData } from "@/modules/decision-workspace/types";
import { useWorkspaceShortcuts } from "./workspace-shortcuts";
import { WorkspaceSummary } from "./workspace-summary";
import { WorkspaceEvidence } from "./workspace-evidence";
import { WorkspaceTimeline } from "./workspace-timeline";
import { WorkspaceActions } from "./workspace-actions";

export function DecisionWorkspace({ data }: { data: DecisionWorkspaceData }) {
  const [activeAction, setActiveAction] = useState<AvailableAction | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  const available = data.actions.available;

  const openAction = useCallback(
    (action: AvailableAction) => {
      if (available.includes(action)) setActiveAction(action);
    },
    [available],
  );

  const moveFocus = useCallback((dir: 1 | -1) => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-evidence-item]"));
    if (items.length === 0) return;
    const current = document.activeElement as HTMLElement | null;
    const idx = current && items.includes(current) ? items.indexOf(current) : -1;
    const next = Math.min(Math.max(idx + dir, 0), items.length - 1);
    items[next].scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = items[next].querySelector<HTMLElement>("button, [tabindex]");
    focusable?.focus();
  }, []);

  const jumpTimeline = useCallback(() => {
    document.getElementById("workspace-timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handlers = useMemo(
    () => ({
      approve: () => openAction("approve"),
      reject: () => openAction("reject"),
      escalate: () => openAction("escalate"),
      block: () => openAction("block"),
      dispute: () => openAction("dispute"),
      voidInvoice: () => openAction("void"),
      nextEvidence: () => moveFocus(1),
      prevEvidence: () => moveFocus(-1),
      timeline: jumpTimeline,
      legend: () => setLegendOpen(true),
    }),
    [openAction, moveFocus, jumpTimeline],
  );

  useWorkspaceShortcuts(handlers);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
      {/* Left — Decision Summary */}
      <div className="order-1 lg:col-span-4 xl:col-span-3">
        <WorkspaceSummary data={data} />
      </div>

      {/* Center — Evidence Package + Decision Timeline */}
      <div className="order-3 space-y-4 lg:order-2 lg:col-span-8 xl:col-span-6">
        <WorkspaceEvidence data={data} />
        <WorkspaceTimeline data={data} />
      </div>

      {/* Right — Decision Actions */}
      <div className="order-2 lg:order-3 lg:col-span-4 xl:col-span-3">
        <div className="lg:sticky lg:top-20">
          <WorkspaceActions
            data={data}
            activeAction={activeAction}
            onActiveActionChange={setActiveAction}
            legendOpen={legendOpen}
            onLegendChange={setLegendOpen}
          />
        </div>
      </div>
    </div>
  );
}
