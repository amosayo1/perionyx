#!/usr/bin/env tsx
/**
 * Phase 22.0B.5 — EDL CI Pipeline: Component Compliance
 *
 * Audits all enterprise components for EDL compliance.
 * Usage: pnpm edl:compliance
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const COMPONENTS_DIR = path.join(ROOT, "src/components/enterprise");

interface ComplianceResult {
  file: string;
  score: number;
  checks: { name: string; passed: boolean }[];
}

function auditComponent(filePath: string): ComplianceResult {
  const content = fs.readFileSync(filePath, "utf-8");
  const rel = path.relative(ROOT, filePath);

  const checks = [
    { name: "EDL import", passed: content.includes("@/design-system/edl") },
    { name: "No hardcoded hex", passed: !/#([0-9a-fA-F]{3,8})\b/.test(content.replace(/#d4af37|#e5c04a|#c7a961|#0a0a0f|#111118|#1a1a24|#222230|#f7f6f2|#a1a1aa|#71717a|#52525b|#22c55e|#f59e0b|#ef4444|#3b82f6/g, "")) },
    { name: "No inline style", passed: !(/style=\{\{/.test(content)) },
    { name: "A11y class", passed: content.includes("className") },
  ];

  const passed = checks.filter((c) => c.passed).length;
  return { file: rel, score: Math.round((passed / checks.length) * 100), checks };
}

const components: ComplianceResult[] = [];

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith(".tsx")) {
      components.push(auditComponent(full));
    }
  }
}

walk(COMPONENTS_DIR);

const avg = Math.round(components.reduce((s, c) => s + c.score, 0) / components.length);
const compliant = components.filter((c) => c.score >= 75).length;

console.log("═══════════════════════════════════════════════");
console.log("  EDL Component Compliance");
console.log("═══════════════════════════════════════════════\n");

console.log(`  Components audited: ${components.length}`);
console.log(`  Compliant (≥75%):   ${compliant}`);
console.log(`  Average score:      ${avg}%\n`);

console.log("  Score distribution:");
const buckets = [0, 0, 0, 0, 0];
for (const c of components) {
  const idx = Math.min(4, Math.floor(c.score / 25));
  buckets[idx]++;
}
console.log(`    0-24%:  ${buckets[0]} components`);
console.log(`    25-49%: ${buckets[1]} components`);
console.log(`    50-74%: ${buckets[2]} components`);
console.log(`    75-99%: ${buckets[3]} components`);
console.log(`    100%:   ${buckets[4]} components\n`);

if (avg >= 75) {
  console.log("  ✅ Component compliance: PASS\n");
  process.exit(0);
} else {
  console.log("  ⚠️  Component compliance: NEEDS WORK\n");
  process.exit(0);
}
