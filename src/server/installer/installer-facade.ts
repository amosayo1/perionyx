import { type InstallationConfig, type InstallationResult, type PrerequisiteCheck, type MigrationRecord, type BackupManifest, type UpgradePlan, type HealthValidationResult, type InstallStatus, type InstallationReport } from "./types"
import { InstallationEngine, installationEngine } from "./installation-engine"
import { InstallationValidator, installationValidator } from "./installation-validator"
import { EnvironmentValidator, environmentValidator } from "./environment-validator"
import { PrerequisiteChecker, prerequisiteChecker } from "./prerequisite-checker"
import { MigrationRunner, migrationRunner } from "./migration-runner"
import { SeedManager, seedManager } from "./seed-manager"
import { RollbackManager, rollbackManager } from "./rollback-manager"
import { CompanyBootstrap, companyBootstrap } from "./company-bootstrap"
import { AdministratorBootstrap, administratorBootstrap } from "./administrator-bootstrap"
import { HealthValidator, healthValidator } from "./health-validator"
import { BackupManager, backupManager } from "./backup-manager"
import { UpgradeManager, upgradeManager } from "./upgrade-manager"
import { InstallationReportGenerator, installationReport } from "./installation-report"

export class InstallerFacade {
  private _engine: InstallationEngine
  private _validator: InstallationValidator
  private _envValidator: EnvironmentValidator
  private _prereq: PrerequisiteChecker
  private _migration: MigrationRunner
  private _seedManager: SeedManager
  private _rollbackManager: RollbackManager
  private _company: CompanyBootstrap
  private _admin: AdministratorBootstrap
  private _healthValidator: HealthValidator
  private _backupManager: BackupManager
  private _upgradeManager: UpgradeManager
  private _report: InstallationReportGenerator

  constructor() {
    this._engine = installationEngine
    this._validator = installationValidator
    this._envValidator = environmentValidator
    this._prereq = prerequisiteChecker
    this._migration = migrationRunner
    this._seedManager = seedManager
    this._rollbackManager = rollbackManager
    this._company = companyBootstrap
    this._admin = administratorBootstrap
    this._healthValidator = healthValidator
    this._backupManager = backupManager
    this._upgradeManager = upgradeManager
    this._report = installationReport
  }

  async install(config: InstallationConfig): Promise<InstallationResult> {
    return this._engine.install(config)
  }

  async validate(config: InstallationConfig): Promise<PrerequisiteCheck[]> {
    const errors = this._validator.validateConfig(config)
    if (errors.some((e) => e.severity === "error")) {
      const prereqChecks = this._prereq.checkAll()
      for (const error of errors) {
        prereqChecks.push({
          name: `Config: ${error.field}`,
          description: error.message,
          required: error.severity === "error",
          passed: false,
          message: error.message,
          severity: error.severity,
        })
      }
      return prereqChecks
    }
    return this._prereq.checkAll()
  }

  async migrate(): Promise<MigrationRecord[]> {
    await this._migration.runPending(
      process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
    )
    return this._migration.getExecutedMigrations()
  }

  async runSeed(env: import("./types").DeploymentEnvironment = "development"): Promise<void> {
    await this._seedManager.installAll(env)
  }

  async createBackup(type: "pre-upgrade" | "manual" | "scheduled" | "restore-point" = "manual"): Promise<BackupManifest> {
    return this._backupManager.createBackup(
      type,
      process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
      ["database", "config", "storage"],
    )
  }

  async restoreBackup(backupId: string): Promise<boolean> {
    return this._backupManager.restoreBackup(backupId)
  }

  async planUpgrade(targetVersion: string): Promise<UpgradePlan> {
    const currentVersion = await this._upgradeManager.detectCurrentVersion()
    return this._upgradeManager.planUpgrade(currentVersion, targetVersion)
  }

  async checkHealth(): Promise<HealthValidationResult> {
    return this._healthValidator.validateAll()
  }

  getStatus(): InstallStatus {
    return this._engine.getStatus()
  }

  getReport(): InstallationReport {
    const active = this._engine.getActiveInstallation()
    if (active?.report) return active.report
    if (active) {
      return this._report.generate(active)
    }
    return {
      summary: "No active installation",
      stepsCompleted: 0,
      stepsFailed: 0,
      stepsSkipped: 0,
      totalDuration: 0,
      recommendations: [],
      status: "pending",
    }
  }

  async rollbackInstallation(installId: string): Promise<boolean> {
    if (this._rollbackManager.hasRollbackPoint(installId)) {
      return this._rollbackManager.rollbackInstallation(
        await this._getInstallationResult(installId),
      )
    }
    return this._engine.rollback()
  }

  async verifyEnvironment(): Promise<{
    valid: boolean;
    errors: import("./types").ValidationError[];
    result: import("./types").EnvironmentValidationResult;
  }> {
    return this._envValidator.verifyRuntime()
  }

  async checkPrerequisites(): Promise<{ passed: boolean; checks: PrerequisiteCheck[] }> {
    return this._prereq.verifyAll()
  }

  async getDeploymentMetrics(): Promise<{
    totalInstallations: number
    successfulInstallations: number
    failedInstallations: number
  }> {
    const history = this._engine.getHistory()
    return {
      totalInstallations: history.length,
      successfulInstallations: history.filter((h) => h.status === "completed").length,
      failedInstallations: history.filter((h) => h.status === "failed" || h.status === "rolled-back").length,
    }
  }

  private async _getInstallationResult(installId: string): Promise<import("./types").InstallationResult> {
    const history = this._engine.getHistory()
    const result = history.find((h) => h.id === installId)
    if (!result) {
      throw new Error(`Installation not found: ${installId}`)
    }
    return result
  }

  getValidator(): InstallationValidator { return this._validator }
  getEnvValidator(): EnvironmentValidator { return this._envValidator }
  getPrereqChecker(): PrerequisiteChecker { return this._prereq }
  getMigrationRunner(): MigrationRunner { return this._migration }
  getSeedManager(): SeedManager { return this._seedManager }
  getRollbackManager(): RollbackManager { return this._rollbackManager }
  getCompanyBootstrap(): CompanyBootstrap { return this._company }
  getAdminBootstrap(): AdministratorBootstrap { return this._admin }
  getHealthValidator(): HealthValidator { return this._healthValidator }
  getBackupManager(): BackupManager { return this._backupManager }
  getUpgradeManager(): UpgradeManager { return this._upgradeManager }
  getReportGenerator(): InstallationReportGenerator { return this._report }
  getEngine(): InstallationEngine { return this._engine }
}

export const installerFacade = new InstallerFacade()
