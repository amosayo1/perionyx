export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface HealthCheckResult {
  status: HealthStatus;
  component: string;
  message?: string;
  latencyMs: number;
  lastChecked: Date;
  metadata?: Record<string, unknown>;
}

export interface HealthReport {
  status: HealthStatus;
  checks: HealthCheckResult[];
  healthy: number;
  degraded: number;
  unhealthy: number;
  total: number;
  timestamp: Date;
}

export type HealthChecker = () => Promise<HealthCheckResult>;

class HealthRegistry {
  private checkers = new Map<string, HealthChecker>();

  register(name: string, checker: HealthChecker): void {
    this.checkers.set(name, checker);
  }

  unregister(name: string): void {
    this.checkers.delete(name);
  }

  async runAll(): Promise<HealthReport> {
    const results = await Promise.all(
      [...this.checkers.entries()].map(async ([name, check]) => {
        try {
          return await check();
        } catch (err) {
          return {
            status: "unhealthy" as const,
            component: name,
            message: err instanceof Error ? err.message : "Unknown error",
            latencyMs: 0,
            lastChecked: new Date(),
          };
        }
      }),
    );

    const healthy = results.filter((r) => r.status === "healthy").length;
    const degraded = results.filter((r) => r.status === "degraded").length;
    const unhealthy = results.filter((r) => r.status === "unhealthy").length;

    let overall: HealthStatus = "healthy";
    if (unhealthy > 0) overall = "unhealthy";
    else if (degraded > 0) overall = "degraded";

    return {
      status: overall,
      checks: results,
      healthy,
      degraded,
      unhealthy,
      total: results.length,
      timestamp: new Date(),
    };
  }

  async runCheck(name: string): Promise<HealthCheckResult> {
    const checker = this.checkers.get(name);
    if (!checker) {
      return {
        status: "unhealthy",
        component: name,
        message: "Health check not registered",
        latencyMs: 0,
        lastChecked: new Date(),
      };
    }
    return checker();
  }
}

export const healthRegistry = new HealthRegistry();

export function registerHealthCheck(
  name: string,
  checker: HealthChecker,
): void {
  healthRegistry.register(name, checker);
}

export async function getHealthReport(): Promise<HealthReport> {
  return healthRegistry.runAll();
}
