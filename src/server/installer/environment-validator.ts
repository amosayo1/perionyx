import { type EnvironmentValidationResult, type ValidationError, type DeploymentEnvironment } from "./types"

const SUPPORTED_PLATFORMS = ["darwin", "linux", "win32"]

export class EnvironmentValidator {
  validateAll(): EnvironmentValidationResult {
    return {
      nodeVersion: this.validateNodeVersion().passed,
      nodeVersionValue: process.version,
      memory: this.validateMemory().passed,
      memoryValue: `${Math.round(require("os").totalmem() / 1024 / 1024)}MB`,
      disk: this.validateDisk().passed,
      diskValue: this.getDiskValue(),
      platform: this.validatePlatform().passed,
      platformValue: process.platform,
      cpuCores: require("os").cpus().length,
    }
  }

  validateNodeVersion(): { passed: boolean; error?: string } {
    const major = parseInt(process.version.replace("v", "").split(".")[0], 10)
    if (major < 18) {
      return { passed: false, error: `Node.js >= 18 required, found ${process.version}` }
    }
    return { passed: true }
  }

  validateMemory(): { passed: boolean; error?: string } {
    const totalMb = Math.round(require("os").totalmem() / 1024 / 1024)
    if (totalMb < 512) {
      return { passed: false, error: `Minimum 512MB RAM required, found ${totalMb}MB` }
    }
    return { passed: true }
  }

  validateDisk(): { passed: boolean; error?: string } {
    try {
      const df = require("child_process").execSync(
        process.platform === "win32" ? "fsutil volume diskfree ." : "df -k .",
        { encoding: "utf8", timeout: 5_000 },
      )
      let freeKb = 0
      if (process.platform === "win32") {
        const match = df.match(/Total free bytes\s*:\s*(\d+)/)
        if (match) freeKb = parseInt(match[1], 10) / 1024
      } else {
        const lines = df.trim().split("\n")
        if (lines.length > 1) {
          const parts = lines[1].split(/\s+/)
          freeKb = parseInt(parts[3], 10)
        }
      }
      const freeMb = Math.round(freeKb / 1024)
      if (freeMb < 1024) {
        return { passed: false, error: `Minimum 1GB free disk required, found ${freeMb}MB` }
      }
      return { passed: true }
    } catch {
      return { passed: false, error: "Unable to determine disk space" }
    }
  }

  validatePlatform(): { passed: boolean; error?: string } {
    if (!SUPPORTED_PLATFORMS.includes(process.platform)) {
      return { passed: false, error: `Unsupported platform: ${process.platform}` }
    }
    return { passed: true }
  }

  validateEnvironmentVariables(): ValidationError[] {
    const errors: ValidationError[] = []
    const required = [
      "DATABASE_URL",
      "NEXTAUTH_SECRET",
      "NEXTAUTH_URL",
      "NEXT_PUBLIC_APP_VERSION",
    ]

    for (const envVar of required) {
      if (!process.env[envVar]) {
        errors.push({
          field: envVar,
          message: `Required environment variable ${envVar} is not set`,
          severity: "error",
        })
      }
    }

    return errors
  }

  validateEnvironmentProfile(env: DeploymentEnvironment): ValidationError[] {
    const errors: ValidationError[] = []
    const validEnvironments: DeploymentEnvironment[] = [
      "development", "testing", "staging", "production", "offline",
    ]
    if (!validEnvironments.includes(env)) {
      errors.push({
        field: "environment",
        message: `Invalid environment: ${env}`,
        severity: "error",
      })
    }
    return errors
  }

  async verifyRuntime(): Promise<{ valid: boolean; errors: ValidationError[]; result: EnvironmentValidationResult }> {
    const result = this.validateAll()
    const errors: ValidationError[] = []

    if (!result.nodeVersion) {
      errors.push({ field: "nodeVersion", message: result.nodeVersionValue, severity: "error" })
    }
    if (!result.memory) {
      errors.push({ field: "memory", message: result.memoryValue, severity: "error" })
    }
    if (!result.disk) {
      errors.push({ field: "disk", message: result.diskValue, severity: "error" })
    }
    if (!result.platform) {
      errors.push({ field: "platform", message: result.platformValue, severity: "error" })
    }

    errors.push(...this.validateEnvironmentVariables())

    return { valid: errors.length === 0, errors, result }
  }

  private getDiskValue(): string {
    try {
      const df = require("child_process").execSync(
        process.platform === "win32" ? "fsutil volume diskfree ." : "df -k .",
        { encoding: "utf8", timeout: 5_000 },
      )
      let freeKb = 0
      if (process.platform === "win32") {
        const match = df.match(/Total free bytes\s*:\s*(\d+)/)
        if (match) freeKb = parseInt(match[1], 10) / 1024
      } else {
        const lines = df.trim().split("\n")
        if (lines.length > 1) {
          const parts = lines[1].split(/\s+/)
          freeKb = parseInt(parts[3], 10)
        }
      }
      return `${Math.round(freeKb / 1024)}MB free`
    } catch {
      return "unknown"
    }
  }
}

export const environmentValidator = new EnvironmentValidator()
