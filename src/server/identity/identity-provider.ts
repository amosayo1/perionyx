import type { IdentityProviderConfig, IdentityProviderConnection, IdentityProviderType } from "./types"

export class IdentityProviderManager {
  private providers = new Map<string, IdentityProviderConfig>()
  private connections = new Map<string, IdentityProviderConnection>()

  registerProvider(config: IdentityProviderConfig): void {
    this.providers.set(config.id, { ...config })
  }

  updateProvider(id: string, updates: Partial<IdentityProviderConfig>): IdentityProviderConfig | undefined {
    const existing = this.providers.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...updates, updatedAt: new Date() }
    this.providers.set(id, updated)
    return updated
  }

  getProvider(id: string): IdentityProviderConfig | undefined {
    return this.providers.get(id)
  }

  getAllProviders(): IdentityProviderConfig[] {
    return Array.from(this.providers.values())
  }

  getProvidersByCompany(companyId: string): IdentityProviderConfig[] {
    return Array.from(this.providers.values()).filter((p) => p.companyId === companyId)
  }

  getProvidersByType(type: IdentityProviderType): IdentityProviderConfig[] {
    return Array.from(this.providers.values()).filter((p) => p.type === type)
  }

  deleteProvider(id: string): boolean {
    return this.providers.delete(id)
  }

  connectProvider(config: {
    providerId: string
    userId: string
    externalId: string
    email: string
    name: string
    attributes: Record<string, unknown>
  }): IdentityProviderConnection {
    const connection: IdentityProviderConnection = {
      id: `conn_${this.connections.size + 1}_${Date.now()}`,
      providerId: config.providerId,
      userId: config.userId,
      externalId: config.externalId,
      email: config.email,
      name: config.name,
      attributes: config.attributes,
      lastSyncedAt: new Date(),
      connectedAt: new Date(),
    }
    this.connections.set(connection.id, connection)
    return connection
  }

  getConnection(userId: string, providerId: string): IdentityProviderConnection | undefined {
    return Array.from(this.connections.values()).find(
      (c) => c.userId === userId && c.providerId === providerId,
    )
  }

  getConnectionsByUser(userId: string): IdentityProviderConnection[] {
    return Array.from(this.connections.values()).filter((c) => c.userId === userId)
  }

  getConnectionsByProvider(providerId: string): IdentityProviderConnection[] {
    return Array.from(this.connections.values()).filter((c) => c.providerId === providerId)
  }

  disconnectProvider(providerId: string, userId: string): boolean {
    const conn = this.getConnection(userId, providerId)
    if (!conn) return false
    return this.connections.delete(conn.id)
  }

  countProviders(): number {
    return this.providers.size
  }

  countConnections(): number {
    return this.connections.size
  }
}

export const identityProviderManager = new IdentityProviderManager()
