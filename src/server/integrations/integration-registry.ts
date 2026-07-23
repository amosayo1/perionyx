import type {
  ProviderConfig,
  ConnectionConfig,
  ConnectionStatus,
  ProviderCategory,
  Capability,
  ProviderCapabilities,
} from "./types";
import type { IntegrationProvider } from "./integration-provider";

type ProviderFactory = () => Promise<{ default: IntegrationProvider }>;

export class IntegrationRegistry {
  private static instance: IntegrationRegistry;

  private readonly providers = new Map<string, ProviderConfig>();
  private readonly providerFactories = new Map<string, ProviderFactory>();
  private readonly providerInstances = new Map<string, IntegrationProvider>();
  private readonly categoryIndex = new Map<ProviderCategory, Set<string>>();
  private readonly connections = new Map<string, ConnectionConfig>();
  private readonly companyConnections = new Map<string, Set<string>>();

  private constructor() {}

  static getInstance(): IntegrationRegistry {
    if (!IntegrationRegistry.instance) {
      IntegrationRegistry.instance = new IntegrationRegistry();
    }
    return IntegrationRegistry.instance;
  }

  registerProvider(category: ProviderCategory, providerFactory: ProviderFactory): string {
    const id = crypto.randomUUID();
    this.providerFactories.set(id, providerFactory);

    if (!this.categoryIndex.has(category)) {
      this.categoryIndex.set(category, new Set());
    }
    this.categoryIndex.get(category)!.add(id);
    return id;
  }

  registerProviderInstance(providerId: string, instance: IntegrationProvider): void {
    this.providerInstances.set(providerId, instance);
    this.providers.set(providerId, instance.config);
    if (!this.categoryIndex.has(instance.config.category)) {
      this.categoryIndex.set(instance.config.category, new Set());
    }
    this.categoryIndex.get(instance.config.category)!.add(providerId);
  }

  getProvider(providerId: string): ProviderConfig | undefined {
    return this.providers.get(providerId);
  }

  resolve(providerId: string): IntegrationProvider | undefined {
    return this.providerInstances.get(providerId);
  }

  getProvidersByCategory(category: ProviderCategory): ProviderConfig[] {
    const ids = this.categoryIndex.get(category);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.providers.get(id))
      .filter((p): p is ProviderConfig => p !== undefined);
  }

  discover(category?: ProviderCategory): ProviderConfig[] {
    if (category) {
      return this.getProvidersByCategory(category);
    }
    return this.getAllProviders();
  }

  listCapabilities(category?: ProviderCategory): Map<string, ProviderCapabilities> {
    const result = new Map<string, ProviderCapabilities>();
    const providers = category ? this.getProvidersByCategory(category) : this.getAllProviders();
    for (const p of providers) {
      result.set(p.id, p.capabilities);
    }
    return result;
  }

  registerConnection(connection: ConnectionConfig): void {
    this.connections.set(connection.id, connection);

    if (!this.companyConnections.has(connection.companyId)) {
      this.companyConnections.set(connection.companyId, new Set());
    }
    this.companyConnections.get(connection.companyId)!.add(connection.id);
  }

  getConnection(connectionId: string): ConnectionConfig | undefined {
    return this.connections.get(connectionId);
  }

  getConnectionsByCompany(companyId: string): ConnectionConfig[] {
    const ids = this.companyConnections.get(companyId);
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.connections.get(id))
      .filter((c): c is ConnectionConfig => c !== undefined);
  }

  updateConnectionStatus(connectionId: string, status: ConnectionStatus): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = status;
      connection.updatedAt = new Date();
    }
  }

  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      this.providerInstances.delete(connection.providerId);
      const companySet = this.companyConnections.get(connection.companyId);
      if (companySet) {
        companySet.delete(connectionId);
        if (companySet.size === 0) {
          this.companyConnections.delete(connection.companyId);
        }
      }
    }
  }

  getAllProviders(): ProviderConfig[] {
    return Array.from(this.providers.values());
  }

  getProviderFactory(providerId: string): ProviderFactory | undefined {
    return this.providerFactories.get(providerId);
  }

  registerProviderConfig(providerId: string, config: ProviderConfig): void {
    this.providers.set(providerId, config);
    if (!this.categoryIndex.has(config.category)) {
      this.categoryIndex.set(config.category, new Set());
    }
    this.categoryIndex.get(config.category)!.add(providerId);
  }

  hasProvider(providerId: string): boolean {
    return this.providers.has(providerId);
  }

  getProviderCount(): number {
    return this.providers.size;
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  reset(): void {
    this.providers.clear();
    this.providerFactories.clear();
    this.providerInstances.clear();
    this.categoryIndex.clear();
    this.connections.clear();
    this.companyConnections.clear();
  }
}

export const integrationRegistry = IntegrationRegistry.getInstance();
