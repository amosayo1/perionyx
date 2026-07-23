import type { SecurityPolicy } from "./types"

export class PolicyEngine {
  private policies = new Map<string, SecurityPolicy>()

  private generateId(): string {
    return `pol_${this.policies.size + 1}_${Date.now()}`
  }

  createPolicy(policy: Omit<SecurityPolicy, "id" | "createdAt" | "updatedAt">): SecurityPolicy {
    const now = new Date()
    const created: SecurityPolicy = {
      ...policy,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    }
    this.policies.set(created.id, created)
    return created
  }

  updatePolicy(id: string, updates: Partial<SecurityPolicy>): SecurityPolicy | undefined {
    const existing = this.policies.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...updates, updatedAt: new Date() }
    this.policies.set(id, updated)
    return updated
  }

  getPolicy(id: string): SecurityPolicy | undefined {
    return this.policies.get(id)
  }

  getAllPolicies(): SecurityPolicy[] {
    return Array.from(this.policies.values())
  }

  getPoliciesByCompany(companyId: string): SecurityPolicy[] {
    return Array.from(this.policies.values()).filter((p) => p.companyId === companyId)
  }

  getPoliciesByCategory(category: string): SecurityPolicy[] {
    return Array.from(this.policies.values()).filter((p) => p.category === category)
  }

  deletePolicy(id: string): boolean {
    return this.policies.delete(id)
  }

  evaluatePasswordPolicy(password: string, companyId: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const companyPolicies = this.getPoliciesByCompany(companyId).filter(
      (p) => p.category === "password" && p.enabled,
    )
    if (companyPolicies.length === 0) {
      if (password.length < 8) errors.push("Minimum 8 characters required")
      return { valid: errors.length === 0, errors }
    }
    for (const policy of companyPolicies) {
      const settings = policy.settings as Record<string, any>
      if (settings.minLength && password.length < settings.minLength) {
        errors.push(`Minimum ${settings.minLength} characters required`)
      }
      if (settings.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push("Uppercase letter required")
      }
      if (settings.requireLowercase && !/[a-z]/.test(password)) {
        errors.push("Lowercase letter required")
      }
      if (settings.requireDigit && !/\d/.test(password)) {
        errors.push("Digit required")
      }
      if (settings.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
        errors.push("Special character required")
      }
      if (settings.minComplexity) {
        let score = 0
        if (/[A-Z]/.test(password)) score++
        if (/[a-z]/.test(password)) score++
        if (/\d/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++
        if (score < settings.minComplexity) {
          errors.push(`Password complexity too low (need ${settings.minComplexity} of 4 character types)`)
        }
      }
    }
    return { valid: errors.length === 0, errors }
  }

  evaluateSessionPolicy(userId: string, companyId: string): { allowed: boolean; reason?: string } {
    const companyPolicies = this.getPoliciesByCompany(companyId).filter(
      (p) => p.category === "session" && p.enabled,
    )
    for (const policy of companyPolicies) {
      const settings = policy.settings as Record<string, any>
      if (settings.maxConcurrentSessions) {
        // Would check here — placeholder for real implementation
      }
    }
    return { allowed: true }
  }

  evaluateLoginPolicy(email: string, ipAddress: string): { allowed: boolean; reason?: string } {
    const blockedIps = ["0.0.0.0", "255.255.255.255"]
    if (blockedIps.includes(ipAddress)) {
      return { allowed: false, reason: "IP address blocked" }
    }
    return { allowed: true }
  }

  count(): number {
    return this.policies.size
  }
}

export const policyEngine = new PolicyEngine()
