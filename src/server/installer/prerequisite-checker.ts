import { type PrerequisiteCheck, type ValidationSeverity } from "./types"

const MIN_NODE_VERSION = 18
const MIN_MEMORY_MB = 512
const MIN_DISK_MB = 1024
const MIN_CPU_CORES = 2
const REQUIRED_PORTS = [3000, 5432, 6379]
const REQUIRED_TOOLS = ["git"]

export class PrerequisiteChecker {
  checkAll(): PrerequisiteCheck[] {
    return [
      this.checkNodeVersion(),
      this.checkMemory(),
      this.checkDisk(),
      this.checkPlatform(),
      this.checkCpuCores(),
      ...this.checkPorts(),
      ...this.checkRequiredTools(),
    ]
  }

  checkNodeVersion(): PrerequisiteCheck {
    const version = process.version
    const major = parseInt(version.replace("v", "").split(".")[0], 10)
    const passed = major >= MIN_NODE_VERSION
    return {
      name: "Node.js Version",
      description: `Node.js >= ${MIN_NODE_VERSION}.x is required`,
      required: true,
      passed,
      message: passed
        ? `Node.js ${version} detected`
        : `Node.js ${version} detected — version ${MIN_NODE_VERSION}.x or higher required`,
      severity: passed ? "info" : "error",
    }
  }

  checkMemory(): PrerequisiteCheck {
    const totalMb = Math.round(require("os").totalmem() / 1024 / 1024)
    const passed = totalMb >= MIN_MEMORY_MB
    return {
      name: "Available Memory",
      description: `At least ${MIN_MEMORY_MB}MB RAM required`,
      required: true,
      passed,
      message: passed
        ? `${totalMb}MB total memory detected`
        : `${totalMb}MB total memory detected — ${MIN_MEMORY_MB}MB minimum required`,
      severity: passed ? "info" : "error",
    }
  }

  checkDisk(): PrerequisiteCheck {
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
      const passed = freeMb >= MIN_DISK_MB
      return {
        name: "Available Disk",
        description: `At least ${MIN_DISK_MB}MB free disk space required`,
        required: true,
        passed,
        message: passed
          ? `${freeMb}MB free disk space detected`
          : `${freeMb}MB free disk space detected — ${MIN_DISK_MB}MB minimum required`,
        severity: passed ? "info" : "error",
      }
    } catch {
      return {
        name: "Available Disk",
        description: `At least ${MIN_DISK_MB}MB free disk space required`,
        required: true,
        passed: false,
        message: "Unable to determine available disk space",
        severity: "warning",
      }
    }
  }

  checkPlatform(): PrerequisiteCheck {
    const supported = ["darwin", "linux", "win32"]
    const passed = supported.includes(process.platform)
    return {
      name: "Platform Support",
      description: "macOS, Linux, or Windows required",
      required: true,
      passed,
      message: passed
        ? `${process.platform} platform detected`
        : `${process.platform} platform detected — not officially supported`,
      severity: passed ? "info" : "warning",
    }
  }

  checkCpuCores(): PrerequisiteCheck {
    const count = require("os").cpus().length
    const passed = count >= MIN_CPU_CORES
    return {
      name: "CPU Cores",
      description: `At least ${MIN_CPU_CORES} CPU cores required`,
      required: true,
      passed,
      message: passed
        ? `${count} CPU cores detected`
        : `${count} CPU cores detected — ${MIN_CPU_CORES} minimum required`,
      severity: passed ? "info" : "error",
    }
  }

  checkPorts(): PrerequisiteCheck[] {
    const net = require("net")
    return REQUIRED_PORTS.map((port) => {
      let passed = true
      try {
        const server = net.createServer()
        server.listen(port, () => {
          server.close()
        })
        server.on("error", () => {
          passed = false
        })
      } catch {
        passed = false
      }
      return {
        name: `Port ${port}`,
        description: `Port ${port} must be available`,
        required: false,
        passed,
        message: passed
          ? `Port ${port} is available`
          : `Port ${port} is already in use`,
        severity: passed ? "info" : "warning",
      } as PrerequisiteCheck
    })
  }

  checkRequiredTools(): PrerequisiteCheck[] {
    return REQUIRED_TOOLS.map((tool) => {
      let passed = false
      try {
        require("child_process").execSync(`which ${tool}`, {
          encoding: "utf8",
          timeout: 3_000,
          stdio: "ignore",
        })
        passed = true
      } catch {
        passed = false
      }
      return {
        name: `${tool}`,
        description: `${tool} must be installed`,
        required: false,
        passed,
        message: passed
          ? `${tool} is installed`
          : `${tool} is not installed`,
        severity: passed ? "info" : "warning",
      } as PrerequisiteCheck
    })
  }

  async verifyAll(): Promise<{ passed: boolean; checks: PrerequisiteCheck[] }> {
    const checks = this.checkAll()
    const failed = checks.filter((c) => c.required && !c.passed)
    return { passed: failed.length === 0, checks }
  }
}

export const prerequisiteChecker = new PrerequisiteChecker()
