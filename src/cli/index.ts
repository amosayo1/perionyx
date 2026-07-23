#!/usr/bin/env node
import { handleInstall } from "./install"
import { handleValidate } from "./validate"
import { handleMigrate } from "./migrate"
import { handleDoctor } from "./doctor"
import { handleBackup, handleRestore, handleListBackups } from "./backup"
import { handleUpgrade } from "./upgrade"
import { handleVersion } from "./version"

const COMMANDS = [
  "install",
  "validate",
  "migrate",
  "seed",
  "backup",
  "restore",
  "list-backups",
  "upgrade",
  "doctor",
  "health",
  "version",
] as const

type Command = (typeof COMMANDS)[number]

function help(): void {
  console.log(`Perionyx Enterprise Deployment CLI`)
  console.log(``)
  console.log(`Usage: perionyx <command> [options]`)
  console.log(``)
  console.log(`Commands:`)
  console.log(`  install [mode] [env]    Run installation (mode: fresh|upgrade|repair|validate-only)`)
  console.log(`  validate                Validate environment and prerequisites`)
  console.log(`  migrate                 Run pending database migrations`)
  console.log(`  seed                    Seed data for current environment`)
  console.log(`  backup [type]           Create backup (type: manual|pre-upgrade|scheduled|restore-point)`)
  console.log(`  restore <backup-id>     Restore from a backup`)
  console.log(`  list-backups            List available backups`)
  console.log(`  upgrade <version>       Upgrade system to target version`)
  console.log(`  doctor                  Comprehensive system health check`)
  console.log(`  health                  Quick health status`)
  console.log(`  version                 Show version information`)
  console.log(`  help                    Show this help`)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const rawCommand = args[0]

  if (!rawCommand || rawCommand === "help" || rawCommand === "--help" || rawCommand === "-h") {
    help()
    process.exit(0)
  }

  if (!COMMANDS.includes(rawCommand as Command)) {
    console.error(`Unknown command: ${rawCommand}`)
    console.error(`Run 'perionyx help' for usage.`)
    process.exit(1)
  }

  const command = rawCommand as Command

  let exitCode: number

  switch (command) {
    case "install":
      exitCode = await handleInstall(args.slice(1))
      break
    case "validate":
      exitCode = await handleValidate()
      break
    case "migrate":
      exitCode = await handleMigrate()
      break
    case "seed": {
      const { seedManager } = await import("@/server/installer")
      const env = (args[1] ?? process.env.NODE_ENV ?? "development") as import("@/server/installer").DeploymentEnvironment
      console.log(`[${timestamp()}] Seeding data for ${env} environment...`)
      const result = await seedManager.installAll(env)
      if (result.failed.length > 0) {
        console.log(`  Installed: ${result.installed.length}, Failed: ${result.failed.length}, Skipped: ${result.skipped.length}`)
        for (const id of result.failed) {
          console.log(`  \u2717 Failed: ${id}`)
        }
        exitCode = 1
      } else {
        console.log(`  Installed: ${result.installed.length}, Skipped: ${result.skipped.length}`)
        exitCode = 0
      }
      break
    }
    case "backup":
      exitCode = await handleBackup(args.slice(1))
      break
    case "restore":
      exitCode = await handleRestore(args.slice(1))
      break
    case "list-backups":
      exitCode = await handleListBackups()
      break
    case "upgrade":
      exitCode = await handleUpgrade(args.slice(1))
      break
    case "doctor":
      exitCode = await handleDoctor()
      break
    case "health": {
      const { healthValidator } = await import("@/server/installer")
      console.log(`[${timestamp()}] Checking health...`)
      const health = await healthValidator.getOverallHealth()
      const icon = health.status === "healthy" ? "\u2713" : health.status === "degraded" ? "~" : "\u2717"
      console.log(`  Status: ${icon} ${health.status} (score: ${health.score}%)`)
      if (health.details.length > 0) {
        for (const d of health.details) {
          const ci = d.status === "healthy" ? "\u2713" : d.status === "degraded" ? "~" : "\u2717"
          console.log(`    ${ci} ${d.name.padEnd(25)} ${d.status} (${d.latencyMs}ms)`)
        }
      }
      exitCode = health.status === "unhealthy" ? 1 : 0
      break
    }
    case "version":
      exitCode = await handleVersion()
      break
    default:
      help()
      exitCode = 0
  }

  process.exit(exitCode)
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19)
}

main().catch((err) => {
  console.error(`Fatal error:`, err)
  process.exit(1)
})
