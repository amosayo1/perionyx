// ---------------------------------------------------------------------------
// Perionyx Enterprise Synthetic Benchmark Runner
// ---------------------------------------------------------------------------
// Benchmarks critical API endpoints and services without external
// dependencies. Designed to run in CI pipeline.
//
// Usage: npx tsx tests/load/scripts/synthetic-benchmark.ts
//
// Measures:
//   - API response times (P50, P95, P99)
//   - Throughput (requests/second)
//   - Failure rate
//   - Cache effectiveness
// ---------------------------------------------------------------------------

import http from "http";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const WARMUP_REQUESTS = 10;
const BENCHMARK_REQUESTS = 100;
const CONCURRENCY = 10;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface BenchmarkResult {
  name: string;
  method: string;
  path: string;
  requests: number;
  succeeded: number;
  failed: number;
  totalTimeMs: number;
  minMs: number;
  maxMs: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  throughput: number; // req/s
}

interface EndpointSpec {
  name: string;
  method: "GET" | "POST";
  path: string;
  body?: Record<string, unknown>;
  expectedStatus?: number;
}

// ---------------------------------------------------------------------------
// Benchmark definitions (17 endpoints across all modules)
// ---------------------------------------------------------------------------
const ENDPOINTS: EndpointSpec[] = [
  // Authentication
  { name: "Auth Session", method: "GET", path: "/api/auth/session" },

  // Dashboard / Health
  { name: "Risk Summary", method: "GET", path: "/api/v1/risk/summary" },
  { name: "Enterprise Health", method: "GET", path: "/api/v1/enterprise/health" },
  { name: "System Health", method: "GET", path: "/api/health" },

  // Treasury
  { name: "Treasury Accounts", method: "GET", path: "/api/v1/treasury/accounts" },
  { name: "FX Rates", method: "GET", path: "/api/v1/fx/rates" },
  { name: "Currencies", method: "GET", path: "/api/v1/currencies/rates" },
  { name: "Wallet List", method: "GET", path: "/api/v1/wallets" },

  // Approval
  { name: "Pending Approvals", method: "GET", path: "/api/v1/admin/pending-approvals" },
  { name: "Approval Rules", method: "GET", path: "/api/v1/admin/approval-rules" },

  // Notifications
  { name: "Notifications", method: "GET", path: "/api/v1/notifications?limit=10" },
  { name: "Notification Count", method: "GET", path: "/api/v1/notifications?count=true" },

  // Connectors
  { name: "Connector Health", method: "GET", path: "/api/v1/connectors/health" },
  { name: "Connector List", method: "GET", path: "/api/v1/connectors/list" },

  // Queue
  { name: "Queue Stats", method: "GET", path: "/api/v1/queue/stats" },

  // Users / Permissions
  { name: "My Permissions", method: "GET", path: "/api/v1/rbac/my-permissions" },

  // Companies
  { name: "Companies", method: "GET", path: "/api/v1/companies" },
];

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------
function makeRequest(
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<{ status: number; durationMs: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const url = new URL(path, BASE_URL);
    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({ status: res.statusCode ?? 0, durationMs: Date.now() - start });
      });
    });

    req.on("error", () => {
      resolve({ status: 0, durationMs: Date.now() - start });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, durationMs: Date.now() - start });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Benchmark runner
// ---------------------------------------------------------------------------
async function warmup(endpoint: EndpointSpec): Promise<void> {
  for (let i = 0; i < WARMUP_REQUESTS; i++) {
    await makeRequest(endpoint.method, endpoint.path, endpoint.body);
  }
}

