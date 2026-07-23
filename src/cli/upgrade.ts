import { installerFacade, upgradeManager } from "@/server/installer"
import { platformVersion } from "@/version"

export async function handleUpgrade(args: string[]): Promise<number> {
  const targetVersion = args[0]

  if (!targetVersion) {
    console.error("Usage: perionyx upgrade <target-version>")
    console.error("  e.g. perionyx upgrade 1.1.0")
    return 1
  }

  if (!/^\d+\.\d+\.\d+$/.test(targetVersion)) {
    console.error(`Invalid version format: ${targetVersion}. Must be semver (e.g., 1.1.0).`)
    return 1
  }

  const currentVersion = platformVersion

  console.log(`[${timestamp()}] Planning upgrade from ${currentVersion} to ${targetVersion}...`)

  const plan = await installerFacade.planUpgrade(targetVersion)

  console.log(`\n  Upgrade Plan:`)
  console.log(`    Current Version : ${plan.currentVersion}`)
  console.log(`    Target Version  : ${plan.targetVersion}`)
  console.log(`    Compatible      : ${plan.compatibility ? "Yes" : "No"}`)
  console.log(`    Migrations      : ${plan.migrations.length}`)
  console.log(`    Est. Downtime   : ${plan.estimatedDowntime}s`)

  if (!plan.compatibility) {
    console.log(`\n[${timestamp()}] Upgrade path is not compatible.`)
    return 1
  }

  const failedChecks = plan.preUpgradeChecks.filter((c) => c.required && !c.passed)
  if (failedChecks.length > 0) {
    console.log(`\n  Pre-upgrade Checks Failed:`)
    for (const check of failedChecks) {
      console.log(`    \u2717 ${check.name}: ${check.message}`)
    }
    console.log(`\n[${timestamp()}] Pre-upgrade checks failed. Aborting.`)
    return 1
  }

  if (plan.warnings.length > 0) {
    console.log(`\n  Warnings:`)
    for (const w of plan.warnings) {
      console.log(`    ! ${w}`)
    }
  }

  if (plan.migrations.length > 0) {
    console.log(`\n  Pending Migrations:`)
    for (const m of plan.migrations) {
      console.log(`    - ${m.name} (v${m.version})`)
    }
  }

  console.log(`\n[${timestamp()}] Executing upgrade...`)

  const result = await upgradeManager.executeUpgrade(currentVersion, targetVersion)

  if (result.executed) {
    console.log(`\n[${timestamp()}] Upgrade completed.`)
    console.log(`  Migrations Run   : ${result.migrationsRun}`)
    console.log(`  Migrations Failed: ${result.migrationsFailed}`)
    console.log(`  Duration         : ${(result.duration / 1000).toFixed(1)}s`)
    return 0
  }

  console.log(`\n[${timestamp()}] Upgrade failed.`)
  for (const err of result.errors) {
    console.log(`  ! ${err}`)
  }
  return 1
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19)
}
