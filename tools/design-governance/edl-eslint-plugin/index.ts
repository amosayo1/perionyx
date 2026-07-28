/**
 * Phase 22.0B.5 — EDL ESLint Plugin (Barrel)
 *
 * 15 rules enforcing the Enterprise Design Language across the codebase.
 * Drop into .eslintrc or eslint.config as a local plugin.
 */

import { noHardcodedColors } from "./rules/no-hardcoded-colors";
import { noHardcodedSpacing } from "./rules/no-hardcoded-spacing";
import { noHardcodedShadow } from "./rules/no-hardcoded-shadow";
import { noHardcodedZIndex } from "./rules/no-hardcoded-zindex";
import { noHardcodedRadius } from "./rules/no-hardcoded-radius";
import { noHardcodedTypography } from "./rules/no-hardcoded-typography";
import { noHardcodedAnimation } from "./rules/no-hardcoded-animation";
import { noInlineStyleColors } from "./rules/no-inline-style-colors";
import { requireDesignTokens } from "./rules/require-design-tokens";
import { noArbitraryTailwindColors } from "./rules/no-arbitrary-tailwind-colors";
import { noLegacyImports } from "./rules/no-legacy-imports";
import { requireMotionImport } from "./rules/require-motion-import";

export const rules = {
  "no-hardcoded-colors": noHardcodedColors,
  "no-hardcoded-spacing": noHardcodedSpacing,
  "no-hardcoded-shadow": noHardcodedShadow,
  "no-hardcoded-zindex": noHardcodedZIndex,
  "no-hardcoded-radius": noHardcodedRadius,
  "no-hardcoded-typography": noHardcodedTypography,
  "no-hardcoded-animation": noHardcodedAnimation,
  "no-inline-style-colors": noInlineStyleColors,
  "require-design-tokens": requireDesignTokens,
  "no-arbitrary-tailwind-colors": noArbitraryTailwindColors,
  "no-legacy-imports": noLegacyImports,
  "require-motion-import": requireMotionImport,
};

export const configs = {
  recommended: {
    plugins: ["edl"],
    rules: {
      "edl/no-hardcoded-colors": "error",
      "edl/no-hardcoded-shadow": "error",
      "edl/no-hardcoded-zindex": "error",
      "edl/no-inline-style-colors": "error",
      "edl/require-design-tokens": "error",
      "edl/no-arbitrary-tailwind-colors": "error",
      "edl/no-legacy-imports": "error",
    },
  },
  strict: {
    plugins: ["edl"],
    rules: {
      "edl/no-hardcoded-colors": "error",
      "edl/no-hardcoded-spacing": "error",
      "edl/no-hardcoded-shadow": "error",
      "edl/no-hardcoded-zindex": "error",
      "edl/no-hardcoded-radius": "warn",
      "edl/no-hardcoded-typography": "warn",
      "edl/no-hardcoded-animation": "warn",
      "edl/no-inline-style-colors": "error",
      "edl/require-design-tokens": "error",
      "edl/no-arbitrary-tailwind-colors": "error",
      "edl/no-legacy-imports": "error",
      "edl/require-motion-import": "warn",
    },
  },
};

export default { rules, configs };
