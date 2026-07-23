export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheck[];
  uptime: number;
  version: string;
  timestamp: string;
}

export interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  message?: string;
}

export interface ReadinessStatus {
  ready: boolean;
  checks: { name: string; ready: boolean }[];
}

export interface LivenessStatus {
  alive: boolean;
  pid: number;
  uptime: number;
  memory: { heapUsed: number; heapTotal: number; rss: number };
}

export class HealthEndpoint {
  private startTime = Date.now();
  private checks: Map<string, () => Promise<Pick<HealthCheck, "status" | "latencyMs" | "message">>> = new Map();

  registerCheck(name: string, check: () => Promise<Pick<HealthCheck, "status" | "latencyMs" | "message">>): void {
    this.checks.set(name, check);
  }

  async getHealth(): Promise<HealthStatus> {
    const results = await Promise.all(
      [...this.checks.entries()].map(async ([name, check]) => {
        try {
          const result = await check();
          return { name, ...result };
        } catch {
          return { name, status: "unhealthy" as const, latencyMs: 0, message: "Check failed" };
        }
      }),
    );

    const hasUnhealthy = results.some((r) => r.status === "unhealthy");
    const hasDegraded = results.some((r) => r.status === "degraded");

    return {
      status: hasUnhealthy ? "unhealthy" : hasDegraded ? "degraded" : "healthy",
      checks: results,
      uptime: Date.now() - this.startTime,
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
      timestamp: new Date().toISOString(),
    };
  }

  getReadiness(): ReadinessStatus {
    return { ready: true, checks: [{ name: "ready", ready: true }] };
  }

  getLiveness(): LivenessStatus {
    const mem = process.memoryUsage();
    return {
      alive: true,
      pid: process.pid,
      uptime: process.uptime(),
      memory: { heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, rss: mem.rss },
    };
  }

  getUptime(): string {
    const ms = Date.now() - this.startTime;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m ${s % 60}s`;
  }

  reset(): void {
    this.startTime = Date.now();
  }
}

export const healthEndpoint = new HealthEndpoint();
