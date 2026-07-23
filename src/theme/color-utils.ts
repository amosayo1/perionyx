export function parseHex(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, "0")).join("")}`;
}

export function hexToRgb(hex: string): string {
  const { r, g, b } = parseHex(hex);
  return `${r}, ${g}, ${b}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function getLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAGAA(hex1: string, hex2: string, isLargeText = false): boolean {
  return getContrastRatio(hex1, hex2) >= (isLargeText ? 3 : 4.5);
}

export function meetsWCAGAAA(hex1: string, hex2: string, isLargeText = false): boolean {
  return getContrastRatio(hex1, hex2) >= (isLargeText ? 4.5 : 7);
}

export function lighten(hex: string, percent: number): string {
  const { r, g, b } = parseHex(hex);
  const factor = 1 + percent / 100;
  return toHex(r * factor, g * factor, b * factor);
}

export function darken(hex: string, percent: number): string {
  const { r, g, b } = parseHex(hex);
  const factor = 1 - percent / 100;
  return toHex(r * factor, g * factor, b * factor);
}

export function mix(hex1: string, hex2: string, weight: number): string {
  const c1 = parseHex(hex1);
  const c2 = parseHex(hex2);
  const w = Math.max(0, Math.min(1, weight));
  return toHex(
    c1.r * (1 - w) + c2.r * w,
    c1.g * (1 - w) + c2.g * w,
    c1.b * (1 - w) + c2.b * w,
  );
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = parseHex(hex);
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rf) {
      h = ((gf - bf) / d + (gf < bf ? 6 : 0)) / 6;
    } else if (max === gf) {
      h = ((bf - rf) / d + 2) / 6;
    } else {
      h = ((rf - gf) / d + 4) / 6;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return toHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

export function hslToString(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

export function getAccessibleVariant(hex: string, bgHex: string, preferredLuminance?: "light" | "dark"): string {
  const bgL = getLuminance(bgHex);
  const isDarkBg = bgL < 0.5;
  let variant = hex;
  for (let i = 0; i < 20; i++) {
    if (meetsWCAGAA(variant, bgHex)) return variant;
    if (preferredLuminance === "light" || (isDarkBg && preferredLuminance !== "dark")) {
      variant = lighten(variant, 5);
    } else {
      variant = darken(variant, 5);
    }
  }
  return isDarkBg ? "#ffffff" : "#000000";
}

export function generateChartPalette(baseHex: string, count = 7): string[] {
  const goldenAngle = 137.508;
  const { s, l } = hexToHsl(baseHex);
  const palette: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * goldenAngle) % 360;
    const sat = Math.max(25, Math.min(70, s + (i % 3 - 1) * 10));
    const lig = Math.max(35, Math.min(65, l + (i % 2 === 0 ? 5 : -5)));
    palette.push(hslToHex(hue, sat, lig));
  }
  return palette;
}

export function generateStatusPalette(accent: string, mode: "light" | "dark"): ThemeStatusColors {
  if (mode === "dark") {
    return {
      success: "#3ca16d",
      warning: "#d4a72c",
      error: "#b56b5e",
      info: "#5b8fc9",
    };
  }
  return {
    success: "#2e7d5e",
    warning: "#b88a1f",
    error: "#9f4d40",
    info: "#3d7bbf",
  };
}

export interface ThemeStatusColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export function generateAccentPalette(accent: string, mode: "light" | "dark"): AccentPaletteResult {
  const isDark = mode === "dark";
  const bgHex = isDark ? "#040404" : "#ffffff";

  const hover = isDark ? lighten(accent, 12) : darken(accent, 10);
  const pressed = isDark ? lighten(accent, 22) : darken(accent, 20);
  const focus = hexToRgba(accent, isDark ? 0.5 : 0.35);
  const muted = hexToRgba(accent, isDark ? 0.2 : 0.15);
  const subtle = hexToRgba(accent, isDark ? 0.08 : 0.06);

  const onAccent = getAccessibleVariant(isDark ? "#ffffff" : "#000000", accent);

  return { base: accent, hover, pressed, focus, muted, subtle, onAccent };
}

export interface AccentPaletteResult {
  base: string;
  hover: string;
  pressed: string;
  focus: string;
  muted: string;
  subtle: string;
  onAccent: string;
}
