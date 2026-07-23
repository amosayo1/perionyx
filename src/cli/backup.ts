import { installerFacade, backupManager } from "@/server/installer"
import type { BackupType } from "@/server/installer"

export async function handleBackup(args: string[]): Promise<number> {
  const type = (args[0] ?? "manual") as BackupType
  const validTypes: BackupType[] = ["pre-upgrade", "manual", "scheduled", "restore-point"]

  if (!validTypes.includes(type)) {
    console.error(`Invalid backup type: ${type}. Must be one of: ${validTypes.join(", ")}`)
    return 1
  }

  console.log(`[${timestamp()}] Creating ${type} backup...`)

  const manifest = await installerFacade.createBackup(type)

  const lines = [
    `Backup ID   : ${manifest.id}`,
    `Type        : ${manifest.type}`,
    `Version     : ${manifest.version}`,
    `Timestamp   : ${manifest.timestamp.toISOString()}`,
    `Status      : ${manifest.status}`,
    `Location    : ${manifest.location}`,
    `Size        : ${formatSize(manifest.size)}`,
    `Checksum    : ${manifest.checksum}`,
    `Components  : ${manifest.includes.join(", ")}`,
  ]
  for (const line of lines) {
    console.log(`  ${line}`)
  }

  if (manifest.status === "completed") {
    console.log(`\n[${timestamp()}] Backup completed.`)
    return 0
  }

  console.log(`\n[${timestamp()}] Backup failed.`)
  return 1
}

export async function handleRestore(args: string[]): Promise<number> {
  const backupId = args[0]

  if (!backupId) {
    console.error("Usage: perionyx restore <backup-id>")
    return 1
  }

  console.log(`[${timestamp()}] Restoring from backup: ${backupId}...`)

  const list = await backupManager.listBackups()
  const backup = list.find((b) => b.id === backupId)

  if (!backup) {
    console.error(`Backup not found: ${backupId}`)
    return 1
  }

  console.log(`  Restoring backup from ${backup.timestamp.toISOString()}`)
  console.log(`  Components: ${backup.includes.join(", ")}`)

  const success = await installerFacade.restoreBackup(backupId)

  if (success) {
    console.log(`\n[${timestamp()}] Restore completed successfully.`)
    return 0
  }

  console.log(`\n[${timestamp()}] Restore failed.`)
  return 1
}

export async function handleListBackups(): Promise<number> {
  const list = await backupManager.listBackups()

  if (list.length === 0) {
    console.log("No backups found.")
    return 0
  }

  console.log(`\n  Available Backups:`)
  for (const b of list) {
    const icon = b.status === "completed" ? "\u2713" : "\u2717"
    console.log(`  ${icon} ${b.id.padEnd(35)} ${b.type.padEnd(15)} ${formatSize(b.size).padStart(10)}  ${b.timestamp.toISOString().slice(0, 19)}`)
  }
  console.log(`\n  Total: ${list.length} backup(s)`)

  return 0
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19)
}
