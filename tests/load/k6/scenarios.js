// ---------------------------------------------------------------------------
// Perionyx Enterprise Load Testing Scenarios (k6)
// ---------------------------------------------------------------------------
// Usage:
//   k6 run --vus 10 --duration 30s tests/load/k6/scenarios.js
//   k6 run --vus 100 --duration 60s tests/load/k6/scenarios.js
//   k6 run --vus 500 --duration 120s tests/load/k6/scenarios.js
//
// Scenarios: auth, dashboard, workflow, approvals, treasury, analytics,
//            notifications, connector, background jobs, scheduler
// ---------------------------------------------------------------------------

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------
const failureRate = new Rate("failure_rate");
const dashboardLatency = new Trend("dashboard_latency_ms");
const authLatency = new Trend("auth_latency_ms");
const workflowLatency = new Trend("workflow_latency_ms");
const approvalLatency = new Trend("approval_latency_ms");
const treasuryLatency = new Trend("treasury_latency_ms");
const analyticsLatency = new Trend("analytics_latency_ms");
const notificationLatency = new Trend("notification_latency_ms");
const connectorLatency = new Trend("connector_latency_ms");
const jobLatency = new Trend("job_latency_ms");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const AUTH_TOKEN = __ENV.AUTH_TOKEN || "";
const TENANT_ID = __ENV.TENANT_ID || "test-tenant";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${AUTH_TOKEN}`,
  "X-Tenant-Id": TENANT_ID,
};

function checkResponse(name, response, expectedStatus = 200) {
  const ok = check(response, {
    [`${name} status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${name} < 2s`]: (r) => r.timings.duration < 2000,
  });
  failureRate.add(!ok);
  return ok;
}

// ---------------------------------------------------------------------------
// Load test scenarios
// ---------------------------------------------------------------------------

export function scenarioAuth() {
  group("Authentication", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/auth/session`, { headers });
    authLatency.add(Date.now() - start);
    checkResponse("auth/session", res);
    sleep(1);
  });
}

export function scenarioDashboard() {
  group("Dashboard", () => {
    // Automation Studio dashboard
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/risk/summary`, { headers });
    dashboardLatency.add(Date.now() - start);
    checkResponse("risk/summary", res);
    sleep(0.5);

    // Governance metrics
    const gStart = Date.now();
    const gRes = http.get(`${BASE_URL}/api/v1/policies`, { headers });
    dashboardLatency.add(Date.now() - gStart);
    checkResponse("policies", gRes);
    sleep(0.5);

    // Health check
    const hStart = Date.now();
    const hRes = http.get(`${BASE_URL}/api/v1/enterprise/health`, { headers });
    dashboardLatency.add(Date.now() - hStart);
    checkResponse("enterprise/health", hRes);
    sleep(1);
  });
}

export function scenarioWorkflow() {
  group("Workflow Engine", () => {
    // List workflows
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/workflows`, { headers });
    workflowLatency.add(Date.now() - start);
    checkResponse("workflows/list", res, 200);
    sleep(0.5);

    // Create workflow definition (lightweight)
    const cStart = Date.now();
    const cRes = http.post(
      `${BASE_URL}/api/v1/workflows`,
      JSON.stringify({
        name: `LoadTest Workflow ${__VU}-${__ITER}`,
        category: "loadtest",
        steps: [
          { id: "step1", type: "DELAY", config: { durationMs: 100 }, label: "Initial delay" },
          { id: "step2", type: "NOTIFICATION", config: { template: "standard" }, label: "Notify" },
        ],
      }),
      { headers },
    );
    workflowLatency.add(Date.now() - cStart);
    checkResponse("workflows/create", cRes);
    sleep(1);
  });
}

export function scenarioApprovals() {
  group("Approvals", () => {
    // Pending approvals
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/admin/pending-approvals`, { headers });
    approvalLatency.add(Date.now() - start);
    checkResponse("approvals/pending", res);
    sleep(0.5);

    // Approval rules
    const rStart = Date.now();
    const rRes = http.get(`${BASE_URL}/api/v1/admin/approval-rules`, { headers });
    approvalLatency.add(Date.now() - rStart);
    checkResponse("approvals/rules", rRes);
    sleep(1);
  });
}

export function scenarioTreasury() {
  group("Treasury", () => {
    // Accounts
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/treasury/accounts`, { headers });
    treasuryLatency.add(Date.now() - start);
    checkResponse("treasury/accounts", res);
    sleep(0.5);

    // FX rates
    const fxStart = Date.now();
    const fxRes = http.get(`${BASE_URL}/api/v1/fx/rates`, { headers });
    treasuryLatency.add(Date.now() - fxStart);
    checkResponse("fx/rates", fxRes);
    sleep(0.5);

    // External accounts
    const eStart = Date.now();
    const eRes = http.get(`${BASE_URL}/api/v1/treasury/external/accounts`, { headers });
    treasuryLatency.add(Date.now() - eStart);
    checkResponse("treasury/external", eRes);
    sleep(1);
  });
}

