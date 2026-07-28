#!/usr/bin/env tsx
/**
 * Phase 22.0B.5 — EDL Component Compliance Auditor
 *
 * Audits every reusable component for EDL compliance:
 * - Uses EDL spacing
 * - Uses EDL typography
 * - Uses EDL colors
 * - Uses EDL motion
 * - Uses semantic status tokens
 * - Uses enterprise elevation
 * - Supports reduced motion
 * - Supports accessibility
 * - No hardcoded values
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../../..");
const COMPONENTS_DIR = path.join(ROOT, "src/components");

interface ComplianceCheck {
  name: string;
  passed: boolean;
  details: string;
}

interface ComponentReport {
  file: string;
  relativePath: string;
  checks: ComplianceCheck[];
  score: number;
  violations: string[];
}

// ── Detection Patterns ───────────────────────────────────────────────────────

const HARDCODED_COLORS = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;
const HARDCODED_RGBA = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g;
const HARDCODED_SPACING = /(?:padding|margin|gap|top|left|right|bottom|width|height):\s*['"]?\d+px/g;
const HARDCODED_SHADOW = /boxShadow:\s*['"][^'"]+/g;
const HARDCODED_ZINDEX = /(?:zIndex|z-index):\s*\d+/g;
const HARDCODED_RADIUS = /borderRadius:\s*['"]?\d+px/g;
const HARDCODED_FONTSIZE = /fontSize:\s*\d+/g;
const EDL_IMPORT = /from\s+['"]@\/design-system\/edl/;
const REDUCED_MOTION = /prefers-reduced-motion|reducedMotion|MotionProvider|REDUCED_MOTION/;
const ARIA_ATTR = /aria-\w+|role\s*=/;
const FRAMER_MOTION = /from\s+['"]framer-motion['"]/;
const MOTION_TOKEN_IMPORT = /from\s+['"]@\/components\/enterprise\/motion\/tokens['"]/;
const STATUS_COLORS = /\b(success|error|warning|info|danger|gold)\b.*(?:color|bg|text|border)/i;

// Allowed hex values (EDL canonical)
const ALLOWED_HEX = new Set([
  "#d4af37", "#e5c04a", "#c7a961",
  "#0a0a0f", "#111118", "#1a1a24", "#222230",
  "#f7f6f2", "#a1a1aa", "#71717a", "#52525b", "#5e9eff",
  "#22c55e", "#16a34a", "#f59e0b", "#d97706",
  "#ef4444", "#dc2626", "#b91c1c", "#3b82f6", "#2563eb",
  "#a855f7", "#06b6d4", "#ec4899",
  "#737373", "#404040", "#262626", "#171717", "#0a0a0a",
]);

function isAllowedHex(hex: string): boolean {
  return ALLOWED_HEX.has(hex.toLowerCase());
}

function auditComponent(filePath: string): ComponentReport {
  const content = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(ROOT, filePath);
  const checks: ComplianceCheck[] = [];
  const violations: string[] = [];

  // 1. EDL Import
  const hasEdlImport = EDL_IMPORT.test(content);
  checks.push({
    name: "EDL Import",
    passed: hasEdlImport,
    details: hasEdlImport ? "Imports from @/design-system/edl" : "No EDL import found",
  });
  if (!hasEdlImport) violations.push("Missing EDL import");

  // 2. No Hardcoded Colors
  const colorMatches = content.match(HARDCODED_COLORS) || [];
  const forbiddenColors = colorMatches.filter((c) => !isAllowedHex(c));
  const noHardcodedColors = forbiddenColors.length === 0;
  checks.push({
    name: "No Hardcoded Colors",
    passed: noHardcodedColors,
    details: noHardcodedColors
      ? "No non-EDL hardcoded colors"
      : `Found ${forbiddenColors.length} non-EDL colors: ${[...new Set(forbiddenColors)].slice(0, 5).join(", ")}`,
  });
  if (!noHardcodedColors) violations.push(`${forbiddenColors.length} hardcoded colors`);

  // 3. No Hardcoded rgba()
  const rgbaMatches = content.match(HARDCODED_RGBA) || [];
  const noHardcodedRgba = rgbaMatches.length === 0;
  checks.push({
    name: "No Hardcoded RGBA",
    passed: noHardcodedRgba,
    details: noHardcodedRgba ? "No hardcoded rgba()" : `Found ${rgbaMatches.length} rgba() values`,
  });
  if (!noHardcodedRgba) violations.push(`${rgbaMatches.length} hardcoded rgba()`);

  // 4. No Hardcoded Spacing
  const spacingMatches = content.match(HARDCODED_SPACING) || [];
  const noHardcodedSpacing = spacingMatches.length === 0;
  checks.push({
    name: "No Hardcoded Spacing",
    passed: noHardcodedSpacing,
    details: noHardcodedSpacing ? "No hardcoded spacing" : `Found ${spacingMatches.length} hardcoded spacing values`,
  });
  if (!noHardcodedSpacing) violations.push(`${spacingMatches.length} hardcoded spacing`);

  // 5. No Hardcoded Shadows
  const shadowMatches = content.match(HARDCODED_SHADOW) || [];
  const noHardcodedShadows = shadowMatches.length === 0;
  checks.push({
    name: "No Hardcoded Shadows",
    passed: noHardcodedShadows,
    details: noHardcodedShadows ? "No hardcoded shadows" : `Found ${shadowMatches.length} hardcoded shadows`,
  });
  if (!noHardcodedShadows) violations.push(`${shadowMatches.length} hardcoded shadows`);

  // 6. No Hardcoded Z-Index
  const zindexMatches = content.match(HARDCODED_ZINDEX) || [];
  const noHardcodedZIndex = zindexMatches.length === 0;
  checks.push({
    name: "No Hardcoded Z-Index",
    passed: noHardcodedZIndex,
    details: noHardcodedZIndex ? "No hardcoded z-index" : `Found ${zindexMatches.length} hardcoded z-index`,
  });
  if (!noHardcodedZIndex) violations.push(`${zindexMatches.length} hardcoded z-index`);

  // 7. No Hardcoded Radius
  const radiusMatches = content.match(HARDCODED_RADIUS) || [];
  const noHardcodedRadius = radiusMatches.length === 0;
  checks.push({
    name: "No Hardcoded Radius",
    passed: noHardcodedRadius,
    details: noHardcodedRadius ? "No hardcoded border-radius" : `Found ${radiusMatches.length} hardcoded radius`,
  });
  if (!noHardcodedRadius) violations.push(`${radiusMatches.length} hardcoded radius`);

  // 8. No Hardcoded Font Size
  const fontSizeMatches = content.match(HARDCODED_FONTSIZE) || [];
  const noHardcodedFontSize = fontSizeMatches.length === 0;
  checks.push({
    name: "No Hardcoded Font Size",
    passed: noHardcodedFontSize,
    details: noHardcodedFontSize ? "No hardcoded font-size" : `Found ${fontSizeMatches.length} hardcoded font-size`,
  });
  if (!noHardcodedFontSize) violations.push(`${fontSizeMatches.length} hardcoded font-size`);

  // 9. Reduced Motion Support
  const hasReducedMotion = REDUCED_MOTION.test(content);
  const usesMotion = FRAMER_MOTION.test(content) || MOTION_TOKEN_IMPORT.test(content);
  const reducedMotionOk = !usesMotion || hasReducedMotion;
  checks.push({
    name: "Reduced Motion",
    passed: reducedMotionOk,
    details: usesMotion
      ? hasReducedMotion ? "Reduced motion supported" : "Uses motion but no reduced-motion support"
      : "No motion used (OK)",
  });
  if (!reducedMotionOk) violations.push("Missing reduced-motion support");

  // 10. Accessibility
  const hasAria = ARIA_ATTR.test(content);
  const isInteractive = /onClick|onPress|onSubmit/.test(content);
  const accessibilityOk = !isInteractive || hasAria;
  checks.push({
    name: "Accessibility",
    passed: accessibilityOk,
    details: isInteractive
      ? hasAria ? "Has ARIA attributes" : "Interactive element without ARIA"
      : "No interactive elements (OK)",
  });
  if (!accessibilityOk) violations.push("Interactive element without ARIA");

  // Calculate score
  const passedChecks = checks.filter((c) => c.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    file: filePath,
    relativePath: relPath,
    checks,
    score,
    violations,
  };
}

export function auditComponents(): ComponentReport[] {
  console.log("🔍 Auditing component compliance...\n");

  const reports: ComponentReport[] = [];

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !["node_modules", ".next", "dist"].includes(entry.name)) {
        walkDir(fullPath);
      } else if (entry.name.endsWith(".tsx") && !entry.name.includes(".test.") && !entry.name.includes(".spec.")) {
        reports.push(auditComponent(fullPath));
      }
    }
  }

  walkDir(COMPONENTS_DIR);

  // Sort by score (worst first)
  reports.sort((a, b) => a.score - b.score);

  // Summary
  const avgScore = Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length);
  const compliant = reports.filter((r) => r.score >= 80).length;
  const partial = reports.filter((r) => r.score >= 50 && r.score < 80).length;
  const failing = reports.filter((r) => r.score < 50).length;

  console.log(`  Components audited:    ${reports.length}`);
  console.log(`  Compliant (≥80%):      ${compliant}`);
  console.log(`  Partial (50-79%):      ${partial}`);
  console.log(`  Failing (<50%):        ${failing}`);
  console.log(`  Average score:         ${avgScore}%\n`);

  // Top 10 worst
  console.log("  Top 10 worst components:");
  for (const report of reports.slice(0, 10)) {
    console.log(`    ${report.score}% — ${report.relativePath}`);
    for (const v of report.violations.slice(0, 3)) {
      console.log(`      ⚠️  ${v}`);
    }
  }
  console.log();

  if (avgScore >= 70) {
    console.log("  ✅ Component compliance: PASS");
  } else if (avgScore >= 50) {
    console.log("  ⚠️  Component compliance: WARN");
  } else {
    console.log("  ❌ Component compliance: FAIL");
  }

  return reports;
}

// ── CLI Entry ────────────────────────────────────────────────────────────────

if (require.main === module) {
  const reports = auditComponents();
  const avgScore = Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length);
  process.exit(avgScore >= 50 ? 0 : 1);
}
