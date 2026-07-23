export class RoleManager {
  private roles = new Map<string, any>()
  private userRoles = new Map<string, Set<string>>()
  private roleUsers = new Map<string, Set<string>>()

  private generateId(): string {
    return `role_${this.roles.size + 1}_${Date.now()}`
  }

  createRole(role: {
    id: string
    name: string
    description: string
    category: string
    permissions: string[]
    inherits: string[]
    isCustom: boolean
    companyId: string
  }): any {
    const now = new Date()
    const created = {
      ...role,
      id: role.id || this.generateId(),
      createdAt: now,
      updatedAt: now,
    }
    this.roles.set(created.id, created)
    this.roleUsers.set(created.id, new Set())
    return created
  }

  getRole(id: string): any | undefined {
    return this.roles.get(id)
  }

  getAllRoles(): any[] {
    return Array.from(this.roles.values())
  }

  getRolesByCompany(companyId: string): any[] {
    return Array.from(this.roles.values()).filter((r) => r.companyId === companyId)
  }

  getCustomRoles(companyId: string): any[] {
    return Array.from(this.roles.values()).filter((r) => r.companyId === companyId && r.isCustom)
  }

  updateRole(id: string, updates: Partial<any>): any | undefined {
    const existing = this.roles.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...updates, updatedAt: new Date() }
    this.roles.set(id, updated)
    return updated
  }

  deleteRole(id: string): boolean {
    this.roleUsers.delete(id)
    for (const [, userRoles] of this.userRoles) {
      userRoles.delete(id)
    }
    return this.roles.delete(id)
  }

  assignRole(userId: string, roleId: string, companyId: string, assignedBy: string): boolean {
    if (!this.roles.has(roleId)) return false
    const userSet = this.userRoles.get(userId) ?? new Set()
    userSet.add(roleId)
    this.userRoles.set(userId, userSet)
    const roleUserSet = this.roleUsers.get(roleId) ?? new Set()
    roleUserSet.add(userId)
    this.roleUsers.set(roleId, roleUserSet)
    return true
  }

  revokeRole(userId: string, roleId: string, companyId: string): boolean {
    const userSet = this.userRoles.get(userId)
    if (!userSet || !userSet.has(roleId)) return false
    userSet.delete(roleId)
    if (userSet.size === 0) this.userRoles.delete(userId)
    const roleUserSet = this.roleUsers.get(roleId)
    if (roleUserSet) {
      roleUserSet.delete(userId)
      if (roleUserSet.size === 0) this.roleUsers.delete(roleId)
    }
    return true
  }

  getUserRoles(userId: string, companyId: string): string[] {
    const userSet = this.userRoles.get(userId)
    if (!userSet) return []
    return Array.from(userSet)
      .map((id) => this.roles.get(id))
      .filter((r) => r !== undefined && r.companyId === companyId)
      .map((r) => r.id)
  }

  getUsersWithRole(roleId: string, companyId: string): string[] {
    const roleUserSet = this.roleUsers.get(roleId)
    if (!roleUserSet) return []
    return Array.from(roleUserSet)
  }

  cloneRole(sourceId: string, newId: string, name: string): any | undefined {
    const source = this.roles.get(sourceId)
    if (!source) return undefined
    const cloned = {
      ...source,
      id: newId,
      name,
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.roles.set(newId, cloned)
    this.roleUsers.set(newId, new Set())
    return cloned
  }

  count(): number {
    return this.roles.size
  }
}

export const roleManager = new RoleManager()
