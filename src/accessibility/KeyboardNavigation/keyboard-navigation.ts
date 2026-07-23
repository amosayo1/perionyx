"use client";

import { useEffect, useCallback, useRef } from "react";

export type KeyHandler = (event: KeyboardEvent) => void;

export interface KeyBinding {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: KeyHandler;
  description: string;
  category?: string;
  preventDefault?: boolean;
}

export function useKeyboardNavigation(
  bindings: KeyBinding[],
  enabled: boolean = true,
  scope?: HTMLElement | null,
) {
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      const target = event.target as HTMLElement;
      if (target?.getAttribute("role") === "textbox" || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
        if (event.key === "Escape") {
          (target as HTMLInputElement).blur();
          event.preventDefault();
        }
        return;
      }

      for (const binding of bindingsRef.current) {
        const keyMatch = event.key === binding.key || event.code === binding.key;
        const ctrlMatch = binding.ctrlKey ? event.ctrlKey : !binding.ctrlKey;
        const metaMatch = binding.metaKey ? event.metaKey : !binding.metaKey;
        const shiftMatch = binding.shiftKey ? event.shiftKey : !binding.shiftKey;
        const altMatch = binding.altKey ? event.altKey : !binding.altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          if (binding.preventDefault) event.preventDefault();
          binding.handler(event);
          return;
        }
      }
    },
    [enabled],
  );

  useEffect(() => {
    const el = scope ?? document;
    const handler = (event: Event) => handleKeyDown(event as KeyboardEvent);
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [handleKeyDown, scope]);
}

export const ENTERPRISE_KEYBOARD_SHORTCUTS: KeyBinding[] = [
  { key: "?", handler: () => {}, description: "Show keyboard shortcuts", category: "General", preventDefault: true },
  { key: "k", metaKey: true, handler: () => {}, description: "Open command palette", category: "General", preventDefault: true },
  { key: "n", metaKey: true, handler: () => {}, description: "Create new item", category: "Actions" },
  { key: "s", metaKey: true, handler: () => {}, description: "Save current form", category: "Actions", preventDefault: true },
  { key: "f", metaKey: true, handler: () => {}, description: "Search / find", category: "Navigation", preventDefault: true },
  { key: "Escape", handler: () => {}, description: "Close dialog / cancel", category: "General", preventDefault: true },
  { key: "Tab", handler: () => {}, description: "Move to next element", category: "Navigation" },
  { key: "Tab", shiftKey: true, handler: () => {}, description: "Move to previous element", category: "Navigation" },
  { key: "Enter", handler: () => {}, description: "Activate / confirm", category: "General" },
  { key: " ", handler: () => {}, description: "Toggle / select", category: "General" },
  { key: "ArrowUp", handler: () => {}, description: "Move up / decrease", category: "Navigation" },
  { key: "ArrowDown", handler: () => {}, description: "Move down / increase", category: "Navigation" },
  { key: "ArrowLeft", handler: () => {}, description: "Move left / previous", category: "Navigation" },
  { key: "ArrowRight", handler: () => {}, description: "Move right / next", category: "Navigation" },
  { key: "Home", handler: () => {}, description: "Go to first item", category: "Navigation" },
  { key: "End", handler: () => {}, description: "Go to last item", category: "Navigation" },
  { key: "PageUp", handler: () => {}, description: "Scroll up one page", category: "Navigation" },
  { key: "PageDown", handler: () => {}, description: "Scroll down one page", category: "Navigation" },
];
