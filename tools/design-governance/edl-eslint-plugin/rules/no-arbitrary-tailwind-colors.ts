/**
 * Phase 22.0B.5 — EDL ESLint Plugin: no-arbitrary-tailwind-colors
 *
 * Reports arbitrary Tailwind color classes that should use EDL utilities.
 */

import { Rule } from "eslint";

export const noArbitraryTailwindColors: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow arbitrary Tailwind color values — use EDL utilities",
      category: "EDL Compliance",
      recommended: true,
    },
    messages: {
      arbitrary:
        "Arbitrary Tailwind color '{{class}}'. Use EDL utilities: text-gold, bg-surface-*, text-st-*, border-st-*, shadow-glow-*, etc.",
    },
    schema: [],
  },
  create(context) {
    const arbitraryPattern = /(?:text|bg|border|ring|fill|stroke|shadow|divide|from|to|via|accent|outline|decoration|border-l|border-t|border-r|border-b)-\[#[0-9a-fA-F]+\]/g;

    function checkString(node: any, value: string) {
      arbitraryPattern.lastIndex = 0;
      let match;
      while ((match = arbitraryPattern.exec(value)) !== null) {
        context.report({
          node,
          messageId: "arbitrary",
          data: { class: match[0] },
        });
      }
    }

    return {
      JSXAttribute(node: any) {
        const name = node.name?.name;
        if (name !== "className" && name !== "class") return;
        if (!node.value) return;

        if (node.value.type === "Literal" && typeof node.value.value === "string") {
          checkString(node, node.value.value);
        }
        if (node.value.type === "JSXExpressionContainer" && node.value.expression?.type === "TemplateLiteral") {
          for (const quasi of node.value.expression.quasis) {
            checkString(node, quasi.value.raw);
          }
        }
      },
    };
  },
};
