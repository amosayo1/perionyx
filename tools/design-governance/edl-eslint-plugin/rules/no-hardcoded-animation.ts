/**
 * Phase 22.0B.5 — EDL ESLint Plugin: no-hardcoded-animation
 *
 * Reports inline animation/transition properties that should use EDL tokens.
 */

import { Rule } from "eslint";

const ANIMATION_PROPS = ["transition", "animation", "transitionDuration", "transitionTimingFunction", "animationDuration"];

export const noHardcodedAnimation: Rule.RuleModule = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow inline animation — use EDL motion tokens",
      category: "EDL Compliance",
      recommended: false,
    },
    messages: {
      hardcoded:
        "Hardcoded {{prop}}. Use EDL motion tokens from @/design-system/edl/motion (d-fastest, d-fast, d-normal, d-slow, e-standard, e-decelerate, e-accelerate, e-spring).",
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
          if (ANIMATION_PROPS.includes(name)) {
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
