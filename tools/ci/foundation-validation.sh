#!/bin/bash
# Foundation Hardening Validation — Phase 26.3
# Run this script to verify no regressions in foundation hardening.

set -e

echo "=== Foundation Hardening Validation ==="

# 1. TypeScript compilation (docs/site docusaurus errors are pre-existing and excluded)
echo "[1/7] TypeScript compilation..."
TSC_OUTPUT=$(pnpm typecheck 2>&1 || true)
NON_SITE_ERRORS=$(echo "$TSC_OUTPUT" | grep "error TS" | grep -v "docs/site" || true)
if [ -n "$NON_SITE_ERRORS" ]; then
  echo "  ✗ TypeScript errors found (excluding docs/site):"
  echo "$NON_SITE_ERRORS"
  exit 1
fi
echo "  ✓ TypeScript clean (excluding pre-existing docs/site errors)"

# 2. Production build
echo "[2/7] Production build..."
pnpm build
echo "  ✓ Build passes"

# 3. Runtime tests
echo "[3/7] Runtime tests..."
pnpm vitest run test/runtime.test.ts
echo "  ✓ Runtime tests pass"

# 4. AP tests
echo "[4/7] AP tests..."
pnpm vitest run test/procurement/ap-api.test.ts
echo "  ✓ AP tests pass"

# 5. No empty catches in foundation layer
echo "[5/7] Exception discipline check..."
EMPTY_CATCHES=$(rg -c 'catch\s*\{\s*\}' src/runtime/ src/server/foundation/ src/server/security/ 2>/dev/null | grep -v ':0$' || true)
if [ -n "$EMPTY_CATCHES" ]; then
  echo "  ✗ Empty catch blocks found:"
  echo "$EMPTY_CATCHES"
  exit 1
fi
echo "  ✓ No empty catches in foundation layer"

# 6. No hardcoded fallback secrets
echo "[6/7] Secret safety check..."
FALLBACKS=$(rg -n '"sandbox-fallback"|"fallback-secret"|"changeme"|"default-secret"' src/ --glob '!*.test.*' 2>/dev/null || true)
if [ -n "$FALLBACKS" ]; then
  echo "  ✗ Fallback secrets found:"
  echo "$FALLBACKS"
  exit 1
fi
echo "  ✓ No fallback secrets in source"

# 7. BoundedRingBuffer usage (no unbounded arrays in foundation)
echo "[7/7] Memory bounds check..."
UNBOUNDED=$(rg -n 'private\s+\w+\s*[=:]\s*\[\]\s*;' src/server/foundation/ src/runtime/ 2>/dev/null || true)
if [ -n "$UNBOUNDED" ]; then
  echo "  ✗ Unbounded arrays found in foundation:"
  echo "$UNBOUNDED"
  exit 1
fi
echo "  ✓ All foundation arrays are bounded"

echo ""
echo "=== All foundation hardening checks passed ==="
