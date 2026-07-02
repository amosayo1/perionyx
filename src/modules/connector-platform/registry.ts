import type { IConnector } from "./interface";
import type { ConnectorKind } from "./types";

type ConnectorFactory = () => IConnector;

export class ConnectorPlatformRegistry {
  private instances = new Map<string, IConnector>();
  private factories = new Map<ConnectorKind, ConnectorFactory>();

  registerKind(kind: ConnectorKind, factory: ConnectorFactory): void {
    if (this.factories.has(kind)) return;
    this.factories.set(kind, factory);
  }

  unregisterKind(kind: ConnectorKind): void {
    this.factories.delete(kind);
  }

  createInstance(kind: ConnectorKind): IConnector {
    const factory = this.factories.get(kind);
    if (!factory) {
      throw new Error(`No connector factory registered for kind: ${kind}`);
    }
    return factory();
  }

  registerInstance(id: string, connector: IConnector): void {
    this.instances.set(id, connector);
  }

  unregisterInstance(id: string): void {
    this.instances.delete(id);
  }

  getInstance(id: string): IConnector | undefined {
    return this.instances.get(id);
  }

  getAllInstances(): IConnector[] {
    return Array.from(this.instances.values());
  }

  hasKind(kind: ConnectorKind): boolean {
    return this.factories.has(kind);
  }

  getRegisteredKinds(): ConnectorKind[] {
    return Array.from(this.factories.keys());
  }
}

export const connectorPlatformRegistry = new ConnectorPlatformRegistry();
