import type { ApiVersion, EndpointMetadata, PaginationParams, PaginatedResponse, ApiError } from "./types";
import { discoverEndpoints } from "./api-registry";
import { negotiateVersion } from "./api-version-manager";
import { getApiConfig, getPageSize } from "./api-configuration";

export class APIService {
  getEndpoints(version?: ApiVersion, tag?: string, query?: string): EndpointMetadata[] {
    return discoverEndpoints(version, tag, query);
  }

  resolveApiVersion(
    acceptHeader?: string,
    urlVersion?: string,
  ): { version: ApiVersion; warning?: string } {
    return negotiateVersion(acceptHeader, urlVersion, getApiConfig().defaultVersion);
  }

  paginate<T>(items: T[], params: PaginationParams): PaginatedResponse<T> {
    const pageSize = getPageSize(params.pageSize);
    const page = params.page ?? 1;
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = items.slice(start, start + pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextCursor: params.cursor && page < totalPages ? `page=${page + 1}` : undefined,
      },
    };
  }

  createError(code: string, message: string, details?: unknown, requestId?: string): ApiError {
    return {
      code,
      message,
      details,
      requestId,
      documentationUrl: `${getApiConfig().baseUrl}${getApiConfig().developerPortalPath}/errors#${code.toLowerCase()}`,
    };
  }

  formatValidationError(issues: Array<{ path: string; message: string }>): ApiError {
    return this.createError("VALIDATION_ERROR", "Request validation failed", issues);
  }

  formatAuthError(message = "Authentication required"): ApiError {
    return this.createError("UNAUTHORIZED", message);
  }

  formatForbiddenError(message = "Insufficient permissions"): ApiError {
    return this.createError("FORBIDDEN", message);
  }

  formatNotFoundError(resource = "Resource"): ApiError {
    return this.createError("NOT_FOUND", `${resource} not found`);
  }

  formatRateLimitError(retryAfterMs: number): ApiError {
    return this.createError("RATE_LIMIT_EXCEEDED", `Rate limit exceeded. Retry after ${retryAfterMs}ms`);
  }
}

export const apiService = new APIService();
