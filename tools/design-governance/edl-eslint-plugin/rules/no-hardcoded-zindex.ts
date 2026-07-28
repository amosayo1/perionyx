/**
 * Phase 22.0B.5 — EDL ESLint Plugin: no-hardcoded-zindex
 *
 * Reports inline zIndex that should use EDL z-index tokens.
 */

import { Rule } from "eslint";

const Z_INDEX_MAX = 50;

export const noHardcodedZIndex: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow inline zIndex — use EDL z-index tokens",
      category: "EDL Compliance",
      recommended: true,
    },
    messages: {
      hardcoded:
        "Hardcoded zIndex: {{value}}. Use EDL z-index tokens (z-tooltip, z-overlay, z-modal, z-toast) or Tailwind utilities (z-tooltip, z-overlay, z-modal, z-toast).",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node: any) {
        if (node.name?.name !== "style") return;
        if (!node.value?.expression?.properties) return;

        for (const prop of node.value.expression.properties) {
          if (prop.key?.name === "zIndex" && prop.value?.type === "Literal" && typeof prop.value.value === "number" && prop.value.value >= Z_INDEX_MAX) {
            context.report({
              node: prop,
              messageId: "hardcoded",
              data: { value: String(prop.value.value) },
            });
          }
        }
      },
    };
  },
};
