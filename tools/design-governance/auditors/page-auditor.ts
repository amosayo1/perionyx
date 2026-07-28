#!/usr/bin/env tsx
/**
 * Phase 22.0B.5 — EDL Page Compliance Auditor
 *
 * Audits every page/route for design compliance.
 * Generates a compliance score per page.
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../../..");
const APP_DIR = path.join(ROOT, "src/app");

interface PageReport {
  file: string;
  relativePath: string;
  section: string;
  checks: { name: string; passed: boolean; count: number }[];
  score: number;
  totalViolations: number;
}

const HARDCODED_HEX = /#[0-9a-fA-F]{6}\b/g;
const HARDCODED_RGBA = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g;
const HARDCODED_SPACING = /(?:padding|margin|gap):\s*['"]?\d+px/g;
const HARDCODED_SHADOW = /boxShadow:\s*['"][^'"]+/g;
const HARDCODED_ZINDEX = /z(?:Index|-\[)\d+/g;
const HARDCODED_RADIUS = /borderRadius:\s*['"]?\d+px/g;

const ALLOWED_HEX = new Set([
  "#d4af37", "#e5c04a", "#c7a961",
  "#0a0a0f", "#111118", "#1a1a24", "#222230",
  "#f7f6f2", "#a1a1aa", "#71717a", "#52525b",
  "#22c55e", "#f59e0b", "#ef4444", "#3b82f6",
]);

function auditPage(filePath: string): PageReport {
  const content = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(ROOT, filePath);

  // Determine section from path
  const sectionMatch = relPath.match(/src\/app\/\(([^)]+)\)/);
  const section = sectionMatch ? sectionMatch[1] : "public";

  const hexMatches = content.match(HARDCODED_HEX) || [];
  const forbiddenHex = hexMatches.filter((h) => !ALLOWED_HEX.has(h.toLowerCase()));

  const checks = [
    { name: "Colors", passed: forbiddenHex.length === 0, count: forbiddenHex.length },
    { name: "RGBA", passed: (content.match(HARDCODED_RGBA) || []).length === 0, count: (content.match(HARDCODED_RGBA) || []).length },
    { name: "Spacing", passed: (content.match(HARDCODED_SPACING) || []).length === 0, count: (content.match(HARDCODED_SPACING) || []).length },
    { name: "Shadows", passed: (content.match(HARDCODED_SHADOW) || []).length === 0, count: (content.match(HARDCODED_SHADOW) || []).length },
    { name: "Z-Index", passed: (content.match(HARDCODED_ZINDEX) || []).length === 0, count: (content.match(HARDCODED_ZINDEX) || []).length },
    { name: "Radius", passed: (content.match(HARDCODED_RADIUS) || []).length === 0, count: (content.match(HARDCODED_RADIUS) || []).length },
  ];

  const passedChecks = checks.filter((c) => c.passed).length;
  const totalViolations = checks.reduce((sum, c) => sum + c.count, 0);

  return {
    file: filePath,
    relativePath: relPath,
    section,
    checks,
    score: Math.round((passedChecks / checks.length) * 100),
    totalViolations,
  };
}

export function auditPages(): PageReport[] {
  console.log("🔍 Auditing page compliance...\n");

  const reports: PageReport[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && !["node_modules", ".next", "dist", "api"].includes(entry.name)) {
        walk(full);
      } else if (entry.name === "page.tsx") {
        reports.push(auditPage(full));
      }
    }
  }

  walk(APP_DIR);

  reports.sort((a, b) => a.score - b.score);

  const avgScore = Math.round(reports.reduce((s, r) => s + r.score, 0) / reports.length);
  const compliant = reports.filter((r) => r.score >= 80).length;
  const partial = reports.filter((r) => r.score >= 50 && r.score < 80).length;
  const failing = reports.filter((r) => r.score < 50).length;

  console.log(`  Pages audited:        ${reports.length}`);
  console.log(`  Compliant (≥80%):     ${compliant}`);
  console.log(`  Partial (50-79%):     ${partial}`);
  console.log(`  Failing (<50%):       ${failing}`);
  console.log(`  Average score:        ${avgScore}%\n`);

  // By section
  const sections = new Map<string, PageReport[]>();
  for (const r of reports) {
    const existing = sections.get(r.section) || [];
    existing.push(r);
    sections.set(r.section, existing);
  }

  console.log("  By section:");
  for (const [section, pages] of sections) {
    const secAvg = Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length);
    console.log(`    ${section}: ${secAvg}% (${pages.length} pages)`);
  }
  console.log();

  console.log("  Top 10 worst pages:");
  for (const r of reports.slice(0, 10)) {
    console.log(`    ${r.score}% — ${r.relativePath} (${r.totalViolations} violations)`);
  }
  console.log();

  if (avgScore >= 70) {
    console.log("  ✅ Page compliance: PASS");
  } else if (avgScore >= 50) {
    console.log("  ⚠️  Page compliance: WARN");
  } else {
    console.log("  ❌ Page compliance: FAIL");
  }

  return reports;
}

if (require.main === module) {
  const reports = auditPages();
  const avg = Math.round(reports.reduce((s, r) => s + r.score, 0) / reports.length);
  process.exit(avg >= 50 ? 0 : 1);
}
