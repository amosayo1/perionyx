"use client";

/**
 * Phase 22.3 — Decision Workspace: Keyboard-first shortcuts
 *
 * Operator velocity (PP-090, PP-116). Shortcuts are guarded so typing inside
 * inputs/textareas/selects never triggers a workspace action. `?` opens the
 * legend. Priority-1 actions affect money — a confirmation dialog still opens
 * before any mutation.
 */

import { useEffect } from "react";

export type WorkspaceShortcutKey = "a" | "r" | "x" | "b" | "d" | "v" | "j" | "k" | "t" | "?";

export interface ShortcutHandlers {
  approve?: () => void;
  reject?: () => void;
  escalate?: () => void;
  block?: () => void;
  dispute?: () => void;
  voidInvoice?: () => void;
  nextEvidence?: () => void;
  prevEvidence?: () => void;
  timeline?: () => void;
  legend?: () => void;
}

export interface ShortcutDef {
  key: WorkspaceShortcutKey;
  label: string;
  hint: string;
  priority: 1 | 2 | 3;
}

export const WORKSPACE_SHORTCUTS: ShortcutDef[] = [
  { key: "a", label: "Approve", hint: "Open approval confirmation", priority: 1 },
  { key: "r", label: "Reject", hint: "Open reject dialog", priority: 1 },
  { key: "x", label: "Escalate", hint: "Open escalation dialog", priority: 1 },
  { key: "b", label: "Block", hint: "Open block dialog", priority: 2 },
  { key: "d", label: "Dispute", hint: "Open dispute dialog", priority: 2 },
  { key: "v", label: "Void", hint: "Open void dialog", priority: 2 },
  { key: "j", label: "Next evidence", hint: "Jump to the next evidence item", priority: 3 },
  { key: "k", label: "Previous evidence", hint: "Jump to the previous evidence item", priority: 3 },
  { key: "t", label: "Timeline", hint: "Jump to the decision timeline", priority: 3 },
  { key: "?", label: "Shortcuts", hint: "Show this legend", priority: 3 },
];

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

const KEY_TO_HANDLER: Record<WorkspaceShortcutKey, keyof ShortcutHandlers> = {
  a: "approve",
  r: "reject",
  x: "escalate",
  b: "block",
  d: "dispute",
  v: "voidInvoice",
  j: "nextEvidence",
  k: "prevEvidence",
  t: "timeline",
  "?": "legend",
};

export function useWorkspaceShortcuts(handlers: ShortcutHandlers): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const handler = KEY_TO_HANDLER[e.key as WorkspaceShortcutKey];
      if (!handler) return;
      const fn = handlers[handler];
      if (!fn) return;
      e.preventDefault();
      fn();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
