import { notFound } from "next/navigation";
import Link from "next/link";

const content: Record<string, { title: string; sections: Array<{ heading: string; body: string }> }> = {
  "getting-started": {
    title: "Getting Started",
    sections: [
      {
        heading: "Welcome to the Perionyx API",
        body: "The Perionyx API provides programmatic access to the Perionyx Financial Operating System. You can manage transactions, wallets, approvals, treasury operations, and more.",
      },
      {
        heading: "Base URL",
        body: "Production: `https://api.perionyx.com/api/v1`\\nSandbox: `https://sandbox.perionyx.com/api/v1`",
      },
      {
        heading: "Your First API Call",
        body: "```\\ncurl -H \"Authorization: va_your_api_key_here\" \\n  https://api.perionyx.com/api/v1/wallets\\n```\\n\\nAll API requests require authentication. See the Authentication guide for details.",
      },
      {
        heading: "Making Requests",
        body: "The Perionyx API is RESTful. All requests must be made over HTTPS. Requests and responses are JSON-encoded.",
      },
      {
        heading: "Pagination",
        body: "List endpoints support pagination with `page`, `pageSize`, and `cursor` parameters. Responses include a `pagination` object with `hasNext`, `total`, and `totalPages` fields.",
      },
    ],
  },
  authentication: {
    title: "Authentication",
    sections: [
      {
        heading: "API Key Authentication",
        body: "The simplest way to authenticate. Include your API key in the `Authorization` header: `Authorization: va_your_api_key`. API keys are prefixed with `va_`.",
      },
      {
        heading: "Bearer Token",
        body: "For Personal Access Tokens and JWT authentication, use the `Authorization: Bearer <token>` header.",
      },
      {
        heading: "OAuth2",
        body: "Perionyx supports OAuth2 authorization code and client credentials flows. Use OAuth2 for third-party applications that need delegated access.",
      },
      {
        heading: "Service Accounts",
        body: "Service accounts use client ID and client secret for machine-to-machine authentication. Use Basic auth with base64-encoded `client_id:client_secret`.",
      },
      {
        heading: "Scoped Tokens",
        body: "Scoped tokens provide time-limited, resource-specific access. Useful for one-time operations or limited-scope integrations.",
      },
      {
        heading: "Token Management",
        body: "Tokens can be created, revoked, and rotated through the Developer Portal or API. Expired tokens are automatically rejected.",
      },
    ],
  },
  "api-reference": {
    title: "API Reference",
    sections: [
      {
        heading: "Endpoints Overview",
        body: "The Perionyx API is organized around RESTful resources. The following categories are available: Treasury, Wallets, Transactions, Approvals, Webhooks, Connectors, Reconciliation, Analytics, Administration.",
      },
      {
        heading: "Standard Responses",
        body: "Successful responses return HTTP 200 (GET), 201 (POST), or 204 (DELETE). Error responses follow a standard format: `{ \"error\": { \"code\": \"ERROR_CODE\", \"message\": \"Human-readable message\" } }`.",
      },
      {
        heading: "Rate Limits",
        body: "Rate limits are enforced per API key. Free tier: 60 requests/minute. Basic: 300/min. Enterprise: 3000/min. Exceeded limits return HTTP 429.",
      },
      {
        heading: "Field Selection",
        body: "Use the `fields` query parameter to select specific fields: `GET /wallets?fields=id,name,balance`. Use `include` and `exclude` for more control.",
      },
      {
        heading: "Versioning",
        body: "The API is versioned via URL path (`/api/v1/`). The current version is v1. Deprecated versions will be announced 6 months before sunset.",
      },
    ],
  },
  openapi: {
    title: "OpenAPI Explorer",
    sections: [
      {
        heading: "OpenAPI Specification",
        body: "Perionyx provides a full OpenAPI 3.1 specification for all public endpoints. Download the spec at `/api/openapi.json`.",
      },
      {
        heading: "Interactive Explorer",
        body: "Use the OpenAPI specification with tools like Swagger UI, Postman, or Insomnia to explore and test endpoints interactively.",
      },
      {
        heading: "Schema Reference",
        body: "All request and response schemas are defined in the OpenAPI spec. Refer to `#/components/schemas/` for type definitions and examples.",
      },
    ],
  },
  sdks: {
    title: "SDKs",
    sections: [
      {
        heading: "Official SDKs",
        body: "Perionyx provides official SDKs for TypeScript, JavaScript, Python, Go, Java, and .NET. Each SDK provides a type-safe client with built-in retry, pagination, and error handling.",
      },
      {
        heading: "TypeScript SDK",
        body: "```\\nnpm install @perionyx/sdk\\n\\nimport { Perionyx } from '@perionyx/sdk';\\nconst client = new Perionyx({ apiKey: 'va_...' });\\nconst wallets = await client.wallets.list();\\n```",
      },
      {
        heading: "Python SDK",
        body: "```\\npip install perionyx-sdk\\n\\nfrom perionyx import Perionyx\\nclient = Perionyx(api_key='va_...')\\nwallets = client.wallets.list()\\n```",
      },
      {
        heading: "SDK Features",
        body: "All SDKs include: automatic retry with exponential backoff, pagination helpers, request signing, typed models, webhook signature verification, and comprehensive error handling.",
      },
    ],
  },
  webhooks: {
    title: "Webhooks",
    sections: [
      {
        heading: "Overview",
        body: "Webhooks allow your application to receive real-time notifications when events occur in Perionyx. Subscribe to specific event types and Perionyx will POST event payloads to your endpoint.",
      },
      {
        heading: "Event Types",
        body: "Available event types include: `transaction.created`, `transaction.updated`, `approval.requested`, `approval.completed`, `wallet.balance_changed`, `transfer.completed`, `reconciliation.completed`.",
      },
      {
        heading: "Signature Verification",
        body: "Every webhook payload includes a `x-webhook-signature` header. Verify signatures using your webhook secret to ensure payloads haven't been tampered with.",
      },
      {
        heading: "Retry Policy",
        body: "Failed webhook deliveries are retried up to 5 times with exponential backoff (1s, 2s, 4s, 8s, 16s). After exhausting retries, events are moved to the dead-letter queue for manual review.",
      },
      {
        heading: "Best Practices",
        body: "1. Respond with 200 OK quickly\\n2. Verify signatures before processing\\n3. Process webhooks asynchronously\\n4. Use idempotency keys for critical operations\\n5. Monitor delivery health via the Developer Portal",
      },
    ],
  },
  "rate-limits": {
    title: "Rate Limits",
    sections: [
      {
        heading: "Rate Limit Tiers",
        body: "| Tier | Requests/Minute | Suitable For |\\n|------|----------------|--------------|\\n| Free | 60 | Development & testing |\\n| Basic | 300 | Small-scale integrations |\\n| Enterprise | 3,000 | Production deployments |\\n| Internal | 10,000 | Perionyx internal services |",
      },
      {
        heading: "Rate Limit Headers",
        body: "Rate limit status is returned in response headers: `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`. When exceeded, HTTP 429 is returned with a `Retry-After` header.",
      },
      {
        heading: "Best Practices",
        body: "1. Implement exponential backoff on 429 responses\\n2. Cache responses when possible\\n3. Use bulk endpoints instead of individual requests\\n4. Monitor rate limit headers to stay within limits",
      },
    ],
  },
  examples: {
    title: "Examples",
    sections: [
      {
        heading: "List Wallets",
        body: "```\\nGET /api/v1/wallets\\nAuthorization: va_your_api_key\\n\\nResponse 200: {\\n  \"data\": [\\n    { \"id\": \"wal_123\", \"name\": \"Operating\", \"balance\": 150000, \"currency\": \"USD\" }\\n  ],\\n  \"pagination\": { \"page\": 1, \"pageSize\": 25, \"total\": 1, \"totalPages\": 1, \"hasNext\": false }\\n}\\n```",
      },
      {
        heading: "Create Transfer",
        body: "```\\nPOST /api/v1/treasury/transfers\\nAuthorization: va_your_api_key\\nContent-Type: application/json\\n\\n{\\n  \"sourceWalletId\": \"wal_123\",\\n  \"destinationWalletId\": \"wal_456\",\\n  \"amount\": 5000,\\n  \"currency\": \"USD\",\\n  \"description\": \"Monthly settlement\"\\n}\\n\\nResponse 201: { \"id\": \"trf_789\", \"status\": \"pending\" }\\n```",
      },
      {
        heading: "Webhook Endpoint Handler",
        body: "```\\n// Verify signature and process webhook\\nfunction handleWebhook(req, res) {\\n  const signature = req.headers['x-webhook-signature'];\\n  const payload = JSON.stringify(req.body);\\n  if (!verifySignature(payload, signature, process.env.WH_SECRET)) {\\n    return res.status(401).end();\\n  }\\n  // Process event\\n  res.status(200).end();\\n}\\n```",
      },
    ],
  },
  changelog: {
    title: "Changelog",
    sections: [
      {
        heading: "v1.0.0 — July 2026",
        body: "Initial release of the Perionyx API. Includes: Treasury operations, wallet management, transaction processing, approval workflows, webhook subscriptions, API key management, connector configuration, reconciliation management.",
      },
    ],
  },
  status: {
    title: "API Status",
    sections: [
      {
        heading: "Current Status",
        body: "✅ All systems operational\\n\\nThe Perionyx API is fully operational across all endpoints and regions.",
      },
      {
        heading: "Service Level Objectives",
        body: "| Metric | Target |\\n|--------|--------|\\n| Uptime | 99.9% |\\n| Latency (p50) | <100ms |\\n| Latency (p99) | <500ms |\\n| Error Rate | <0.1% |",
      },
      {
        heading: "Incident History",
        body: "No incidents reported since launch.",
      },
    ],
  },
};

export default async function DeveloperSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugStr = slug?.[0] ?? "overview";

  const page = content[slugStr];
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/developer" className="text-sm text-muted-foreground hover:text-foreground">
        ← Developer Portal
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{page.title}</h1>
      <div className="mt-8 space-y-8">
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-semibold">{s.heading}</h2>
            <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return Object.keys(content).map((slug) => ({ slug: [slug] }));
}
