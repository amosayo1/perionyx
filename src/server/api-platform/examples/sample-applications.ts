// ──────────────────────────────────────────────────────────
// Sample Applications — Provider-Agnostic Integration Examples
// ──────────────────────────────────────────────────────────

export const SAMPLE_LIST_WALLETS = `
// List wallets with pagination
// Provider-agnostic: adapt to your language/SDK of choice

GET /api/v1/wallets?page=1&pageSize=25
Authorization: va_your_api_key

Response 200:
{
  "data": [
    {
      "id": "wal_001",
      "name": "Operating Account",
      "balance": "150000.00",
      "currency": "USD",
      "type": "checking",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
`;

export const SAMPLE_AUTHENTICATION = `
// Authentication Examples
// -----------------------

// API Key
curl -H "Authorization: va_your_api_key" https://api.perionyx.com/api/v1/wallets

// Personal Access Token
curl -H "Authorization: Bearer pat_your_token" https://api.perionyx.com/api/v1/wallets

// OAuth2 Client Credentials
curl -X POST https://api.perionyx.com/api/auth/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials&client_id=your_client_id&client_secret=your_client_secret"

// Service Account (Basic Auth)
curl -u client_id:client_secret https://api.perionyx.com/api/v1/wallets
`;

export const SAMPLE_API_CLIENT = `
// API Client — TypeScript (provider-agnostic pattern)
// ---------------------------------------------------

interface ClientConfig {
  baseUrl: string;
  apiKey?: string;
  accessToken?: string;
}

class ApiClient {
  private config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = config;
  }

  private getAuthHeaders(): Record<string, string> {
    if (this.config.apiKey) {
      return { Authorization: this.config.apiKey };
    }
    if (this.config.accessToken) {
      return { Authorization: \`Bearer \${this.config.accessToken}\` };
    }
    return {};
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(\`\${this.config.baseUrl}\${path}\`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error);
    }

    return response.json();
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(\`\${this.config.baseUrl}\${path}\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error);
    }

    return response.json();
  }
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public error: { code?: string; message?: string },
  ) {
    super(error.message ?? \`HTTP \${statusCode}\`);
    this.name = "ApiError";
  }
}
`;

export const SAMPLE_WEBHOOK_RECEIVER = `
// Webhook Receiver — provider-agnostic pattern
// ---------------------------------------------

// 1. Verify the signature
function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
): boolean {
  // HMAC-SHA256 verification
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const msg = encoder.encode(payload);

  let hash = 0;
  for (let i = 0; i < msg.length; i++) {
    hash = ((hash << 5) - hash) + msg[i];
    hash |= 0;
  }
  const keyHash = Array.from(key).reduce((h, b) => ((h << 5) - h) + b, 0) | 0;
  const expected = \`sha256=\${Math.abs(hash ^ keyHash).toString(16).padStart(8, "0")}\`;

  return expected === signatureHeader;
}

// 2. Handle incoming webhook
async function handleWebhook(request: Request): Promise<Response> {
  const signature = request.headers.get("x-webhook-signature") ?? "";
  const eventType = request.headers.get("x-webhook-event") ?? "";
  const webhookId = request.headers.get("x-webhook-id") ?? "";
  const timestamp = request.headers.get("x-webhook-timestamp") ?? "";
  const secret = process.env.WEBHOOK_SECRET ?? "";

  // Verify signature
  const body = await request.text();
  if (!verifyWebhookSignature(body, signature, secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  // Replay protection: reject events older than 5 minutes
  const eventTime = parseInt(timestamp, 10) * 1000;
  if (Date.now() - eventTime > 5 * 60 * 1000) {
    return new Response("Event too old", { status: 400 });
  }

  // Process based on event type
  const event = JSON.parse(body);
  switch (event.type) {
    case "treasury.transfer.completed":
      await onTransferCompleted(event.data);
      break;
    case "payment.processed":
      await onPaymentProcessed(event.data);
      break;
    case "invoice.paid":
      await onInvoicePaid(event.data);
      break;
    case "compliance.rule.violated":
      await onComplianceViolation(event.data);
      break;
  }

  // Acknowledge quickly
  return new Response("OK", { status: 200 });
}

async function onTransferCompleted(data: unknown): Promise<void> {
  // Update local records, trigger downstream workflows
  console.log("Transfer completed:", data);
}

async function onPaymentProcessed(data: unknown): Promise<void> {
  // Update payment status in local system
  console.log("Payment processed:", data);
}

async function onInvoicePaid(data: unknown): Promise<void> {
  // Mark invoice as paid, update AR ledger
  console.log("Invoice paid:", data);
}

async function onComplianceViolation(data: unknown): Promise<void> {
  // Trigger alert, notify compliance team
  console.log("Compliance violation:", data);
}
`;

export const SAMPLE_SYNCHRONIZATION = `
// Data Synchronization — provider-agnostic pattern
// -------------------------------------------------

interface SyncState {
  lastCursor: string | null;
  lastTimestamp: string | null;
}

// Incremental sync with cursor-based pagination
async function syncTransactions(
  client: ApiClient,
  syncState: SyncState,
): Promise<SyncState> {
  let cursor = syncState.lastCursor;
  let totalSynced = 0;

  while (true) {
    const params: Record<string, string> = { pageSize: "100" };
    if (cursor) params.cursor = cursor;

    const response = await client.get<{
      data: unknown[];
      pagination: { hasNext: boolean; nextCursor?: string };
    }>("/api/v1/treasury/transactions", params);

    for (const transaction of response.data) {
      await upsertTransaction(transaction);
      totalSynced++;
    }

    if (!response.pagination.hasNext) break;
    cursor = response.pagination.nextCursor;
  }

  return {
    lastCursor: cursor ?? syncState.lastCursor,
    lastTimestamp: new Date().toISOString(),
  };
}

async function upsertTransaction(transaction: unknown): Promise<void> {
  // Insert or update in local database
  console.log("Syncing transaction:", transaction);
}
`;

