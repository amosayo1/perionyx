import type {
  ConnectorKind,
  ConnectorAuthMethod,
  ConnectorCapability,
  ConnectorCategory,
} from "./types";

export interface ConnectorMetadata {
  kind: ConnectorKind;
  label: string;
  description: string;
  version: string;
  author?: string;
  icon?: string;
  docsUrl?: string;
  websiteUrl?: string;
  capabilities: ConnectorCapability[];
  authMethods: ConnectorAuthMethod[];
  category: ConnectorCategory;
  tags: string[];
  isSystem?: boolean;
}

export interface ConnectorKindSummary {
  kind: ConnectorKind;
  label: string;
  description: string;
  category: ConnectorCategory;
  capabilities: ConnectorCapability[];
  authMethods: ConnectorAuthMethod[];
  version: string;
}

class ConnectorMetadataRegistry {
  private metadata = new Map<ConnectorKind, ConnectorMetadata>();

  register(meta: ConnectorMetadata): void {
    if (this.metadata.has(meta.kind)) return;
    this.metadata.set(meta.kind, meta);
  }

  unregister(kind: ConnectorKind): void {
    this.metadata.delete(kind);
  }

  get(kind: ConnectorKind): ConnectorMetadata | undefined {
    return this.metadata.get(kind);
  }

  getAll(): ConnectorMetadata[] {
    return Array.from(this.metadata.values());
  }

  findByCapability(capability: ConnectorCapability): ConnectorMetadata[] {
    return this.getAll().filter((m) => m.capabilities.includes(capability));
  }

  findByCategory(category: ConnectorCategory): ConnectorMetadata[] {
    return this.getAll().filter((m) => m.category === category);
  }

  search(query: string): ConnectorMetadata[] {
    const lower = query.toLowerCase();
    return this.getAll().filter(
      (m) =>
        m.label.toLowerCase().includes(lower) ||
        m.description.toLowerCase().includes(lower) ||
        m.tags.some((t) => t.toLowerCase().includes(lower)),
    );
  }

  listCategories(): { category: ConnectorCategory; count: number }[] {
    const counts = new Map<ConnectorCategory, number>();
    for (const m of this.getAll()) {
      counts.set(m.category, (counts.get(m.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  toSummary(kind: ConnectorKind): ConnectorKindSummary | undefined {
    const meta = this.get(kind);
    if (!meta) return undefined;
    return {
      kind: meta.kind,
      label: meta.label,
      description: meta.description,
      category: meta.category,
      capabilities: meta.capabilities,
      authMethods: meta.authMethods,
      version: meta.version,
    };
  }

  listSummaries(): ConnectorKindSummary[] {
    return this.getAll().map((m) => ({
      kind: m.kind,
      label: m.label,
      description: m.description,
      category: m.category,
      capabilities: m.capabilities,
      authMethods: m.authMethods,
      version: m.version,
    }));
  }
}

export const connectorMetadataRegistry = new ConnectorMetadataRegistry();
