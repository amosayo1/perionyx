/**
 * Phase 22.0B.5 — EDL ESLint Plugin: no-inline-style-colors
 *
 * Reports inline style objects using color values that should be EDL tokens.
 */

import { Rule } from "eslint";

export const noInlineStyleColors: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow inline style color values — use EDL tokens or Tailwind classes",
      category: "EDL Compliance",
      recommended: true,
    },
    messages: {
      color:
        "Inline style '{{prop}}: {{value}}'. Use EDL color tokens (colors.gold.500, colors.text.primary) or Tailwind utilities (text-gold, text-st-*, bg-surface-*).",
    },
    schema: [],
  },
  create(context) {
    const colorProps = [
      "color", "backgroundColor", "borderColor", "borderTopColor",
      "borderRightColor", "borderBottomColor", "borderLeftColor",
      "outlineColor", "textDecorationColor", "fill", "stroke",
    ];

    return {
      JSXAttribute(node: any) {
        if (node.name?.name !== "style") return;
        if (!node.value?.expression?.properties) return;

        for (const prop of node.value.expression.properties) {
          const name = prop.key?.name || prop.key?.value;
          if (colorProps.includes(name)) {
            const val = prop.value;
            // Only flag string values (hex, rgb, rgba)
            if (val?.type === "Literal" && typeof val.value === "string") {
              context.report({
                node: prop,
                messageId: "color",
                data: { prop: name, value: val.value },
              });
            }
          }
        }
      },
    };
  },
};
