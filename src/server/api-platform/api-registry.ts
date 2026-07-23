import type { EndpointMetadata, ApiVersion } from "./types";
import { getEndpointsByVersion, getAllEndpoints, getEndpointsByTag, searchEndpoints, getTagsSummary } from "./endpoint-metadata";
import { getRoutesByVersion, getAllRoutes, getRouteCount } from "./route-registry";
import { getAllVersions, getVersion } from "./api-version-manager";

export interface ApiRegistryReport {
  totalEndpoints: number;
  totalRoutes: number;
  versions: string[];
  tags: Record<string, number>;
  endpointsByVersion: Record<string, number>;
}

export function getApiRegistryReport(): ApiRegistryReport {
  const versions = getAllVersions();
  const epsByVer: Record<string, number> = {};
  for (const v of versions) {
    epsByVer[v.version] = getEndpointsByVersion(v.version).length;
  }

  return {
    totalEndpoints: getAllEndpoints().length,
    totalRoutes: getRouteCount(),
    versions: versions.map((v) => `${v.version} (${v.status})`),
    tags: getTagsSummary(),
    endpointsByVersion: epsByVer,
  };
}

export function discoverEndpoints(version?: ApiVersion, tag?: string, query?: string): EndpointMetadata[] {
  if (query) return searchEndpoints(query);
  if (tag) return getEndpointsByTag(tag);
  if (version) return getEndpointsByVersion(version);
  return getAllEndpoints();
}

export function getVersionInfo(version: ApiVersion) {
  return getVersion(version);
}

export function getApiSummary() {
  return {
    endpoints: getAllEndpoints().length,
    routes: getRouteCount(),
    tags: getTagsSummary(),
    versions: getAllVersions().map((v) => ({
      version: v.version,
      status: v.status,
      changelog: v.changelog,
      breakingChanges: v.breakingChanges,
    })),
  };
}
