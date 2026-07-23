import type { SdkClientConfig, SdkEndpoint, HttpMethod } from "../types";

// ──────────────────────────────────────────────────────────
// SDK Architecture Definition
// ──────────────────────────────────────────────────────────

export interface SdkPackage {
  name: string;
  language: string;
  version: string;
  description: string;
  homepage: string;
  repository: string;
  installCommand: string;
  importStatement: string;
  dependencies: string[];
  endpoints: SdkEndpoint[];
  features: string[];
}

export const SDK_LANGUAGES = [
  {
    name: "TypeScript",
    language: "typescript",
    version: "1.0.0",
    description: "Official Perionyx TypeScript SDK",
    homepage: "https://docs.perionyx.com/sdks/typescript",
    repository: "https://github.com/perionyx/sdk-typescript",
    installCommand: "npm install @perionyx/sdk",
    importStatement: 'import { Perionyx } from "@perionyx/sdk";',
    dependencies: ["typescript >= 5.0", "node-fetch or built-in fetch"],
    endpoints: [],
    features: ["Full TypeScript support", "Promise-based API", "Automatic retry", "Request signing"],
  },
  {
    name: "JavaScript",
    language: "javascript",
    version: "1.0.0",
    description: "Official Perionyx JavaScript SDK",
    homepage: "https://docs.perionyx.com/sdks/javascript",
    repository: "https://github.com/perionyx/sdk-javascript",
    installCommand: "npm install @perionyx/sdk-js",
    importStatement: 'const { Perionyx } = require("@perionyx/sdk-js");',
    dependencies: ["axios or fetch"],
    endpoints: [],
    features: ["Node.js and browser support", "Callback and Promise patterns", "Automatic pagination"],
  },
  {
    name: "Python",
    language: "python",
    version: "1.0.0",
    description: "Official Perionyx Python SDK",
    homepage: "https://docs.perionyx.com/sdks/python",
    repository: "https://github.com/perionyx/sdk-python",
    installCommand: "pip install perionyx-sdk",
    importStatement: "from perionyx import Perionyx",
    dependencies: ["requests >= 2.25", "pydantic >= 2.0"],
    endpoints: [],
    features: ["Type hints", "Async support", "Context manager pattern"],
  },
  {
    name: "Go",
    language: "go",
    version: "1.0.0",
    description: "Official Perionyx Go SDK",
    homepage: "https://docs.perionyx.com/sdks/go",
    repository: "https://github.com/perionyx/sdk-go",
    installCommand: "go get github.com/perionyx/sdk-go",
    importStatement: 'import "github.com/perionyx/sdk-go"',
    dependencies: [],
    endpoints: [],
    features: ["Strongly typed", "Context support", "Concurrent request handling"],
  },
  {
    name: "Java",
    language: "java",
    version: "1.0.0",
    description: "Official Perionyx Java SDK",
    homepage: "https://docs.perionyx.com/sdks/java",
    repository: "https://github.com/perionyx/sdk-java",
    installCommand: `implementation 'com.perionyx:perionyx-sdk:1.0.0'`,
    importStatement: "import com.perionyx.PerionyxClient;",
    dependencies: ["OkHttp or Apache HttpClient"],
    endpoints: [],
    features: ["Maven/Gradle support", "Thread-safe", "Builder pattern"],
  },
  {
    name: ".NET",
    language: "csharp",
    version: "1.0.0",
    description: "Official Perionyx .NET SDK",
    homepage: "https://docs.perionyx.com/sdks/dotnet",
    repository: "https://github.com/perionyx/sdk-dotnet",
    installCommand: "dotnet add package Perionyx.Sdk",
    importStatement: "using Perionyx.Sdk;",
    dependencies: ["System.Text.Json", "System.Net.Http"],
    endpoints: [],
    features: [".NET 8+ support", "Async/await pattern", "Dependency injection ready"],
  },
];

// ──────────────────────────────────────────────────────────
// Base Client Architecture (TypeScript reference)
// ──────────────────────────────────────────────────────────

export const BASE_CLIENT_TYPESCRIPT = `
// Reference Architecture — TypeScript SDK Base Client
// This is NOT a runnable SDK. It defines the architecture

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ClientConfig {
  baseUrl: string;
  apiKey?: string;
  accessToken?: string;
  timeout?: number;
  retry?: {
    maxRetries: number;
    initialDelayMs: number;
    backoffMultiplier: number;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

class PerionyxClient {
  private config: Required<ClientConfig>;

  constructor(config: ClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey ?? '',
      accessToken: config.accessToken ?? '',
      timeout: config.timeout ?? 30000,
      retry: config.retry ?? { maxRetries: 3, initialDelayMs: 1000, backoffMultiplier: 2 },
    };
  }

  private getAuthHeaders(): Record<string, string> {
    if (this.config.apiKey) return { 'Authorization': this.config.apiKey };
    if (this.config.accessToken) return { 'Authorization': \`Bearer \${this.config.accessToken}\` };
    return {};
  }

  async request<T>(method: HttpMethod, path: string, options?: {
    body?: unknown;
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }): Promise<T> {
    const url = new URL(\`\${this.config.baseUrl}\${path}\`);
    if (options?.params) {
      Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options?.headers,
    };

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.config.retry.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url.toString(), {
          method,
          headers,
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          const error: ApiError = await response.json().catch(() => ({
            code: 'UNKNOWN',
            message: response.statusText,
          }));
          throw error;
        }

        return response.json();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.retry.maxRetries) {
          await new Promise(r => setTimeout(r,
            this.config.retry.initialDelayMs * Math.pow(this.config.retry.backoffMultiplier, attempt)
          ));
        }
      }
    }
    throw lastError;
  }

  get<T>(path: string, params?: Record<string, string>) {
    return this.request<T>('GET', path, { params });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, { body });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, { body });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>('PATCH', path, { body });
  }

  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }

  // Pagination helper
  async paginate<T>(
    fetcher: (page: number) => Promise<PaginatedResponse<T>>,
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
}
`;

