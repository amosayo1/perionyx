/**
 * Phase 22.0B.5 — EDL ESLint Plugin: no-hardcoded-shadow
 *
 * Reports inline box-shadow that should use EDL tokens.
 */

import { Rule } from "eslint";

export const noHardcodedShadow: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow inline box-shadow — use EDL shadow tokens",
      category: "EDL Compliance",
      recommended: true,
    },
    messages: {
      hardcoded:
        "Hardcoded box-shadow. Use EDL shadow tokens: shadow-elevated, shadow-elevatedHigh, shadow-glow-gold, shadow-glow-success, shadow-glow-error, etc.",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node: any) {
        if (node.name?.name !== "style") return;
        if (!node.value?.expression?.properties) return;

        for (const prop of node.value.expression.properties) {
          if (prop.key?.name === "boxShadow") {
            context.report({ node: prop, messageId: "hardcoded" });
          }
        }
      },
    };
  },
};
