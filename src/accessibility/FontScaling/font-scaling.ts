"use client";

import { useEffect, useMemo } from "react";

export function useFontScaling(scalePercent: number): void {
  useEffect(() => {
    const root = document.documentElement;
    const scale = Math.max(75, Math.min(200, scalePercent)) / 100;
    root.style.setProperty("--a11y-font-scale", String(scale));
    root.style.fontSize = `${scale}rem`;
    root.style.setProperty("--a11y-font-size-xs", `${0.6875 * scale}rem`);
    root.style.setProperty("--a11y-font-size-sm", `${0.75 * scale}rem`);
    root.style.setProperty("--a11y-font-size-base", `${0.8125 * scale}rem`);
    root.style.setProperty("--a11y-font-size-lg", `${0.9375 * scale}rem`);
    root.style.setProperty("--a11y-font-size-xl", `${1.125 * scale}rem`);
    root.style.setProperty("--a11y-font-size-2xl", `${1.375 * scale}rem`);
    root.style.setProperty("--a11y-font-size-3xl", `${1.75 * scale}rem`);

    if (scalePercent === 100) {
      root.style.removeProperty("--a11y-font-scale");
      root.style.removeProperty("font-size");
    }

    return () => {
      root.style.removeProperty("--a11y-font-scale");
      root.style.removeProperty("font-size");
    };
  }, [scalePercent]);
}

export function useReadingDensity(density: "compact" | "comfortable"): void {
  useEffect(() => {
    const root = document.documentElement;
    if (density === "compact") {
      root.classList.add("a11y-density-compact");
      root.classList.remove("a11y-density-comfortable");
    } else {
      root.classList.add("a11y-density-comfortable");
      root.classList.remove("a11y-density-compact");
    }
    return () => {
      root.classList.remove("a11y-density-compact", "a11y-density-comfortable");
    };
  }, [density]);
}

export const FONT_SCALING_STYLES = `
  .a11y-density-compact {
    --a11y-spacing: 0.75;
    --a11y-line-height: 1.35;
  }
  .a11y-density-compact p, .a11y-density-compact li {
    line-height: var(--a11y-line-height);
    margin-bottom: calc(0.5rem * var(--a11y-spacing));
  }
  .a11y-density-compact .gap-2 { gap: 0.375rem !important; }
  .a11y-density-compact .gap-3 { gap: 0.5rem !important; }
  .a11y-density-compact .gap-4 { gap: 0.75rem !important; }
  .a11y-density-compact .p-4 { padding: 0.75rem !important; }
  .a11y-density-compact .px-4 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
  .a11y-density-compact .py-3 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }

  .a11y-density-comfortable {
    --a11y-spacing: 1.25;
    --a11y-line-height: 1.75;
  }
  .a11y-density-comfortable p, .a11y-density-comfortable li {
    line-height: var(--a11y-line-height);
    margin-bottom: calc(0.5rem * var(--a11y-spacing));
  }
`;

export function useZoomSupport(): void {
  useEffect(() => {
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      const original = meta.getAttribute("content") ?? "";
      if (!original.includes("user-scalable=yes")) {
        meta.setAttribute("content", "width=device-width, initial-scale=1, user-scalable=yes");
      }
    }
    root.style.setProperty("max-font-size", "100%");
    return () => {
      if (meta) {
        meta.setAttribute("content", "width=device-width, initial-scale=1");
      }
    };
  }, []);
}
