#!/usr/bin/env node
/**
 * Phase 26.0A Codemod — Runtime Convergence (v2)
 *
 * Fixes from v1:
 * 1. Multi-line imports: insert withRuntimeContext after the last import block end
 * 2. Multi-line requireTenantContext: remove all continuation lines
 * 3. No-parameter functions: match GET() without requiring a param
 *
 * Usage: node scripts/migrate-routes.mjs [--dry-run] [--scope api|pages|all]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const SCOPE = process.argv.find(a => a.startsWith('--scope='))?.split('=')[1]
  || (process.argv.includes('--scope') ? process.argv[process.argv.indexOf('--scope') + 1] : 'api');

const ROOT = process.cwd();
const stats = { migrated: 0, skipped: 0, failed: 0, errors: [] };

function log(status, file, msg = '') {
  const rel = relative(ROOT, file);
  if (status === 'MIGRATED') console.log(`  ✓ ${rel}${msg ? ' — ' + msg : ''}`);
  else if (status === 'SKIP') console.log(`  · ${rel} (${msg})`);
  else if (status === 'FAIL') console.error(`  ✗ ${rel}: ${msg}`);
}

function findFiles(dir, name, results = []) {
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      try {
        const st = statSync(full);
        if (st.isDirectory()) findFiles(full, name, results);
        else if (entry === name) results.push(full);
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return results;
}

/**
 * Find the line index of the end of the last import block.
 * Handles multi-line imports like:
 *   import {
 *     foo,
 *     bar,
 *   } from "module";
 */
function findLastImportEnd(lines) {
  let lastEnd = -1;
  let inImport = false;
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('import ')) {
      inImport = true;
      // Check if it's a single-line import
      if (line.endsWith(';')) {
        lastEnd = i;
        inImport = false;
      } else {
        // Multi-line: count braces
        for (const ch of line) { if (ch === '{') depth++; if (ch === '}') depth--; }
      }
    } else if (inImport) {
      for (const ch of line) { if (ch === '{') depth++; if (ch === '}') depth--; }
      if (depth <= 0 && line.includes(';')) {
        lastEnd = i;
        inImport = false;
        depth = 0;
      }
    }
  }
  return lastEnd;
}

/**
 * Check if a line is part of a multi-line requireTenantContext call.
 * Returns true if this line is a continuation (not the first line).
 */
function isRequireTenantContextContinuation(line, prevLines) {
  // Check if any previous line in this block started "const ctx = requireTenantContext("
  // and we haven't found the closing ");" yet
  for (let i = prevLines.length - 1; i >= Math.max(0, prevLines.length - 10); i--) {
    const prev = prevLines[i].trim();
    if (prev.startsWith('const ctx = requireTenantContext(') && !prev.endsWith(');')) {
      return true;
    }
    if (prev.startsWith('const session = await auth()')) continue;
    // Stop if we hit a non-empty, non-auth line
    if (prev && !prev.startsWith('const session') && !prev.startsWith('const ctx')) break;
  }
  return false;
}

/**
 * Remove auth() and requireTenantContext() lines from a block of lines.
 * Handles single-line and multi-line patterns.
 */
function removeAuthLines(lines) {
  const result = [];
  let skipMultiLineReqCtx = false;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();

    // Skip single-line: const session = await auth();
    if (t.startsWith('const session = await auth()') && t.endsWith(';')) continue;

    // Start of multi-line or single-line requireTenantContext
    if (t.startsWith('const ctx = requireTenantContext(')) {
      if (t.endsWith(');')) {
        // Single-line — skip it
        continue;
      } else {
        // Multi-line start — skip until closing ");
        skipMultiLineReqCtx = true;
        continue;
      }
    }

    // Inside multi-line requireTenantContext — skip until closing ");
    if (skipMultiLineReqCtx) {
      if (t.includes(');') || t === ');') {
        skipMultiLineReqCtx = false;
      }
      continue;
    }

    result.push(lines[i]);
  }

  return result;
}

/**
 * Transform ctx references in a line.
 */