// ──────────────────────────────────────────────────────────
// Webhook Helper Architecture
// ──────────────────────────────────────────────────────────

export const WEBHOOK_HELPER_TYPESCRIPT = `
// Webhook Verification Helper
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const msg = encoder.encode(payload);

  let hash = 0;
  for (let i = 0; i < msg.length; i++) {
    hash = ((hash << 5) - hash) + msg[i];
    hash |= 0;
  }
  const keyHash = Array.from(key).reduce((h, b) => ((h << 5) - h) + b, 0) | 0;
  const expected = \`sha256=\${Math.abs(hash ^ keyHash).toString(16).padStart(8, '0')}\`;

  return expected === signature;
}

// Webhook Event Types
interface WebhookEvent {
  id: string;
  type: string;
  version: string;
  tenantId: string;
  source: string;
  subject?: string;
  data: unknown;
  timestamp: string;
  correlationId: string;
}
`;

// ──────────────────────────────────────────────────────────
// Typed Models (shared across all SDKs)
// ──────────────────────────────────────────────────────────

export interface SdkModel {
  name: string;
  description: string;
  properties: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example?: unknown;
  }>;
}

export const SDK_MODELS: SdkModel[] = [
  {
    name: "Transaction",
    description: "A financial transaction",
    properties: [
      { name: "id", type: "string", required: true, description: "Unique identifier" },
      { name: "amount", type: "number", required: true, description: "Transaction amount" },
      { name: "currency", type: "string", required: true, description: "ISO 4217 currency code", example: "USD" },
      { name: "type", type: "string", required: true, description: "Transaction type (credit/debit/transfer)" },
      { name: "status", type: "string", required: true, description: "Transaction status" },
      { name: "description", type: "string", required: false, description: "Transaction description" },
      { name: "createdAt", type: "string", required: true, description: "ISO 8601 timestamp" },
    ],
  },
  {
    name: "Wallet",
    description: "A financial wallet or account",
    properties: [
      { name: "id", type: "string", required: true, description: "Unique identifier" },
      { name: "name", type: "string", required: true, description: "Wallet name" },
      { name: "balance", type: "number", required: true, description: "Current balance" },
      { name: "currency", type: "string", required: true, description: "ISO 4217 currency code" },
      { name: "type", type: "string", required: true, description: "Wallet type" },
      { name: "status", type: "string", required: true, description: "Wallet status" },
    ],
  },
  {
    name: "Approval",
    description: "An approval request",
    properties: [
      { name: "id", type: "string", required: true, description: "Unique identifier" },
      { name: "resourceType", type: "string", required: true, description: "Type of resource requiring approval" },
      { name: "resourceId", type: "string", required: true, description: "ID of the resource" },
      { name: "status", type: "string", required: true, description: "Approval status" },
      { name: "requestedBy", type: "string", required: true, description: "User ID who requested" },
      { name: "approvedBy", type: "string", required: false, description: "User ID who approved" },
      { name: "createdAt", type: "string", required: true, description: "ISO 8601 timestamp" },
    ],
  },
  {
    name: "WebhookSubscription",
    description: "A webhook subscription configuration",
    properties: [
      { name: "id", type: "string", required: true, description: "Unique identifier" },
      { name: "name", type: "string", required: true, description: "Subscription name" },
      { name: "url", type: "string", required: true, description: "Webhook endpoint URL" },
      { name: "events", type: "string[]", required: true, description: "List of event types to receive" },
      { name: "status", type: "string", required: true, description: "Subscription status" },
      { name: "createdAt", type: "string", required: true, description: "ISO 8601 timestamp" },
    ],
  },
  {
    name: "ApiKey",
    description: "An API key for programmatic access",
    properties: [
      { name: "id", type: "string", required: true, description: "Unique identifier" },
      { name: "name", type: "string", required: true, description: "Human-readable name" },
      { name: "keyPrefix", type: "string", required: true, description: "First few characters of the key" },
      { name: "scopes", type: "string[]", required: true, description: "Permission scopes" },
      { name: "expiresAt", type: "string", required: false, description: "Expiration timestamp" },
      { name: "status", type: "string", required: true, description: "Key status" },
    ],
  },
];

export function getSdkPackage(language: string): SdkPackage | undefined {
  return SDK_LANGUAGES.find((pkg) => pkg.language === language);
}

export function getSdkEndpoints(allEndpoints: SdkEndpoint[]): SdkEndpoint[] {
  return allEndpoints;
}
