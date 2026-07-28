/**
 * Phase 22.0B.5 — EDL ESLint Plugin: no-hardcoded-radius
 *
 * Reports inline borderRadius that should use EDL tokens.
 */

import { Rule } from "eslint";

export const noHardcodedRadius: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow inline borderRadius — use EDL radius tokens",
      category: "EDL Compliance",
      recommended: false,
    },
    messages: {
      hardcoded:
        "Hardcoded borderRadius: {{value}}. Use EDL radius tokens (radius-sm/md/lg/xl/2xl/3xl/full).",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node: any) {
        if (node.name?.name !== "style") return;
        if (!node.value?.expression?.properties) return;

        for (const prop of node.value.expression.properties) {
          if (prop.key?.name === "borderRadius" && prop.value?.type === "Literal") {
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
