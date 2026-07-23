export type MigrationDirection = "up" | "down";

export interface MigrationVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface MigrationDependency {
  name: string;
  version: MigrationVersion;
}

export interface MigrationDefinition {
  name: string;
  version: MigrationVersion;
  description: string;
  dependencies: MigrationDependency[];
  checksum: string;
  timestamp: Date;

  up(): Promise<void>;
  down(): Promise<void>;
  validate(): Promise<boolean>;
  seed?(): Promise<void>;
}

export abstract class Migration implements MigrationDefinition {
  public abstract readonly name: string;
  public abstract readonly version: MigrationVersion;
  public abstract readonly description: string;

  get dependencies(): MigrationDependency[] {
    return [];
  }

  get checksum(): string {
    return Migration.generateChecksum(this.name, this.version);
  }

  get timestamp(): Date {
    return new Date();
  }

  abstract up(): Promise<void>;
  abstract down(): Promise<void>;

  async validate(): Promise<boolean> {
    return true;
  }

  async seed(): Promise<void> {
  }

  static generateChecksum(name: string, version: MigrationVersion): string {
    const input = `${name}-${version.major}.${version.minor}.${version.patch}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  static versionToString(version: MigrationVersion): string {
    return `${version.major}.${version.minor}.${version.patch}`;
  }

  static compareVersions(a: MigrationVersion, b: MigrationVersion): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }
}
