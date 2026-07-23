import {
  type UpgradePlan,
  type UpgradeResult,
  type MigrationRecord,
  type PrerequisiteCheck,
  type InstallStatus,
  type InstallMode,
  type InstallationConfig,
} from "./types"
import { migrationRunner, type MigrationFile } from "./migration-runner"
import { prerequisiteChecker } from "./prerequisite-checker"
import { backupManager } from "./backup-manager"
import { healthValidator } from "./health-validator"

export class UpgradeManager {
  private upgradeHistory: UpgradeResult[] = []
  private readonly maxHistory = 10
  private allowedDowngrade = false

  async planUpgrade(currentVersion: string, targetVersion: string): Promise<UpgradePlan> {
    const compatibility = this.checkCompatibility(currentVersion, targetVersion)
    const migrations = await this.getPendingMigrations(currentVersion, targetVersion)
    const preUpgradeChecks = prerequisiteChecker.checkAll()

    const warnings: string[] = []
    if (!compatibility) {
      warnings.push(`Version ${currentVersion} to ${targetVersion} may not be fully compatible`)
    }
    if (migrations.length === 0) {
      warnings.push("No pending migrations for this upgrade path")
    }

    const estimatedDowntime = this.estimateDowntime(migrations.length)

    return {
      currentVersion,
      targetVersion,
      migrations,
      compatibility,
      estimatedDowntime,
      preUpgradeChecks,
      rollbackSteps: this.generateRollbackSteps(migrations),
      warnings,
    }
  }

  async executeUpgrade(currentVersion: string, targetVersion: string): Promise<UpgradeResult> {
    const startTime = Date.now()
    const plan = await this.planUpgrade(currentVersion, targetVersion)

    if (!plan.compatibility) {
      return {
        plan,
        executed: false,
        migrationsRun: 0,
        migrationsFailed: 0,
        duration: 0,
        status: "failed",
        errors: ["Version compatibility check failed"],
      }
    }

    const failedChecks = plan.preUpgradeChecks.filter((c) => c.required && !c.passed)
    if (failedChecks.length > 0) {
      return {
        plan,
        executed: false,
        migrationsRun: 0,
        migrationsFailed: 0,
        duration: 0,
        status: "failed",
        errors: failedChecks.map((c) => `Prerequisite failed: ${c.name}`),
      }
    }

    const errors: string[] = []

    try {
      await backupManager.preUpgradeBackup(currentVersion)

      if (plan.migrations.length > 0) {
        const report = await migrationRunner.runPending(targetVersion, "upgrade")
        if (report.failedMigrations > 0) {
          errors.push(`${report.failedMigrations} migration(s) failed during upgrade`)
          await this.rollbackUpgrade(plan)
          return {
            plan,
            executed: false,
            migrationsRun: report.successfulMigrations,
            migrationsFailed: report.failedMigrations,
            duration: Date.now() - startTime,
            status: "failed",
            errors,
          }
        }
      }

      const result: UpgradeResult = {
        plan,
        executed: true,
        migrationsRun: plan.migrations.length,
        migrationsFailed: 0,
        duration: Date.now() - startTime,
        status: "completed",
        errors: [],
      }

      this.upgradeHistory.push(result)
      if (this.upgradeHistory.length > this.maxHistory) {
        this.upgradeHistory.shift()
      }

      return result
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "Upgrade execution failed",
      )

      return {
        plan,
        executed: false,
        migrationsRun: 0,
        migrationsFailed: plan.migrations.length,
        duration: Date.now() - startTime,
        status: "failed",
        errors,
      }
    }
  }

  async rollbackUpgrade(plan: UpgradePlan): Promise<boolean> {
    const latestBackup = await backupManager.getLatestBackup("pre-upgrade")
    if (latestBackup) {
      return backupManager.restoreBackup(latestBackup.id)
    }
    return migrationRunner.rollbackTarget(plan.currentVersion)
  }

  checkCompatibility(currentVersion: string, targetVersion: string): boolean {
    const current = this.parseVersion(currentVersion)
    const target = this.parseVersion(targetVersion)

    if (!current || !target) return false
    if (this.allowedDowngrade) return true

    if (target.major > current.major) return true
    if (target.major === current.major && target.minor > current.minor) return true
    if (target.major === current.major && target.minor === current.minor && target.patch >= current.patch) return true

    return false
  }

  async detectCurrentVersion(): Promise<string> {
    return process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"
  }

  getLatestVersion(): string {
    const versions = this.getAllAvailableVersions()
    return versions[versions.length - 1] ?? "1.0.0"
  }

  getAllAvailableVersions(): string[] {
    return [
      "0.1.0", "0.2.0", "0.3.0", "0.4.0", "0.5.0",
      "0.6.0", "0.7.0", "0.8.0", "0.9.0",
      "1.0.0", "1.1.0", "1.2.0",
    ]
  }

  getUpgradeHistory(): UpgradeResult[] {
    return [...this.upgradeHistory]
  }

  getLatestUpgrade(): UpgradeResult | null {
    if (this.upgradeHistory.length === 0) return null
    return this.upgradeHistory[this.upgradeHistory.length - 1]
  }

  estimateDowntime(migrationCount: number): number {
    return Math.max(30, migrationCount * 15)
  }

  private async getPendingMigrations(_currentVersion: string, _targetVersion: string): Promise<MigrationRecord[]> {
    const pending = await migrationRunner.getPendingMigrations()
    return pending.map((m: MigrationFile) => ({
      id: m.id,
      name: m.name,
      version: m.version,
      batch: 0,
      executedAt: new Date(),
      duration: 0,
      checksum: m.checksum,
      success: false,
      rollbackScript: m.rollbackScript,
    }))
  }

  private generateRollbackSteps(migrations: MigrationRecord[]): string[] {
    const steps: string[] = []
    steps.push("1. Restore pre-upgrade database backup")
    steps.push("2. Revert configuration changes")
    steps.push("3. Restore previous version of application files")

    if (migrations.length > 0) {
      steps.push(`4. Rollback ${migrations.length} database migration(s)`)
    }

    steps.push(`${steps.length + 1}. Verify system health post-rollback`)
    return steps
  }

  private parseVersion(version: string): { major: number; minor: number; patch: number } | null {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)/)
    if (!match) return null
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
    }
  }
}

export const upgradeManager = new UpgradeManager()
