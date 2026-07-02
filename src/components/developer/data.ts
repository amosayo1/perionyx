import type {
  DeveloperKpi,
  ApiEndpoint,
  Sdk,
  AuthMethod,
  WebhookCategory,
  DeveloperResource,
} from "./types";

export const developerKpis: DeveloperKpi[] = [
  {
    id: "api-requests",
    title: "API Requests Today",
    value: "12,847",
    trend: "up",
    trendLabel: "+14.7% vs yesterday",
    status: "healthy",
    insight: "API consumption growing steadily. Rate limit headroom at 72%.",
    sparklineData: [8200, 9100, 8800, 10200, 11400, 11200, 12847],
  },
  {
    id: "webhook-deliveries",
    title: "Webhook Deliveries",
    value: "3,421",
    trend: "up",
    trendLabel: "+8.2% vs yesterday",
    status: "healthy",
    insight: "Webhook delivery success rate at 98.7%. 44 deliveries currently retrying.",
    sparklineData: [2400, 2600, 2900, 3100, 3200, 3300, 3421],
  },
  {
    id: "sdk-downloads",
    title: "SDK Downloads",
    value: "2,847",
    trend: "up",
    trendLabel: "+22.4% this week",
    status: "healthy",
    insight: "Node.js SDK most popular (1,420 downloads). Python SDK growth accelerating.",
    sparklineData: [1200, 1400, 1600, 1800, 2100, 2400, 2847],
  },
  {
    id: "active-keys",
    title: "Active API Keys",
    value: "48",
    trend: "up",
    trendLabel: "+3 this week",
    status: "info",
    insight: "48 active keys across 32 organizations. 6 keys expiring within 30 days.",
    sparklineData: [36, 38, 40, 42, 44, 46, 48],
  },
  {
    id: "sandbox-projects",
    title: "Sandbox Projects",
    value: "124",
    trend: "up",
    trendLabel: "+18 this month",
    status: "healthy",
    insight: "Sandbox adoption up 32% quarter-over-quarter. Average project age 14 days.",
    sparklineData: [80, 88, 95, 102, 110, 118, 124],
  },
  {
    id: "api-latency",
    title: "Average API Latency",
    value: "42ms",
    trend: "down",
    trendLabel: "-3ms improvement",
    status: "healthy",
    insight: "P95 latency at 98ms. All endpoints responding within 200ms SLA.",
    sparklineData: [52, 48, 47, 45, 44, 43, 42],
  },
];

export const apiEndpoints: ApiEndpoint[] = [
  { id: "api-payments", name: "Payments API", version: "v1.2", status: "stable", auth: "API Key", baseUrl: "https://api.perionyx.io/v1/payments", latency: "45ms", description: "Create, retrieve, and manage payments. Supports wires, ACH, and book transfers." },
  { id: "api-treasury", name: "Treasury API", version: "v1.0", status: "stable", auth: "API Key", baseUrl: "https://api.perionyx.io/v1/treasury", latency: "52ms", description: "Manage accounts, balances, and liquidity across connected banks." },
  { id: "api-ledger", name: "Ledger API", version: "v1.1", status: "stable", auth: "API Key", baseUrl: "https://api.perionyx.io/v1/ledger", latency: "38ms", description: "Post journal entries, query transaction history, and reconcile accounts." },
  { id: "api-approval", name: "Approval API", version: "v1.0", status: "stable", auth: "API Key + OAuth", baseUrl: "https://api.perionyx.io/v1/approvals", latency: "55ms", description: "Manage approval workflows, policies, and escalation rules." },
  { id: "api-policy", name: "Policy API", version: "v0.9", status: "beta", auth: "API Key + OAuth", baseUrl: "https://api.perionyx.io/v1/policies", latency: "42ms", description: "Define and manage approval policies, rules, and conditions." },
  { id: "api-audit", name: "Audit API", version: "v1.0", status: "stable", auth: "API Key", baseUrl: "https://api.perionyx.io/v1/audit", latency: "35ms", description: "Query the immutable audit trail for compliance and investigation." },
  { id: "api-risk", name: "Risk API", version: "v0.8", status: "beta", auth: "API Key + OAuth", baseUrl: "https://api.perionyx.io/v1/risk", latency: "48ms", description: "Evaluate transaction risk, manage alerts, and configure risk rules." },
  { id: "api-reporting", name: "Reporting API", version: "v1.0", status: "stable", auth: "API Key", baseUrl: "https://api.perionyx.io/v1/reporting", latency: "120ms", description: "Generate financial reports, export data, and schedule report delivery." },
];

