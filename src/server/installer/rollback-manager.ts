import { type RollbackPoint, type InstallationStep, type InstallStatus, type InstallationResult } from "./types"

interface SnapshotEntry {
  key: string
  value: unknown
  previousValue: unknown
}

export class RollbackManager {
  private rollbackPoints: RollbackPoint[] = []
  private snapshots: Map<string, SnapshotEntry[]> = new Map()
  private readonly maxRollbackPoints = 20

  async createRollbackPoint(
    installId: string,
    type: RollbackPoint["type"],
  ): Promise<RollbackPoint> {
    const point: RollbackPoint = {
      id: `rbp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      installId,
      timestamp: new Date(),
      type,
      state: await this.captureState(),
      restored: false,
    }
    this.rollbackPoints.push(point)
    if (this.rollbackPoints.length > this.maxRollbackPoints) {
      this.rollbackPoints.shift()
    }
    return point
  }

  async rollbackToPoint(pointId: string): Promise<boolean> {
    const point = this.rollbackPoints.find((p) => p.id === pointId)
    if (!point || point.restored) return false

    try {
      await this.restoreState(point.state)
      point.restored = true
      point.restoredAt = new Date()
      return true
    } catch {
      return false
    }
  }

  async rollbackInstallation(result: InstallationResult): Promise<boolean> {
    const installPoints = this.rollbackPoints.filter(
      (p) => p.installId === result.id,
    )

    const sorted = installPoints.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    )

    for (const point of sorted) {
      if (!point.restored) {
        const success = await this.rollbackToPoint(point.id)
        if (!success) return false
      }
    }

    return true
  }

  async rollbackFailedSteps(installId: string, steps: InstallationStep[]): Promise<boolean> {
    const failedSteps = steps.filter(
      (s) => s.status === "failed" || s.status === "running",
    )

    if (failedSteps.length === 0) return true

    const sorted = failedSteps.sort((a, b) => b.order - a.order)

    for (const step of sorted) {
      const pointId = `rbp_step_${installId}_${step.id}`
      const point = this.rollbackPoints.find((p) => p.id === pointId)
      if (point && !point.restored) {
        await this.rollbackToPoint(point.id)
      }
    }

    return true
  }

  recordSnapshot(installId: string, key: string, value: unknown): void {
    const existing = this.snapshots.get(installId) ?? []
    existing.push({
      key,
      value,
      previousValue: this.getPreviousValue(key),
    })
    this.snapshots.set(installId, existing)
  }

  getRollbackPoint(pointId: string): RollbackPoint | null {
    return this.rollbackPoints.find((p) => p.id === pointId) ?? null
  }

  getInstallRollbackPoints(installId: string): RollbackPoint[] {
    return this.rollbackPoints.filter((p) => p.installId === installId)
  }

  getLatestRollbackPoint(installId: string): RollbackPoint | null {
    const points = this.getInstallRollbackPoints(installId)
    if (points.length === 0) return null
    return points.reduce((latest, p) =>
      p.timestamp > latest.timestamp ? p : latest,
    )
  }

  hasRollbackPoint(installId: string): boolean {
    return this.rollbackPoints.some((p) => p.installId === installId)
  }

  clearInstallRollbackPoints(installId: string): void {
    this.rollbackPoints = this.rollbackPoints.filter(
      (p) => p.installId !== installId,
    )
    this.snapshots.delete(installId)
  }

  clearAll(): void {
    this.rollbackPoints = []
    this.snapshots.clear()
  }

  private async captureState(): Promise<Record<string, unknown>> {
    return {
      env: { ...process.env },
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    }
  }

  private async restoreState(_state: Record<string, unknown>): Promise<void> {
    await Promise.resolve()
  }

  private getPreviousValue(key: string): unknown {
    return null
  }
}

export const rollbackManager = new RollbackManager()
