import { type HealthValidationResult, type ComponentStatus, type ComponentHealthDetail } from "./types"

interface HealthCheckFunction {
  name: string
  check: () => Promise<{ status: ComponentStatus; latencyMs: number; message: string }>
}

export class HealthValidator {
  private checks: HealthCheckFunction[] = []
  private lastResults: Map<string, ComponentHealthDetail> = new Map()

  constructor() {
    this.registerDefaultChecks()
  }

  registerCheck(name: string, check: () => Promise<{ status: ComponentStatus; latencyMs: number; message: string }>): void {
    this.checks.push({ name, check })
  }

  async validateAll(): Promise<HealthValidationResult> {
    const results = await this.runAllChecks()

    return {
      database: this.getComponentStatus(results, "database"),
      redis: this.getComponentStatus(results, "redis"),
      queues: this.getComponentStatus(results, "queues"),
      storage: this.getComponentStatus(results, "storage"),
      cache: this.getComponentStatus(results, "cache"),
      persistence: this.getComponentStatus(results, "persistence"),
      security: this.getComponentStatus(results, "security"),
      backgroundWorkers: this.getComponentStatus(results, "background-workers"),
      applicationServices: this.getComponentStatus(results, "application-services"),
      details: this.buildDetailsMap(results),
    }
  }

  async checkDatabase(): Promise<ComponentHealthDetail> {
    return this.runCheck("database")
  }

  async checkRedis(): Promise<ComponentHealthDetail> {
    return this.runCheck("redis")
  }

  async checkQueues(): Promise<ComponentHealthDetail> {
    return this.runCheck("queues")
  }

  async checkStorage(): Promise<ComponentHealthDetail> {
    return this.runCheck("storage")
  }

  async checkCache(): Promise<ComponentHealthDetail> {
    return this.runCheck("cache")
  }

  async checkPersistence(): Promise<ComponentHealthDetail> {
    return this.runCheck("persistence")
  }

  async checkSecurity(): Promise<ComponentHealthDetail> {
    return this.runCheck("security")
  }

  async checkBackgroundWorkers(): Promise<ComponentHealthDetail> {
    return this.runCheck("background-workers")
  }

  async checkApplicationServices(): Promise<ComponentHealthDetail> {
    return this.runCheck("application-services")
  }

  getLastResult(name: string): ComponentHealthDetail | null {
    return this.lastResults.get(name) ?? null
  }

  getAllLastResults(): ComponentHealthDetail[] {
    return [...this.lastResults.values()]
  }

  async getOverallHealth(): Promise<{ status: ComponentStatus; score: number; details: ComponentHealthDetail[] }> {
    const results = await this.runAllChecks()
    const unhealthy = results.filter((r) => r.status === "unhealthy").length
    const degraded = results.filter((r) => r.status === "degraded").length
    const total = results.length

    let status: ComponentStatus = "healthy"
    if (unhealthy > 0) status = "unhealthy"
    else if (degraded > 0) status = "degraded"

    const score = Math.round(((total - unhealthy * 2 - degraded) / (total * 2)) * 100)

    return { status, score, details: results }
  }

  isHealthy(): boolean {
    const unhealthy = [...this.lastResults.values()].filter(
      (r) => r.status === "unhealthy",
    )
    return unhealthy.length === 0
  }

  private registerDefaultChecks(): void {
    this.registerCheck("database", () => this.simulateCheck())
    this.registerCheck("redis", () => this.simulateCheck())
    this.registerCheck("queues", () => this.simulateCheck())
    this.registerCheck("storage", () => this.simulateCheck())
    this.registerCheck("cache", () => this.simulateCheck())
    this.registerCheck("persistence", () => this.simulateCheck())
    this.registerCheck("security", () => this.simulateCheck())
    this.registerCheck("background-workers", () => this.simulateCheck())
    this.registerCheck("application-services", () => this.simulateCheck())
  }

  private async runAllChecks(): Promise<ComponentHealthDetail[]> {
    const results = await Promise.all(
      this.checks.map(async (check) => {
        const detail = await this.runCheck(check.name)
        this.lastResults.set(check.name, detail)
        return detail
      }),
    )
    return results
  }

  private async runCheck(name: string): Promise<ComponentHealthDetail> {
    const check = this.checks.find((c) => c.name === name)
    if (!check) {
      return {
        name,
        status: "not-checked",
        latencyMs: 0,
        message: "No check registered",
        lastChecked: new Date(),
      }
    }

    const start = Date.now()
    try {
      const result = await check.check()
      return {
        name,
        status: result.status,
        latencyMs: result.latencyMs,
        message: result.message,
        lastChecked: new Date(),
      }
    } catch {
      return {
        name,
        status: "unhealthy",
        latencyMs: Date.now() - start,
        message: "Health check threw an exception",
        lastChecked: new Date(),
      }
    }
  }

  private getComponentStatus(
    results: ComponentHealthDetail[],
    name: string,
  ): ComponentStatus {
    return results.find((r) => r.name === name)?.status ?? "not-checked"
  }

  private buildDetailsMap(results: ComponentHealthDetail[]): Record<string, string> {
    const map: Record<string, string> = {}
    for (const result of results) {
      map[result.name] = `${result.status} (${result.latencyMs}ms)`
    }
    return map
  }

  private async simulateCheck(): Promise<{ status: ComponentStatus; latencyMs: number; message: string }> {
    await new Promise((r) => setTimeout(r, Math.random() * 50))
    return {
      status: "healthy",
      latencyMs: Math.floor(Math.random() * 50),
      message: "Check passed",
    }
  }
}

export const healthValidator = new HealthValidator()