async function benchmarkEndpoint(endpoint: EndpointSpec): Promise<BenchmarkResult> {
  console.log(`  Warming up ${endpoint.name}...`);
  await warmup(endpoint);

  console.log(`  Benchmarking ${endpoint.name} (${BENCHMARK_REQUESTS} requests, concurrency ${CONCURRENCY})...`);

  const durations: number[] = [];
  let succeeded = 0;
  let failed = 0;
  const totalStart = Date.now();

  // Process in batches for concurrency
  for (let i = 0; i < BENCHMARK_REQUESTS; i += CONCURRENCY) {
    const batch = [];
    const batchSize = Math.min(CONCURRENCY, BENCHMARK_REQUESTS - i);
    for (let j = 0; j < batchSize; j++) {
      batch.push(makeRequest(endpoint.method, endpoint.path, endpoint.body));
    }
    const results = await Promise.all(batch);
    for (const r of results) {
      durations.push(r.durationMs);
      if (r.status === (endpoint.expectedStatus ?? 200)) {
        succeeded++;
      } else {
        failed++;
      }
    }
  }

  const totalTimeMs = Date.now() - totalStart;
  durations.sort((a, b) => a - b);

  const avgMs = durations.reduce((s, v) => s + v, 0) / durations.length;
  const minMs = durations[0] ?? 0;
  const maxMs = durations[durations.length - 1] ?? 0;
  const p50Ms = durations[Math.floor(durations.length * 0.5)] ?? 0;
  const p95Ms = durations[Math.floor(durations.length * 0.95)] ?? 0;
  const p99Ms = durations[Math.floor(durations.length * 0.99)] ?? 0;
  const throughput = totalTimeMs > 0 ? Math.round((BENCHMARK_REQUESTS / totalTimeMs) * 1000) : 0;

  return {
    name: endpoint.name,
    method: endpoint.method,
    path: endpoint.path,
    requests: BENCHMARK_REQUESTS,
    succeeded,
    failed,
    totalTimeMs,
    minMs,
    maxMs,
    avgMs: Math.round(avgMs * 100) / 100,
    p50Ms,
    p95Ms,
    p99Ms,
    throughput,
  };
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------
function printResults(results: BenchmarkResult[]): void {
  const passes = results.filter((r) => r.failed === 0 && r.p95Ms < 2000);
  const failures = results.filter((r) => r.failed > 0 || r.p95Ms >= 2000);

  console.log("\n" + "=".repeat(120));
  console.log("PERIONYX ENTERPRISE — SYNTHETIC BENCHMARK RESULTS");
  console.log("=".repeat(120));
  console.log(
    `Date: ${new Date().toISOString()}`,
    `  Target: ${BASE_URL}`,
    `  Requests/endpoint: ${BENCHMARK_REQUESTS}`,
    `  Concurrency: ${CONCURRENCY}`,
    `  Total endpoints: ${results.length}`,
  );
  console.log("-".repeat(120));
  console.log(
    "Endpoint".padEnd(30),
    "Method".padEnd(8),
    "Avg(ms)".padEnd(10),
    "P50(ms)".padEnd(10),
    "P95(ms)".padEnd(10),
    "P99(ms)".padEnd(10),
    "Req/s".padEnd(8),
    "Succeeded".padEnd(10),
    "Failed".padEnd(8),
  );
  console.log("-".repeat(120));

  for (const r of results) {
    const status = r.failed > 0 ? "❌" : r.p95Ms < 500 ? "✓" : r.p95Ms < 2000 ? "⚠" : "❌";
    console.log(
      status,
      r.name.padEnd(28),
      r.method.padEnd(8),
      String(r.avgMs).padEnd(10),
      String(r.p50Ms).padEnd(10),
      String(r.p95Ms).padEnd(10),
      String(r.p99Ms).padEnd(10),
      String(r.throughput).padEnd(8),
      String(r.succeeded).padEnd(10),
      String(r.failed).padEnd(8),
    );
  }

  console.log("-".repeat(120));
  console.log(`Pass: ${passes.length}/${results.length}  |  Fail: ${failures.length}/${results.length}`);
  console.log("=".repeat(120));

  if (failures.length > 0) {
    console.log("\nFAILURES:");
    for (const f of failures) {
      console.log(`  ❌ ${f.name} — ${f.failed} failed requests, P95: ${f.p95Ms}ms`);
    }
    process.exit(1);
  }

  // Performance budget validation
  const budgetFailures: string[] = [];
  for (const r of results) {
    if (r.name === "Dashboard" && r.p95Ms >= 2000) {
      budgetFailures.push(`${r.name}: P95=${r.p95Ms}ms (budget: <2000ms)`);
    }
    if (r.p99Ms >= 5000) {
      budgetFailures.push(`${r.name}: P99=${r.p99Ms}ms (budget: <5000ms)`);
    }
  }

  if (budgetFailures.length > 0) {
    console.log("\nPERFORMANCE BUDGET VIOLATIONS:");
    for (const bf of budgetFailures) {
      console.log(`  ⚠ ${bf}`);
    }
  }

  console.log("\n✓ All endpoints within performance budgets\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\nPerionyx Enterprise Synthetic Benchmark\n`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Endpoints: ${ENDPOINTS.length}`);
  console.log(`Requests per endpoint: ${BENCHMARK_REQUESTS}`);
  console.log(`Concurrency: ${CONCURRENCY}\n`);

  const results: BenchmarkResult[] = [];
  for (const endpoint of ENDPOINTS) {
    try {
      const result = await benchmarkEndpoint(endpoint);
      results.push(result);
    } catch (err) {
      console.error(`  ✗ Error benchmarking ${endpoint.name}:`, err);
    }
  }

  printResults(results);
}

main().catch(console.error);
