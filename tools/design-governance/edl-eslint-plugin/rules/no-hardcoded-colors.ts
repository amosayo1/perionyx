/**
 * Phase 22.0B.5 — EDL ESLint Plugin: no-hardcoded-colors
 *
 * Reports hardcoded hex colors that should use EDL tokens.
 */

import { Rule } from "eslint";

const EDL_COLORS = [
  "#d4af37", "#e5c04a", "#c7a961",
  "#0a0a0f", "#111118", "#1a1a24", "#222230", "#040404", "#0f0f17",
  "#f7f6f2", "#e4e4e7", "#a1a1aa", "#71717a", "#52525b", "#3f3f46", "#27272a",
  "#22c55e", "#16a34a", "#f59e0b", "#d97706",
  "#ef4444", "#dc2626", "#b91c1c", "#3b82f6", "#2563eb",
  "#a855f7", "#06b6d4", "#ec4899", "#737373",
];

export const noHardcodedColors: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded hex colors — use EDL tokens or Tailwind EDL utilities",
      category: "EDL Compliance",
      recommended: true,
    },
    messages: {
      hardcoded:
        "Hardcoded hex color '{{color}}' found. Use EDL tokens: import { colors } from '@/design-system/edl' or Tailwind utilities (text-gold, bg-surface-*, text-st-*).",
    },
    schema: [],
  },
  create(context) {
    const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;

    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        const value = node.value;
        hexPattern.lastIndex = 0;
        let match;
        while ((match = hexPattern.exec(value)) !== null) {
          const hex = match[0].toLowerCase();
          if (EDL_COLORS.includes(hex)) continue;
          context.report({
            node,
            messageId: "hardcoded",
            data: { color: match[0] },
          });
        }
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          const value = quasi.value.raw;
          hexPattern.lastIndex = 0;
          let match;
          while ((match = hexPattern.exec(value)) !== null) {
            const hex = match[0].toLowerCase();
            if (EDL_COLORS.includes(hex)) continue;
            context.report({
              node,
              messageId: "hardcoded",
              data: { color: match[0] },
            });
          }
        }
      },
    };
  },
};
