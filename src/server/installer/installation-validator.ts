import { type InstallationConfig, type ValidationError, type InstallMode, type DeploymentEnvironment } from "./types"

const VALID_MODES: InstallMode[] = ["fresh", "upgrade", "repair", "validate-only"]
const VALID_ENVIRONMENTS: DeploymentEnvironment[] = [
  "development", "testing", "staging", "production", "offline",
]
const VALID_CURRENCIES = [
  "USD", "EUR", "GBP", "SGD", "CNY", "BRL", "INR", "JPY", "CHF", "AUD",
]

export class InstallationValidator {
  validateConfig(config: InstallationConfig): ValidationError[] {
    const errors: ValidationError[] = []

    errors.push(...this.validateMode(config.mode))
    errors.push(...this.validateEnvironment(config.environment))
    errors.push(...this.validateVersion(config.version, config.previousVersion))
    errors.push(...this.validateDatabaseConfig(config.dbConnectionString))
    errors.push(...this.validateRedisConfig(config.redisHost))
    errors.push(...this.validateStoragePath(config.storagePath))
    errors.push(...this.validateCompanyConfig(config))
    errors.push(...this.validateAdminConfig(config))

    return errors
  }

  validateMode(mode: InstallMode): ValidationError[] {
    if (!VALID_MODES.includes(mode)) {
      return [{
        field: "mode",
        message: `Invalid install mode: ${mode}. Must be one of: ${VALID_MODES.join(", ")}`,
        severity: "error",
      }]
    }
    return []
  }

  validateEnvironment(environment: DeploymentEnvironment): ValidationError[] {
    if (!VALID_ENVIRONMENTS.includes(environment)) {
      return [{
        field: "environment",
        message: `Invalid environment: ${environment}. Must be one of: ${VALID_ENVIRONMENTS.join(", ")}`,
        severity: "error",
      }]
    }
    return []
  }

  validateVersion(version: string, previousVersion?: string): ValidationError[] {
    const errors: ValidationError[] = []
    if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
      errors.push({
        field: "version",
        message: "Version must be a valid semver string (e.g., 1.0.0)",
        severity: "error",
      })
    }
    if (previousVersion && !/^\d+\.\d+\.\d+/.test(previousVersion)) {
      errors.push({
        field: "previousVersion",
        message: "Previous version must be a valid semver string (e.g., 0.9.0)",
        severity: "error",
      })
    }
    return errors
  }

  validateDatabaseConfig(connectionString?: string): ValidationError[] {
    if (!connectionString) return []
    try {
      const url = new URL(connectionString)
      const validSchemes = ["postgresql", "postgres", "mysql", "mysql2", "sqlite"]
      if (!validSchemes.includes(url.protocol.replace(":", ""))) {
        return [{
          field: "dbConnectionString",
          message: `Unsupported database scheme: ${url.protocol}. Supported: ${validSchemes.join(", ")}`,
          severity: "warning",
        }]
      }
    } catch {
      return [{
        field: "dbConnectionString",
        message: "Invalid database connection string format",
        severity: "error",
      }]
    }
    return []
  }

  validateRedisConfig(redisHost?: string): ValidationError[] {
    if (!redisHost) return []
    try {
      const url = new URL(
        redisHost.startsWith("redis://") ? redisHost : `redis://${redisHost}`,
      )
      if (url.protocol !== "redis:" && url.protocol !== "rediss:") {
        return [{
          field: "redisHost",
          message: "Redis host must use redis:// or rediss:// scheme",
          severity: "warning",
        }]
      }
    } catch {
      return [{
        field: "redisHost",
        message: "Invalid Redis host format",
        severity: "error",
      }]
    }
    return []
  }

  validateStoragePath(storagePath?: string): ValidationError[] {
    if (!storagePath) return []
    try {
      const fs = require("fs")
      if (!fs.existsSync(storagePath)) {
        return [{
          field: "storagePath",
          message: `Storage path does not exist: ${storagePath}`,
          severity: "warning",
        }]
      }
      const stats = fs.statSync(storagePath)
      if (!stats.isDirectory()) {
        return [{
          field: "storagePath",
          message: `Storage path is not a directory: ${storagePath}`,
          severity: "error",
        }]
      }
    } catch {
      return [{
        field: "storagePath",
        message: "Unable to verify storage path",
        severity: "warning",
      }]
    }
    return []
  }

  validateCompanyConfig(config: InstallationConfig): ValidationError[] {
    const errors: ValidationError[] = []
    if (config.mode === "fresh") {
      if (!config.companyName) {
        errors.push({
          field: "companyName",
          message: "Company name is required for fresh installation",
          severity: "error",
        })
      }
      if (config.baseCurrency && !VALID_CURRENCIES.includes(config.baseCurrency.toUpperCase())) {
        errors.push({
          field: "baseCurrency",
          message: `Unsupported currency: ${config.baseCurrency}. Supported: ${VALID_CURRENCIES.join(", ")}`,
          severity: "warning",
        })
      }
      if (config.fiscalYearStart !== undefined && (config.fiscalYearStart < 1 || config.fiscalYearStart > 12)) {
        errors.push({
          field: "fiscalYearStart",
          message: "Fiscal year start month must be between 1 and 12",
          severity: "error",
        })
      }
    }
    return errors
  }

  validateAdminConfig(config: InstallationConfig): ValidationError[] {
    const errors: ValidationError[] = []
    if (config.mode === "fresh") {
      if (config.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.adminEmail)) {
        errors.push({
          field: "adminEmail",
          message: "Invalid admin email format",
          severity: "error",
        })
      }
      if (config.adminPassword && config.adminPassword.length < 8) {
        errors.push({
          field: "adminPassword",
          message: "Admin password must be at least 8 characters",
          severity: "error",
        })
      }
    }
    return errors
  }

  async verify(config: InstallationConfig): Promise<{ valid: boolean; errors: ValidationError[] }> {
    const errors = this.validateConfig(config)
    return { valid: errors.filter((e) => e.severity === "error").length === 0, errors }
  }
}

export const installationValidator = new InstallationValidator()