export const sdks: Sdk[] = [
  { id: "sdk-node", language: "Node.js", latestVersion: "v2.4.1", releaseDate: "2024-12-15", packageManager: "npm install @perionyx/sdk" },
  { id: "sdk-python", language: "Python", latestVersion: "v2.3.0", releaseDate: "2024-11-28", packageManager: "pip install perionyx-sdk" },
  { id: "sdk-java", language: "Java", latestVersion: "v2.2.0", releaseDate: "2024-11-10", packageManager: "Maven: com.perionyx:sdk:2.2.0" },
  { id: "sdk-go", language: "Go", latestVersion: "v1.8.0", releaseDate: "2024-10-22", packageManager: "go get github.com/perionyx/sdk" },
  { id: "sdk-dotnet", language: ".NET", latestVersion: "v2.1.0", releaseDate: "2024-10-05", packageManager: "dotnet add package Perionyx.Sdk" },
  { id: "sdk-php", language: "PHP", latestVersion: "v2.0.0", releaseDate: "2024-09-15", packageManager: "composer require perionyx/sdk" },
  { id: "sdk-ruby", language: "Ruby", latestVersion: "v1.9.0", releaseDate: "2024-08-30", packageManager: "gem install perionyx-sdk" },
];

export const authMethods: AuthMethod[] = [
  { id: "auth-api-key", name: "API Keys", description: "Simple key-based authentication for server-to-server integration", recommendedUsage: "Server-side applications, CI/CD pipelines", status: "recommended" },
  { id: "auth-oauth", name: "OAuth 2.0", description: "Secure delegated access with scoped permissions and refresh tokens", recommendedUsage: "Web applications, mobile apps, third-party integrations", status: "recommended" },
  { id: "auth-service", name: "Service Accounts", description: "Machine-to-machine authentication with long-lived credentials", recommendedUsage: "Automated services, background jobs, scheduled tasks", status: "recommended" },
  { id: "auth-pat", name: "Personal Access Tokens", description: "User-scoped tokens for API access with granular permissions", recommendedUsage: "Developer tooling, CLI access, script automation", status: "available" },
  { id: "auth-webhook-signing", name: "Webhook Signing", description: "HMAC-SHA256 signature verification for webhook payloads", recommendedUsage: "Webhook endpoint verification", status: "recommended" },
  { id: "auth-jwt", name: "JWT", description: "JSON Web Tokens for stateless authentication between services", recommendedUsage: "Internal service-to-service communication", status: "available" },
  { id: "auth-mtls", name: "Mutual TLS", description: "Certificate-based mutual authentication for high-security integrations", recommendedUsage: "Financial institution integrations, regulated environments", status: "available" },
];

export const webhookCategories: WebhookCategory[] = [
  { id: "wh-payments", name: "Payments", eventCount: 24, deliveryStatus: "healthy", retryRate: "1.2%", lastDelivery: "30s ago" },
  { id: "wh-approvals", name: "Approvals", eventCount: 18, deliveryStatus: "healthy", retryRate: "0.8%", lastDelivery: "15s ago" },
  { id: "wh-treasury", name: "Treasury", eventCount: 12, deliveryStatus: "healthy", retryRate: "2.1%", lastDelivery: "1m ago" },
  { id: "wh-ledger", name: "Ledger", eventCount: 8, deliveryStatus: "healthy", retryRate: "0.5%", lastDelivery: "45s ago" },
  { id: "wh-audit", name: "Audit", eventCount: 6, deliveryStatus: "healthy", retryRate: "0.1%", lastDelivery: "2m ago" },
  { id: "wh-risk", name: "Risk", eventCount: 10, deliveryStatus: "warning", retryRate: "3.4%", lastDelivery: "5m ago" },
  { id: "wh-incidents", name: "Incidents", eventCount: 4, deliveryStatus: "healthy", retryRate: "0.0%", lastDelivery: "10m ago" },
  { id: "wh-platform", name: "Platform", eventCount: 7, deliveryStatus: "healthy", retryRate: "0.3%", lastDelivery: "3m ago" },
];

export const developerResources: DeveloperResource[] = [
  { id: "res-quickstart", title: "Quick Start", description: "Get up and running in 5 minutes", icon: "zap", href: "https://docs.perionyx.io/quickstart" },
  { id: "res-auth", title: "Authentication Guide", description: "Learn about API authentication", icon: "key", href: "https://docs.perionyx.io/auth" },
  { id: "res-api-ref", title: "API Reference", description: "Complete API documentation", icon: "book-open", href: "https://docs.perionyx.io/api" },
  { id: "res-webhooks", title: "Webhook Guide", description: "Receive real-time event notifications", icon: "zap", href: "https://docs.perionyx.io/webhooks" },
  { id: "res-sdk", title: "SDK Downloads", description: "Client libraries for 7 languages", icon: "download", href: "https://docs.perionyx.io/sdk" },
  { id: "res-releasenotes", title: "Release Notes", description: "What's new in the latest releases", icon: "file-text", href: "https://docs.perionyx.io/releases" },
  { id: "res-changelog", title: "Changelog", description: "Complete version history", icon: "clock", href: "https://docs.perionyx.io/changelog" },
  { id: "res-bestpractices", title: "Best Practices", description: "Recommended integration patterns", icon: "shield", href: "https://docs.perionyx.io/best-practices" },
];
