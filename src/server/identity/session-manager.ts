import type { AuthenticationMethod, AuthenticatedUser, UserSession } from "./types"

let sessionIdCounter = 0

export class SessionManager {
  private sessions = new Map<string, UserSession>()
  private userSessionIndex = new Map<string, Set<string>>()

  createSession(
    userId: string,
    email: string,
    companyId: string,
    ip: string,
    ua: string,
    method: AuthenticationMethod,
    provider?: string,
  ): UserSession {
    sessionIdCounter++
    const id = `sess_${sessionIdCounter}_${Date.now()}`
    const now = new Date()
    const session: UserSession = {
      id,
      userId,
      email,
      companyId,
      ipAddress: ip,
      userAgent: ua,
      status: "active",
      authenticationMethod: method,
      identityProvider: provider,
      mfaVerified: method.startsWith("sso_") || method.startsWith("mfa_") || method === "passkey",
      lastActivityAt: now,
      expiresAt: new Date(now.getTime() + 86400000),
      createdAt: now,
    }
    this.sessions.set(id, session)
    const userSessions = this.userSessionIndex.get(userId) ?? new Set()
    userSessions.add(id)
    this.userSessionIndex.set(userId, userSessions)
    return session
  }

  getSession(sessionId: string): UserSession | undefined {
    return this.sessions.get(sessionId)
  }

  getActiveSessions(userId: string): UserSession[] {
    const sessionIds = this.userSessionIndex.get(userId)
    if (!sessionIds) return []
    return Array.from(sessionIds)
      .map((id) => this.sessions.get(id))
      .filter((s): s is UserSession => s !== undefined && s.status === "active")
  }

  getAllActiveSessions(): UserSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === "active")
  }

  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.lastActivityAt = new Date()
    }
  }

  revokeSession(sessionId: string, reason?: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    session.status = "revoked"
    session.revokedAt = new Date()
    session.revocationReason = reason
    return true
  }

  revokeAllUserSessions(userId: string, reason?: string): number {
    const sessionIds = this.userSessionIndex.get(userId)
    if (!sessionIds) return 0
    let count = 0
    for (const id of sessionIds) {
      const session = this.sessions.get(id)
      if (session && session.status === "active") {
        session.status = "revoked"
        session.revokedAt = new Date()
        session.revocationReason = reason
        count++
      }
    }
    return count
  }

  revokeAllCompanySessions(companyId: string, reason?: string): number {
    let count = 0
    for (const session of this.sessions.values()) {
      if (session.companyId === companyId && session.status === "active") {
        session.status = "revoked"
        session.revokedAt = new Date()
        session.revocationReason = reason
        count++
      }
    }
    return count
  }

  validateSession(sessionId: string): AuthenticatedUser | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null
    if (session.status !== "active") return null
    if (session.expiresAt < new Date()) {
      session.status = "expired"
      return null
    }
    session.lastActivityAt = new Date()
    return {
      id: session.userId,
      email: session.email,
      name: session.email.split("@")[0],
      roles: [],
      permissions: [],
      mfaVerified: session.mfaVerified,
      sessionId: session.id,
      identityProvider: session.identityProvider,
      companyId: session.companyId,
    }
  }

  cleanupExpiredSessions(): number {
    let count = 0
    for (const [id, session] of this.sessions) {
      if (session.expiresAt < new Date() && session.status === "active") {
        session.status = "expired"
        count++
      }
    }
    return count
  }

  countActiveSessions(): number {
    return Array.from(this.sessions.values()).filter((s) => s.status === "active").length
  }

  countActiveSessionsByUser(userId: string): number {
    return this.getActiveSessions(userId).length
  }

  getSessionByDevice(userId: string, fingerprint: string): UserSession | undefined {
    return Array.from(this.sessions.values()).find(
      (s) => s.userId === userId && s.deviceFingerprint === fingerprint && s.status === "active",
    )
  }
}

export const sessionManager = new SessionManager()
