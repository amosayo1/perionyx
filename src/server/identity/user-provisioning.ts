import type { IdentityProviderType, ProvisionedUser, ProvisioningStatus } from "./types"

export class UserProvisioningService {
  private users = new Map<string, ProvisionedUser>()
  private externalIdIndex = new Map<string, string>()

  private generateId(): string {
    return `prov_${this.users.size + 1}_${Date.now()}`
  }

  provisionUser(user: Omit<ProvisionedUser, "id" | "createdAt" | "updatedAt">): ProvisionedUser {
    const now = new Date()
    const provisioned: ProvisionedUser = {
      ...user,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    }
    this.users.set(provisioned.id, provisioned)
    this.externalIdIndex.set(provisioned.externalId, provisioned.id)
    return provisioned
  }

  deprovisionUser(userId: string): boolean {
    const user = this.users.get(userId)
    if (!user) return false
    this.externalIdIndex.delete(user.externalId)
    return this.users.delete(userId)
  }

  updateProvisionedUser(userId: string, updates: Partial<ProvisionedUser>): ProvisionedUser | undefined {
    const existing = this.users.get(userId)
    if (!existing) return undefined
    const updated = { ...existing, ...updates, updatedAt: new Date() }
    this.users.set(userId, updated)
    if (updated.externalId !== existing.externalId) {
      this.externalIdIndex.delete(existing.externalId)
      this.externalIdIndex.set(updated.externalId, userId)
    }
    return updated
  }

  getProvisionedUser(userId: string): ProvisionedUser | undefined {
    return this.users.get(userId)
  }

  getProvisionedUserByExternalId(externalId: string): ProvisionedUser | undefined {
    const userId = this.externalIdIndex.get(externalId)
    if (!userId) return undefined
    return this.users.get(userId)
  }

  getAllProvisionedUsers(): ProvisionedUser[] {
    return Array.from(this.users.values())
  }

  getProvisionedUsersByCompany(companyId: string): ProvisionedUser[] {
    return Array.from(this.users.values()).filter((u) => u.companyId === companyId)
  }

  getProvisionedUsersBySource(source: IdentityProviderType): ProvisionedUser[] {
    return Array.from(this.users.values()).filter((u) => u.source === source)
  }

  syncUser(externalId: string, attributes: Record<string, unknown>): ProvisionedUser {
    const existing = this.getProvisionedUserByExternalId(externalId)
    if (existing) {
      return this.updateProvisionedUser(existing.id, {
        email: (attributes.email as string) ?? existing.email,
        firstName: (attributes.firstName as string) ?? existing.firstName,
        lastName: (attributes.lastName as string) ?? existing.lastName,
        displayName: (attributes.displayName as string) ?? existing.displayName,
        department: (attributes.department as string) ?? existing.department,
        jobTitle: (attributes.jobTitle as string) ?? existing.jobTitle,
        phone: (attributes.phone as string) ?? existing.phone,
        status: "synced",
        lastSyncedAt: new Date(),
      })!
    }
    return this.provisionUser({
      externalId,
      email: (attributes.email as string) ?? `user_${externalId}@unknown.com`,
      firstName: (attributes.firstName as string) ?? "Unknown",
      lastName: (attributes.lastName as string) ?? "User",
      displayName: (attributes.displayName as string) ?? `User ${externalId}`,
      department: attributes.department as string | undefined,
      jobTitle: attributes.jobTitle as string | undefined,
      phone: attributes.phone as string | undefined,
      source: (attributes.source as IdentityProviderType) ?? "oidc",
      status: "synced",
      groups: (attributes.groups as string[]) ?? [],
      roles: (attributes.roles as string[]) ?? [],
      lastSyncedAt: new Date(),
      companyId: (attributes.companyId as string) ?? "default",
    })
  }

  bulkProvision(users: Array<Omit<ProvisionedUser, "id" | "createdAt" | "updatedAt">>): ProvisionedUser[] {
    return users.map((u) => this.provisionUser(u))
  }

  getSyncStatus(): { total: number; synced: number; pending: number; failed: number; orphaned: number } {
    const all = Array.from(this.users.values())
    return {
      total: all.length,
      synced: all.filter((u) => u.status === "synced").length,
      pending: all.filter((u) => u.status === "pending").length,
      failed: all.filter((u) => u.status === "failed").length,
      orphaned: all.filter((u) => u.status === "orphaned").length,
    }
  }

  importUsers(file: { name: string; data: string }): { imported: number; failed: number; errors: string[] } {
    const errors: string[] = []
    let imported = 0
    let failed = 0
    try {
      const lines = file.data.split("\n").filter((l) => l.trim())
      for (let i = 1; i < lines.length; i++) {
        try {
          const fields = lines[i].split(",")
          if (fields.length < 3) {
            failed++
            continue
          }
          this.provisionUser({
            externalId: fields[0].trim(),
            email: fields[1].trim(),
            firstName: fields[2].trim(),
            lastName: fields[3]?.trim() ?? "",
            displayName: `${fields[2].trim()} ${fields[3]?.trim() ?? ""}`.trim(),
            source: "oidc",
            status: "pending",
            groups: [],
            roles: [],
            companyId: "default",
          })
          imported++
        } catch {
          failed++
          errors.push(`Failed to import line ${i + 1}`)
        }
      }
    } catch (e) {
      errors.push(`Parse error: ${e}`)
    }
    return { imported, failed, errors }
  }

  count(): number {
    return this.users.size
  }
}

export const userProvisioningService = new UserProvisioningService()
