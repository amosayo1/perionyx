"use client";

import { useEffect } from "react";

export function useHighContrast(enabled: boolean): void {
  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add("a11y-high-contrast");
    } else {
      root.classList.remove("a11y-high-contrast");
    }
    return () => root.classList.remove("a11y-high-contrast");
  }, [enabled]);
}

export const HIGH_CONTRAST_STYLES = `
  .a11y-high-contrast {
    --hc-border: rgba(255, 255, 255, 0.4) !important;
    --hc-text: #ffffff !important;
    --hc-bg: #000000 !important;
  }
  .a11y-high-contrast * {
    border-color: var(--hc-border) !important;
  }
  .a11y-high-contrast .text-zinc-400,
  .a11y-high-contrast .text-zinc-500,
  .a11y-high-contrast .text-zinc-600,
  .a11y-high-contrast .text-zinc-700 {
    color: var(--hc-text) !important;
    opacity: 0.9;
  }
  .a11y-high-contrast .bg-zinc-900,
  .a11y-high-contrast .bg-zinc-950,
  .a11y-high-contrast .bg-perionyx-bg-primary {
    background-color: var(--hc-bg) !important;
  }
  .a11y-high-contrast [class*="border-white/"] {
    border-color: var(--hc-border) !important;
  }
  .a11y-high-contrast [class*="bg-white/"] {
    background-color: rgba(255, 255, 255, 0.15) !important;
  }
  .a11y-high-contrast [class*="text-\\[\\#d4af37\\]"],
  .a11y-high-contrast [class*="text-gold"] {
    color: #ffd700 !important;
  }
`;

export const COLOR_BLIND_STYLES: Record<string, string> = {
  protanopia: `
    html[data-color-blind="protanopia"] .text-red-400, html[data-color-blind="protanopia"] .bg-red-500,
    html[data-color-blind="protanopia"] .text-red-500 { color: #ff8800 !important; background-color: rgba(255,136,0,0.1) !important; }
    html[data-color-blind="protanopia"] .text-emerald-400, html[data-color-blind="protanopia"] .bg-emerald-500 { color: #0088ff !important; background-color: rgba(0,136,255,0.1) !important; }
  `,
  deuteranopia: `
    html[data-color-blind="deuteranopia"] .text-red-400, html[data-color-blind="deuteranopia"] .bg-red-500,
    html[data-color-blind="deuteranopia"] .text-red-500 { color: #ffaa00 !important; background-color: rgba(255,170,0,0.1) !important; }
    html[data-color-blind="deuteranopia"] .text-emerald-400, html[data-color-blind="deuteranopia"] .bg-emerald-500 { color: #0066ff !important; background-color: rgba(0,102,255,0.1) !important; }
  `,
  tritanopia: `
    html[data-color-blind="tritanopia"] .text-red-400, html[data-color-blind="tritanopia"] .bg-red-500,
    html[data-color-blind="tritanopia"] .text-red-500 { color: #ff6688 !important; background-color: rgba(255,102,136,0.1) !important; }
    html[data-color-blind="tritanopia"] .text-blue-400, html[data-color-blind="tritanopia"] .bg-blue-500 { color: #00bbaa !important; background-color: rgba(0,187,170,0.1) !important; }
  `,
};
