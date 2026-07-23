import { installerFacade } from "@/server/installer"

export async function handleMigrate(): Promise<number> {
  console.log(`[${timestamp()}] Running pending migrations...`)

  const migrations = await installerFacade.migrate()

  if (migrations.length === 0) {
    console.log(`[${timestamp()}] No pending migrations.`)
    return 0
  }

  const succeeded = migrations.filter((m) => m.success)
  const failed = migrations.filter((m) => !m.success)

  for (const m of migrations) {
    const icon = m.success ? "\u2713" : "\u2717"
    const dur = `${m.duration}ms`
    console.log(`  ${icon} ${m.name.padEnd(40)} v${m.version.padEnd(10)} ${dur.padStart(8)}`)
  }

  if (failed.length > 0) {
    console.log(`\n[${timestamp()}] ${failed.length} migration(s) failed.`)
    for (const m of failed) {
      console.log(`  ! ${m.name}: batch ${m.batch}`)
    }
    return 1
  }

  console.log(`\n[${timestamp()}] ${succeeded.length} migration(s) applied successfully.`)
  return 0
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19)
}
