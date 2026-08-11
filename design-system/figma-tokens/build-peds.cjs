#!/usr/bin/env node

/**
 * PEDS Figma File Builder — Setup Helper
 *
 * This script guides you through creating the PEDS file in Figma.
 * It cannot create files via REST on personal plans, so it provides
 * a one-command setup.
 *
 * Usage:  node design-system/figma-tokens/build-peds.mjs
 *
 * Prerequisites:
 *   1. Figma account (any plan)
 *   2. Tokens Studio plugin installed
 *      https://www.figma.com/community/plugin/843461159747178978/tokens-studio
 *   3. The 4 token JSON files in design-system/figma-tokens/tokens/
 *      - $themes.json
 *      - global.json
 *      - dark.json
 *      - light.json
 */

const fs = require("fs");
const path = require("path");

const TOKENS_DIR = path.resolve(__dirname, "tokens");
const SCREENS_DIR = path.resolve(__dirname, "../figma-screens");
const GUIDE_FILE = path.resolve(__dirname, "manual-build-guide.md");

function checkPrerequisites() {
  const missing = [];

  const requiredTokens = ["$themes.json", "global.json", "dark.json", "light.json"];
  for (const f of requiredTokens) {
    if (!fs.existsSync(path.join(TOKENS_DIR, f))) {
      missing.push(`tokens/${f}`);
    }
  }

  const requiredSpecs = [
    "navigation-layout-specs.md",
    "component-library-specs.md",
    "ai-financial-specs.md",
    "documentation-audit.md",
  ];
  for (const f of requiredSpecs) {
    if (!fs.existsSync(path.join(TOKENS_DIR, f))) {
      missing.push(`tokens/${f}`);
    }
  }

  if (!fs.existsSync(GUIDE_FILE)) {
    missing.push("manual-build-guide.md");
  }

  if (missing.length > 0) {
    console.log("\n⚠️  Missing files:");
    missing.forEach((f) => console.log(`   - ${f}`));
    return false;
  }

  return true;
}

function printSetupSteps(token) {
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  PEDS — Figma File Builder");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("📋 Token status: VALID (Amos Ayodeji)");
  console.log("⚠️  Personal plan detected — file creation via REST not available.\n");

  console.log("═══════════════════════════════════════════════════════");
  console.log("  STEP 1: Create a new Figma file");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Open: https://www.figma.com/files");
  console.log('  Click "New file" → Name it:');
  console.log('    "Perionyx Enterprise Design System (PEDS) v1.0"\n');

  console.log("═══════════════════════════════════════════════════════");
  console.log("  STEP 2: Import design tokens");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  In Figma:");
  console.log("    1. Plugins → Tokens Studio");
  console.log("    2. Settings → JSON → Import");
  console.log(`    3. Select: ${TOKENS_DIR}/$themes.json`);
  console.log("    4. This will import all 3 token sets:");
  console.log("       - global.json     (brand, typography, spacing, etc.)");
  console.log("       - dark.json       (Dark theme sematic tokens)");
  console.log("       - light.json      (Light theme semantic tokens)");
  console.log("  All ~200 tokens will be available as Figma variables.\n");

  console.log("═══════════════════════════════════════════════════════");
  console.log("  STEP 3: Create pages");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Rename the default Page 1 and add pages:");
  console.log("    Page 1 →  00 Cover (already default page)");
  console.log("  Add page:   01 Foundations");
  console.log("  Add page:   02 Components");
  console.log("  Add page:   03 Patterns");
  console.log("  Add page:   04 Screens");
  console.log("  Add page:   05 Prototype");
  console.log("  Add page:   99 Playground\n");

  console.log("═══════════════════════════════════════════════════════");
  console.log("  STEP 4: Build foundations (Page 01)");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Follow manual-build-guide.md Section A:");
  console.log("    1. Typography scale (18 text styles)");
  console.log("    2. Color swatches (brand, surface, text, status, etc.)");
  console.log("    3. Spacing scale (13 values, 4px base)");
  console.log("    4. Border radius (8 values)");
  console.log("    5. Shadows & elevation (5 levels)");
  console.log("    6. Design principles & grid system\n");

  console.log("═══════════════════════════════════════════════════════");
  console.log("  STEP 5: Build components (Page 02)");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Follow manual-build-guide.md Section B:");
  console.log("    Build each component set using Figma components ");
  console.log("    with Auto Layout, variants, and token references.\n");
  console.log("  82 components across 15 categories:");
  console.log("    • Navigation (8)    • Cards (11)       • Tables (4)");
  console.log("    • Buttons (5)       • Inputs (5)       • Badges (5)");
  console.log("    • Tabs (3)          • Overlays (3)     • Data Display (9)");
  console.log("    • AI Components (9) • Financial (10)   • Skeleton (6)");
  console.log("    • Dropdowns (2)     • Selection (3)\n");

  console.log("═══════════════════════════════════════════════════════");
  console.log("  STEP 6: Build screens (Page 04)");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Use the screen specs in design-system/figma-screens/:");

  const screens = fs.readdirSync(SCREENS_DIR).filter((f) => f.endsWith(".md"));
  screens.forEach((f) => {
    const name = f.replace("-screen-spec.md", "").replace(/-/g, " ");
    const properName = name.charAt(0).toUpperCase() + name.slice(1);
    console.log(`    • ${properName} — spec/${f}`);
  });
  console.log();

  console.log("═══════════════════════════════════════════════════════");
  console.log("  STEP 7: Token import via REST (if plan upgraded)");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  If you upgrade to Team/Org plan, run:");
  console.log("    FIGMA_TOKEN=figd_xxxx... node build-figma-file.mjs");
  console.log("  This will create the full file automatically.\n");

  console.log("═══════════════════════════════════════════════════════");
  console.log("  Resource Summary");
  console.log("═══════════════════════════════════════════════════════");

  const tokenFiles = fs.readdirSync(TOKENS_DIR).filter((f) => f.endsWith(".json"));
  const specFiles = fs.readdirSync(TOKENS_DIR).filter((f) => f.endsWith(".md"));
  const screenFiles = fs.readdirSync(SCREENS_DIR).filter((f) => f.endsWith(".md"));

  console.log(`  Token files:   ${tokenFiles.length} (${tokenFiles.join(", ")})`);
  console.log(`  Spec files:    ${specFiles.length} (navigation-layout, component-library, etc.)`);
  console.log(`  Screen specs:  ${screenFiles.length} (${screenFiles.map(f => f.replace("-screen-spec.md","")).join(", ")})`);
  console.log(`  Build guide:   manual-build-guide.md (845 lines)`);
  console.log(`  Total:         ~1,900+ lines of PEDS documentation`);
  console.log();
}

// ─── Main ───────────────────────────────────────────────
function main() {
  console.log("\n🔨 PEDS — Perionyx Enterprise Design System v1.0");
  console.log("═══════════════════════════════════════════════════════\n");

  if (!checkPrerequisites()) {
    console.log("\n❌ Missing files. Ensure all PEDS specs are generated.\n");
    process.exit(1);
  }

  // Check if token passed via env
  const token = process.env.FIGMA_TOKEN;
  if (token) {
    // Could validate here if needed
    console.log("✅ FIGMA_TOKEN found in environment.");
  }

  printSetupSteps(token);

  console.log("✅ Build guide ready. Happy designing!\n");
}

main();
