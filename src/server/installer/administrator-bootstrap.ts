import { type AdministratorSetup } from "./types"

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  passwordHash: string
  mfaEnabled: boolean
  recoveryCodes: string[]
  roles: string[]
  permissions: string[]
  mfaSecret?: string
  createdAt: Date
  updatedAt: Date
}

export class AdministratorBootstrap {
  private admins: Map<string, AdminUser> = new Map()

  async createAdmin(setup: AdministratorSetup): Promise<AdminUser> {
    this.validatePassword(setup.password)
    this.validateEmail(setup.email)

    const id = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const now = new Date()

    const recoveryCodes = setup.recoveryCodes.length > 0
      ? setup.recoveryCodes
      : this.generateRecoveryCodes()

    const user: AdminUser = {
      id,
      email: setup.email.toLowerCase(),
      firstName: setup.firstName,
      lastName: setup.lastName,
      passwordHash: await this.hashPassword(setup.password),
      mfaEnabled: setup.mfaEnabled,
      recoveryCodes,
      roles: setup.roles,
      permissions: setup.permissions,
      ...(setup.mfaEnabled && { mfaSecret: this.generateMfaSecret() }),
      createdAt: now,
      updatedAt: now,
    }

    await this.createUserRecord(user)

    if (setup.mfaEnabled) {
      await this.configureMfa(user)
    }

    await this.assignRoles(user, setup.roles)
    await this.assignPermissions(user, setup.permissions)

    this.admins.set(id, user)
    return user
  }

  async getAdmin(id: string): Promise<AdminUser | null> {
    return this.admins.get(id) ?? null
  }

  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    return [...this.admins.values()].find(
      (a) => a.email === email.toLowerCase(),
    ) ?? null
  }

  async updateAdmin(id: string, updates: Partial<AdministratorSetup>): Promise<AdminUser | null> {
    const user = this.admins.get(id)
    if (!user) return null

    const updated: AdminUser = {
      ...user,
      ...(updates.email && { email: updates.email.toLowerCase() }),
      ...(updates.firstName && { firstName: updates.firstName }),
      ...(updates.lastName && { lastName: updates.lastName }),
      ...(updates.mfaEnabled !== undefined && { mfaEnabled: updates.mfaEnabled }),
      ...(updates.roles && { roles: updates.roles }),
      ...(updates.permissions && { permissions: updates.permissions }),
      updatedAt: new Date(),
    }

    if (updates.password) {
      this.validatePassword(updates.password)
      updated.passwordHash = await this.hashPassword(updates.password)
    }

    if (updates.mfaEnabled && !user.mfaSecret) {
      updated.mfaSecret = this.generateMfaSecret()
      updated.recoveryCodes = this.generateRecoveryCodes()
    }

    this.admins.set(id, updated)
    return updated
  }

  async verifyCredentials(email: string, password: string): Promise<boolean> {
    const user = await this.getAdminByEmail(email)
    if (!user) return false
    return this.verifyPassword(password, user.passwordHash)
  }

  validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long")
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error("Password must contain at least one uppercase letter")
    }
    if (!/[a-z]/.test(password)) {
      throw new Error("Password must contain at least one lowercase letter")
    }
    if (!/[0-9]/.test(password)) {
      throw new Error("Password must contain at least one number")
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new Error("Password must contain at least one special character")
    }
  }

  validateEmail(email: string): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email format")
    }
  }

  getDefaultAdminRoles(): string[] {
    return ["super_admin", "administrator"]
  }

  getDefaultAdminPermissions(): string[] {
    return [
      "company:read", "company:write", "company:delete",
      "users:read", "users:write", "users:delete",
      "roles:read", "roles:write", "roles:delete",
      "permissions:read", "permissions:write",
      "settings:read", "settings:write",
      "audit:read", "security:read", "security:write",
      "backup:read", "backup:write", "backup:restore",
      "migration:execute",
    ]
  }

  generateRecoveryCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      const code = Array.from({ length: 4 }, () =>
        Math.random().toString(36).slice(2, 5).toUpperCase(),
      ).join("-")
      codes.push(code)
    }
    return codes
  }

  generateMfaSecret(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    return Array.from({ length: 32 }, () =>
      chars[Math.floor(Math.random() * chars.length)],
    ).join("")
  }

  countAdmins(): number {
    return this.admins.size
  }

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import("bcryptjs")
    return bcrypt.hash(password, 12)
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import("bcryptjs")
    return bcrypt.compare(password, hash)
  }

  private async createUserRecord(_user: AdminUser): Promise<void> {
    await Promise.resolve()
  }

  private async configureMfa(_user: AdminUser): Promise<void> {
    await Promise.resolve()
  }

  private async assignRoles(_user: AdminUser, _roles: string[]): Promise<void> {
    await Promise.resolve()
  }

  private async assignPermissions(_user: AdminUser, _permissions: string[]): Promise<void> {
    await Promise.resolve()
  }
}

export const administratorBootstrap = new AdministratorBootstrap()
