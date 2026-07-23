import { execSync } from "child_process";
import { logger } from "@/lib/logger";

export interface DependencyScanResult {
  scanned: number;
  vulnerabilities: DependencyVulnerability[];
  warnings: string[];
  safe: boolean;
  summary: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
}

export interface DependencyVulnerability {
  package: string;
  severity: "critical" | "high" | "moderate" | "low" | "info";
  title: string;
  url: string;
  fixAvailable: boolean;
}

export class DependencyScanner {
  /**
   * Run pnpm audit and parse the results.
   * Returns structured vulnerability data from the actual package manager.
   */
  scan(): DependencyScanResult {
    try {
      const output = execSync("pnpm audit --json 2>/dev/null || true", {
        encoding: "utf-8",
        timeout: 30_000,
        maxBuffer: 1024 * 1024,
      });

      return this.parseAuditJson(output);
    } catch {
      // pnpm audit exits non-zero when vulnerabilities found — that's expected
      try {
        const output = execSync("pnpm audit --json 2>&1 || true", {
          encoding: "utf-8",
          timeout: 30_000,
          maxBuffer: 1024 * 1024,
        });
        return this.parseAuditJson(output);
      } catch (err) {
        logger.error(err, "Dependency scan failed");
        return {
          scanned: 0,
          vulnerabilities: [],
          warnings: ["Dependency scan failed to execute"],
          safe: false,
          summary: { critical: 0, high: 0, moderate: 0, low: 0 },
        };
      }
    }
  }

  /**
   * Check if any critical or high severity vulnerabilities exist.
   * Used by CI to gate deployments.
   */
  hasBlockingVulnerabilities(): boolean {
    const result = this.scan();
    return result.summary.critical > 0 || result.summary.high > 0;
  }

  private parseAuditJson(output: string): DependencyScanResult {
    const vulnerabilities: DependencyVulnerability[] = [];
    const warnings: string[] = [];
    let scanned = 0;

    try {
      // pnpm audit --json outputs newline-delimited JSON
      const lines = output.trim().split("\n").filter((l) => l.startsWith("{"));
      for (const line of lines) {
        const entry = JSON.parse(line);
        if (entry.type === "auditAdvisory") {
          const advisory = entry.data?.advisory;
          if (advisory) {
            vulnerabilities.push({
              package: advisory.module_name ?? "unknown",
              severity: advisory.severity ?? "info",
              title: advisory.title ?? "Unknown vulnerability",
              url: advisory.url ?? "",
              fixAvailable: !!advisory.patched_versions,
            });
          }
        }
        if (entry.type === "auditSummary") {
          scanned = entry.data?.totalDependencies ?? 0;
        }
      }
    } catch {
      warnings.push("Could not parse audit output as JSON; falling back to text parsing");
      // Fallback: parse text output
      const severityCounts = { critical: 0, high: 0, moderate: 0, low: 0 };
      for (const line of output.split("\n")) {
        const lower = line.toLowerCase();
        if (lower.includes("critical")) severityCounts.critical++;
        else if (lower.includes("high")) severityCounts.high++;
        else if (lower.includes("moderate")) severityCounts.moderate++;
        else if (lower.includes("low")) severityCounts.low++;
      }
      return {
        scanned: 0,
        vulnerabilities: [],
        warnings,
        safe: severityCounts.critical === 0 && severityCounts.high === 0,
        summary: severityCounts,
      };
    }

    const summary = { critical: 0, high: 0, moderate: 0, low: 0 };
    for (const v of vulnerabilities) {
      if (v.severity in summary) summary[v.severity as keyof typeof summary]++;
    }

    return {
      scanned,
      vulnerabilities,
      warnings,
      safe: summary.critical === 0 && summary.high === 0,
      summary,
    };
  }
}

export const dependencyScanner = new DependencyScanner();
