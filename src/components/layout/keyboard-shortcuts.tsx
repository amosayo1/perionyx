"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, Command as CommandIcon } from "lucide-react";

interface Shortcut {
  key: string;
  label: string;
  description: string;
  category: string;
  handler: () => void;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

const GLOBAL_SHORTCUTS: Shortcut[] = [];

export function useKeyboardShortcuts() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const registerShortcuts = useCallback((shortcuts: Shortcut[]) => {
    const handler = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        const metaMatch = (s.metaKey ? e.metaKey : true) && (s.ctrlKey ? e.ctrlKey : true);
        if (metaMatch && e.key.toLowerCase() === s.key.toLowerCase()) {
          e.preventDefault();
          s.handler();
          return;
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return { shortcutsOpen, setShortcutsOpen, registerShortcuts };
}

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsDialog({ open, onClose }: KeyboardShortcutsDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const shortcuts = [
    { category: "Navigation", items: [
      { keys: "⌘K", description: "Command palette" },
      { keys: "⌘1–9", description: "Quick nav slot N" },
      { keys: "⌘B", description: "Toggle sidebar" },
      { keys: "⌘E", description: "Search" },
      { keys: "Q", description: "Quick actions" },
      { keys: "?", description: "Keyboard shortcuts" },
    ]},
    { category: "Actions", items: [
      { keys: "⌘N", description: "New item" },
      { keys: "⌘S", description: "Save" },
      { keys: "⌘F", description: "Find in page" },
      { keys: "⌘R", description: "Refresh" },
    ]},
    { category: "Navigation within tables", items: [
      { keys: "↑↓", description: "Navigate rows" },
      { keys: "␣", description: "Toggle select row" },
      { keys: "↵", description: "Open row" },
      { keys: "Home/End", description: "First/last row" },
    ]},
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="button"
      tabIndex={-1}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClose(); }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CommandIcon className="h-4 w-4 text-[#d4af37]" />
            <h3 className="text-sm font-semibold text-white">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-zinc-500 hover:bg-white/10 hover:text-zinc-300" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-5 max-h-[400px] overflow-y-auto">
          {shortcuts.map((group) => (
            <div key={group.category}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-2">{group.category}</p>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div key={item.keys} className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{item.description}</span>
                    <kbd className="rounded-md border border-white/[0.06] bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-500 font-mono">
                      {item.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[10px] text-zinc-600">
          Press <kbd className="rounded border border-white/[0.06] px-1 py-0.5">?</kbd> to toggle this dialog
        </p>
      </div>
    </div>
  );
}
