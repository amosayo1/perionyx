"use client";

import { useEffect } from "react";
import { HIGH_CONTRAST_STYLES } from "./HighContrast/high-contrast";
import { REDUCED_MOTION_STYLES } from "./ReducedMotion/reduced-motion";
import { FONT_SCALING_STYLES } from "./FontScaling/font-scaling";
import { COLOR_BLIND_STYLES } from "./HighContrast/high-contrast";

const ALL_STYLES = [
  HIGH_CONTRAST_STYLES,
  REDUCED_MOTION_STYLES,
  FONT_SCALING_STYLES,
  ...Object.values(COLOR_BLIND_STYLES),
].join("\n");

export function A11yStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "a11y-injected-styles";
    style.textContent = ALL_STYLES;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById("a11y-injected-styles");
      if (el) el.remove();
    };
  }, []);

  return null;
}
