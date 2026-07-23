import type { EndpointMetadata, ApiVersion, AuthStrategy } from "../types";
import { getAllEndpoints, getEndpointsByVersion, getEndpointCount, getTagsSummary } from "../endpoint-metadata";
import { getAllVersions } from "../api-version-manager";
import { getApiConfig } from "../api-configuration";

// ──────────────────────────────────────────────────────────
// OpenAPI 3.1 Generator
// ──────────────────────────────────────────────────────────

export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
    contact: {
      name: string;
      email: string;
      url: string;
    };
    license: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, Record<string, unknown>>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
  };
  tags: Array<{
    name: string;
    description: string;
  }>;
  externalDocs: {
    description: string;
    url: string;
  };
}

export function generateOpenApiSpec(version?: ApiVersion): OpenApiSpec {
  const endpoints = version ? getEndpointsByVersion(version) : getAllEndpoints();
  const allVersions = getAllVersions();
  const config = getApiConfig();
  const currentVer = allVersions.find((v) => v.status === "current");

  const spec: OpenApiSpec = {
    openapi: "3.1.0",
    info: {
      title: "Perionyx API",
      description: "Enterprise Financial Operating System API\n\nBuild, integrate, and automate financial workflows with Perionyx's REST API.",
      version: currentVer?.version ?? "v1",
      contact: {
        name: "Perionyx Developer Relations",
        email: "developers@perionyx.com",
        url: `${config.baseUrl}${config.developerPortalPath}`,
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: config.baseUrl,
        description: "Production API",
      },
      {
        url: config.baseUrl.replace(/\/\/[^/]+/, "//sandbox.perionyx.com"),
        description: "Sandbox API",
      },
    ],
    paths: {},
    components: {
      schemas: buildSharedSchemas(),
      securitySchemes: buildSecuritySchemes(),
    },
    tags: [],
    externalDocs: {
      description: "Perionyx Developer Portal",
      url: `${config.baseUrl}${config.developerPortalPath}`,
    },
  };

  const tagSet = new Set<string>();
  for (const ep of endpoints) {
    if (!spec.paths[ep.path]) spec.paths[ep.path] = {};
    spec.paths[ep.path][ep.method.toLowerCase()] = buildOperation(ep);
    for (const tag of ep.tags) tagSet.add(tag);
  }

  spec.tags = [...tagSet].map((tag) => ({
    name: tag,
    description: `${tag} operations`,
  }));

  return spec;
}

function buildOperation(ep: EndpointMetadata): Record<string, unknown> {
  const op: Record<string, unknown> = {
    operationId: ep.operationId,
    summary: ep.summary,
    description: ep.description ?? ep.summary,
    tags: ep.tags,
    parameters: buildParameters(ep),
    responses: buildResponses(ep),
    deprecated: ep.deprecated || undefined,
  };

  if (ep.deprecationMessage) {
    op["x-deprecation-message"] = ep.deprecationMessage;
  }

  if (ep.requestBody) {
    op.requestBody = {
      required: true,
      content: {
        [ep.requestBody.contentType]: {
          schema: ep.requestBody.schema,
          example: ep.requestBody.example,
        },
      },
    };
  }

  if (ep.auth.length > 0 && ep.auth[0] !== "none") {
    op.security = ep.auth.map((a) => ({
      [mapAuthToSecurityScheme(a)]: ep.requiredScopes,
    }));
  }

  if (ep.rateLimitTier) {
    op["x-rate-limit-tier"] = ep.rateLimitTier;
  }

  if (ep.tenantAware) {
    op["x-tenant-aware"] = true;
  }

  if (ep.auditLogged) {
    op["x-audit-logged"] = true;
  }

  return op;
}

function buildParameters(ep: EndpointMetadata): Array<Record<string, unknown>> {
  const params: Array<Record<string, unknown>> = [];

  for (const p of ep.parameters) {
    const param: Record<string, unknown> = {
      name: p.name,
      in: p.in,
      required: p.required,
      description: p.description,
      schema: p.schema ?? { type: mapTypeToOpenApi(p.type) },
    };
    if (p.example) param.example = p.example;
    if (p.deprecated) param.deprecated = true;
    params.push(param);
  }

  return params;
}

