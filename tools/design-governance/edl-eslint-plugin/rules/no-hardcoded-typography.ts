/**
 * Phase 22.0B.5 — EDL ESLint Plugin: no-hardcoded-typography
 *
 * Reports inline font properties that should use EDL tokens.
 */

import { Rule } from "eslint";

const TYPOGRAPHY_PROPS = ["fontSize", "fontWeight", "lineHeight", "letterSpacing", "fontFamily"];

export const noHardcodedTypography: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow inline typography — use EDL typography tokens",
      category: "EDL Compliance",
      recommended: false,
    },
    messages: {
      hardcoded:
        "Hardcoded {{prop}}. Use EDL typography tokens or Tailwind font utilities (text-xs, text-sm, text-base, font-medium, leading-tight, tracking-wide, etc.).",
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
          if (TYPOGRAPHY_PROPS.includes(name)) {
            context.report({
              node: prop,
              messageId: "hardcoded",
              data: { prop: name },
            });
          }
        }
      },
    };
  },
};
