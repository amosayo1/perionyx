#!/usr/bin/env tsx
/**
 * Phase 22.0B.5 — EDL CI Pipeline: Full Audit
 *
 * Runs all validators and generates a compliance report.
 * Exit code 0 = pass, 1 = fail.
 *
 * Usage: pnpm edl:audit
 */

import { scanCodebase } from "./validators/codebase-scanner";
import { auditPages } from "./auditors/page-auditor";

console.log("═══════════════════════════════════════════════");
console.log("  EDL Design Governance — Full Audit");
console.log("═══════════════════════════════════════════════\n");

const scan = scanCodebase();
console.log("\n");
const pages = auditPages();

const avgScore = Math.round(
  (scan.score + (pages.length > 0 ? Math.round(pages.reduce((s, p) => s + p.score, 0) / pages.length) : 100)) / 2
);

console.log("\n═══════════════════════════════════════════════");
console.log(`  Overall Compliance: ${avgScore}%`);
console.log("═══════════════════════════════════════════════\n");

if (avgScore >= 70) {
  console.log("  ✅ EDL Audit: PASS\n");
  process.exit(0);
} else if (avgScore >= 50) {
  console.log("  ⚠️  EDL Audit: WARN\n");
  process.exit(0);
} else {
  console.log("  ❌ EDL Audit: FAIL\n");
  process.exit(1);
}