function buildResponses(ep: EndpointMetadata): Record<string, unknown> {
  const responses: Record<string, unknown> = {};

  for (const r of ep.responses) {
    const key = String(r.status);
    const response: Record<string, unknown> = {
      description: r.description,
    };

    if (r.schema) {
      response.content = {
        [r.contentType ?? "application/json"]: {
          schema: r.schema,
          example: r.example,
        },
      };
    }

    responses[key] = response;
  }

  if (!responses["400"]) {
    responses["400"] = {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
        },
      },
    };
  }

  if (!responses["401"]) {
    responses["401"] = {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
        },
      },
    };
  }

  if (!responses["403"]) {
    responses["403"] = {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
        },
      },
    };
  }

  if (!responses["429"]) {
    responses["429"] = {
      description: "Rate Limit Exceeded",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" },
        },
      },
    };
  }

  return responses;
}

function buildSharedSchemas(): Record<string, unknown> {
  return {
    ApiError: {
      type: "object",
      required: ["code", "message"],
      properties: {
        code: { type: "string", description: "Error code" },
        message: { type: "string", description: "Human-readable error message" },
        details: { type: "object", description: "Additional error details" },
        requestId: { type: "string", description: "Request ID for debugging" },
        documentationUrl: { type: "string", description: "Link to error documentation" },
      },
    },
    Pagination: {
      type: "object",
      properties: {
        page: { type: "integer", description: "Current page number" },
        pageSize: { type: "integer", description: "Items per page" },
        total: { type: "integer", description: "Total items" },
        totalPages: { type: "integer", description: "Total pages" },
        hasNext: { type: "boolean" },
        hasPrev: { type: "boolean" },
        nextCursor: { type: "string" },
      },
    },
    PaginatedResponse: {
      type: "object",
      properties: {
        data: { type: "array", items: { type: "object" } },
        pagination: { $ref: "#/components/schemas/Pagination" },
      },
    },
  };
}

function buildSecuritySchemes(): Record<string, unknown> {
  return {
    ApiKeyAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "API key authentication. Prefix with 'va_'.",
    },
    BearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Bearer token authentication (Personal Access Token or JWT).",
    },
    OAuth2: {
      type: "oauth2",
      flows: {
        authorizationCode: {
          authorizationUrl: `${getApiConfig().baseUrl}/api/auth/authorize`,
          tokenUrl: `${getApiConfig().baseUrl}/api/auth/token`,
          scopes: buildScopeDescriptions(),
        },
        clientCredentials: {
          tokenUrl: `${getApiConfig().baseUrl}/api/auth/token`,
          scopes: buildScopeDescriptions(),
        },
      },
    },
  };
}

function buildScopeDescriptions(): Record<string, string> {
  return {
    "workflow:read": "Read workflow definitions and executions",
    "workflow:write": "Create and modify workflows",
    "treasury:read": "Read treasury positions and transactions",
    "treasury:write": "Create treasury transfers and manage positions",
    "approvals:read": "Read approval requests and history",
    "approvals:write": "Create and approve approval requests",
    "admin:read": "Read administrative settings",
    "admin:write": "Modify administrative settings",
    "webhook:read": "Read webhook subscriptions and deliveries",
    "webhook:write": "Create and manage webhook subscriptions",
    "api_keys:read": "Read API key configurations",
    "api_keys:write": "Create and manage API keys",
    "audit:read": "Read audit logs",
    "analytics:read": "Read analytics data",
    "connectors:read": "Read connector configurations",
    "connectors:write": "Create and manage connectors",
  };
}

function mapAuthToSecurityScheme(auth: AuthStrategy): string {
  switch (auth) {
    case "api-key":
    case "bearer-token":
      return "ApiKeyAuth";
    case "jwt":
    case "personal-access-token":
      return "BearerAuth";
    case "oauth2":
      return "OAuth2";
    default:
      return "ApiKeyAuth";
  }
}

function mapTypeToOpenApi(type: string): string {
  const mapping: Record<string, string> = {
    string: "string",
    number: "number",
    boolean: "boolean",
    integer: "integer",
    array: "array",
    object: "object",
    date: "string",
    "date-time": "string",
  };
  return mapping[type.toLowerCase()] ?? "string";
}

export function generateOpenApiJson(version?: ApiVersion): string {
  return JSON.stringify(generateOpenApiSpec(version), null, 2);
}

export function getOpenApiSpecMetadata(): {
  endpointCount: number;
  tagCount: number;
  schemaCount: number;
  version: string;
} {
  return {
    endpointCount: getEndpointCount(),
    tagCount: Object.keys(getTagsSummary()).length,
    schemaCount: Object.keys(buildSharedSchemas()).length,
    version: "3.1.0",
  };
}
