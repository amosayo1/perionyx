export interface RequestConfig {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

export interface RequestResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
}

function buildUrl(baseUrl: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return baseUrl;
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${qs}` : baseUrl;
}

export async function makeRequest<T = unknown>(
  config: RequestConfig,
  authHeaders?: Record<string, string>,
): Promise<RequestResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...authHeaders,
    ...config.headers,
  };

  const controller = new AbortController();
  const timeout = config.timeout ?? 30000;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(buildUrl(config.url, config.params), {
      method: config.method,
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
      signal: controller.signal,
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value: string, key: string) => {
      responseHeaders[key] = value;
    });

    let data: T;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      data = (await response.json()) as T;
    } else {
      data = (await response.text()) as unknown as T;
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function makePaginatedRequest<T>(
  baseConfig: Omit<RequestConfig, "url"> & { url: string },
  cursorParam = "cursor",
  maxPages?: number,
): Promise<T[]> {
  const allItems: T[] = [];
  let cursor: string | null = null;
  let pages = 0;

  do {
    const params: Record<string, string | number | boolean | undefined> = { ...baseConfig.params };
    if (cursor) {
      params[cursorParam] = cursor;
    }
    const response = await makeRequest<{ items: T[]; next_cursor?: string | null; has_more?: boolean }>({
      ...baseConfig,
      params,
    });

    const items = response.data.items ?? [];
    allItems.push(...items);

    cursor = response.data.next_cursor ?? null;
    pages++;

    if (!cursor || (maxPages && pages >= maxPages)) break;
  } while (cursor);

  return allItems;
}
