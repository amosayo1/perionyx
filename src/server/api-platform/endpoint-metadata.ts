import type {
  EndpointMetadata,
  HttpMethod,
  ApiVersion,
  AuthStrategy,
  RateLimitTier,
  EndpointParameter,
  EndpointResponse,
} from "./types";

const endpoints = new Map<string, EndpointMetadata>();

export function generateEndpointId(method: HttpMethod, path: string, version: ApiVersion): string {
  return `${version}:${method}:${path}`;
}

export function registerEndpoint(meta: EndpointMetadata): void {
  const id = generateEndpointId(meta.method, meta.path, meta.version);
  endpoints.set(id, { ...meta, id, addedAt: new Date(), updatedAt: new Date() });
}

export function getEndpoint(method: HttpMethod, path: string, version: ApiVersion): EndpointMetadata | undefined {
  return endpoints.get(generateEndpointId(method, path, version));
}

export function getEndpointsByVersion(version: ApiVersion): EndpointMetadata[] {
  return [...endpoints.values()].filter((e) => e.version === version && !e.internal);
}

export function getAllEndpoints(): EndpointMetadata[] {
  return [...endpoints.values()].filter((e) => !e.internal);
}

export function getEndpointsByTag(tag: string): EndpointMetadata[] {
  return [...endpoints.values()].filter((e) => e.tags.includes(tag) && !e.internal);
}

export function getEndpointsByScope(scope: string): EndpointMetadata[] {
  return [...endpoints.values()].filter((e) => e.requiredScopes.includes(scope) && !e.internal);
}

export function searchEndpoints(query: string): EndpointMetadata[] {
  const q = query.toLowerCase();
  return [...endpoints.values()].filter(
    (e) =>
      !e.internal &&
      (e.path.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.operationId.toLowerCase().includes(q)),
  );
}

export function unregisterEndpoint(method: HttpMethod, path: string, version: ApiVersion): boolean {
  return endpoints.delete(generateEndpointId(method, path, version));
}

export function createEndpointBuilder(version: ApiVersion) {
  return {
    get(path: string) {
      return builderFor("GET", path, version);
    },
    post(path: string) {
      return builderFor("POST", path, version);
    },
    put(path: string) {
      return builderFor("PUT", path, version);
    },
    patch(path: string) {
      return builderFor("PATCH", path, version);
    },
    del(path: string) {
      return builderFor("DELETE", path, version);
    },
  };
}

function builderFor(method: HttpMethod, path: string, version: ApiVersion) {
  const meta: Partial<EndpointMetadata> = {
    method,
    path,
    version,
    operationId: "",
    summary: "",
    tags: [],
    auth: [],
    requiredScopes: [],
    rateLimitTier: "free",
    deprecated: false,
    parameters: [],
    responses: [],
    internal: false,
    tenantAware: true,
    auditLogged: false,
  };

  const builder = {
    operationId(id: string) {
      meta.operationId = id;
      return builder;
    },
    summary(s: string) {
      meta.summary = s;
      return builder;
    },
    description(d: string) {
      meta.description = d;
      return builder;
    },
    tags(t: string[]) {
      meta.tags = t;
      return builder;
    },
    auth(a: AuthStrategy[]) {
      meta.auth = a;
      return builder;
    },
    scopes(s: string[]) {
      meta.requiredScopes = s;
      return builder;
    },
    rateLimit(tier: RateLimitTier) {
      meta.rateLimitTier = tier;
      return builder;
    },
    deprecated(dep: boolean, msg?: string) {
      meta.deprecated = dep;
      meta.deprecationMessage = msg;
      return builder;
    },
    parameter(p: EndpointParameter) {
      meta.parameters!.push(p);
      return builder;
    },
    requestBody(body: NonNullable<EndpointMetadata["requestBody"]>) {
      meta.requestBody = body;
      return builder;
    },
    response(r: EndpointResponse) {
      meta.responses!.push(r);
      return builder;
    },
    internal(i: boolean) {
      meta.internal = i;
      return builder;
    },
    tenantAware(t: boolean) {
      meta.tenantAware = t;
      return builder;
    },
    auditLogged(a: boolean) {
      meta.auditLogged = a;
      return builder;
    },
    register() {
      if (!meta.operationId) {
        meta.operationId = `${method.toLowerCase()}_${path.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "")}`;
      }
      registerEndpoint(meta as EndpointMetadata);
      return builder;
    },
    build(): EndpointMetadata {
      return {
        ...meta,
        id: generateEndpointId(method, path, version),
        addedAt: new Date(),
        updatedAt: new Date(),
      } as EndpointMetadata;
    },
  };

  return builder;
}

export function getEndpointCount(): number {
  return endpoints.size;
}

export function getTagsSummary(): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const ep of endpoints.values()) {
    if (ep.internal) continue;
    for (const tag of ep.tags) {
      summary[tag] = (summary[tag] ?? 0) + 1;
    }
  }
  return summary;
}
