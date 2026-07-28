/**
 * Phase 22.0B.5 — EDL ESLint Plugin: require-motion-import
 *
 * Reports framer-motion usage without EDL motion tokens.
 */

import { Rule } from "eslint";

export const requireMotionImport: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce EDL motion tokens for framer-motion components",
      category: "EDL Compliance",
      recommended: false,
    },
    messages: {
      inline:
        "Inline motion value '{{value}}'. Use EDL motion tokens (d-fastest, e-standard, etc.) for consistency.",
    },
    schema: [],
  },
  create(context) {
    const DURATIONS = /\bd-\w+/g;
    const EASINGS = /\be-\w+/g;

    return {
      JSXAttribute(node: any) {
        const name = node.name?.name;
        if (!name) return;
        if (name !== "transition" && name !== "whileHover" && name !== "whileTap" && name !== "animate" && name !== "exit") return;

        if (node.value?.type === "JSXExpressionContainer" && node.value.expression?.type === "ObjectExpression") {
          for (const prop of node.value.expression.properties) {
            const key = prop.key?.name || prop.key?.value;
            if (key === "duration" && prop.value?.type === "Literal" && typeof prop.value.value === "number") {
              context.report({
                node: prop,
                messageId: "inline",
                data: { value: `duration: ${prop.value.value}` },
              });
            }
            if (key === "ease" && prop.value?.type === "Literal" && typeof prop.value.value === "string") {
              context.report({
                node: prop,
                messageId: "inline",
                data: { value: `ease: "${prop.value.value}"` },
              });
            }
          }
        }
      },
    };
  },
};
