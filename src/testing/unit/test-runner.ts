import { describe, it, expect } from "vitest";

export interface TestSuite {
  name: string;
  tests: TestCase[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export interface TestCase {
  name: string;
  fn: () => Promise<void>;
  tags?: string[];
}

export async function runTestSuite(suite: TestSuite): Promise<{ passed: number; failed: number; total: number }> {
  let passed = 0;
  let failed = 0;

  if (suite.setup) await suite.setup();
  for (const test of suite.tests) {
    try {
      await test.fn();
      passed++;
    } catch {
      failed++;
    }
  }
  if (suite.teardown) await suite.teardown();

  return { passed, failed, total: suite.tests.length };
}

export function categorizeTests(tests: TestCase[], tag: string): TestCase[] {
  return tests.filter((t) => t.tags?.includes(tag));
}

export { describe, it, expect };
