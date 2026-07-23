import type { SessionConfig, SessionInfo } from "./types";
import { EnterpriseRoles } from "./roles";
import type { EnterpriseRoleId } from "./types";

export class EnterpriseSessionManager {
  private sessions: Map<string, SessionInfo> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();

  private config: SessionConfig = {
    idleTimeoutMinutes: 30,
    absoluteTimeoutHours: 12,
    maxConcurrentSessions: 5,
    requireDeviceFingerprint: false,
  };

  configure(config: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): SessionConfig {
    return { ...this.config };
  }

  createSession(params: {
    userId: string;
    deviceFingerprint?: string;
    ipAddress: string;
    userAgent: string;
    role: EnterpriseRoleId;
  }): SessionInfo {
    const maxSessionHours = EnterpriseRoles.getMaxSessionLifetime(params.role);
    const absoluteTimeoutMs = Math.min(
      maxSessionHours * 60 * 60 * 1000,
      this.config.absoluteTimeoutHours * 60 * 60 * 1000,
    );

    const now = Date.now();
    const session: SessionInfo = {
      sessionId: crypto.randomUUID(),
      userId: params.userId,
      deviceFingerprint: params.deviceFingerprint ?? null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      createdAt: new Date(now),
      lastActivityAt: new Date(now),
      expiresAt: new Date(now + absoluteTimeoutMs),
      revoked: false,
    };

    const existing = this.userSessions.get(params.userId) ?? new Set();
    if (existing.size >= this.config.maxConcurrentSessions) {
      const sorted = Array.from(existing)
        .map((sid) => ({ sid, session: this.sessions.get(sid)! }))
        .filter((s) => s.session && !s.session.revoked)
        .sort((a, b) => a.session.lastActivityAt.getTime() - b.session.lastActivityAt.getTime());
      if (sorted.length > 0) {
        const oldest = sorted[0];
        this.revokeSession(oldest.sid);
        existing.delete(oldest.sid);
      }
    }

    this.sessions.set(session.sessionId, session);
    existing.add(session.sessionId);
    this.userSessions.set(params.userId, existing);

    return session;
  }

  touchSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.revoked) return false;
    if (session.expiresAt < new Date()) return false;

    const idleCutoff = new Date(Date.now() - this.config.idleTimeoutMinutes * 60 * 1000);
    if (session.lastActivityAt < idleCutoff) {
      this.revokeSession(sessionId);
      return false;
    }

    session.lastActivityAt = new Date();
    return true;
  }

  validateSession(sessionId: string): { valid: boolean; session?: SessionInfo } {
    const session = this.sessions.get(sessionId);
    if (!session) return { valid: false };
    if (session.revoked) return { valid: false };
    if (session.expiresAt < new Date()) {
      this.revokeSession(sessionId);
      return { valid: false };
    }
    return { valid: true, session };
  }

  revokeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.revoked = true;

    const userSessions = this.userSessions.get(session.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }
    return true;
  }

  revokeAllUserSessions(userId: string, exceptSessionId?: string): number {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) return 0;

    let count = 0;
    for (const sessionId of userSessions) {
      if (sessionId !== exceptSessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
          session.revoked = true;
          count++;
        }
      }
    }
    this.userSessions.delete(userId);
    if (exceptSessionId) {
      this.userSessions.set(userId, new Set([exceptSessionId]));
    }
    return count;
  }

  getUserActiveSessions(userId: string): SessionInfo[] {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) return [];

    const active: SessionInfo[] = [];
    for (const sessionId of userSessions) {
      const session = this.sessions.get(sessionId);
      if (session && !session.revoked && session.expiresAt >= new Date()) {
        active.push(session);
      }
    }
    return active;
  }

  getActiveSessionCount(): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (!session.revoked && session.expiresAt >= new Date()) count++;
    }
    return count;
  }

  cleanup(): number {
    const now = new Date();
    let removed = 0;
    for (const [sessionId, session] of this.sessions) {
      if (session.revoked || session.expiresAt < now) {
        this.sessions.delete(sessionId);
        this.revokeSession(sessionId);
        removed++;
      }
    }
    return removed;
  }

  getMetrics(): {
    totalSessions: number;
    activeSessions: number;
    userIdleTimeoutMinutes: number;
    absoluteTimeoutHours: number;
    maxConcurrentSessions: number;
  } {
    return {
      totalSessions: this.sessions.size,
      activeSessions: this.getActiveSessionCount(),
      userIdleTimeoutMinutes: this.config.idleTimeoutMinutes,
      absoluteTimeoutHours: this.config.absoluteTimeoutHours,
      maxConcurrentSessions: this.config.maxConcurrentSessions,
    };
  }
}

export const enterpriseSessionManager = new EnterpriseSessionManager();
