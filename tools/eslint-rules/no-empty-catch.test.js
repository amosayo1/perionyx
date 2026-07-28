/**
 * Tests for the no-empty-catch ESLint rule.
 *
 * Run: node tools/eslint-rules/no-empty-catch.test.js
 * Or via ESLint: npx eslint --no-eslintrc --rule 'no-empty-catch: error' --plugin '' --rulesdir tools/eslint-rules <file>
 */

const { RuleTester } = require("eslint");
const rule = require("./no-empty-catch.js");

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

const FIXED_CATCH = `catch (err) {\n  logger.error(err, "Unhandled error");\n}`;
const FIXED_NOOP = `(err) => {\n  logger.error(err, "Unhandled error");\n}`;

// ---------------------------------------------------------------------------
// Valid cases
// ---------------------------------------------------------------------------
const valid = [
  // catch with body
  {
    code: `try { x() } catch (e) { logger.error(e); }`,
  },
  // catch with re-throw
  {
    code: `try { x() } catch (err) { throw err; }`,
  },
  // catch with conditional handling
  {
    code: `function handle() { try { x() } catch (e) { if (e.code === 'ENOENT') return; else throw e; } }`,
  },
  // .catch with real handler
  {
    code: `promise.catch(err => { logger.error(err); })`,
  },
  // .catch with named function
  {
    code: `promise.catch(function(err) { console.error(err); })`,
  },
  // .catch with reject
  {
    code: `promise.catch(reject)`,
  },
  // Empty catch allowed with allowCommentedCatch + comment
  {
    code: `try { x() } catch (e) { /* intentionally empty — retry handles it */ }`,
    options: [{ allowCommentedCatch: true }],
  },
  // catch with statement (not empty)
  {
    code: `function fn() { try { x() } catch { return false; } }`,
  },
];

// ---------------------------------------------------------------------------
// Invalid cases
// ---------------------------------------------------------------------------
const invalid = [
  // Empty catch block with param
  {
    code: `try { x() } catch (e) {}`,
    errors: [{ messageId: "emptyCatch", type: "CatchClause" }],
    output: `try { x() } ${FIXED_CATCH}`,
  },
  // Empty catch block without param
  {
    code: `try { x() } catch {}`,
    errors: [{ messageId: "emptyCatch", type: "CatchClause" }],
    output: `try { x() } ${FIXED_CATCH}`,
  },
  // Catch with only whitespace
  {
    code: `try { x() } catch (e) {   }`,
    errors: [{ messageId: "emptyCatch", type: "CatchClause" }],
    output: `try { x() } ${FIXED_CATCH}`,
  },
  // Catch with only a comment — should still error by default
  {
    code: `try { x() } catch (e) { /* noop */ }`,
    errors: [{ messageId: "emptyCatch", type: "CatchClause" }],
    output: `try { x() } ${FIXED_CATCH}`,
  },
  // .catch(() => {})
  {
    code: `promise.catch(() => {})`,
    errors: [{ messageId: "noopCatch", type: "CallExpression" }],
    output: `promise.catch(${FIXED_NOOP})`,
  },
  // .catch(() => null)
  {
    code: `promise.catch(() => null)`,
    errors: [{ messageId: "noopCatch", type: "CallExpression" }],
    output: `promise.catch(${FIXED_NOOP})`,
  },
  // .catch(() => undefined)
  {
    code: `promise.catch(() => undefined)`,
    errors: [{ messageId: "noopCatch", type: "CallExpression" }],
    output: `promise.catch(${FIXED_NOOP})`,
  },
  // .catch(function() {})
  {
    code: `promise.catch(function() {})`,
    errors: [{ messageId: "noopCatch", type: "CallExpression" }],
    output: `promise.catch(${FIXED_NOOP})`,
  },
  // Empty catch in async function
  {
    code: `async function run() { try { await fetch() } catch (e) {} }`,
    errors: [{ messageId: "emptyCatch", type: "CatchClause" }],
    output: `async function run() { try { await fetch() } ${FIXED_CATCH} }`,
  },
  // Chained .catch(() => {})
  {
    code: `fetch().then(fn).catch(() => {})`,
    errors: [{ messageId: "noopCatch", type: "CallExpression" }],
    output: `fetch().then(fn).catch(${FIXED_NOOP})`,
  },
  // allowCommentedCatch = false — catch with comment still errors
  {
    code: `function g() { try { x() } catch (e) { /* suppressed */ } }`,
    options: [{ allowCommentedCatch: false }],
    errors: [{ messageId: "emptyCatch", type: "CatchClause" }],
    output: `function g() { try { x() } ${FIXED_CATCH} }`,
  },
];

tester.run("no-empty-catch", rule, { valid, invalid });

console.log("✓ All no-empty-catch tests passed");
