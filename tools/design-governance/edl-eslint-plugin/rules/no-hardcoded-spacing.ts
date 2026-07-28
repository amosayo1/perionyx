/**
 * Phase 22.0B.5 — EDL ESLint Plugin: no-hardcoded-spacing
 *
 * Reports inline spacing that should use EDL tokens.
 */

import { Rule } from "eslint";

export const noHardcodedSpacing: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow inline spacing values — use EDL spacing tokens or Tailwind utilities",
      category: "EDL Compliance",
      recommended: false,
    },
    messages: {
      hardcoded:
        "Hardcoded spacing '{{value}}'. Use EDL spacing tokens or Tailwind utilities (p-4, m-6, gap-3, etc.).",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node: any) {
        if (node.name?.name !== "style") return;
        if (!node.value?.expression?.properties) return;

        for (const prop of node.value.expression.properties) {
          const name = prop.key?.name || prop.key?.value;
          if (!["padding", "margin", "gap", "top", "left", "right", "bottom", "paddingTop", "paddingBottom", "marginTop", "marginBottom"].includes(name)) continue;

          const val = prop.value;
          if (val?.type === "Literal" && typeof val.value === "number" && val.value > 0) {
            context.report({
              node: prop,
              messageId: "hardcoded",
              data: { value: `${name}: ${val.value}px` },
            });
          }
          if (val?.type === "UnaryExpression" && val.argument?.value) {
            context.report({
              node: prop,
              messageId: "hardcoded",
              data: { value: `${name}: ${val.operator}${val.argument.value}px` },
            });
          }
        }
      },
    };
  },
};
