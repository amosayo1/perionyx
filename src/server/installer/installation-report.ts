import {
  type InstallationResult,
  type InstallationReport,
  type InstallStatus,
  type ReportSection,
  type InstallationTiming,
  type InstallationStep,
} from "./types"

export class InstallationReportGenerator {
  private reports: Map<string, InstallationReport> = new Map()

  generate(result: InstallationResult): InstallationReport {
    const stepsCompleted = result.steps.filter((s) => s.status === "completed").length
    const stepsFailed = result.steps.filter((s) => s.status === "failed").length
    const stepsSkipped = result.steps.filter((s) => s.status === "skipped").length

    const totalDuration = result.duration ?? this.computeDuration(result.steps)
    const summary = this.buildSummary(result)
    const recommendations = this.generateRecommendations(result)

    const report: InstallationReport = {
      summary,
      stepsCompleted,
      stepsFailed,
      stepsSkipped,
      totalDuration,
      recommendations,
      status: result.status,
    }

    this.reports.set(result.id, report)
    return report
  }

  getReport(installId: string): InstallationReport | null {
    return this.reports.get(installId) ?? null
  }

  generateDetailedReport(result: InstallationResult): string {
    const lines: string[] = []
    const separator = "=".repeat(60)

    lines.push(separator)
    lines.push("PERIONYX ENTERPRISE INSTALLATION REPORT")
    lines.push(separator)
    lines.push("")
    lines.push(`Installation ID : ${result.id}`)
    lines.push(`Mode           : ${result.mode}`)
    lines.push(`Environment    : ${result.environment}`)
    lines.push(`Version        : ${result.version}`)
    lines.push(`Status         : ${result.status.toUpperCase()}`)
    lines.push(`Started        : ${result.startedAt.toISOString()}`)
    if (result.completedAt) {
      lines.push(`Completed      : ${result.completedAt.toISOString()}`)
    }
    if (result.duration) {
      lines.push(`Duration       : ${this.formatDuration(result.duration)}`)
    }
    lines.push("")

    lines.push("-".repeat(60))
    lines.push("STEPS")
    lines.push("-".repeat(60))
    lines.push("")

    for (const step of result.steps) {
      const statusIcon = this.statusIcon(step.status)
      const duration = step.duration ? this.formatDuration(step.duration) : "---"
      lines.push(`  ${statusIcon} ${step.name.padEnd(30)} ${duration}`)
      if (step.error) {
        lines.push(`       Error: ${step.error}`)
      }
    }

    lines.push("")

    if (result.errors.length > 0) {
      lines.push("-".repeat(60))
      lines.push("ERRORS")
      lines.push("-".repeat(60))
      lines.push("")
      for (const error of result.errors) {
        lines.push(`  ! ${error}`)
      }
      lines.push("")
    }

    if (result.warnings.length > 0) {
      lines.push("-".repeat(60))
      lines.push("WARNINGS")
      lines.push("-".repeat(60))
      lines.push("")
      for (const warning of result.warnings) {
        lines.push(`  ? ${warning}`)
      }
      lines.push("")
    }

    if (result.report) {
      lines.push("-".repeat(60))
      lines.push("RECOMMENDATIONS")
      lines.push("-".repeat(60))
      lines.push("")
      for (const rec of result.report.recommendations) {
        lines.push(`  * ${rec}`)
      }
      lines.push("")
    }

    lines.push(separator)
    lines.push(`REPORT GENERATED: ${new Date().toISOString()}`)
    lines.push(separator)

    return lines.join("\n")
  }

  generateSummaryReport(result: InstallationResult): string {
    const report = result.report ?? this.generate(result)
    return [
      `Installation ${result.id}: ${result.status.toUpperCase()}`,
      `  Mode: ${result.mode} | Env: ${result.environment} | Version: ${result.version}`,
      `  Steps: ${report.stepsCompleted} completed, ${report.stepsFailed} failed, ${report.stepsSkipped} skipped`,
      `  Duration: ${this.formatDuration(report.totalDuration)}`,
      `  Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`,
      `  ${report.summary}`,
    ].join("\n")
  }

