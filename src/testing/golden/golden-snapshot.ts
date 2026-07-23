import fs from "fs";
import path from "path";

export interface GoldenSnapshot {
  name: string;
  data: unknown;
  hash: string;
  updatedAt: string;
}

export class GoldenSnapshotManager {
  private snapshotDir: string;

  constructor(snapshotDir: string) {
    this.snapshotDir = snapshotDir;
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }
  }

  async match(name: string, data: unknown): Promise<boolean> {
    const filePath = this.getPath(name);
    const serialized = JSON.stringify(data, null, 2);

    if (!fs.existsSync(filePath)) {
      await fs.promises.writeFile(filePath, serialized, "utf-8");
      return true;
    }

    const existing = await fs.promises.readFile(filePath, "utf-8");
    return serialized === existing;
  }

  async update(name: string, data: unknown): Promise<void> {
    const filePath = this.getPath(name);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async get(name: string): Promise<unknown | null> {
    const filePath = this.getPath(name);
    if (!fs.existsSync(filePath)) return null;
    const content = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(content);
  }

  list(): string[] {
    if (!fs.existsSync(this.snapshotDir)) return [];
    return fs.readdirSync(this.snapshotDir)
      .filter((f) => f.endsWith(".snap"))
      .map((f) => f.replace(".snap", ""));
  }

  private getPath(name: string): string {
    return path.join(this.snapshotDir, `${name}.snap`);
  }
}
