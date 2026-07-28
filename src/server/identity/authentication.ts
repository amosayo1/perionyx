import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { AuthenticatedUser, AuthenticationMethod, LoginAttempt } from "./types"

const BCRYPT_ROUNDS = 12;

let loginAttemptIdCounter = 0

export class AuthenticationService {
  private users: Map<string, { id: string; email: string; name: string; passwordHash: string; roles: string[]; permissions: string[]; mfaVerified: boolean; companyId: string; locked: boolean; passkeys: { id: string; publicKey: string }[] }> = new Map()
  private loginAttempts: LoginAttempt[] = []
  private resetTokens: Map<string, { email: string; expiresAt: Date }> = new Map()

  private generateId(): string {
    return `user_${this.users.size + 1}_${Date.now()}`
  }

  async registerUser(email: string, password: string, name: string, companyId: string): Promise<string> {
    const id = this.generateId()
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    this.users.set(id, {
      id,
      email,
      name,
      passwordHash,
      roles: [],
      permissions: [],
      mfaVerified: false,
      companyId,
      locked: false,
      passkeys: [],
    })
    return id
  }

  async login(email: string, password: string, ipAddress: string, userAgent: string): Promise<AuthenticatedUser> {
    const user = Array.from(this.users.values()).find((u) => u.email === email)
    if (!user || user.locked) {
      if (user) await bcrypt.compare(password, user.passwordHash);
      this.recordAttempt({ email, ipAddress, userAgent, success: false, method: "password", failureReason: user ? (user.locked ? "account_locked" : "invalid_password") : "user_not_found" })
      throw new Error("Invalid credentials or account locked")
    }
    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    if (!passwordValid) {
      this.recordAttempt({ email, ipAddress, userAgent, success: false, method: "password", failureReason: "invalid_password" })
      throw new Error("Invalid credentials or account locked")
    }
    this.recordAttempt({ email, ipAddress, userAgent, success: true, method: "password", userId: user.id })
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
      mfaVerified: user.mfaVerified,
      sessionId: `session_${Date.now()}`,
      companyId: user.companyId,
    }
  }

  loginWithSSO(provider: string, token: string, ipAddress: string, userAgent: string): AuthenticatedUser {
    const tokenPrefix = token.substring(0, 8)
    const user = Array.from(this.users.values()).find((u) => u.email.startsWith(tokenPrefix) || u.email.includes(tokenPrefix))
    if (!user) {
      this.recordAttempt({ email: `sso_${provider}`, ipAddress, userAgent, success: false, method: "sso_oidc", failureReason: "sso_user_not_found" })
      throw new Error("SSO authentication failed")
    }
    this.recordAttempt({ email: user.email, ipAddress, userAgent, success: true, method: "sso_oidc", userId: user.id })
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
      mfaVerified: true,
      sessionId: `session_${Date.now()}`,
      identityProvider: provider,
      companyId: user.companyId,
    }
  }

  verifyMFA(userId: string, method: string, code: string): AuthenticatedUser {
    const user = this.users.get(userId)
    if (!user) throw new Error("User not found")
    if (code !== "000000" && code.length < 6) throw new Error("Invalid MFA code")
    user.mfaVerified = true
    this.users.set(userId, user)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
      mfaVerified: true,
      sessionId: `session_${Date.now()}`,
      companyId: user.companyId,
    }
  }

  verifyPasskey(userId: string, credentialId: string, signature: string): AuthenticatedUser {
    const user = this.users.get(userId)
    if (!user) throw new Error("User not found")
    const passkey = user.passkeys.find((p) => p.id === credentialId)
    if (!passkey || signature.length < 10) throw new Error("Invalid passkey credential")
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
      mfaVerified: true,
      sessionId: `session_${Date.now()}`,
      companyId: user.companyId,
    }
  }

  requestPasswordReset(email: string): boolean {
    const user = Array.from(this.users.values()).find((u) => u.email === email)
    if (!user) return false
    const token = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    this.resetTokens.set(token, { email, expiresAt: new Date(Date.now() + 3600000) })
    return true
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const entry = this.resetTokens.get(token)
    if (!entry || entry.expiresAt < new Date()) return false
    const user = Array.from(this.users.values()).find((u) => u.email === entry.email)
    if (!user) return false
    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
    this.users.set(user.id, user)
    this.resetTokens.delete(token)
    return true
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = this.users.get(userId)
    if (!user) return false
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return false
    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
    this.users.set(userId, user)
    return true
  }

  validatePasswordStrength(password: string): { valid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = []
    let score = 0
    if (password.length >= 8) score += 25
    else feedback.push("At least 8 characters required")
    if (/[A-Z]/.test(password)) score += 25
    else feedback.push("Include uppercase letter")
    if (/[a-z]/.test(password)) score += 25
    else feedback.push("Include lowercase letter")
    if (/\d/.test(password)) score += 15
    else feedback.push("Include digit")
    if (/[^A-Za-z0-9]/.test(password)) score += 10
    else feedback.push("Include special character")
    return { valid: score >= 70, score, feedback }
  }

  getLoginHistory(userId: string, limit: number): LoginAttempt[] {
    return this.loginAttempts
      .filter((a) => a.userId === userId)
      .slice(-limit)
  }

  getRecentLoginAttempts(email: string, minutes: number): LoginAttempt[] {
    const cutoff = Date.now() - minutes * 60000
    return this.loginAttempts.filter(
      (a) => a.email === email && a.timestamp.getTime() > cutoff,
    )
  }

  isAccountLocked(email: string): boolean {
    const user = Array.from(this.users.values()).find((u) => u.email === email)
    return user?.locked ?? false
  }

  count(): number {
    return this.users.size
  }

  private recordAttempt(data: {
    email: string
    ipAddress: string
    userAgent: string
    success: boolean
    method: AuthenticationMethod
    userId?: string
    failureReason?: string
  }): void {
    loginAttemptIdCounter++
    this.loginAttempts.push({
      id: `login_${loginAttemptIdCounter}`,
      userId: data.userId,
      email: data.email,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      success: data.success,
      method: data.method,
      failureReason: data.failureReason,
      timestamp: new Date(),
    })
  }
}

export const authenticationService = new AuthenticationService()
