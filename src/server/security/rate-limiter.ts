import type { NextRequest } from "next/server";

export class RateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly maxRequests: number = 100,
    private readonly windowMs: number = 60000,
  ) {}

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, resetAt: now + this.windowMs };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetAt: entry.resetAt };
  }

  middleware(limit?: number) {
    const maxReqs = limit ?? this.maxRequests;
    return async (request: NextRequest): Promise<Response | null> => {
      const key = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      const result = this.check(key);
      if (!result.allowed) {
        return new Response("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(maxReqs),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
          },
        });
      }
      return null;
    };
  }

  reset(key?: string): void {
    if (key) this.store.delete(key);
    else this.store.clear();
  }
}

export const rateLimiter = new RateLimiter();
