import { VersionMismatchError } from "../domain/persistence-errors";

export interface SchemaVersionConfig {
  major: number;
  minor: number;
  patch: number;
  name: string;
  description?: string;
  breaking: boolean;
  dependencies?: string[];
}

export class SchemaVersion {
  constructor(private readonly config: SchemaVersionConfig) {}

  get major(): number {
    return this.config.major;
  }

  get minor(): number {
    return this.config.minor;
  }

  get patch(): number {
    return this.config.patch;
  }

  get name(): string {
    return this.config.name;
  }

  get description(): string | undefined {
    return this.config.description;
  }

  get breaking(): boolean {
    return this.config.breaking;
  }

  get dependencies(): string[] {
    return this.config.dependencies ?? [];
  }

  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  isCompatible(other: SchemaVersion): boolean {
    return this.major === other.major && this.minor === other.minor;
  }

  isBreaking(other: SchemaVersion): boolean {
    return this.major !== other.major;
  }

  compare(other: SchemaVersion): -1 | 0 | 1 {
    if (this.major !== other.major) {
      return this.major > other.major ? 1 : -1;
    }
    if (this.minor !== other.minor) {
      return this.minor > other.minor ? 1 : -1;
    }
    if (this.patch !== other.patch) {
      return this.patch > other.patch ? 1 : -1;
    }
    return 0;
  }

  assertCompatible(other: SchemaVersion): void {
    if (!this.isCompatible(other)) {
      throw new VersionMismatchError(
        this.toString(),
        other.toString(),
        `Schema version ${this.toString()} is incompatible with ${other.toString()}`,
      );
    }
  }

  static fromString(version: string): SchemaVersion {
    const parts = version.split(".");
    const [major = 0, minor = 0, patch = 0] = parts.map(Number);
    return new SchemaVersion({
      major,
      minor,
      patch,
      name: `v${version}`,
      breaking: false,
    });
  }

  static parse(config: SchemaVersionConfig): SchemaVersion {
    return new SchemaVersion(config);
  }
}

export class SchemaVersionManager {
  private readonly versions = new Map<string, SchemaVersion>();
  private current?: SchemaVersion;

  register(version: SchemaVersion): void {
    this.versions.set(version.name, version);
  }

  setCurrent(version: SchemaVersion): void {
    if (this.current) {
      if (version.isBreaking(this.current)) {
        throw new VersionMismatchError(
          this.current.toString(),
          version.toString(),
          `Cannot upgrade from ${this.current.toString()} to ${version.toString()} — breaking change`,
        );
      }
    }
    this.current = version;
  }

  getCurrent(): SchemaVersion | undefined {
    return this.current;
  }

  getByName(name: string): SchemaVersion | undefined {
    return this.versions.get(name);
  }

  getAll(): SchemaVersion[] {
    return [...this.versions.values()];
  }

  getUpgradePath(from?: SchemaVersion): SchemaVersion[] {
    const start = from ?? this.current;
    if (!start) return this.getAll();
    return this.getAll()
      .filter((v) => v.compare(start) > 0)
      .sort((a, b) => a.compare(b));
  }

  getDowngradePath(from: SchemaVersion): SchemaVersion[] {
    return this.getAll()
      .filter((v) => v.compare(from) < 0)
      .sort((a, b) => b.compare(a));
  }

  has(name: string): boolean {
    return this.versions.has(name);
  }

  count(): number {
    return this.versions.size;
  }
}
