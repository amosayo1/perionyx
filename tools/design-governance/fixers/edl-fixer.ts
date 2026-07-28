#!/usr/bin/env tsx
/**
 * Phase 22.0B.5 — EDL Auto-Fixer
 *
 * Safely replaces known hardcoded values with EDL equivalents:
 * - Legacy gold hex → #d4af37
 * - Legacy surface hex → EDL surfaces
 * - Arbitrary Tailwind colors → EDL utilities
 * - Legacy imports → EDL imports
 *
 * Dry-run by default. Use --apply to write changes.
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const SRC_DIR = path.join(ROOT, "src");
const APPLY = process.argv.includes("--apply");

const FIXES: { pattern: RegExp; replacement: string; description: string }[] = [
  // Legacy gold
  { pattern: /#c9a84c/gi, replacement: "#d4af37", description: "Legacy gold #c9a84c → EDL gold" },
  { pattern: /#d4a843/gi, replacement: "#d4af37", description: "Legacy gold #d4a843 → EDL gold" },
  { pattern: /#a89545/gi, replacement: "#d4af37", description: "Legacy gold #a89545 → EDL gold" },
  { pattern: /#8b7e3b/gi, replacement: "#d4af37", description: "Legacy gold #8b7e3b → EDL gold" },
  { pattern: /#c9a94c/gi, replacement: "#d4af37", description: "Legacy gold #c9a94c → EDL gold" },
  { pattern: /#d4aa49/gi, replacement: "#d4af37", description: "Legacy gold #d4aa49 → EDL gold" },
  { pattern: /#f0c040/gi, replacement: "#d4af37", description: "Legacy gold #f0c040 → EDL gold" },
  { pattern: /#ffc107/gi, replacement: "#d4af37", description: "Legacy gold #ffc107 → EDL gold" },
  { pattern: /#fbbf24/gi, replacement: "#d4af37", description: "Legacy gold #fbbf24 → EDL gold" },
  { pattern: /#c09f3c/gi, replacement: "#d4af37", description: "Legacy gold #c09f3c → EDL gold" },
  // Legacy surfaces
  { pattern: /#08080f/gi, replacement: "#0a0a0f", description: "Legacy surface #08080f → EDL base" },
  { pattern: /#0c0c14/gi, replacement: "#0a0a0f", description: "Legacy surface #0c0c14 → EDL base" },
  { pattern: /#0e0e16/gi, replacement: "#111118", description: "Legacy surface #0e0e16 → EDL raised" },
  { pattern: /#0b0b13/gi, replacement: "#111118", description: "Legacy surface #0b0b13 → EDL raised" },
  { pattern: /#16161e/gi, replacement: "#222230", description: "Legacy surface #16161e → EDL overlay" },
  { pattern: /#181820/gi, replacement: "#222230", description: "Legacy surface #181820 → EDL overlay" },
  { pattern: /#1c1c28/gi, replacement: "#222230", description: "Legacy surface #1c1c28 → EDL overlay" },
  { pattern: /#1d1d2b/gi, replacement: "#222230", description: "Legacy surface #1d1d2b → EDL overlay" },
  { pattern: /#1e1e2e/gi, replacement: "#222230", description: "Legacy surface #1e1e2e → EDL overlay" },
  { pattern: /#2a2a3a/gi, replacement: "#222230", description: "Legacy surface #2a2a3a → EDL overlay" },
  { pattern: /#282838/gi, replacement: "#222230", description: "Legacy surface #282838 → EDL overlay" },
  // Tailwind arbitrary colors
  { pattern: /text-\[#c9a84c\]/g, replacement: "text-gold", description: "Arbitrary gold text → EDL" },
  { pattern: /text-\[#d4a843\]/g, replacement: "text-gold", description: "Arbitrary gold text → EDL" },
  { pattern: /text-\[#d4af37\]/g, replacement: "text-gold", description: "Arbitrary gold text → EDL" },
  { pattern: /text-\[#f5c842\]/g, replacement: "text-gold", description: "Arbitrary gold text → EDL" },
  { pattern: /text-\[#c9a94c\]/g, replacement: "text-gold", description: "Arbitrary gold text → EDL" },
  { pattern: /text-\[#d4aa49\]/g, replacement: "text-gold", description: "Arbitrary gold text → EDL" },
  { pattern: /bg-\[#0a0a0f\]/g, replacement: "bg-surface-base", description: "Arbitrary surface bg → EDL" },
  { pattern: /bg-\[#0c0c14\]/g, replacement: "bg-surface-base", description: "Arbitrary surface bg → EDL" },
  { pattern: /bg-\[#111118\]/g, replacement: "bg-surface-raised", description: "Arbitrary surface bg → EDL" },
  { pattern: /bg-\[#1a1a24\]/g, replacement: "bg-surface-overlay", description: "Arbitrary surface bg → EDL" },
  { pattern: /bg-\[#222230\]/g, replacement: "bg-surface-drawer", description: "Arbitrary surface bg → EDL" },
  { pattern: /border-\[#2a2a38\]/g, replacement: "border-st-subtle", description: "Arbitrary border → EDL" },
  { pattern: /text-\[#a1a1aa\]/g, replacement: "text-st-secondary", description: "Arbitrary text → EDL" },
  { pattern: /text-\[#71717a\]/g, replacement: "text-st-muted", description: "Arbitrary text → EDL" },
  { pattern: /text-\[#52525b\]/g, replacement: "text-st-placeholder", description: "Arbitrary text → EDL" },
  { pattern: /text-\[#e4e4e7\]/g, replacement: "text-st-secondary", description: "Arbitrary text → EDL" },
  { pattern: /text-\[#d4d4d8\]/g, replacement: "text-st-secondary", description: "Arbitrary text → EDL" },
  { pattern: /text-\[#737373\]/g, replacement: "text-st-muted", description: "Arbitrary text → EDL" },
  { pattern: /bg-\[#22c55e\]/g, replacement: "bg-st-success", description: "Arbitrary status bg → EDL" },
  { pattern: /bg-\[#16a34a\]/g, replacement: "bg-st-success", description: "Arbitrary status bg → EDL" },
  { pattern: /bg-\[#ef4444\]/g, replacement: "bg-st-error", description: "Arbitrary status bg → EDL" },
  { pattern: /bg-\[#dc2626\]/g, replacement: "bg-st-error", description: "Arbitrary status bg → EDL" },
  { pattern: /bg-\[#b91c1c\]/g, replacement: "bg-st-error", description: "Arbitrary status bg → EDL" },
  { pattern: /bg-\[#f59e0b\]/g, replacement: "bg-st-warning", description: "Arbitrary status bg → EDL" },
  { pattern: /bg-\[#3b82f6\]/g, replacement: "bg-st-info", description: "Arbitrary status bg → EDL" },
  { pattern: /bg-\[#2563eb\]/g, replacement: "bg-st-info", description: "Arbitrary status bg → EDL" },
  { pattern: /text-\[#22c55e\]/g, replacement: "text-st-success", description: "Arbitrary status text → EDL" },
  { pattern: /text-\[#ef4444\]/g, replacement: "text-st-error", description: "Arbitrary status text → EDL" },
  { pattern: /text-\[#f59e0b\]/g, replacement: "text-st-warning", description: "Arbitrary status text → EDL" },
  { pattern: /text-\[#3b82f6\]/g, replacement: "text-st-info", description: "Arbitrary status text → EDL" },
  // Legacy imports
  { pattern: /from\s+['"]@\/design-system\/tokens\/colors['"]/g, replacement: "from '@/design-system/edl'", description: "Legacy token import → EDL" },
  { pattern: /from\s+['"]@\/design-system\/tokens\/surfaces['"]/g, replacement: "from '@/design-system/edl'", description: "Legacy token import → EDL" },
  { pattern: /from\s+['"]@\/design-system\/tokens\/status['"]/g, replacement: "from '@/design-system/edl'", description: "Legacy token import → EDL" },
  { pattern: /from\s+['"]@\/design-system\/tokens\/typography['"]/g, replacement: "from '@/design-system/edl'", description: "Legacy token import → EDL" },
  { pattern: /from\s+['"]@\/design-system\/tokens\/spacing['"]/g, replacement: "from '@/design-system/edl'", description: "Legacy token import → EDL" },
  { pattern: /from\s+['"]@\/design-system\/tokens\/radius['"]/g, replacement: "from '@/design-system/edl'", description: "Legacy token import → EDL" },
  { pattern: /from\s+['"]@\/design-system\/tokens\/animation['"]/g, replacement: "from '@/design-system/edl'", description: "Legacy token import → EDL" },
  { pattern: /from\s+['"]@\/design-system\/tokens\/shadows['"]/g, replacement: "from '@/design-system/edl'", description: "Legacy token import → EDL" },
  { pattern: /from\s+['"]@\/design-system\/tokens['"]/g, replacement: "from '@/design-system/edl'", description: "Legacy token import → EDL" },
];

const EXEMPT_PATTERNS = [
  /tools\/design-governance\//,
  /edl-eslint-plugin\//,
  /design-system\/edl\//,
  /tailwind\.config/,
  /globals\.css/,
];

let totalFixed = 0;
let totalFiles = 0;

function fixFile(filePath: string): number {
  if (EXEMPT_PATTERNS.some((p) => p.test(path.relative(ROOT, filePath)))) return 0;

  let content = fs.readFileSync(filePath, "utf-8");
  let fileFixed = 0;

  for (const fix of FIXES) {
    fix.pattern.lastIndex = 0;
    const matches = content.match(fix.pattern);
    if (matches) {
      fileFixed += matches.length;
      content = content.replace(fix.pattern, fix.replacement);
    }
  }

  if (fileFixed > 0 && APPLY) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✏️  ${path.relative(ROOT, filePath)} (${fileFixed} fixes)`);
  } else if (fileFixed > 0) {
    console.log(`  📋 ${path.relative(ROOT, filePath)} (${fileFixed} fixes — dry run)`);
  }

  return fileFixed;
}

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", ".next", "dist"].includes(entry.name)) {
      walk(full);
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      totalFiles++;
      totalFixed += fixFile(full);
    }
  }
}

console.log(`🔧 EDL Auto-Fixer (${APPLY ? "APPLY" : "DRY RUN"})\n`);
walk(SRC_DIR);
console.log(`\n  Files scanned: ${totalFiles}`);
console.log(`  Total fixes:   ${totalFixed}`);

if (!APPLY) {
  console.log(`\n  Run with --apply to write changes.`);
}
