#!/usr/bin/env tsx
/**
 * Phase 22.0B.5 — EDL Codebase Scanner
 *
 * Scans the entire codebase for design violations:
 * - Hardcoded colors
 * - Hardcoded rgba()
 * - Hardcoded spacing
 * - Hardcoded shadows
 * - Hardcoded z-index
 * - Hardcoded radius
 * - Hardcoded typography
 * - Legacy imports
 * - Arbitrary Tailwind values
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../../..");
const SRC_DIR = path.join(ROOT, "src");

interface Violation {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: "error" | "warning";
}

interface ScanResult {
  totalFiles: number;
  filesWithViolations: number;
  totalViolations: number;
  byRule: Map<string, number>;
  bySeverity: { error: number; warning: number };
  violations: Violation[];
  score: number;
}

const RULES: { name: string; pattern: RegExp; severity: "error" | "warning"; message: string }[] = [
  {
    name: "no-hardcoded-colors",
    pattern: /#[0-9a-fA-F]{6}\b/g,
    severity: "error",
    message: "Hardcoded hex color — use EDL tokens",
  },
  {
    name: "no-hardcoded-rgba",
    pattern: /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g,
    severity: "error",
    message: "Hardcoded rgba() — use EDL tokens",
  },
  {
    name: "no-hardcoded-spacing",
    pattern: /(?:padding|margin|gap|top|left|right|bottom):\s*['"]?\d+px/g,
    severity: "warning",
    message: "Hardcoded spacing — use EDL spacing tokens or Tailwind utilities",
  },
  {
    name: "no-hardcoded-shadow",
    pattern: /boxShadow:\s*['"][^'"]+/g,
    severity: "error",
    message: "Hardcoded box-shadow — use EDL shadow tokens",
  },
  {
    name: "no-hardcoded-zindex",
    pattern: /zIndex:\s*\d{3,}/g,
    severity: "error",
    message: "Hardcoded z-index — use EDL z-index tokens",
  },
  {
    name: "no-hardcoded-radius",
    pattern: /borderRadius:\s*['"]?\d+px/g,
    severity: "warning",
    message: "Hardcoded border-radius — use EDL radius tokens",
  },
  {
    name: "no-hardcoded-fontsize",
    pattern: /fontSize:\s*\d+/g,
    severity: "warning",
    message: "Hardcoded font-size — use EDL typography tokens",
  },
  {
    name: "no-legacy-imports",
    pattern: /from\s+['"]@\/design-system\/tokens\//g,
    severity: "error",
    message: "Legacy design-system import — migrate to @/design-system/edl",
  },
  {
    name: "no-legacy-motion-imports",
    pattern: /from\s+['"]@\/components\/enterprise\/motion\/tokens['"]/g,
    severity: "warning",
    message: "Legacy motion token import — migrate to @/design-system/edl/motion",
  },
  {
    name: "no-arbitrary-tailwind-colors",
    pattern: /(?:text|bg|border|ring|fill|stroke|shadow|divide|from|to|via|accent|outline|decoration|border-l|border-t|border-r|border-b)-\[#[0-9a-fA-F]+\]/g,
    severity: "error",
    message: "Arbitrary Tailwind color — use EDL utility classes (text-gold, bg-surface-*, etc.)",
  },
];

const ALLOWED_HEX = new Set([
  "#d4af37", "#e5c04a", "#c7a961",
  "#0a0a0f", "#111118", "#1a1a24", "#222230",
  "#f7f6f2", "#a1a1aa", "#71717a", "#52525b", "#5e9eff",
  "#22c55e", "#16a34a", "#f59e0b", "#d97706",
  "#ef4444", "#dc2626", "#b91c1c", "#3b82f6", "#2563eb",
  "#a855f7", "#06b6d4", "#ec4899",
  "#737373", "#404040", "#262626", "#171717", "#0a0a0a",
]);

const EXEMPT_PATTERNS = [
  /tools\/design-governance\//,
  /edl-eslint-plugin\//,
  /design-system\/edl\//,
  /design-system\/tokens\//,
  /tailwind\.config/,
  /globals\.css/,
  /\.config\.(js|ts|cjs|mjs)/,
  /vitest\.config/,
  /next\.config/,
  /docs\//,
  /node_modules\//,
  /\.next\//,
];

function isExempt(filePath: string): boolean {
  const rel = path.relative(ROOT, filePath);
  return EXEMPT_PATTERNS.some((p) => p.test(rel));
}

function isAllowedHex(hex: string): boolean {
  return ALLOWED_HEX.has(hex.toLowerCase());
}

function scanFile(filePath: string): Violation[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const violations: Violation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const rule of RULES) {
      // Reset regex lastIndex for each line
      rule.pattern.lastIndex = 0;
      let match;
      while ((match = rule.pattern.exec(line)) !== null) {
        // Skip allowed hex colors for the color rule
        if (rule.name === "no-hardcoded-colors") {
          const hex = match[0];
          if (isAllowedHex(hex)) continue;
        }

        // Skip allowed rgba for the rgba rule
        if (rule.name === "no-hardcoded-rgba") {
          const rgba = match[0];
          if (/rgba\(\s*(212|255|0|34|245|239|59|113|220)\s*,/.test(rgba)) continue;
        }

        violations.push({
          file: path.relative(ROOT, filePath),
          line: i + 1,
          column: match.index,
          rule: rule.name,
          message: rule.message,
          severity: rule.severity,
        });
      }
    }
  }

  return violations;
}

export function scanCodebase(): ScanResult {
  console.log("🔍 Scanning codebase for design violations...\n");

  const allViolations: Violation[] = [];
  const byRule = new Map<string, number>();
  let totalFiles = 0;
  let filesWithViolations = 0;

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && !["node_modules", ".next", "dist"].includes(entry.name)) {
        walk(full);
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        if (isExempt(full)) continue;
        totalFiles++;
        const violations = scanFile(full);
        if (violations.length > 0) {
          filesWithViolations++;
          allViolations.push(...violations);
          for (const v of violations) {
            byRule.set(v.rule, (byRule.get(v.rule) || 0) + 1);
          }
        }
      }
    }
  }

  walk(SRC_DIR);

  const errors = allViolations.filter((v) => v.severity === "error").length;
  const warnings = allViolations.filter((v) => v.severity === "warning").length;
  const maxScore = 100;
  const deductions = errors * 2 + warnings * 1;
  const score = Math.max(0, maxScore - deductions);

  const result: ScanResult = {
    totalFiles,
    filesWithViolations,
    totalViolations: allViolations.length,
    byRule,
    bySeverity: { error: errors, warning: warnings },
    violations: allViolations,
    score,
  };

  // Report
  console.log(`  Files scanned:          ${result.totalFiles}`);
  console.log(`  Files with violations:  ${result.filesWithViolations}`);
  console.log(`  Total violations:       ${result.totalViolations}`);
  console.log(`  Errors:                 ${result.bySeverity.error}`);
  console.log(`  Warnings:               ${result.bySeverity.warning}`);
  console.log(`  Compliance score:       ${result.score}%\n`);

  // By rule
  console.log("  Violations by rule:");
  const sortedRules = [...byRule.entries()].sort((a, b) => b[1] - a[1]);
  for (const [rule, count] of sortedRules) {
    const bar = "█".repeat(Math.min(count, 40));
    console.log(`    ${rule}: ${count} ${bar}`);
  }
  console.log();

  if (result.score >= 80) {
    console.log("  ✅ Codebase scan: PASS");
  } else if (result.score >= 60) {
    console.log("  ⚠️  Codebase scan: WARN");
  } else {
    console.log("  ❌ Codebase scan: FAIL");
  }

  return result;
}

if (require.main === module) {
  const result = scanCodebase();
  process.exit(result.score >= 60 ? 0 : 1);
}