function transformCtx(line) {
  let t = line;
  // Replace ctx.property → ctx.tenant.property
  t = t.replace(/\bctx\./g, 'ctx.tenant.');
  // Replace (ctx) → (ctx.tenant) — function call
  t = t.replace(/\(ctx\)/g, '(ctx.tenant)');
  // Replace (ctx, → (ctx.tenant, — first arg
  t = t.replace(/\(ctx,/g, '(ctx.tenant,');
  // Replace , ctx) → , ctx.tenant) — last arg
  t = t.replace(/, ctx\)/g, ', ctx.tenant)');
  // Replace , ctx, → , ctx.tenant, — middle arg
  t = t.replace(/, ctx,/g, ', ctx.tenant,');

  // Replace bare ctx as standalone argument on its own line (after whitespace)
  // Matches lines that are just "    ctx," or "    ctx" (with optional trailing comma)
  t = t.replace(/^(\s+)ctx(\s*,\s*)$/, '$1ctx.tenant$2');
  // Matches "    ctx" at end of a line (e.g. last arg before closing paren on next line)
  t = t.replace(/^(\s+)ctx(\s*)$/, (match, indent, trail) => {
    // Only replace if this is clearly a function argument (ctx alone on a line)
    // Don't replace if it's part of an expression
    return indent + 'ctx.tenant' + trail;
  });

  // Replace session?.user?.id → ctx.tenant.userId
  t = t.replace(/session\?\.user\?\.id/g, 'ctx.tenant.userId');
  // Replace session!.user!.id → ctx.tenant.userId
  t = t.replace(/session!\.user!\.id/g, 'ctx.tenant.userId');
  // Replace session.user.id → ctx.tenant.userId (non-optional)
  t = t.replace(/session\.user\.id\b/g, 'ctx.tenant.userId');
  // Replace session?.user?.activeCompanyId → ctx.tenant.companyId
  t = t.replace(/session\?\.user\?\.activeCompanyId/g, 'ctx.tenant.companyId');
  // Replace session!.user!.activeCompanyId → ctx.tenant.companyId
  t = t.replace(/session!\.user!\.activeCompanyId/g, 'ctx.tenant.companyId');
  // Replace session.user.activeCompanyId → ctx.tenant.companyId (non-optional)
  t = t.replace(/session\.user\.activeCompanyId\b/g, 'ctx.tenant.companyId');
  // Replace session?.user?.companyRole → ctx.tenant.role
  t = t.replace(/session\?\.user\?\.companyRole/g, 'ctx.tenant.role');
  // Replace session!.user!.companyRole → ctx.tenant.role
  t = t.replace(/session!\.user!\.companyRole/g, 'ctx.tenant.role');
  // Replace session.user.companyRole → ctx.tenant.role (non-optional)
  t = t.replace(/session\.user\.companyRole\b/g, 'ctx.tenant.role');

  return t;
}

// ─── API Route Migration ──────────────────────────────────────────────

