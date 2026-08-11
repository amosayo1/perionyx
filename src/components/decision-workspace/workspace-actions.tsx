"use client";

/**
 * Phase 22.3 — Decision Workspace: Right zone — Decision Actions
 *
 * Every action reuses the existing AP endpoints (no new API surface), previews
 * its consequence before executing, records an audit entry via the command
 * service, and requires a reason where the domain requires one. Dialogs are
 * WCAG-accessible (role=dialog, Escape, labelled fields, focus).
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2, ScrollText, Keyboard, AlertTriangle } from "lucide-react";
import { AnimatedDialog } from "@/components/enterprise/motion/animated-dialog";
import type { AvailableAction, DecisionWorkspaceData } from "@/modules/decision-workspace/types";
import { WORKSPACE_SHORTCUTS } from "./workspace-shortcuts";

interface ActionConfig {
  label: string;
  endpoint: string;
  destructive: boolean;
  primary: boolean;
  requiresReason: boolean;
  blockType?: boolean;
  shortcut: string;
}

const ACTION_CONFIG: Record<AvailableAction, ActionConfig> = {
  approve: { label: "Approve", endpoint: "approve", destructive: false, primary: true, requiresReason: false, shortcut: "A" },
  reject: { label: "Reject", endpoint: "reject", destructive: true, primary: false, requiresReason: true, shortcut: "R" },
  escalate: { label: "Escalate", endpoint: "escalate", destructive: false, primary: false, requiresReason: true, shortcut: "X" },
  block: { label: "Block", endpoint: "block", destructive: true, primary: false, requiresReason: true, blockType: true, shortcut: "B" },
  dispute: { label: "Dispute", endpoint: "dispute", destructive: false, primary: false, requiresReason: true, shortcut: "D" },
  void: { label: "Void", endpoint: "void", destructive: true, primary: false, requiresReason: true, shortcut: "V" },
};

const BLOCK_TYPES = ["FRAUD", "DUPLICATE", "INCOMPLETE", "LEGAL_HOLD", "OTHER"];

function buildBody(config: ActionConfig, reason: string, blockType: string): Record<string, unknown> | undefined {
  if (config.endpoint === "approve") return undefined;
  if (config.endpoint === "block") return { reason, blockType };
  if (config.endpoint === "dispute") return { disputeReason: reason };
  return { reason };
}

interface WorkspaceActionsProps {
  data: DecisionWorkspaceData;
  activeAction: AvailableAction | null;
  onActiveActionChange: (action: AvailableAction | null) => void;
  legendOpen: boolean;
  onLegendChange: (open: boolean) => void;
}

type RunState = "idle" | "loading" | "error";

export function WorkspaceActions({ data, activeAction, onActiveActionChange, legendOpen, onLegendChange }: WorkspaceActionsProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [blockType, setBlockType] = useState(BLOCK_TYPES[0]);
  const [runState, setRunState] = useState<RunState>("idle");
  const [error, setError] = useState<string | null>(null);

  const available = data.actions.available;
  const requiresReason = activeAction ? ACTION_CONFIG[activeAction].requiresReason : false;
  const reasonValid = reason.trim().length >= 10;
  const canSubmit = !requiresReason || reasonValid;

  const close = useCallback(() => {
    setRunState("idle");
    setError(null);
    setReason("");
    onActiveActionChange(null);
  }, [onActiveActionChange]);

  const submit = useCallback(async () => {
    if (!activeAction) return;
    const config = ACTION_CONFIG[activeAction];
    setRunState("loading");
    setError(null);
    try {
      const body = buildBody(config, reason.trim(), blockType);
      const res = await fetch(`/api/v1/ap/invoices/${data.invoiceId}/${config.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = errData?.error?.message ?? errData?.data?.error?.message ?? `Action failed (${res.status})`;
        throw new Error(msg);
      }
      setRunState("idle");
      close();
      router.refresh();
    } catch (err) {
      setRunState("error");
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  }, [activeAction, reason, blockType, data.invoiceId, close, router]);

  const openAction = (action: AvailableAction) => {
    setError(null);
    setReason("");
    onActiveActionChange(action);
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <section className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-surface-raised/70 to-surface-base/50 p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Decision actions</h2>

        {data.actions.terminal ? (
          <div className="mt-3 rounded-lg bg-white/[0.03] px-3 py-3 text-center">
            <p className="text-[13px] text-zinc-400">
              This invoice is <span className="font-medium text-white">{data.status.label}</span>.
              No further actions are available.
            </p>
          </div>
        ) : available.length === 0 ? (
          <p className="mt-3 text-[13px] text-zinc-500">No actions are available in the current state.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {available.includes("approve") && (
              <ActionButton
                config={ACTION_CONFIG.approve}
                consequence={data.actions.consequence.approve}
                onClick={() => openAction("approve")}
              />
            )}
            {available.includes("reject") && (
              <ActionButton
                config={ACTION_CONFIG.reject}
                consequence={data.actions.consequence.reject}
                onClick={() => openAction("reject")}
              />
            )}
            <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
              {available.includes("escalate") && (
                <ActionButton compact config={ACTION_CONFIG.escalate} consequence={data.actions.consequence.escalate} onClick={() => openAction("escalate")} />
              )}
              {available.includes("block") && (
                <ActionButton compact config={ACTION_CONFIG.block} consequence={data.actions.consequence.block} onClick={() => openAction("block")} />
              )}
              {available.includes("dispute") && (
                <ActionButton compact config={ACTION_CONFIG.dispute} consequence={data.actions.consequence.dispute} onClick={() => openAction("dispute")} />
              )}
              {available.includes("void") && (
                <ActionButton compact config={ACTION_CONFIG.void} consequence={data.actions.consequence.void} onClick={() => openAction("void")} />
              )}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
          <a
            href="#workspace-timeline"
            className="flex items-center gap-2 text-[12px] font-medium text-zinc-400 transition-colors hover:text-gold"
          >
            <ScrollText className="h-3.5 w-3.5" />
            View audit trail
          </a>
          <button
            type="button"
            onClick={() => onLegendChange(true)}
            className="flex items-center gap-2 text-[12px] font-medium text-zinc-400 transition-colors hover:text-gold"
          >
            <Keyboard className="h-3.5 w-3.5" />
            Keyboard shortcuts
          </button>
        </div>
      </section>

      {/* Consequence note */}
      {!data.actions.terminal && (
        <p className="px-1 text-[10px] leading-relaxed text-zinc-600">
          Every action records your identity, role, and timestamp in the append-only audit trail.
          Destructive actions require a written reason.
        </p>
      )}

      {/* Action dialog */}
      {activeAction && (
        <AnimatedDialog open onClose={close} size="sm" title={`${ACTION_CONFIG[activeAction].label} invoice`}>
          <div role="dialog" aria-modal="true" aria-labelledby="action-title" aria-describedby="action-desc">
            <h2 id="action-title" className="sr-only">
              {ACTION_CONFIG[activeAction].label} invoice {data.invoiceNumber}
            </h2>
            <p id="action-desc" className="text-[13px] leading-relaxed text-zinc-400">
              {data.actions.consequence[activeAction]}
            </p>

            {requiresReason && (
              <div className="mt-4">
                <label htmlFor="action-reason" className="block text-[12px] font-medium text-zinc-300">
                  Reason <span className="text-zinc-600">(minimum 10 characters)</span>
                </label>
                <textarea
                  id="action-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  autoFocus
                  aria-required="true"
                  aria-invalid={reason.length > 0 && !reasonValid}
                  aria-describedby="action-reason-hint"
                  className="mt-1.5 w-full resize-none rounded-lg border border-white/[0.08] bg-surface-elevated px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:border-gold-focus focus:outline-none"
                  placeholder="Explain why this action is being taken…"
                />
                <p id="action-reason-hint" className="mt-1 text-[10px] text-zinc-600">
                  {reason.length}/1000 characters · reason is stored in the audit trail
                </p>
              </div>
            )}

            {ACTION_CONFIG[activeAction].blockType && (
              <div className="mt-4">
                <label htmlFor="action-block-type" className="block text-[12px] font-medium text-zinc-300">
                  Block type
                </label>
                <select
                  id="action-block-type"
                  value={blockType}
                  onChange={(e) => setBlockType(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/[0.08] bg-surface-elevated px-3 py-2 text-[13px] text-white focus:border-gold-focus focus:outline-none"
                >
                  {BLOCK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {runState === "error" && error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                <p className="text-[12px] text-red-300" role="alert">{error}</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-white/[0.06] px-4 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.04]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit || runState === "loading"}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  ACTION_CONFIG[activeAction].destructive
                    ? "bg-red-600 text-white hover:bg-red-500"
                    : "bg-gold text-black hover:bg-gold/90",
                )}
              >
                {runState === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {ACTION_CONFIG[activeAction].label} invoice
              </button>
            </div>
          </div>
        </AnimatedDialog>
      )}

      {/* Shortcut legend */}
      <AnimatedDialog open={legendOpen} onClose={() => onLegendChange(false)} size="sm" title="Keyboard shortcuts">
        <ul className="space-y-2">
          {WORKSPACE_SHORTCUTS.map((s) => (
            <li key={s.key} className="flex items-center gap-3">
              <kbd className="inline-flex min-w-[1.6rem] items-center justify-center rounded border border-white/[0.1] bg-surface-elevated px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gold">
                {s.key}
              </kbd>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-zinc-300">{s.label}</p>
                <p className="text-[10px] text-zinc-600">{s.hint}</p>
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-600">P{s.priority}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] leading-relaxed text-zinc-600">
          Shortcuts are disabled while typing in a field. Money actions open a confirmation before any mutation.
        </p>
      </AnimatedDialog>
    </div>
  );
}

function ActionButton({
  config,
  consequence,
  onClick,
  compact = false,
}: {
  config: ActionConfig;
  consequence: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={consequence}
      className={cn(
        "group flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[13px] font-medium transition-colors",
        config.primary
          ? "border-gold-border bg-gold/10 text-gold hover:bg-gold/15"
          : config.destructive
            ? "border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"
            : "border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:bg-white/[0.05]",
      )}
    >
      <span className="flex items-center gap-2">
        {config.label}
        {compact && (
          <span className="hidden text-[10px] font-normal text-zinc-600 xl:inline">
            — {consequence.split(".")[0]}.
          </span>
        )}
      </span>
      <kbd className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/[0.1] bg-surface-elevated font-mono text-[10px] font-semibold text-zinc-500 transition-colors group-hover:text-zinc-300">
        {config.shortcut}
      </kbd>
    </button>
  );
}
