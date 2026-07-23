import { SchemaVersion } from "./schema-version";

export interface CompatibilityResult {
  compatible: boolean;
  issues: CompatibilityIssue[];
}

export interface CompatibilityIssue {
  type: "breaking" | "warning" | "info";
  message: string;
  details?: string;
}

export interface CompatibilityMatrix {
  [versionA: string]: {
    [versionB: string]: CompatibilityResult;
  };
}

export class CompatibilityChecker {
  private readonly matrix: CompatibilityMatrix = {};

  check(source: SchemaVersion, target: SchemaVersion): CompatibilityResult {
    const issues: CompatibilityIssue[] = [];

    if (source.major !== target.major) {
      issues.push({
        type: "breaking",
        message: `Major version mismatch: ${source.major} vs ${target.major}`,
        details: "Major version changes indicate breaking schema changes",
      });
    }

    if (source.minor !== target.minor) {
      issues.push({
        type: "warning",
        message: `Minor version mismatch: ${source.minor} vs ${target.minor}`,
        details: "Minor version changes indicate backward-compatible additions",
      });
    }

    if (source.patch !== target.patch) {
      issues.push({
        type: "info",
        message: `Patch version difference: ${source.patch} vs ${target.patch}`,
        details: "Patch version changes indicate bug fixes",
      });
    }

    if (!source.isCompatible(target)) {
      issues.push({
        type: "breaking",
        message: `Incompatible schema versions: ${source.toString()} vs ${target.toString()}`,
        details: "The schemas cannot be used together",
      });
    }

    return {
      compatible: issues.filter((i) => i.type === "breaking").length === 0,
      issues,
    };
  }

  registerCompatibility(
    source: SchemaVersion,
    target: SchemaVersion,
    result: CompatibilityResult,
  ): void {
    const sourceKey = source.toString();
    const targetKey = target.toString();
    if (!this.matrix[sourceKey]) {
      this.matrix[sourceKey] = {};
    }
    this.matrix[sourceKey][targetKey] = result;
  }

  getCompatibility(
    source: SchemaVersion,
    target: SchemaVersion,
  ): CompatibilityResult | undefined {
    return this.matrix[source.toString()]?.[target.toString()];
  }

  getAllMatrices(): CompatibilityMatrix {
    return { ...this.matrix };
  }

  isUpgradeSafe(
    current: SchemaVersion,
    target: SchemaVersion,
  ): boolean {
    if (target.isBreaking(current)) return false;
    if (current.compare(target) >= 0) return false;
    return true;
  }

  isDowngradeSafe(
    current: SchemaVersion,
    target: SchemaVersion,
  ): boolean {
    if (target.major < current.major) return false;
    if (target.minor < current.minor) return false;
    return true;
  }
}

export function checkCompatibility(
  source: SchemaVersion,
  target: SchemaVersion,
): CompatibilityResult {
  const checker = new CompatibilityChecker();
  return checker.check(source, target);
}
