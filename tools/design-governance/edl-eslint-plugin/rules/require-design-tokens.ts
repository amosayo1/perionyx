/**
 * Phase 22.0B.5 — EDL ESLint Plugin: require-design-tokens
 *
 * Enforces that new files import from EDL canonical sources.
 */

import { Rule } from "eslint";

const VALID_EDL_IMPORTS = [
  "@/design-system/edl",
  "@/design-system/edl/colors",
  "@/design-system/edl/typography",
  "@/design-system/edl/spacing",
  "@/design-system/edl/radius",
  "@/design-system/edl/motion",
  "@/design-system/edl/z-index",
  "@/design-system/edl/icons",
  "@/design-system/edl/components",
];

const DEPRECATED_IMPORTS = [
  "@/design-system/tokens/colors",
  "@/design-system/tokens/surfaces",
  "@/design-system/tokens/status",
  "@/design-system/tokens/typography",
  "@/design-system/tokens/spacing",
  "@/design-system/tokens/radius",
  "@/design-system/tokens/animation",
  "@/design-system/tokens/shadows",
  "@/design-system/tokens/index",
  "@/components/enterprise/motion/tokens",
];

export const requireDesignTokens: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require imports from EDL canonical sources",
      category: "EDL Compliance",
      recommended: true,
    },
    messages: {
      deprecated:
        "Import from deprecated path '{{path}}'. Migrate to @/design-system/edl (the canonical barrel).",
      legacy:
        "Import from legacy motion tokens. Migrate to @/design-system/edl/motion.",
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== "string") return;

        if (DEPRECATED_IMPORTS.includes(source)) {
          context.report({
            node,
            messageId: source.includes("motion/tokens") ? "legacy" : "deprecated",
            data: { path: source },
          });
        }
      },
      ImportExpression(node) {
        if (node.source?.type === "Literal" && typeof node.source.value === "string") {
          const source = node.source.value;
          if (DEPRECATED_IMPORTS.includes(source)) {
            context.report({
              node,
              messageId: source.includes("motion/tokens") ? "legacy" : "deprecated",
              data: { path: source },
            });
          }
        }
      },
    };
  },
};
