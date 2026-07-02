import type { TenantContext } from "@/server/context/tenant-context";
import type { IntelligenceCategory, IntelligenceEngineResult } from "./types";

export abstract class IntelligenceEngine {
  abstract readonly category: IntelligenceCategory;
  abstract readonly label: string;

  abstract evaluate(ctx: TenantContext): Promise<IntelligenceEngineResult>;
}

class EngineRegistry {
  private engines = new Map<IntelligenceCategory, IntelligenceEngine>();

  register(engine: IntelligenceEngine): void {
    if (this.engines.has(engine.category)) return;
    this.engines.set(engine.category, engine);
  }

  get(category: IntelligenceCategory): IntelligenceEngine | undefined {
    return this.engines.get(category);
  }

  getAll(): IntelligenceEngine[] {
    return Array.from(this.engines.values());
  }

  getCategories(): IntelligenceCategory[] {
    return Array.from(this.engines.keys());
  }
}

export const engineRegistry = new EngineRegistry();