export function scenarioAnalytics() {
  group("Analytics", () => {
    // Approval analytics
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/admin/approval-analytics`, { headers });
    analyticsLatency.add(Date.now() - start);
    checkResponse("analytics/approval", res);
    sleep(1);

    // Risk summary
    const rStart = Date.now();
    const rRes = http.get(`${BASE_URL}/api/v1/risk/summary`, { headers });
    analyticsLatency.add(Date.now() - rStart);
    checkResponse("analytics/risk", rRes);
    sleep(1);
  });
}

export function scenarioNotifications() {
  group("Notifications", () => {
    // List notifications
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/notifications?limit=20`, { headers });
    notificationLatency.add(Date.now() - start);
    checkResponse("notifications/list", res);
    sleep(0.5);

    // Unread count
    const cStart = Date.now();
    const cRes = http.get(`${BASE_URL}/api/v1/notifications?count=true`, { headers });
    notificationLatency.add(Date.now() - cStart);
    checkResponse("notifications/count", cRes);
    sleep(1);
  });
}

export function scenarioConnector() {
  group("Connector", () => {
    // Connector health
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/connectors/health`, { headers });
    connectorLatency.add(Date.now() - start);
    checkResponse("connectors/health", res);
    sleep(0.5);

    // Connector list
    const lStart = Date.now();
    const lRes = http.get(`${BASE_URL}/api/v1/connectors/list`, { headers });
    connectorLatency.add(Date.now() - lStart);
    checkResponse("connectors/list", lRes);
    sleep(1);
  });
}

export function scenarioBackgroundJobs() {
  group("Background Jobs", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/queue/stats`, { headers });
    jobLatency.add(Date.now() - start);
    checkResponse("queue/stats", res);
    sleep(1);
  });
}

// ---------------------------------------------------------------------------
// Main test — mixed workload simulating real user behavior
// ---------------------------------------------------------------------------
export default function () {
  // Simulate different user profiles
  const profile = __VU % 5;

  switch (profile) {
    case 0: // Dashboard user
      scenarioAuth();
      scenarioDashboard();
      scenarioNotifications();
      break;
    case 1: // Operator
      scenarioWorkflow();
      scenarioApprovals();
      break;
    case 2: // Treasury user
      scenarioTreasury();
      scenarioAnalytics();
      break;
    case 3: // Admin
      scenarioDashboard();
      scenarioApprovals();
      scenarioAnalytics();
      scenarioConnector();
      break;
    case 4: // Read-only user
      scenarioDashboard();
      scenarioNotifications();
      scenarioConnector();
      scenarioBackgroundJobs();
      break;
  }
}

// ---------------------------------------------------------------------------
// Stress test — burst all endpoints simultaneously
// ---------------------------------------------------------------------------
export function stress() {
  const requests = [
    ["GET", `${BASE_URL}/api/v1/risk/summary`],
    ["GET", `${BASE_URL}/api/v1/connectors/health`],
    ["GET", `${BASE_URL}/api/v1/fx/rates`],
    ["GET", `${BASE_URL}/api/v1/notifications?limit=10`],
    ["GET", `${BASE_URL}/api/v1/enterprise/health`],
    ["GET", `${BASE_URL}/api/v1/treasury/accounts`],
    ["GET", `${BASE_URL}/api/v1/policies`],
  ];

  const responses = http.batch(
    requests.map(([method, url]) => ({
      method,
      url,
      headers,
    })),
  );

  for (const res of responses) {
    failureRate.add(res.status !== 200);
  }
}

// ---------------------------------------------------------------------------
// Endurance test — sustained workload for extended periods
// ---------------------------------------------------------------------------
export function endurance() {
  // Simulate a realistic daily usage pattern
  for (let hour = 0; hour < 24; hour++) {
    const intensity = hour >= 9 && hour <= 17 ? 1.0 : 0.2;

    // During business hours, do more work
    const iterations = intensity > 0.5 ? 5 : 2;
    for (let i = 0; i < iterations; i++) {
      scenarioDashboard();
      sleep(2 * intensity);
    }

    if (intensity > 0.5) {
      scenarioWorkflow();
      scenarioApprovals();
      scenarioTreasury();
      sleep(3);
    }

    scenarioNotifications();
    scenarioBackgroundJobs();
    sleep(5);
  }
}