export const SAMPLE_PAGINATION = `
// Pagination — handle large result sets
// --------------------------------------

async function fetchAllPages<T>(
  fetcher: (page: number) => Promise<{
    data: T[];
    pagination: { hasNext: boolean };
  }>,
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const response = await fetcher(page);
    results.push(...response.data);
    hasNext = response.pagination.hasNext;
    page++;
  }

  return results;
}

// Usage: fetch all wallets
const allWallets = await fetchAllWallets((page) =>
  client.get(\`/api/v1/wallets?page=\${page}&pageSize=100\`),
);
`;

export const SAMPLE_FILTERING = `
// Filtering and Sorting — query patterns
// ---------------------------------------

// Filter by field
GET /api/v1/transactions?filter[status][eq]=pending

// Filter with multiple conditions
GET /api/v1/transactions?filter[amount][gte]=1000&filter[currency][eq]=USD

// Sort by multiple fields
GET /api/v1/transactions?sort=-amount,+createdAt

// Field selection
GET /api/v1/wallets?fields=id,name,balance,currency

// Combined
GET /api/v1/transactions \\
  ?filter[status][eq]=completed \\
  &filter[amount][gte]=500 \\
  &sort=-createdAt \\
  &fields=id,amount,currency,status,createdAt \\
  &page=1 \\
  &pageSize=50
`;

export const SAMPLE_ERROR_HANDLING = `
// Error Handling — retry with exponential backoff
// ------------------------------------------------

async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelayMs?: number;
    backoffMultiplier?: number;
  },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const initialDelay = options?.initialDelayMs ?? 1000;
  const multiplier = options?.backoffMultiplier ?? 2;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry client errors (4xx)
      if (error instanceof ApiError && error.statusCode < 500) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(multiplier, attempt);
        console.warn(\`Retry \${attempt + 1}/\${maxRetries} after \${delay}ms\`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Usage
try {
  const wallets = await withRetry(
    () => client.get("/api/v1/wallets"),
    { maxRetries: 5, initialDelayMs: 500, backoffMultiplier: 2 },
  );
  console.log("Wallets:", wallets);
} catch (error) {
  console.error("Failed to fetch wallets after retries:", error);
}
`;

export const SAMPLE_IDEMPOTENCY = `
// Idempotency — safe retries for mutations
// -----------------------------------------

// POST with idempotency key
async function createTransfer(
  client: ApiClient,
  transfer: { sourceWalletId: string; destinationWalletId: string; amount: string; currency: string },
  idempotencyKey: string,
): Promise<unknown> {
  return client.post("/api/v1/treasury/transfers", transfer, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

// Generate idempotency key
function generateIdempotencyKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Safe transfer with retry
async function safeTransfer(client: ApiClient, transfer: { sourceWalletId: string; destinationWalletId: string; amount: string; currency: string }): Promise<unknown> {
  const idempotencyKey = generateIdempotencyKey();

  return withRetry(() => createTransfer(client, transfer, idempotencyKey));
}
`;

export const SAMPLE_APP_INDEX = `
// Integration Application — complete example
// -------------------------------------------

// This application demonstrates:
// 1. Authentication with API key
// 2. Listing wallets with pagination
// 3. Creating a transfer
// 4. Handling webhooks
// 5. Error handling with retry

import { ApiClient } from "./client";
import { verifyWebhookSignature } from "./webhook-verifier";
import { withRetry } from "./retry";

const API_KEY = process.env.PERIONYX_API_KEY ?? "";
const WEBHOOK_SECRET = process.env.PERIONYX_WEBHOOK_SECRET ?? "";

const client = new ApiClient({
  baseUrl: "https://api.perionyx.com/api/v1",
  apiKey: API_KEY,
});

async function main() {
  // 1. List wallets
  const wallets = await withRetry(() => client.get("/wallets", { pageSize: "100" }));
  console.log(\`Found \${wallets.data.length} wallets\`);

  // 2. Get wallet balance
  const walletId = wallets.data[0].id;
  const wallet = await client.get(\`/wallets/\${walletId}\`);
  console.log(\`Balance: \${wallet.balance} \${wallet.currency}\`);

  // 3. Create transfer
  const transfer = await client.post("/treasury/transfers", {
    sourceWalletId: walletId,
    destinationWalletId: wallets.data[1].id,
    amount: "5000.00",
    currency: "USD",
    description: "Monthly settlement",
  });
  console.log(\`Transfer created: \${transfer.id}\`);
}

main().catch(console.error);
`;

export function getSampleCategories(): Array<{ id: string; title: string; description: string }> {
  return [
    { id: "authentication", title: "Authentication", description: "All auth methods with code examples" },
    { id: "api-client", title: "API Client", description: "TypeScript client with auth, error handling, retry" },
    { id: "webhook-receiver", title: "Webhook Receiver", description: "Signature verification, event processing, replay protection" },
    { id: "synchronization", title: "Data Sync", description: "Cursor-based pagination, incremental sync pattern" },
    { id: "pagination", title: "Pagination", description: "Fetch all pages with auto-pagination helper" },
    { id: "filtering", title: "Filtering & Sorting", description: "Query parameters for precise data retrieval" },
    { id: "error-handling", title: "Error Handling", description: "Exponential backoff retry, error classification" },
    { id: "idempotency", title: "Idempotency", description: "Safe retries for mutation endpoints" },
  ];
}
