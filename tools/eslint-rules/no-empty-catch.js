/**
 * ESLint Rule: no-empty-catch
 *
 * Detects empty catch blocks and no-op .catch() arrow patterns.
 * Reports as error. Provides auto-fix to log the error.
 *
 * Options:
 *   allowCommentedCatch (boolean, default: false)
 *     When true, catch blocks containing a comment are allowed.
 */

const EMPTY_CATCH_MESSAGE =
  "Empty catch block. Errors must be handled or explicitly logged.";
const NOOP_CATCH_MESSAGE =
  "No-op .catch() handler. Errors must be handled or explicitly logged.";

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow empty catch blocks and no-op .catch() arrow handlers",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          allowCommentedCatch: {
            type: "boolean",
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      emptyCatch: EMPTY_CATCH_MESSAGE,
      noopCatch: NOOP_CATCH_MESSAGE,
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowCommentedCatch = options.allowCommentedCatch === true;

    /**
     * Returns true if the node's body contains at least one comment.
     */
    function hasComment(node) {
      const sourceCode = context.sourceCode || context.getSourceCode();
      const body = node.body || (node.consequent && node.consequent.body);
      if (!body) return false;

      // For BlockStatement body
      const block = node.type === "CatchClause" ? node.body : node;
      if (!block || !block.body) return false;

      const comments = sourceCode.getAllComments();
      const blockStart = block.range[0];
      const blockEnd = block.range[1];

      return comments.some(
        (c) => c.range[0] >= blockStart && c.range[1] <= blockEnd
      );
    }

    /**
     * Checks if a BlockStatement is empty or contains only comments.
     */
    function isEmptyBlock(block) {
      if (!block || !block.body) return true;
      if (block.body.length === 0) return true;
      return false;
    }

    /**
     * Reports on catch clauses with empty bodies.
     */
    function checkCatchClause(node) {
      if (!isEmptyBlock(node.body)) return;

      if (allowCommentedCatch && hasComment(node)) return;

      context.report({
        node,
        messageId: "emptyCatch",
        fix(fixer) {
          const replacement = `catch (err) {\n  logger.error(err, "Unhandled error");\n}`;
          return fixer.replaceText(node, replacement);
        },
      });
    }

    /**
     * Detects `.catch(() => {})` and `.catch(() => null)` / `.catch(() => undefined)`.
     */
    function checkCallExpression(node) {
      if (
        node.callee.type !== "MemberExpression" ||
        node.callee.property.type !== "Identifier" ||
        node.callee.property.name !== "catch" ||
        node.callee.computed
      ) {
        return;
      }

      const args = node.arguments;
      if (args.length !== 1) return;

      const arg = args[0];
      if (arg.type !== "ArrowFunctionExpression" && arg.type !== "FunctionExpression") {
        return;
      }

      // .catch(() => {})
      if (
        arg.params.length === 0 &&
        arg.body.type === "BlockStatement" &&
        arg.body.body.length === 0
      ) {
        context.report({
          node,
          messageId: "noopCatch",
          fix(fixer) {
            return fixer.replaceText(
              arg,
              `(err) => {\n  logger.error(err, "Unhandled error");\n}`
            );
          },
        });
        return;
      }

      // .catch(() => null) or .catch(() => undefined)
      if (
        arg.params.length === 0 &&
        arg.body.type !== "BlockStatement" &&
        (arg.body.type === "Literal" && (arg.body.value === null || arg.body.value === undefined)) ||
        (arg.body.type === "Identifier" && arg.body.name === "undefined")
      ) {
        context.report({
          node,
          messageId: "noopCatch",
          fix(fixer) {
            return fixer.replaceText(
              arg,
              `(err) => {\n  logger.error(err, "Unhandled error");\n}`
            );
          },
        });
      }
    }

    return {
      CatchClause: checkCatchClause,
      CallExpression: checkCallExpression,
    };
  },
};
