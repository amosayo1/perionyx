import { type SeedManifest, type SeedState, type DeploymentEnvironment } from "./types"

export class SeedManager {
  private manifests: SeedManifest[] = []
  private seedStates: Map<string, SeedState> = new Map()

  registerManifest(manifest: SeedManifest): void {
    if (this.manifests.some((m) => m.id === manifest.id)) {
      throw new Error(`Seed manifest already registered: ${manifest.id}`)
    }
    this.manifests.push(manifest)
  }

  registerManifests(manifests: SeedManifest[]): void {
    for (const manifest of manifests) {
      this.registerManifest(manifest)
    }
  }

  getManifests(): SeedManifest[] {
    return [...this.manifests]
  }

  getManifest(id: string): SeedManifest | null {
    return this.manifests.find((m) => m.id === id) ?? null
  }

  getManifestsForEnvironment(env: DeploymentEnvironment): SeedManifest[] {
    return this.manifests.filter((m) =>
      m.environments.includes(env as any) || m.environments.length === 0,
    )
  }

  getPendingManifests(env: DeploymentEnvironment): SeedManifest[] {
    return this.getManifestsForEnvironment(env).filter(
      (m) => !this.seedStates.has(m.id) || !this.seedStates.get(m.id)!.installed,
    )
  }

  async installSeed(manifestId: string): Promise<boolean> {
    const manifest = this.manifests.find((m) => m.id === manifestId)
    if (!manifest) throw new Error(`Seed manifest not found: ${manifestId}`)

    if (this.seedStates.get(manifestId)?.installed) return true

    for (const dep of manifest.dependsOn) {
      if (!this.seedStates.get(dep)?.installed) {
        await this.installSeed(dep)
      }
    }

    try {
      await this.executeSeed(manifest)
      this.seedStates.set(manifestId, {
        manifestId,
        version: manifest.version,
        installed: true,
        installedAt: new Date(),
        checksum: this.computeChecksum(manifest),
        verified: false,
      })
      return true
    } catch {
      return false
    }
  }

  async installAll(env: DeploymentEnvironment): Promise<{
    installed: string[]
    failed: string[]
    skipped: string[]
  }> {
    const pending = this.getPendingManifests(env)
    const installed: string[] = []
    const failed: string[] = []
    const skipped: string[] = []

    const required = pending.filter((m) => m.required)
    const optional = pending.filter((m) => !m.required)

    for (const manifest of required) {
      const success = await this.installSeed(manifest.id)
      if (success) {
        installed.push(manifest.id)
      } else {
        failed.push(manifest.id)
      }
    }

    for (const manifest of optional) {
      const success = await this.installSeed(manifest.id)
      if (success) {
        installed.push(manifest.id)
      } else {
        skipped.push(manifest.id)
      }
    }

    return { installed, failed, skipped }
  }

  async reinstall(manifestId: string): Promise<boolean> {
    this.seedStates.delete(manifestId)
    return this.installSeed(manifestId)
  }

  getSeedState(manifestId: string): SeedState | null {
    return this.seedStates.get(manifestId) ?? null
  }

  getAllSeedStates(): SeedState[] {
    return [...this.seedStates.values()]
  }

  isInstalled(manifestId: string): boolean {
    return this.seedStates.get(manifestId)?.installed ?? false
  }

  isAllRequiredInstalled(env: DeploymentEnvironment): boolean {
    const required = this.getManifestsForEnvironment(env).filter((m) => m.required)
    return required.every((m) => this.seedStates.get(m.id)?.installed)
  }

  async verifySeeds(): Promise<{ verified: boolean; inconsistencies: string[] }> {
    const inconsistencies: string[] = []
    for (const [id, state] of this.seedStates) {
      const manifest = this.manifests.find((m) => m.id === id)
      if (!manifest) {
        inconsistencies.push(`Seed ${id} has no matching manifest`)
        continue
      }
      const expectedChecksum = this.computeChecksum(manifest)
      if (state.checksum !== expectedChecksum) {
        inconsistencies.push(
          `Seed ${id} checksum mismatch: expected=${expectedChecksum}, got=${state.checksum}`,
        )
      }
    }
    return { verified: inconsistencies.length === 0, inconsistencies }
  }

  clear(): void {
    this.manifests = []
    this.seedStates.clear()
  }

  private async executeSeed(_manifest: SeedManifest): Promise<void> {
    await Promise.resolve()
  }

  private computeChecksum(manifest: SeedManifest): string {
    const str = `${manifest.id}:${manifest.version}:${JSON.stringify(manifest.data)}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + chr
      hash |= 0
    }
    return `seed_${Math.abs(hash).toString(16)}`
  }
}

export const seedManager = new SeedManager()
