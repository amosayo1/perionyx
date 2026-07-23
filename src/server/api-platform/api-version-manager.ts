import type { ApiVersion, VersionInfo, VersionStatus } from "./types";

interface VersionEntry extends VersionInfo {
  migrations?: Record<string, string>;
}

const versions = new Map<ApiVersion, VersionEntry>();

export function registerVersion(info: VersionInfo): void {
  versions.set(info.version, info);
}

export function getVersion(version: ApiVersion): VersionInfo | undefined {
  return versions.get(version);
}

export function getAllVersions(): VersionInfo[] {
  return [...versions.values()].sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());
}

export function getCurrentVersion(): ApiVersion {
  const all = getAllVersions();
  const current = all.find((v) => v.status === "current");
  return current?.version ?? "v1";
}

export function resolveVersion(requested: string): ApiVersion | undefined {
  const normalized = requested.toLowerCase().startsWith("v") ? requested.toLowerCase() : `v${requested}`;
  if (versions.has(normalized as ApiVersion)) return normalized as ApiVersion;
  for (const [key, info] of versions) {
    if (info.status === "current") return key;
  }
  return undefined;
}

export function negotiateVersion(
  acceptHeader?: string,
  urlVersion?: string,
  defaultVersion?: ApiVersion,
): { version: ApiVersion; warning?: string } {
  const target = defaultVersion ?? getCurrentVersion();
  if (urlVersion) {
    const resolved = resolveVersion(urlVersion);
    if (resolved) {
      const info = versions.get(resolved);
      if (info?.status === "sunset") {
        return { version: getCurrentVersion(), warning: `Version ${resolved} is sunset. Using ${getCurrentVersion()}.` };
      }
      if (info?.status === "deprecated") {
        return { version: resolved, warning: `Version ${resolved} is deprecated. Upgrade to ${getCurrentVersion()}.` };
      }
      return { version: resolved };
    }
  }
  if (acceptHeader) {
    const match = acceptHeader.match(/version\s*=\s*(v\d+)/i);
    if (match) {
      return negotiateVersion(undefined, match[1], defaultVersion);
    }
  }
  return { version: target };
}

export function isVersionCompatible(version: ApiVersion, minVersion: ApiVersion): boolean {
  const vNum = (v: ApiVersion) => parseInt(v.replace("v", ""), 10);
  return vNum(version) >= vNum(minVersion);
}

export function deprecateVersion(version: ApiVersion, deprecationDate: Date, sunsetDate: Date, migrationGuide: string): void {
  const entry = versions.get(version);
  if (!entry) return;
  entry.status = "deprecated";
  entry.deprecationDate = deprecationDate;
  entry.sunsetDate = sunsetDate;
  entry.migrationGuide = migrationGuide;
}

export function sunsetVersion(version: ApiVersion): void {
  const entry = versions.get(version);
  if (!entry) return;
  entry.status = "sunset";
}

export function addBreakingChange(version: ApiVersion, change: string): void {
  const entry = versions.get(version);
  if (!entry) return;
  entry.breakingChanges.push(change);
}

export function addChangelogEntry(version: ApiVersion, entry: string): void {
  const ver = versions.get(version);
  if (!ver) return;
  ver.changelog.push(entry);
}

export function setMigrationPath(version: ApiVersion, from: string, to: string): void {
  const entry = versions.get(version);
  if (!entry) {
    return;
  }
  if (!entry.migrations) entry.migrations = {};
  entry.migrations[from] = to;
}

// Initialize v1 as current
registerVersion({
  version: "v1",
  status: "current",
  releaseDate: new Date("2026-07-01"),
  breakingChanges: [],
  changelog: ["Initial API version"],
});
