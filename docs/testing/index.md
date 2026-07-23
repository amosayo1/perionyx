# Testing Documentation

## Test Types

| Type | Directory | Description |
|---|---|---|
| Unit | `src/testing/unit/` | Isolated function/class tests |
| Integration | `src/testing/integration/` | Multi-component interaction tests |
| Repository | `src/testing/repository/` | Data layer tests |
| Service | `src/testing/service/` | Business logic tests |
| API | `src/testing/api/` | HTTP endpoint tests |
| Component | `src/testing/component/` | UI component tests |
| Infrastructure | `src/testing/infrastructure/` | Config and infrastructure tests |
| Smoke | `src/testing/smoke/` | Basic sanity checks |
| Regression | `src/testing/regression/` | Bug regression tests |
| Golden Snapshot | `src/testing/golden/` | Snapshot comparison tests |
| Contract | `src/testing/contract/` | API contract validation |
| E2E | `src/testing/e2e/` | End-to-end workflow tests |
| Performance | `src/testing/performance/` | Load, stress, chaos, benchmarks |

## Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test -- src/testing/smoke/smoke.test.ts

# Run tests matching pattern
pnpm test -- -t "should handle"

# Run performance benchmarks
pnpm test -- src/testing/performance/
```

## Test Configuration

- **Framework**: Vitest
- **Environment**: Node (with jsdom for component tests)
- **Coverage threshold**: 85% lines, 85% functions, 80% branches
- **Parallel execution**: 4 max forks, 8 max concurrency
- **Timeout**: 30s per test, 30s per hook
- **Retry**: 1 retry for flaky tests

## Mock Factories

Located in `src/testing/support/factories/`:
- `userFactory` — User mock objects
- `organizationFactory` — Organization mock objects
- `treasuryAccountFactory` — Treasury account mock objects
- `createMockFactory<T>()` — Generic mock factory

## Fixtures

Located in `src/testing/support/fixtures/`:
- `treasuryFixtures` — Treasury domain fixtures
- `createFixture()` — Immutable fixture wrapper

## Performance Testing

### Benchmark Harness

```typescript
import { benchmark } from "src/testing/performance/benchmark-runner";

const results = await benchmark.run({
  name: "My Benchmark",
  benchmarks: [
    { name: "operation", fn: () => doThing(), iterations: 1000 },
  ],
});
```

### Load Test Harness

```typescript
import { loadTest } from "src/testing/performance/load/load-test";

const result = await loadTest.run({
  name: "my-load-test",
  concurrency: 50,
  durationMs: 10000,
  fn: async (i) => { /* test operation */ },
});
```

### Stress Test Harness

```typescript
import { stressTest } from "src/testing/performance/stress/stress-test";

const result = await stressTest.run({
  name: "my-stress-test",
  rampUpMs: 5000,
  peakConcurrency: 100,
  sustainedMs: 10000,
  fn: async (i) => { /* test operation */ },
});
```

### Chaos Test Harness

```typescript
import { chaosTest } from "src/testing/performance/chaos/chaos-test";

const result = await chaosTest.run({
  name: "my-chaos-test",
  durationMs: 2000,
  scenarios: [
    { name: "timeout", fn: () => { /* scenario */ } },
  ],
});
```

## Golden Snapshot Testing

Snapshots are stored in `src/testing/golden/__snapshots__/` and compared on each run. New snapshots are automatically created when they don't exist.

## Data Builders

```typescript
import { DataBuilder } from "src/testing/support/builders/data-builder";

const builder = new DataBuilder<User>()
  .with("name", "Alice")
  .with("email", "alice@example.com");
const user = builder.build(defaultUser);
```