  generateSections(result: InstallationResult): ReportSection[] {
    const sections: ReportSection[] = []

    sections.push({
      title: "Overview",
      content: [
        `Installation ID: ${result.id}`,
        `Mode: ${result.mode}`,
        `Environment: ${result.environment}`,
        `Version: ${result.version}`,
        `Status: ${result.status}`,
      ],
      severity: result.status === "failed" ? "error" : "info",
    })

    sections.push({
      title: "Steps Summary",
      content: result.steps.map((s) =>
        `[${this.statusIcon(s.status)}] ${s.name}${s.error ? ` — ${s.error}` : ""}`,
      ),
      severity: result.steps.some((s) => s.status === "failed") ? "error" : "info",
    })

    if (result.errors.length > 0) {
      sections.push({
        title: "Errors",
        content: result.errors,
        severity: "error",
      })
    }

    if (result.warnings.length > 0) {
      sections.push({
        title: "Warnings",
        content: result.warnings,
        severity: "warning",
      })
    }

    if (result.report && result.report.recommendations.length > 0) {
      sections.push({
        title: "Recommendations",
        content: result.report.recommendations,
        severity: "info",
      })
    }

    return sections
  }

  generateTimings(result: InstallationResult): InstallationTiming[] {
    const timings: InstallationTiming[] = []
    const baseTime = result.startedAt.getTime()

    for (const step of result.steps) {
      if (step.startedAt && step.completedAt) {
        timings.push({
          phase: step.name,
          startTime: step.startedAt.getTime() - baseTime,
          endTime: step.completedAt.getTime() - baseTime,
          duration: step.duration ?? 0,
        })
      }
    }

    return timings
  }

  compareReports(id1: string, id2: string): {
    durationDiff: number
    stepsDiff: { completed: number; failed: number; skipped: number }
  } | null {
    const r1 = this.reports.get(id1)
    const r2 = this.reports.get(id2)
    if (!r1 || !r2) return null

    return {
      durationDiff: r2.totalDuration - r1.totalDuration,
      stepsDiff: {
        completed: r2.stepsCompleted - r1.stepsCompleted,
        failed: r2.stepsFailed - r1.stepsFailed,
        skipped: r2.stepsSkipped - r1.stepsSkipped,
      },
    }
  }

  private buildSummary(result: InstallationResult): string {
    const total = result.steps.length
    const completed = result.steps.filter((s) => s.status === "completed").length
    const failed = result.steps.filter((s) => s.status === "failed").length

    if (result.status === "completed") {
      return `Installation completed successfully. All ${completed}/${total} steps completed.`
    }
    if (result.status === "failed") {
      return `Installation failed. ${completed}/${total} steps completed, ${failed} failed.`
    }
    if (result.status === "rolled-back") {
      return `Installation rolled back. ${completed}/${total} steps completed before rollback.`
    }
    return `Installation in progress (${result.status}). ${completed}/${total} steps completed.`
  }

  private generateRecommendations(result: InstallationResult): string[] {
    const recommendations: string[] = []

    if (result.errors.length > 0) {
      recommendations.push("Review error logs and address each issue before retrying")
    }

    if (result.warnings.length > 0) {
      recommendations.push("Review warnings to ensure optimal system configuration")
    }

    const failedSteps = result.steps.filter((s) => s.status === "failed")
    if (failedSteps.length > 0) {
      recommendations.push(
        `Investigate failed steps: ${failedSteps.map((s) => s.name).join(", ")}`,
      )
    }

    if (result.mode === "fresh") {
      recommendations.push("Run post-installation health check to verify all systems operational")
      recommendations.push("Review company configuration and adjust fiscal year settings if needed")
    }

    if (result.mode === "upgrade") {
      recommendations.push("Verify data integrity after upgrade")
      recommendations.push("Test all critical workflows to ensure compatibility")
    }

    if (result.environment === "production") {
      recommendations.push("Ensure all backups are verified and stored in secure location")
      recommendations.push("Monitor system performance for the first 24 hours post-installation")
    }

    return recommendations
  }

  private computeDuration(steps: InstallationStep[]): number {
    const completed = steps.filter(
      (s) => s.duration !== undefined && s.duration > 0,
    )
    if (completed.length === 0) return 0
    return completed.reduce((sum, s) => sum + (s.duration ?? 0), 0)
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  private statusIcon(status: string): string {
    switch (status) {
      case "completed": return "[OK]"
      case "failed": return "[!!]"
      case "running": return "[..]"
      case "skipped": return "[--]"
      default: return "[  ]"
    }
  }
}

export const installationReport = new InstallationReportGenerator()
