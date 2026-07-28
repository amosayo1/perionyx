/**
 * Phase 22.0B.5 — EDL ESLint Plugin: no-legacy-imports
 *
 * Reports imports from deprecated design system paths.
 */

import { Rule } from "eslint";

const DEPRECATED = [
  "@/design-system/tokens/colors",
  "@/design-system/tokens/surfaces",
  "@/design-system/tokens/status",
  "@/design-system/tokens/typography",
  "@/design-system/tokens/spacing",
  "@/design-system/tokens/radius",
  "@/design-system/tokens/animation",
  "@/design-system/tokens/shadows",
  "@/design-system/tokens/index",
];

export const noLegacyImports: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow imports from deprecated design system paths",
      category: "EDL Compliance",
      recommended: true,
    },
    messages: {
      legacy:
        "Import from deprecated legacy path '{{path}}'. Use @/design-system/edl instead.",
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== "string") return;
        if (DEPRECATED.includes(source)) {
          context.report({ node, messageId: "legacy", data: { path: source } });
        }
      },
      ImportExpression(node) {
        if (node.source?.type === "Literal" && typeof node.source.value === "string") {
          if (DEPRECATED.includes(node.source.value)) {
            context.report({ node, messageId: "legacy", data: { path: node.source.value } });
          }
        }
      },
    };
  },
};
