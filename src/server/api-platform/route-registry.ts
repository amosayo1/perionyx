import type { HttpMethod, ApiVersion, EndpointMetadata } from "./types";
import { generateEndpointId, registerEndpoint, getEndpoint } from "./endpoint-metadata";

export type RouteHandler = (...args: unknown[]) => Promise<Response>;

interface RouteEntry {
  method: HttpMethod;
  path: string;
  version: ApiVersion;
  handler: RouteHandler;
  metadata: EndpointMetadata;
  middleware: RouteMiddleware[];
}

export type RouteMiddleware = (context: RouteContext, next: () => Promise<Response>) => Promise<Response>;

export interface RouteContext {
  method: HttpMethod;
  path: string;
  version: ApiVersion;
  params: Record<string, string>;
  query: URLSearchParams;
  headers: Headers;
  body?: unknown;
  metadata: EndpointMetadata;
}

const routes = new Map<string, RouteEntry>();

export function registerRoute(
  method: HttpMethod,
  path: string,
  version: ApiVersion,
  handler: RouteHandler,
  metadata?: Partial<EndpointMetadata>,
  middleware?: RouteMiddleware[],
): void {
  const endpointId = generateEndpointId(method, path, version);
  const fullMeta: EndpointMetadata = {
    id: endpointId,
    method,
    path,
    version,
    operationId: metadata?.operationId ?? `${method.toLowerCase()}_${path.replace(/[^a-zA-Z0-9]/g, "_")}`,
    summary: metadata?.summary ?? "",
    description: metadata?.description,
    tags: metadata?.tags ?? [],
    auth: metadata?.auth ?? [],
    requiredScopes: metadata?.requiredScopes ?? [],
    rateLimitTier: metadata?.rateLimitTier ?? "free",
    deprecated: metadata?.deprecated ?? false,
    deprecationMessage: metadata?.deprecationMessage,
    parameters: metadata?.parameters ?? [],
    requestBody: metadata?.requestBody,
    responses: metadata?.responses ?? [{ status: 200, description: "Success" }],
    internal: metadata?.internal ?? false,
    tenantAware: metadata?.tenantAware ?? true,
    auditLogged: metadata?.auditLogged ?? false,
    addedAt: new Date(),
    updatedAt: new Date(),
  };

  registerEndpoint(fullMeta);

  routes.set(endpointId, {
    method,
    path,
    version,
    handler,
    metadata: fullMeta,
    middleware: middleware ?? [],
  });
}

export function getRoute(method: HttpMethod, path: string, version: ApiVersion): RouteEntry | undefined {
  return routes.get(generateEndpointId(method, path, version));
}

export function getRouteByOperationId(operationId: string): RouteEntry | undefined {
  return [...routes.values()].find((r) => r.metadata.operationId === operationId);
}

export function getAllRoutes(): RouteEntry[] {
  return [...routes.values()];
}

export function getRoutesByVersion(version: ApiVersion): RouteEntry[] {
  return [...routes.values()].filter((r) => r.version === version);
}

export function getRoutesByTag(tag: string): RouteEntry[] {
  return [...routes.values()].filter((r) => r.metadata.tags.includes(tag));
}

export function unregisterRoute(method: HttpMethod, path: string, version: ApiVersion): boolean {
  return routes.delete(generateEndpointId(method, path, version));
}

export function getRouteCount(): number {
  return routes.size;
}
