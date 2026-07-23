import { installerFacade, prerequisiteChecker } from "@/server/installer"

export async function handleValidate(): Promise<number> {
  console.log(`[${timestamp()}] Validating environment...`)

  const envResult = await installerFacade.verifyEnvironment()

  console.log(`\n  Runtime Environment:`)
  const runtimeLines = [
    `Node Version : ${envResult.result.nodeVersionValue} ${envResult.result.nodeVersion ? "\u2713" : "\u2717"}`,
    `Memory       : ${envResult.result.memoryValue} ${envResult.result.memory ? "\u2713" : "\u2717"}`,
    `Disk         : ${envResult.result.diskValue} ${envResult.result.disk ? "\u2713" : "\u2717"}`,
    `Platform     : ${envResult.result.platformValue} ${envResult.result.platform ? "\u2713" : "\u2717"}`,
    `CPU Cores    : ${envResult.result.cpuCores}`,
  ]
  for (const line of runtimeLines) {
    console.log(`    ${line}`)
  }

  if (envResult.errors.length > 0) {
    console.log(`\n  Environment Errors:`)
    for (const err of envResult.errors) {
      console.log(`    ! ${err.field}: ${err.message}`)
    }
  }

  console.log(`\n  Prerequisites:`)
  const prereqResult = await prerequisiteChecker.verifyAll()
  for (const check of prereqResult.checks) {
    const icon = check.passed ? "\u2713" : "\u2717"
    console.log(`    ${icon} ${check.name.padEnd(20)} ${check.message}`)
  }

  if (!envResult.valid) {
    console.log(`\n[${timestamp()}] Environment validation FAILED.`)
    return 1
  }

  if (!prereqResult.passed) {
    console.log(`\n[${timestamp()}] Prerequisite checks FAILED.`)
    return 1
  }

  console.log(`\n[${timestamp()}] Environment validation PASSED.`)
  return 0
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19)
}