function migrateApiRoute(filePath) {
  let content = readFileSync(filePath, 'utf8');

  const hasAuth = /^\s*import \{ auth \} from ["']@\/server\/auth\/auth["'];/m.test(content);
  const hasReqCtx = /^\s*import \{ requireTenantContext/m.test(content);
  if (!hasAuth || !hasReqCtx) return 'skip-no-pattern';
  if (content.includes('from "@/server/http/init-runtime-context"')) return 'skip-already';
  if (/requireSession|requireAuth|requirePermission/.test(content)) return 'skip-special-auth';

  const lines = content.split('\n');
  const out = [];

  // ── Pass 1: Fix imports ──
  let skippedAuthImport = false;
  let skippedReqCtxImport = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!skippedAuthImport && /^\s*import \{ auth \} from ["']@\/server\/auth\/auth["'];/.test(line)) {
      skippedAuthImport = true;
      continue;
    }
    if (!skippedReqCtxImport && /^\s*import \{ requireTenantContext(?:,\s*type TenantContext)? \} from ["']@\/server\/context\/tenant-context["'];/.test(line)) {
      skippedReqCtxImport = true;
      continue;
    }
    out.push(line);
  }

  if (!skippedAuthImport || !skippedReqCtxImport) return 'skip-no-matched-imports';

  // Find the last import block end and insert withRuntimeContext after it
  const lastImportEnd = findLastImportEnd(out);
  if (lastImportEnd >= 0) {
    out.splice(lastImportEnd + 1, 0, 'import { withRuntimeContext } from "@/server/http/init-runtime-context";');
  }

  // ── Pass 2: Transform each exported async function ──
  const result = [];
  let i = 0;

  while (i < out.length) {
    const line = out[i];

    // Match: export async function NAME( — with or without parameters
    const funcMatch = line.match(/^export async function (\w+)\(/);
    if (!funcMatch) {
      result.push(line);
      i++;
      continue;
    }

    // Emit function signature lines, tracking paren depth to find body opening {
    let parenDepth = 0;
    let foundBodyBrace = false;
    let sigLines = [];
    while (i < out.length && !foundBodyBrace) {
      const l = out[i];
      sigLines.push(l);
      for (const ch of l) {
        if (ch === '(') parenDepth++;
        if (ch === ')') parenDepth--;
      }
      // The body { is the first { after all parens are closed (parenDepth <= 0)
      if (parenDepth <= 0 && l.includes('{')) {
        foundBodyBrace = true;
      }
      i++;
    }

    // Emit all signature lines (including the { line)
    result.push(...sigLines);

    // Detect the request parameter name (first param before colon)
    const sigBlock = sigLines.join(' ');
    const paramMatch = sigBlock.match(/function \w+\(\s*(\w+)\s*:/);
    const hasParam = paramMatch && (sigBlock.includes('Request') || sigBlock.includes('NextRequest'));
    const paramName = hasParam ? paramMatch[1] : null;

    // Add withRuntimeContext wrapper opening
    // No-param functions (GET()) get new Headers() as fallback to auth()
    if (paramName) {
      result.push(`  return withRuntimeContext(${paramName}, async (ctx) => {`);
    } else {
      result.push(`  return withRuntimeContext(new Headers(), async (ctx) => {`);
    }

    // Collect function body until matching }
    let braceCount = 1;
    const bodyLines = [];
    while (i < out.length && braceCount > 0) {
      const l = out[i];
      for (const ch of l) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
      }
      bodyLines.push(l);
      i++;
    }

    // The last line is the function's closing }
    const closingBrace = bodyLines.pop();

    // Remove auth/requireTenantContext lines (handles multi-line)
    const filtered = removeAuthLines(bodyLines);

    // Transform ctx references + add 2-space indent
    for (const l of filtered) {
      result.push('  ' + transformCtx(l));
    }

    // Add wrapper closing + function closing
    result.push('  });');
    result.push(closingBrace);
  }

  const newContent = result.join('\n');
  if (DRY_RUN) {
    log('MIGRATED', filePath, '(dry-run)');
  } else {
    writeFileSync(filePath, newContent);
    log('MIGRATED', filePath);
  }
  return 'migrated';
}

// ─── Page Migration (Server Components) ───────────────────────────────

function migratePage(filePath) {
  let content = readFileSync(filePath, 'utf8');

  const hasAuth = /^\s*import \{ auth \} from ["']@\/server\/auth\/auth["'];/m.test(content);
  const hasReqCtx = /^\s*import \{ requireTenantContext/m.test(content);
  if (!hasAuth || !hasReqCtx) return 'skip-no-pattern';
  if (content.includes('from "@/server/http/init-runtime-context"')) return 'skip-already';

  const lines = content.split('\n');
  const out = [];

  let skippedAuthImport = false;
  let skippedReqCtxImport = false;
  let hasHeadersImport = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!skippedAuthImport && /^\s*import \{ auth \} from ["']@\/server\/auth\/auth["'];/.test(line)) {
      skippedAuthImport = true;
      continue;
    }
    if (!skippedReqCtxImport && /^\s*import \{ requireTenantContext(?:,\s*type TenantContext)? \} from ["']@\/server\/context\/tenant-context["'];/.test(line)) {
      skippedReqCtxImport = true;
      continue;
    }
    if (/from ["']next\/headers["']/.test(line)) hasHeadersImport = true;
    out.push(line);
  }

  if (!skippedAuthImport || !skippedReqCtxImport) return 'skip-no-matched-imports';

  const lastImportEnd = findLastImportEnd(out);
  if (lastImportEnd >= 0) {
    out.splice(lastImportEnd + 1, 0,
      'import { withRuntimeContext } from "@/server/http/init-runtime-context";',
    );
  }
  if (!hasHeadersImport) {
    const wrIdx = out.findIndex(l => l.includes('init-runtime-context'));
    if (wrIdx >= 0) {
      out.splice(wrIdx + 1, 0, 'import { headers } from "next/headers";');
    }
  }

  const result = [];
  let i = 0;

  while (i < out.length) {
    const line = out[i];

    const funcMatch = line.match(/^export (default )?async function (\w+)\s*\(/);
    if (!funcMatch) {
      result.push(line);
      i++;
      continue;
    }

    // Emit function signature lines, tracking paren depth to find body opening {
    let parenDepth = 0;
    let foundBodyBrace = false;
    while (i < out.length && !foundBodyBrace) {
      const l = out[i];
      result.push(l);
      for (const ch of l) {
        if (ch === '(') parenDepth++;
        if (ch === ')') parenDepth--;
      }
      if (parenDepth <= 0 && l.includes('{')) {
        foundBodyBrace = true;
      }
      i++;
    }

    result.push('  return withRuntimeContext(await headers(), async (ctx) => {');

    let braceCount = 1;
    const bodyLines = [];
    while (i < out.length && braceCount > 0) {
      const l = out[i];
      for (const ch of l) {
        if (ch === '{') braceCount++;
        if (ch === '}') braceCount--;
      }
      bodyLines.push(l);
      i++;
    }

    const closingBrace = bodyLines.pop();
    const filtered = removeAuthLines(bodyLines);

    // Also remove: if (!ctx) redirect("/sign-in");
    const filtered2 = filtered.filter(l => {
      const t = l.trim();
      return !/^if\s*\(\s*!ctx\s*\)\s*redirect\(/.test(t);
    });

    for (const l of filtered2) {
      result.push('  ' + transformCtx(l));
    }

    result.push('  });');
    result.push(closingBrace);
  }

  const newContent = result.join('\n');
  if (DRY_RUN) {
    log('MIGRATED', filePath, '(dry-run)');
  } else {
    writeFileSync(filePath, newContent);
    log('MIGRATED', filePath);
  }
  return 'migrated';
}

// ─── Main ─────────────────────────────────────────────────────────────

console.log(`\nPhase 26.0A Codemod v2 — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
console.log(`Scope: ${SCOPE}\n`);

if (SCOPE === 'api' || SCOPE === 'all') {
  console.log('── Migrating API routes ──');
  const apiFiles = findFiles(join(ROOT, 'src/app/api'), 'route.ts');
  console.log(`Found ${apiFiles.length} route files\n`);
  for (const full of apiFiles) {
    try {
      const result = migrateApiRoute(full);
      if (result === 'migrated') stats.migrated++;
      else { stats.skipped++; log('SKIP', full, result); }
    } catch (err) {
      stats.failed++;
      stats.errors.push({ file: relative(ROOT, full), error: err.message });
      log('FAIL', full, err.message);
    }
  }
}

if (SCOPE === 'pages' || SCOPE === 'all') {
  console.log('\n── Migrating Server Components ──');
  const pageFiles = findFiles(join(ROOT, 'src/app/(shell)'), 'page.tsx');
  console.log(`Found ${pageFiles.length} page files\n`);
  for (const full of pageFiles) {
    try {
      const result = migratePage(full);
      if (result === 'migrated') stats.migrated++;
      else { stats.skipped++; log('SKIP', full, result); }
    } catch (err) {
      stats.failed++;
      stats.errors.push({ file: relative(ROOT, full), error: err.message });
      log('FAIL', full, err.message);
    }
  }
}

console.log(`\n── Summary ──`);
console.log(`Migrated: ${stats.migrated}`);
console.log(`Skipped:  ${stats.skipped}`);
console.log(`Failed:   ${stats.failed}`);
if (stats.errors.length > 0) {
  console.log('\nFailed files:');
  for (const e of stats.errors) console.log(`  ${e.file}: ${e.error}`);
}
if (DRY_RUN) console.log('\n(dry-run — no files modified)');
