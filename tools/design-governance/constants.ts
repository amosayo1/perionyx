/**
 * Phase 22.0B.5 — EDL Canonical Constants for Governance Tooling
 *
 * Single source of truth for all lint rules, auditors, validators, and fixers.
 * Import from here — never hardcode these values in governance tools.
 */

// ── Forbidden Hex Colors (non-EDL) ──────────────────────────────────────────
// These hex values are NOT part of the EDL. If found in source code, they are violations.

export const FORBIDDEN_HEX = [
  // Legacy gold variants
  "#c9a84c",
  "#d4a843",
  "#dbb95c",
  // Wrong surfaces
  "#101010",
  "#1a1a1a",
  "#1a1a2e",
  "#040404",
  "#141414",
  "#232323",
  "#2a2a2a",
  "#333333",
  "#16213e",
  "#2a2a4a",
  "#3a3a5a",
  "#4a4a6a",
  // Wrong text
  "#e0e0e0",
  "#888",
  "#999",
  "#ccc",
  "#ddd",
  "#eee",
] as const;

// ── Allowed Hex Colors (EDL canonical) ───────────────────────────────────────
// These hex values ARE part of the EDL. They are never violations.

export const ALLOWED_HEX = [
  // Brand
  "#d4af37",
  "#e5c04a",
  "#c7a961",
  // Surfaces
  "#0a0a0f",
  "#111118",
  "#1a1a24",
  "#222230",
  // Text
  "#f7f6f2",
  "#a1a1aa",
  "#71717a",
  "#52525b",
  "#5e9eff",
  "#7db1ff",
  // Status
  "#22c55e",
  "#16a34a",
  "#f59e0b",
  "#d97706",
  "#ef4444",
  "#dc2626",
  "#b91c1c",
  "#3b82f6",
  "#2563eb",
  // Charts
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  // Neutral
  "#737373",
  "#525252",
  "#404040",
  "#333333",
  "#262626",
  "#171717",
  "#0a0a0a",
] as const;

// ── Forbidden rgba() Patterns ────────────────────────────────────────────────
// Non-EDL rgba patterns that indicate violations.

