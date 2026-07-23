import { installerFacade } from "@/server/installer"
import type { InstallMode, DeploymentEnvironment } from "@/server/installer"

export async function handleInstall(args: string[]): Promise<number> {
  const mode = (args[0] ?? "fresh") as InstallMode
  const environment = (args[1] ?? (process.env.NODE_ENV as DeploymentEnvironment) ?? "development") as DeploymentEnvironment

  const validModes = ["fresh", "upgrade", "repair", "validate-only"]
  const validEnvs = ["development", "testing", "staging", "production", "offline"]

  if (!validModes.includes(mode)) {
    console.error(`Invalid mode: ${mode}. Must be one of: ${validModes.join(", ")}`)
    return 1
  }
  if (!validEnvs.includes(environment)) {
    console.error(`Invalid environment: ${environment}. Must be one of: ${validEnvs.join(", ")}`)
    return 1
  }

  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0"
  const storagePath = process.env.PERSISTENCE_STORAGE_PATH ?? process.cwd()

  console.log(`[${timestamp()}] Starting Perionyx installation...`)
  console.log(`[${timestamp()}] Mode: ${mode}, Environment: ${environment}, Version: ${version}`)

  const result = await installerFacade.install({
    mode,
    environment,
    version,
    storagePath,
    dbConnectionString: process.env.DATABASE_URL,
    redisHost: process.env.REDIS_HOST,
    companyName: process.env.COMPANY_NAME,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    baseCurrency: process.env.BASE_CURRENCY ?? "USD",
    skipPrerequisites: process.env.SKIP_PREREQUISITES === "true",
    skipMigrations: process.env.SKIP_MIGRATIONS === "true",
    skipSeeding: process.env.SKIP_SEEDING === "true",
    skipHealthCheck: process.env.SKIP_HEALTH_CHECK === "true",
    rollbackOnFailure: process.env.ROLLBACK_ON_FAILURE !== "false",
  })

  for (const step of result.steps) {
    const icon = stepIcon(step.status)
    const dur = step.duration ? `${step.duration}ms` : "---"
    console.log(`  ${icon} ${step.name.padEnd(30)} ${dur.padStart(10)}`)
    if (step.error) {
      console.log(`       Error: ${step.error}`)
    }
  }

  if (result.errors.length > 0) {
    console.log(`\n[${timestamp()}] Errors:`)
    for (const err of result.errors) {
      console.log(`  ! ${err}`)
    }
  }

  if (result.warnings.length > 0) {
    console.log(`\n[${timestamp()}] Warnings:`)
    for (const warn of result.warnings) {
      console.log(`  ? ${warn}`)
    }
  }

  const duration = result.duration ? `${(result.duration / 1000).toFixed(1)}s` : "unknown"

  if (result.status === "completed") {
    console.log(`\n[${timestamp()}] Installation completed successfully in ${duration}.`)
    return 0
  }

  if (result.status === "rolled-back") {
    console.log(`\n[${timestamp()}] Installation failed and was rolled back (${duration}).`)
    return 1
  }

  console.log(`\n[${timestamp()}] Installation failed (${duration}).`)
  return 1
}

function stepIcon(status: string): string {
  switch (status) {
    case "completed": return "\u2713"
    case "failed": return "\u2717"
    case "running": return "\u25D4"
    case "skipped": return "-"
    default: return " "
  }
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19)
}
