type VersionEntry = {
  version: string;
  timestamp: Date;
};

export type VersionChange = {
  id: string;
  connectionId: string;
  version: number;
  timestamp: Date;
  details?: string;
};

const providerVersions = new Map<string, VersionEntry>();
const connectionVersions = new Map<string, number>();
const versionHistories = new Map<string, VersionChange[]>();

export function registerProviderVersion(providerId: string, version: string): void {
  providerVersions.set(providerId, {
    version,
    timestamp: new Date(),
  });
}

export function getProviderVersion(providerId: string): string | undefined {
  return providerVersions.get(providerId)?.version;
}

export function getConnectionVersion(connectionId: string): number {
  return connectionVersions.get(connectionId) ?? 1;
}

export function bumpConnectionVersion(
  connectionId: string,
  details?: string,
): number {
  const current = connectionVersions.get(connectionId) ?? 1;
  const next = current + 1;
  connectionVersions.set(connectionId, next);

  const change: VersionChange = {
    id: crypto.randomUUID(),
    connectionId,
    version: next,
    timestamp: new Date(),
    details,
  };

  if (!versionHistories.has(connectionId)) {
    versionHistories.set(connectionId, []);
  }
  versionHistories.get(connectionId)!.push(change);

  return next;
}

export function getVersionHistory(
  connectionId: string,
  limit = 50,
): VersionChange[] {
  const history = versionHistories.get(connectionId) ?? [];
  return history.slice(-limit);
}

export function clearVersionHistory(connectionId: string): void {
  versionHistories.delete(connectionId);
}

export function clearAllVersions(): void {
  providerVersions.clear();
  connectionVersions.clear();
  versionHistories.clear();
}
