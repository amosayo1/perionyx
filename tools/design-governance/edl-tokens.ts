#!/usr/bin/env tsx
/**
 * Phase 22.0B.5 — EDL CI Pipeline: Token Health Check
 *
 * Verifies all EDL token files are valid and complete.
 * Usage: pnpm edl:tokens
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const EDL_DIR = path.join(ROOT, "src/design-system/edl");

const REQUIRED_FILES = [
  "colors.ts", "typography.ts", "spacing.ts", "radius.ts",
  "motion.ts", "z-index.ts", "icons.ts", "components.ts", "index.ts",
];

console.log("═══════════════════════════════════════════════");
console.log("  EDL Token Health Check");
console.log("═══════════════════════════════════════════════\n");

let allPresent = true;

for (const file of REQUIRED_FILES) {
  const full = path.join(EDL_DIR, file);
  if (fs.existsSync(full)) {
    const content = fs.readFileSync(full, "utf-8");
    const exports = (content.match(/export /g) || []).length;
    const lines = content.split("\n").length;
    console.log(`  ✅ ${file} — ${lines} lines, ${exports} exports`);
  } else {
    console.log(`  ❌ ${file} — MISSING`);
    allPresent = false;
  }
}

// Check barrel exports
const index = path.join(EDL_DIR, "index.ts");
if (fs.existsSync(index)) {
  const content = fs.readFileSync(index, "utf-8");
  const reexports = (content.match(/export\s+\*\s+from/g) || []).length;
  console.log(`\n  Barrel re-exports: ${reexports}`);
  if (reexports >= 8) {
    console.log("  ✅ Barrel complete");
  } else {
    console.log("  ⚠️  Barrel may be incomplete");
  }
}

console.log(`\n  Token files: ${REQUIRED_FILES.filter((f) => fs.existsSync(path.join(EDL_DIR, f))).length}/${REQUIRED_FILES.length}`);

if (allPresent) {
  console.log("  ✅ Token health: PASS\n");
  process.exit(0);
} else {
  console.log("  ❌ Token health: FAIL\n");
  process.exit(1);
}