export const FORBIDDEN_RGBA_PATTERNS = [
  /rgba\(\s*201\s*,\s*168\s*,\s*76/,  // #c9a84c legacy gold
  /rgba\(\s*212\s*,\s*168\s*,\s*67/,  // #d4a843 legacy gold
  /rgba\(\s*224\s*,\s*224\s*,\s*224/, // #e0e0e0 text
] as const;

// ── EDL Allowed rgba() Patterns ──────────────────────────────────────────────
// These rgba patterns are part of the EDL.

export const ALLOWED_RGBA = [
  /rgba\(\s*212\s*,\s*175\s*,\s*55/,  // Gold variants
  /rgba\(\s*255\s*,\s*255\s*,\s*255/, // White border variants
  /rgba\(\s*0\s*,\s*0\s*,\s*0/,       // Black shadow/overlay
  /rgba\(\s*34\s*,\s*197\s*,\s*94/,   // Success
  /rgba\(\s*245\s*,\s*158\s*,\s*11/,  // Warning
  /rgba\(\s*239\s*,\s*68\s*,\s*68/,   // Error
  /rgba\(\s*59\s*,\s*130\s*,\s*246/,  // Info
  /rgba\(\s*113\s*,\s*113\s*,\s*122/, // Neutral
  /rgba\(\s*220\s*,\s*38\s*,\s*38/,   // Critical
] as const;

// ── Forbidden Spacing Values ─────────────────────────────────────────────────
// Inline style spacing values that should use EDL tokens.

export const FORBIDDEN_SPACING = [
  "padding: '4px'",
  "padding: '8px'",
  "padding: '12px'",
  "padding: '16px'",
  "padding: '20px'",
  "padding: '24px'",
  "margin: '4px'",
  "margin: '8px'",
  "margin: '12px'",
  "margin: '16px'",
  "gap: 4",
  "gap: 8",
  "gap: 12",
  "gap: 16",
  "gap: 20",
  "gap: 24",
] as const;

// ── Forbidden Shadow Patterns ────────────────────────────────────────────────

export const FORBIDDEN_SHADOW_PATTERNS = [
  /boxShadow:\s*['"]0\s+\d+px\s+\d+px\s+rgba/,
  /shadow-\[#/,
] as const;

// ── Forbidden Z-Index Patterns ───────────────────────────────────────────────

export const FORBIDDEN_ZINDEX_PATTERNS = [
  /zIndex:\s*\d{3,}/,
  /z-\[\d+\]/,
] as const;

// ── Forbidden Transition Patterns ────────────────────────────────────────────

export const FORBIDDEN_TRANSITION_PATTERNS = [
  /duration:\s*0\.\d{3,}/,  // More than 2 decimal places (not on EDL scale)
  /duration:\s*[2-9]\d/,    // > 100ms in framer-motion (not a round EDL value)
] as const;

// ── Forbidden Radius Patterns ────────────────────────────────────────────────

export const FORBIDDEN_RADIUS_PATTERNS = [
  /borderRadius:\s*[3-5]\b/,   // 3px, 4px, 5px not on EDL scale
  /borderRadius:\s*[7-9]\b/,   // 7px, 9px not on EDL scale
  /borderRadius:\s*\d{2,}\b/,  // 10+ px
] as const;

// ── Forbidden Typography Patterns ────────────────────────────────────────────

export const FORBIDDEN_FONT_SIZE_PATTERNS = [
  /fontSize:\s*\d+\b/,  // Any inline fontSize (should use Tailwind classes)
] as const;

// ── Legacy Import Patterns ───────────────────────────────────────────────────

export const FORBIDDEN_IMPORT_PATTERNS = [
  /from\s+['"]@\/design-system\/tokens\//,
  /from\s+['"]@\/components\/enterprise\/motion\/tokens['"]/,
] as const;

// ── EDL Import Pattern ───────────────────────────────────────────────────────

export const EDL_IMPORT_PATTERN = /from\s+['"]@\/design-system\/edl/;

// ── Tailwind Arbitrary Value Patterns (non-EDL) ─────────────────────────────

export const FORBIDDEN_TAILWIND_ARBITRARY = [
  /text-\[#[0-9a-fA-F]+\]/,
  /bg-\[#[0-9a-fA-F]+\]/,
  /border-\[#[0-9a-fA-F]+\]/,
  /ring-\[#[0-9a-fA-F]+\]/,
  /fill-\[#[0-9a-fA-F]+\]/,
  /stroke-\[#[0-9a-fA-F]+\]/,
  /shadow-\[#[0-9a-fA-F]+\]/,
  /divide-\[#[0-9a-fA-F]+\]/,
  /from-\[#[0-9a-fA-F]+\]/,
  /to-\[#[0-9a-fA-F]+\]/,
  /via-\[#[0-9a-fA-F]+\]/,
  /accent-\[#[0-9a-fA-F]+\]/,
  /outline-\[#[0-9a-fA-F]+\]/,
  /decoration-\[#[0-9a-fA-F]+\]/,
  /border-l-\[#[0-9a-fA-F]+\]/,
  /border-t-\[#[0-9a-fA-F]+\]/,
  /border-r-\[#[0-9a-fA-F]+\]/,
  /border-b-\[#[0-9a-fA-F]+\]/,
] as const;

// ── File Path Exceptions ─────────────────────────────────────────────────────
// These files are exempt from governance rules.

export const EXEMPT_FILE_PATTERNS = [
  /tools\/design-governance\//,    // The governance tools themselves
  /edl-eslint-plugin\//,           // ESLint plugin source
  /design-system\/edl\//,          // EDL token definitions
  /design-system\/tokens\//,       // Legacy tokens (deprecated but still needed)
  /tailwind\.config/,              // Tailwind configuration
  /globals\.css/,                  // CSS custom properties
  /\.config\.(js|ts|cjs|mjs)/,    // Config files
  /vitest\.config/,                // Test config
  /next\.config/,                  // Next.js config
  /docs\//,                        // Documentation
  /node_modules\//,                // Dependencies
  /\.next\//,                      // Build output
  /canvas/i,                       // Canvas rendering
  /chart/i,                        // Chart libraries
  /plotly/i,                       // Plotly
  /d3\//,                          // D3.js
  /three\//,                       // Three.js
  /konva/i,                        // Konva canvas
] as const;

// ── Component Compliance Requirements ────────────────────────────────────────

export const COMPONENT_REQUIREMENTS = {
  /** Must import from EDL */
  edlImport: true,
  /** Must not have hardcoded colors */
  noHardcodedColors: true,
  /** Must not have hardcoded spacing */
  noHardcodedSpacing: true,
  /** Must not have hardcoded shadows */
  noHardcodedShadows: true,
  /** Must not have hardcoded z-index */
  noHardcodedZIndex: true,
  /** Must support reduced motion */
  reducedMotion: true,
  /** Must have accessibility attributes */
  accessibility: true,
} as const;
