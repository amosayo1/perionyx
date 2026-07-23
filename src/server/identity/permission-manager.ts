import { PermissionRegistry } from "../iam/permissions"
import type { GranularPermission } from "../iam/types"

export class PermissionManager {
  private userPermissions = new Map<string, Map<string, string[]>>()
  private templates = new Map<string, any>()

  private generateId(): string {
    return `template_${this.templates.size + 1}_${Date.now()}`
  }

  getAllPermissions(): string[] {
    return PermissionRegistry.getAllNames() as string[]
  }

  getCategoryPermissions(category: string): string[] {
    return PermissionRegistry.getByCategory(category as any).map((p) => p.name) as string[]
  }

  grantPermission(userId: string, permission: string, scope: string, companyId: string, grantedBy: string): boolean {
    if (!PermissionRegistry.validate(permission as GranularPermission)) return false
    const companyPermissions = this.userPermissions.get(userId) ?? new Map()
    const perms = companyPermissions.get(companyId) ?? []
    if (!perms.includes(permission)) {
      perms.push(permission)
    }
    companyPermissions.set(companyId, perms)
    this.userPermissions.set(userId, companyPermissions)
    return true
  }

  revokePermission(userId: string, permission: string, companyId: string): boolean {
    const companyPermissions = this.userPermissions.get(userId)
    if (!companyPermissions) return false
    const perms = companyPermissions.get(companyId)
    if (!perms) return false
    const idx = perms.indexOf(permission)
    if (idx === -1) return false
    perms.splice(idx, 1)
    if (perms.length === 0) companyPermissions.delete(companyId)
    if (companyPermissions.size === 0) this.userPermissions.delete(userId)
    return true
  }

  getUserPermissions(userId: string, companyId: string): string[] {
    return this.userPermissions.get(userId)?.get(companyId) ?? []
  }

  hasPermission(userId: string, permission: string, companyId: string): boolean {
    return this.getUserPermissions(userId, companyId).includes(permission)
  }

  createPermissionTemplate(template: any): any {
    const id = this.generateId()
    const created = { ...template, id, createdAt: new Date(), updatedAt: new Date() }
    this.templates.set(id, created)
    return created
  }

  applyTemplate(templateId: string, userId: string, companyId: string): boolean {
    const template = this.templates.get(templateId)
    if (!template) return false
    for (const perm of template.permissions ?? []) {
      this.grantPermission(userId, perm, "global", companyId, "template")
    }
    return true
  }

  count(): number {
    let count = 0
    for (const companyPerms of this.userPermissions.values()) {
      for (const perms of companyPerms.values()) {
        count += perms.length
      }
    }
    return count
  }
}

export const permissionManager = new PermissionManager()
