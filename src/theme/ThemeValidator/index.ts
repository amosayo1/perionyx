import type { ThemeConfig, ThemeValidationResult, ThemeValidationError } from "../types";
import { getContrastRatio, getLuminance } from "../color-utils";

interface ContrastThresholds {
  normalText: number;
  largeText: number;
  uiComponent: number;
}

const WCAG_AA: ContrastThresholds = {
  normalText: 4.5,
  largeText: 3,
  uiComponent: 3,
};

const WCAG_AAA: ContrastThresholds = {
  normalText: 7,
  largeText: 4.5,
  uiComponent: 3,
};

function validateContrast(
  fg: string,
  bg: string,
  label: string,
  thresholds: ContrastThresholds = WCAG_AA,
): ThemeValidationError | null {
  const ratio = getContrastRatio(fg, bg);
  if (ratio >= thresholds.normalText) return null;

  return {
    property: label,
    message: `Contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA minimum ${thresholds.normalText}:1`,
    wcagCriterion: "1.4.3",
    currentValue: `${ratio.toFixed(2)}:1`,
    suggestedValue: `≥${thresholds.normalText}:1`,
  };
}

export function validateTheme(theme: ThemeConfig): ThemeValidationResult {
  const errors: ThemeValidationError[] = [];
  const warnings: ThemeValidationError[] = [];

  const textOnBg = validateContrast(
    theme.text.primary,
    theme.backgrounds.primary,
    "text-primary on bg-primary",
  );
  if (textOnBg) errors.push(textOnBg);

  const textOnSurface = validateContrast(
    theme.text.primary,
    theme.backgrounds.surface,
    "text-primary on surface",
  );
  if (textOnSurface) errors.push(textOnSurface);

  const mutedOnBg = validateContrast(
    theme.text.muted,
    theme.backgrounds.primary,
    "text-muted on bg-primary",
  );
  if (mutedOnBg && getContrastRatio(theme.text.muted, theme.backgrounds.primary) < 3) {
    errors.push(mutedOnBg);
  } else if (mutedOnBg) {
    warnings.push(mutedOnBg);
  }

  const onAccent = validateContrast(
    theme.accent.onAccent,
    theme.accent.base,
    "onAccent on accent-base",
  );
  if (onAccent) errors.push(onAccent);

  const accentOnBg = validateContrast(
    theme.accent.base,
    theme.backgrounds.primary,
    "accent-base on bg-primary",
    { normalText: 3, largeText: 3, uiComponent: 3 },
  );
  if (accentOnBg) warnings.push(accentOnBg);

  const linkOnBg = validateContrast(
    theme.text.link,
    theme.backgrounds.primary,
    "link on bg-primary",
  );
  if (linkOnBg) warnings.push(linkOnBg);

  const successOnBg = validateContrast(
    theme.status.success,
    theme.backgrounds.surface,
    "status-success on surface",
    { normalText: 3, largeText: 3, uiComponent: 3 },
  );
  if (successOnBg) warnings.push(successOnBg);

  if (theme.text.primary === theme.text.muted) {
    errors.push({
      property: "text-primary / text-muted",
      message: "Primary and muted text colors must be distinguishable",
    });
  }

  if (theme.backgrounds.primary === theme.backgrounds.secondary) {
    warnings.push({
      property: "bg-primary / bg-secondary",
      message: "Primary and secondary backgrounds are identical — surfaces will lack depth",
    });
  }

  const bgLuminance = getLuminance(theme.backgrounds.primary);
  if (theme.mode === "dark" && bgLuminance > 0.2) {
    warnings.push({
      property: "bg-primary",
      message: "Dark mode backgrounds should have luminance < 0.2",
      currentValue: bgLuminance.toFixed(3),
    });
  }
  if (theme.mode === "light" && bgLuminance < 0.8) {
    warnings.push({
      property: "bg-primary",
      message: "Light mode backgrounds should have luminance > 0.8",
      currentValue: bgLuminance.toFixed(3),
    });
  }

  const errorCount = errors.length;
  const warningCount = warnings.length;
  const totalChecks = 10;
  const score = Math.max(0, Math.round(((totalChecks - errorCount - warningCount * 0.5) / totalChecks) * 100));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

export function validateAccentColor(hex: string): ThemeValidationError[] {
  const errors: ThemeValidationError[] = [];
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    errors.push({
      property: "accent",
      message: "Must be a valid 6-digit hex color (e.g., #d4af37)",
    });
    return errors;
  }
  const { getLuminance } = require("../color-utils");
  const l = getLuminance(hex);
  if (l < 0.05) {
    errors.push({
      property: "accent",
      message: "Accent color is too dark — will not be visible on dark surfaces",
    });
  }
  if (l > 0.95) {
    errors.push({
      property: "accent",
      message: "Accent color is too light — will not be visible on light surfaces",
    });
  }
  return errors;
}
