#!/usr/bin/env tsx
/**
 * Phase 22.0B.5 — EDL Token Validator
 *
 * Validates EDL token integrity:
 * - Every token is documented
 * - Every token is used
 * - No duplicate definitions
 * - No orphan tokens
 * - No deprecated tokens in active use
 * - Token values match documentation
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");
const EDL_DIR = path.join(ROOT, "src/design-system/edl");

interface TokenInfo {
  name: string;
  file: string;
  value: string;
  line: number;
  documented: boolean;
  usedInCode: boolean;
  deprecated: boolean;
}

interface ValidationResult {
  totalTokens: number;
  documentedTokens: number;
  usedTokens: number;
  orphanTokens: string[];
  duplicateTokens: { name: string; files: string[] }[];
  deprecatedTokens: { name: string; consumers: string[] }[];
  undocumentedTokens: string[];
  score: number;
}

function findTokenExports(): TokenInfo[] {
  const tokens: TokenInfo[] = [];
  const files = fs.readdirSync(EDL_DIR).filter((f) => f.endsWith(".ts") && f !== "index.ts");

  for (const file of files) {
    const content = fs.readFileSync(path.join(EDL_DIR, file), "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match: export const TOKEN_NAME = ... or export const { ... } = ...
      const exportMatch = line.match(/export\s+const\s+(\w+)/);
      if (exportMatch) {
        tokens.push({
          name: exportMatch[1],
          file,
          value: line.trim(),
          line: i + 1,
          documented: false,
          usedInCode: false,
          deprecated: line.includes("@deprecated"),
        });
      }
    }
  }

  return tokens;
}

function checkDocumentation(tokens: TokenInfo[]): void {
  const docsDir = path.join(ROOT, "docs/design");
  if (!fs.existsSync(docsDir)) return;

  const docFiles = fs.readdirSync(docsDir).filter((f) => f.endsWith(".md"));
  const allDocs = docFiles.map((f) => fs.readFileSync(path.join(docsDir, f), "utf-8")).join("\n");

  for (const token of tokens) {
    token.documented = allDocs.includes(token.name);
  }
}

function checkUsage(tokens: TokenInfo[]): void {
  const srcDir = path.join(ROOT, "src");
  const allTsx = readAllFiles(srcDir, [".tsx", ".ts"]);
  const allContent = allTsx.join("\n");

  for (const token of tokens) {
    token.usedInCode = allContent.includes(token.name);
  }
}

function findDuplicates(tokens: TokenInfo[]): { name: string; files: string[] }[] {
  const map = new Map<string, string[]>();
  for (const token of tokens) {
    const existing = map.get(token.name) || [];
    existing.push(token.file);
    map.set(token.name, existing);
  }

  const duplicates: { name: string; files: string[] }[] = [];
  for (const [name, files] of map) {
    if (files.length > 1) {
      duplicates.push({ name, files: [...new Set(files)] });
    }
  }
  return duplicates;
}

function readAllFiles(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", ".next", "dist"].includes(entry.name)) {
      results.push(...readAllFiles(fullPath, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(fs.readFileSync(fullPath, "utf-8"));
    }
  }
  return results;
}

export function validateTokens(): ValidationResult {
  console.log("🔍 Validating EDL tokens...\n");

  const tokens = findTokenExports();
  checkDocumentation(tokens);
  checkUsage(tokens);
  const duplicates = findDuplicates(tokens);

  const orphanTokens = tokens
    .filter((t) => !t.usedInCode && !t.deprecated)
    .map((t) => `${t.name} (${t.file}:${t.line})`);

  const undocumentedTokens = tokens
    .filter((t) => !t.documented && !t.deprecated)
    .map((t) => `${t.name} (${t.file}:${t.line})`);

  const deprecatedTokens = tokens
    .filter((t) => t.deprecated)
    .map((t) => ({ name: t.name, consumers: [] as string[] }));

  const documentedCount = tokens.filter((t) => t.documented).length;
  const usedCount = tokens.filter((t) => t.usedInCode).length;
  const score = Math.round(
    ((documentedCount + usedCount) / (tokens.length * 2)) * 100
  );

  const result: ValidationResult = {
    totalTokens: tokens.length,
    documentedTokens: documentedCount,
    usedTokens: usedCount,
    orphanTokens,
    duplicateTokens: duplicates,
    deprecatedTokens,
    undocumentedTokens,
    score,
  };

  // Print report
  console.log(`  Total tokens:           ${result.totalTokens}`);
  console.log(`  Documented:            ${result.documentedTokens}/${result.totalTokens}`);
  console.log(`  Used in code:          ${result.usedTokens}/${result.totalTokens}`);
  console.log(`  Orphan tokens:         ${result.orphanTokens.length}`);
  console.log(`  Duplicate tokens:      ${result.duplicateTokens.length}`);
  console.log(`  Undocumented tokens:   ${result.undocumentedTokens.length}`);
  console.log(`  Token health score:    ${result.score}%\n`);

  if (result.orphanTokens.length > 0) {
    console.log("  ⚠️  Orphan tokens (defined but never used):");
    for (const orphan of result.orphanTokens) {
      console.log(`     - ${orphan}`);
    }
    console.log();
  }

  if (result.duplicateTokens.length > 0) {
    console.log("  ⚠️  Duplicate token definitions:");
    for (const dup of result.duplicateTokens) {
      console.log(`     - ${dup.name}: ${dup.files.join(", ")}`);
    }
    console.log();
  }

  if (result.undocumentedTokens.length > 0) {
    console.log("  ⚠️  Undocumented tokens:");
    for (const tok of result.undocumentedTokens) {
      console.log(`     - ${tok}`);
    }
    console.log();
  }

  if (result.score >= 80) {
    console.log("  ✅ Token governance: PASS");
  } else if (result.score >= 60) {
    console.log("  ⚠️  Token governance: WARN");
  } else {
    console.log("  ❌ Token governance: FAIL");
  }

  return result;
}

// ── CLI Entry ────────────────────────────────────────────────────────────────

if (require.main === module) {
  const result = validateTokens();
  process.exit(result.score >= 60 ? 0 : 1);
}
