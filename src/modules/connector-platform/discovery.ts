import type {
  ConnectorKind,
  ConnectorAuthMethod,
  ConnectorCapability,
  ConnectorCategory,
} from "./types";
import type { ConnectorMetadata, ConnectorKindSummary } from "./metadata";
import { connectorMetadataRegistry } from "./metadata";

export interface DiscoveryQuery {
  capabilities?: ConnectorCapability[];
  category?: ConnectorCategory;
  authMethod?: ConnectorAuthMethod;
  search?: string;
}

export class ConnectorDiscovery {
  findProviders(query: DiscoveryQuery): ConnectorMetadata[] {
    let results = connectorMetadataRegistry.getAll();

    if (query.capabilities && query.capabilities.length > 0) {
      results = results.filter((m) =>
        query.capabilities!.every((c) => m.capabilities.includes(c)),
      );
    }

    if (query.category) {
      results = results.filter((m) => m.category === query.category);
    }

    if (query.authMethod) {
      results = results.filter((m) => m.authMethods.includes(query.authMethod!));
    }

    if (query.search) {
      results = connectorMetadataRegistry.search(query.search);
    }

    return results;
  }

  getProvider(kind: ConnectorKind): ConnectorMetadata | undefined {
    return connectorMetadataRegistry.get(kind);
  }

  listCategories(): { category: ConnectorCategory; count: number }[] {
    return connectorMetadataRegistry.listCategories();
  }

  listSummaries(): ConnectorKindSummary[] {
    return connectorMetadataRegistry.listSummaries();
  }

  getSupportedKinds(): ConnectorKind[] {
    return connectorMetadataRegistry.getAll().map((m) => m.kind);
  }
}

export const connectorDiscovery = new ConnectorDiscovery();
