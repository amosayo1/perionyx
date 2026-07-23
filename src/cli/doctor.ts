import { installerFacade, prerequisiteChecker, environmentValidator } from "@/server/installer"

export async function handleDoctor(): Promise<number> {
  console.log(`[${timestamp()}] Running comprehensive health check...`)
  let exitCode = 0

  console.log(`\n  === Environment ===`)
  const envResult = environmentValidator.validateAll()
  const envChecks = [
    { name: "Node Version", ok: envResult.nodeVersion, value: envResult.nodeVersionValue },
    { name: "Memory", ok: envResult.memory, value: envResult.memoryValue },
    { name: "Disk Space", ok: envResult.disk, value: envResult.diskValue },
    { name: "Platform", ok: envResult.platform, value: envResult.platformValue },
    { name: "CPU Cores", ok: true, value: `${envResult.cpuCores} cores` },
  ]
  for (const check of envChecks) {
    const icon = check.ok ? "\u2713" : "\u2717"
    console.log(`    ${icon} ${check.name.padEnd(20)} ${check.value}`)
    if (!check.ok) exitCode = 1
  }

  const envVars = environmentValidator.validateEnvironmentVariables()
  if (envVars.length > 0) {
    console.log(`\n  === Environment Variables ===`)
    for (const ev of envVars) {
      console.log(`    \u2717 ${ev.field}: ${ev.message}`)
      exitCode = 1
    }
  }

  console.log(`\n  === Prerequisites ===`)
  const prereq = await prerequisiteChecker.verifyAll()
  for (const check of prereq.checks) {
    const icon = check.passed ? "\u2713" : "\u2717"
    console.log(`    ${icon} ${check.name.padEnd(20)} ${check.message}`)
    if (check.required && !check.passed) exitCode = 1
  }

  console.log(`\n  === Health ===`)
  const health = await installerFacade.checkHealth()
  const componentEntries: [string, import("@/server/installer").ComponentStatus][] = [
    ["Database", health.database],
    ["Redis", health.redis],
    ["Queues", health.queues],
    ["Storage", health.storage],
    ["Cache", health.cache],
    ["Persistence", health.persistence],
    ["Security", health.security],
    ["Background Workers", health.backgroundWorkers],
    ["Application Services", health.applicationServices],
  ]
  for (const [name, status] of componentEntries) {
    const icon = status === "healthy" ? "\u2713" : status === "degraded" ? "~" : "\u2717"
    console.log(`    ${icon} ${name.padEnd(25)} ${status}`)
    if (status === "unhealthy") exitCode = 1
  }

  if (Object.keys(health.details).length > 0) {
    console.log(`\n  === Details ===`)
    for (const [key, val] of Object.entries(health.details)) {
      console.log(`    ${key}: ${val}`)
    }
  }

  const metrics = await installerFacade.getDeploymentMetrics()
  console.log(`\n  === Deployment Metrics ===`)
  console.log(`    Total Installations     : ${metrics.totalInstallations}`)
  console.log(`    Successful Installations: ${metrics.successfulInstallations}`)
  console.log(`    Failed Installations    : ${metrics.failedInstallations}`)

  if (exitCode === 0) {
    console.log(`\n[${timestamp()}] All checks passed. System is healthy.`)
  } else {
    console.log(`\n[${timestamp()}] Some checks failed. Review issues above.`)
  }

  return exitCode
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19)
}
