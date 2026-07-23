import {
  type InstallationConfig,
  type InstallationResult,
  type InstallationStep,
  type InstallationReport,
  type InstallStatus,
  type StepStatus,
  type InstallMode,
} from "./types"
import { prerequisiteChecker } from "./prerequisite-checker"
import { environmentValidator } from "./environment-validator"
import { installationValidator } from "./installation-validator"
import { migrationRunner } from "./migration-runner"
import { seedManager } from "./seed-manager"
import { rollbackManager } from "./rollback-manager"
import { companyBootstrap } from "./company-bootstrap"
import { administratorBootstrap } from "./administrator-bootstrap"
import { healthValidator } from "./health-validator"
import { backupManager } from "./backup-manager"
import { installationReport } from "./installation-report"

interface EngineState {
  id: string
  config: InstallationConfig
  status: InstallStatus
  steps: InstallationStep[]
  errors: string[]
  warnings: string[]
  startedAt: Date
  completedAt?: Date
}

export class InstallationEngine {
  private activeInstallation: EngineState | null = null
  private history: EngineState[] = []
  private readonly maxHistory = 20

  async install(config: InstallationConfig): Promise<InstallationResult> {
    const installId = `inst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const startTime = Date.now()

    this.activeInstallation = {
      id: installId,
      config,
      status: "pending",
      steps: this.planSteps(config),
      errors: [],
      warnings: [],
      startedAt: new Date(),
    }

    try {
      if (config.mode !== "repair") {
        const validationErrors = installationValidator.validateConfig(config)
        for (const err of validationErrors) {
          if (err.severity === "error") {
            this.activeInstallation.errors.push(err.message)
          } else {
            this.activeInstallation.warnings.push(err.message)
          }
        }

        if (this.activeInstallation.errors.length > 0 && config.mode !== "validate-only") {
          return this.failInstallation("Configuration validation failed")
        }
      }

      this.activeInstallation.status = "running"

      if (config.rollbackOnFailure !== false) {
        await rollbackManager.createRollbackPoint(installId, "pre-install")
      }

      const phase1Steps = [
        "validate-environment",
        "check-prerequisites",
        "validate-configuration",
      ]

      const phase1Ok = await this.executeStepBatch(phase1Steps, config, startTime)
      if (!phase1Ok) {
        return this.finalize(startTime)
      }

      if (config.mode === "validate-only") {
        this.activeInstallation.status = "completed"
        return this.finalize(startTime)
      }

      if (!config.skipHealthCheck) {
        const healthSteps = ["check-system-health"]
        await this.executeStepBatch(healthSteps, config, startTime)
      }

      if (config.mode === "fresh" || config.mode === "upgrade") {
        const phase2Steps = [
          "backup-existing",
          "run-migrations",
          "seed-data",
        ]

        const phase2Ok = await this.executeStepBatch(phase2Steps, config, startTime)
        if (!phase2Ok) {
          if (config.rollbackOnFailure !== false) {
            await this.rollback()
          }
          return this.finalize(startTime)
        }
      }

      if (config.mode === "fresh" && config.companyName) {
        const phase3Steps = [
          "bootstrap-company",
          "setup-administrator",
        ]

        const phase3Ok = await this.executeStepBatch(phase3Steps, config, startTime)
        if (!phase3Ok) {
          if (config.rollbackOnFailure !== false) {
            await this.rollback()
          }
          return this.finalize(startTime)
        }
      }

      if (config.mode === "repair") {
        const repairSteps = [
          "verify-migrations",
          "verify-seeds",
          "check-health",
        ]
        await this.executeStepBatch(repairSteps, config, startTime)
      }

      const finalSteps = ["generate-report"]
      await this.executeStepBatch(finalSteps, config, startTime)

      this.activeInstallation.status = "completed"
    } catch (error) {
      const message = error instanceof Error ? error.message : "Installation engine error"
      this.activeInstallation.errors.push(message)
      this.activeInstallation.status = "failed"
    }

    return this.finalize(startTime)
  }

  async rollback(): Promise<boolean> {
    if (!this.activeInstallation) return false
    const success = await rollbackManager.rollbackInstallation(this.asResult())
    if (success && this.activeInstallation) {
      this.activeInstallation.status = "rolled-back"
      for (const step of this.activeInstallation.steps) {
        if (step.status === "running" || step.status === "pending") {
          step.status = "skipped"
        }
      }
    }
    return success
  }

  getStatus(): InstallStatus {
    return this.activeInstallation?.status ?? "pending"
  }

  getActiveInstallation(): InstallationResult | null {
    if (!this.activeInstallation) return null
    return this.asResult()
  }

  getHistory(): InstallationResult[] {
    return this.history.map((h) => this.stateToResult(h))
  }

  clearHistory(): void {
    this.history = []
  }

  private planSteps(config: InstallationConfig): InstallationStep[] {
    const steps: InstallationStep[] = []
    let order = 0

    const addStep = (id: string, name: string, description: string) => {
      steps.push({
        id,
        name,
        description,
        order: order++,
        status: "pending",
      })
    }

    addStep("validate-environment", "Validate Environment", "Verify runtime environment compatibility")
    addStep("check-prerequisites", "Check Prerequisites", "Verify system meets minimum requirements")
    addStep("validate-configuration", "Validate Configuration", "Verify installation configuration is valid")

    if (!config.skipHealthCheck) {
      addStep("check-system-health", "Check System Health", "Verify all system components are healthy")
    }

    if (config.mode === "fresh" || config.mode === "upgrade") {
      addStep("backup-existing", "Backup Existing Data", "Create pre-installation backup")
      addStep("run-migrations", "Run Migrations", "Execute database migrations")
      addStep("seed-data", "Seed Data", "Install seed data")
    }

    if (config.mode === "fresh" && config.companyName) {
      addStep("bootstrap-company", "Bootstrap Company", "Create company record and configuration")
      addStep("setup-administrator", "Setup Administrator", "Create administrator user account")
    }

    if (config.mode === "repair") {
      addStep("verify-migrations", "Verify Migrations", "Verify database migration integrity")
      addStep("verify-seeds", "Verify Seeds", "Verify seed data integrity")
      addStep("check-health", "Final Health Check", "Verify system health after repair")
    }

    addStep("generate-report", "Generate Report", "Generate installation report")

    return steps
  }

  private async executeStepBatch(
    stepIds: string[],
    config: InstallationConfig,
    startTime: number,
  ): Promise<boolean> {
    for (const stepId of stepIds) {
      const state = this.activeInstallation
      if (!state || state.status === "failed") return false
      await this.executeStep(stepId, config, startTime)
      if (this.activeInstallation?.status === "failed") return false
    }
    return true
  }

  private async executeStep(
    stepId: string,
    config: InstallationConfig,
    startTime: number,
  ): Promise<void> {
    if (!this.activeInstallation) return

    const step = this.activeInstallation.steps.find((s) => s.id === stepId)
    if (!step) return

    const stepStart = Date.now()
    step.status = "running"
    step.startedAt = new Date()

    try {
      switch (stepId) {
        case "validate-environment": {
          const result = await environmentValidator.verifyRuntime()
          if (!result.valid) {
            for (const err of result.errors) {
              this.activeInstallation.errors.push(err.message)
            }
            throw new Error("Environment validation failed")
          }
          break
        }

        case "check-prerequisites": {
          const result = await prerequisiteChecker.verifyAll()
          if (!result.passed) {
            const failed = result.checks.filter((c) => c.required && !c.passed)
            for (const check of failed) {
              this.activeInstallation.errors.push(
                `Prerequisite failed: ${check.name} — ${check.message}`,
              )
            }
            throw new Error("Prerequisite checks failed")
          }
          for (const check of result.checks) {
            if (!check.passed && !check.required) {
              this.activeInstallation.warnings.push(
                `Optional prerequisite: ${check.name} — ${check.message}`,
              )
            }
          }
          break
        }

        case "validate-configuration": {
          if (config.mode !== "repair") {
            const result = await installationValidator.verify(config)
            if (!result.valid) {
              throw new Error("Configuration validation failed")
            }
          }
          break
        }

        case "check-system-health": {
          const health = await healthValidator.validateAll()
          const unhealthy = Object.entries(health).filter(
            ([k, v]) => k !== "details" && v === "unhealthy",
          )
          if (unhealthy.length > 0) {
            this.activeInstallation.warnings.push(
              `Unhealthy components: ${unhealthy.map(([k]) => k).join(", ")}`,
            )
          }
          break
        }

        case "backup-existing": {
          await backupManager.preUpgradeBackup(config.version)
          break
        }

        case "run-migrations": {
          if (!config.skipMigrations) {
            const report = await migrationRunner.runPending(config.version, config.mode)
            if (report.failedMigrations > 0) {
              for (const batch of report.batches) {
                for (const m of batch.migrations) {
                  if (!m.success) {
                    this.activeInstallation.errors.push(
                      `Migration failed: ${m.name} — batch ${m.batch}`,
                    )
                  }
                }
              }
              throw new Error(`${report.failedMigrations} migration(s) failed`)
            }
          }
          break
        }

        case "seed-data": {
          if (!config.skipSeeding) {
            const result = await seedManager.installAll(config.environment)
            if (result.failed.length > 0) {
              this.activeInstallation.errors.push(
                `Failed to install seeds: ${result.failed.join(", ")}`,
              )
              throw new Error("Seed installation failed")
            }
          }
          break
        }

        case "bootstrap-company": {
          if (config.companyName) {
            await companyBootstrap.bootstrap({
              companyName: config.companyName,
              fiscalYearStart: config.fiscalYearStart ?? 1,
              fiscalYearEnd: config.fiscalYearStart
                ? config.fiscalYearStart > 1 ? config.fiscalYearStart - 1 : 12
                : 12,
              baseCurrency: config.baseCurrency ?? "USD",
              reportingCurrency: config.baseCurrency ?? "USD",
              departments: [],
              businessUnits: [],
              enableTax: false,
              enableTreasury: false,
            })
          }
          break
        }

        case "setup-administrator": {
          if (config.adminEmail && config.adminPassword) {
            await administratorBootstrap.createAdmin({
              email: config.adminEmail,
              firstName: "Admin",
              lastName: "User",
              password: config.adminPassword,
              mfaEnabled: false,
              recoveryCodes: [],
              roles: administratorBootstrap.getDefaultAdminRoles(),
              permissions: administratorBootstrap.getDefaultAdminPermissions(),
            })
          }
          break
        }

        case "verify-migrations": {
          const result = await migrationRunner.verifyMigrations()
          if (!result.verified) {
            this.activeInstallation.warnings.push(
              `Migration inconsistencies: ${result.inconsistencies.join("; ")}`,
            )
          }
          break
        }

        case "verify-seeds": {
          const result = await seedManager.verifySeeds()
          if (!result.verified) {
            this.activeInstallation.warnings.push(
              `Seed inconsistencies: ${result.inconsistencies.join("; ")}`,
            )
          }
          break
        }

        case "check-health": {
          await healthValidator.validateAll()
          break
        }

        case "generate-report": {
          break
        }

        default:
          this.activeInstallation.warnings.push(`Unknown step: ${stepId}`)
      }

      step.status = "completed"
    } catch (error) {
      step.status = "failed"
      step.error = error instanceof Error ? error.message : "Step execution failed"

      if (this.activeInstallation) {
        this.activeInstallation.errors.push(
          `Step "${step.name}" failed: ${step.error}`,
        )
        this.activeInstallation.status = "failed"
      }
    } finally {
      step.completedAt = new Date()
      step.duration = Date.now() - stepStart
    }
  }

  private failInstallation(reason: string): InstallationResult {
    if (!this.activeInstallation) {
      throw new Error("No active installation")
    }
    this.activeInstallation.errors.push(reason)
    this.activeInstallation.status = "failed"
    return this.finalize(Date.now())
  }

  private finalize(startTime: number): InstallationResult {
    if (!this.activeInstallation) {
      throw new Error("No active installation")
    }

    this.activeInstallation.completedAt = new Date()

    const result = this.asResult()
    result.duration = Date.now() - startTime
    result.report = installationReport.generate(result)

    this.history.push(this.activeInstallation)
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }

    this.activeInstallation = null
    return result
  }

  private asResult(): InstallationResult {
    if (!this.activeInstallation) {
      throw new Error("No active installation")
    }
    return this.stateToResult(this.activeInstallation)
  }

  private stateToResult(state: EngineState): InstallationResult {
    return {
      id: state.id,
      mode: state.config.mode,
      environment: state.config.environment,
      version: state.config.version,
      status: state.status,
      steps: state.steps.map((s) => ({ ...s })),
      startedAt: state.startedAt,
      completedAt: state.completedAt,
      errors: [...state.errors],
      warnings: [...state.warnings],
    }
  }
}

export const installationEngine = new InstallationEngine()
