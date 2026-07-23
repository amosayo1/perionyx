import type { ApiPlatformConfig, ApiVersion, EndpointMetadata } from "./types";
import { getApiConfig, updateApiConfig } from "./api-configuration";
import { getCurrentVersion, negotiateVersion, registerVersion, getAllVersions } from "./api-version-manager";
import { getEndpointsByVersion, getAllEndpoints, searchEndpoints, getEndpointCount } from "./endpoint-metadata";
import { APIService, apiService } from "./api-service";
import { createRequestContext, extractPaginationParams, extractFilterParams, extractSortParams, extractFieldSelection, parseVersionFromPath, parseVersionFromHeader } from "./request-pipeline";
import { toNextResponse, createResponseContext, errorResponse } from "./response-pipeline";
import type { VersionInfo } from "./types";

export class APIPlatform {
  private initialized = false;

  get config(): ApiPlatformConfig {
    return getApiConfig();
  }

  get service(): APIService {
    return apiService;
  }

  initialize(config?: Partial<ApiPlatformConfig>): void {
    if (this.initialized) return;
    if (config) updateApiConfig(config);
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getVersion(): ApiVersion {
    return getCurrentVersion();
  }

  negotiateVersion(acceptHeader?: string, urlVersion?: string) {
    return negotiateVersion(acceptHeader, urlVersion, this.config.defaultVersion);
  }

  registerVersion(info: VersionInfo): void {
    registerVersion(info);
  }

  getVersions() {
    return getAllVersions();
  }

  getEndpoints(version?: ApiVersion, tag?: string, query?: string): EndpointMetadata[] {
    return this.service.getEndpoints(version, tag, query);
  }

  getAllEndpoints(): EndpointMetadata[] {
    return getAllEndpoints();
  }

  searchEndpoints(query: string): EndpointMetadata[] {
    return searchEndpoints(query);
  }

  getEndpointCount(): number {
    return getEndpointCount();
  }

  processRequest(request: Request) {
    const url = new URL(request.url);
    const urlVersion = parseVersionFromPath(url.pathname);
    const headerVersion = parseVersionFromHeader(request.headers);
    const { version, warning } = this.negotiateVersion(headerVersion, urlVersion);

    const ctx = createRequestContext(request, version);

    return {
      ctx,
      version,
      warning,
      pagination: extractPaginationParams(url),
      filters: extractFilterParams(url),
      sorts: extractSortParams(url),
      fieldSelection: extractFieldSelection(url),
    };
  }

  createResponse(ctx: ReturnType<APIPlatform["processRequest"]>["ctx"], data: unknown, status = 200) {
    const responseCtx = createResponseContext(ctx, status, data);
    return toNextResponse(responseCtx);
  }

  createError(ctx: ReturnType<APIPlatform["processRequest"]>["ctx"], code: string, message: string, status: number, details?: unknown) {
    const err = this.service.createError(code, message, details, ctx.requestId);
    return errorResponse(err, status);
  }
}

export const apiPlatform = new APIPlatform();
