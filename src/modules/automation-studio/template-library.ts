import { BUILTIN_TEMPLATES } from "./templates";
import type {
  AutomationTemplate,
  AutomationCategory,
  TemplateVersionInfo,
  DuplicateTemplateOptions,
} from "./types";

export class TemplateLibrary {
  private templates: Map<string, AutomationTemplate>;
  private versions: Map<string, TemplateVersionInfo[]>;
  private lastIdCounter: number;

  constructor() {
    this.templates = new Map();
    this.versions = new Map();
    this.lastIdCounter = 0;
    for (const tpl of BUILTIN_TEMPLATES) {
      this.templates.set(tpl.id, { ...tpl });
      this.versions.set(tpl.id, [
        {
          version: tpl.metadata.version,
          createdAt: new Date().toISOString(),
          changelog: "Initial release",
          templateId: tpl.id,
        },
      ]);
    }
  }

  // ── Queries ───────────────────────────────────────────────────────────

  getAll(): AutomationTemplate[] {
    return Array.from(this.templates.values());
  }

  getById(id: string): AutomationTemplate | undefined {
    return this.templates.get(id);
  }

  getByCategory(category: AutomationCategory): AutomationTemplate[] {
    return this.getAll().filter((t) => t.category === category);
  }

  search(query: string): AutomationTemplate[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.metadata.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  searchByTags(tags: string[], matchAll = false): AutomationTemplate[] {
    return this.getAll().filter((t) => {
      const templateTags = new Set(t.metadata.tags.map((tag) => tag.toLowerCase()));
      const searchTags = tags.map((tag) => tag.toLowerCase());
      return matchAll
        ? searchTags.every((tag) => templateTags.has(tag))
        : searchTags.some((tag) => templateTags.has(tag));
    });
  }

  getCategories(): { category: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const tpl of this.getAll()) {
      counts.set(tpl.category, (counts.get(tpl.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  getAllTags(): string[] {
    const tagSet = new Set<string>();
    for (const tpl of this.getAll()) {
      for (const tag of tpl.metadata.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }

  getByTriggerType(triggerType: "manual" | "scheduled" | "event"): AutomationTemplate[] {
    return this.getAll().filter((t) => t.triggerType === triggerType);
  }

  getByRiskLevel(riskLevel: AutomationTemplate["metadata"]["riskLevel"]): AutomationTemplate[] {
    return this.getAll().filter((t) => t.metadata.riskLevel === riskLevel);
  }

  getByStatus(status: AutomationTemplate["status"]): AutomationTemplate[] {
    return this.getAll().filter((t) => t.status === status);
  }

  getPopular(): AutomationTemplate[] {
    return this.getAll().filter((t) => t.popularity === "high");
  }

  getTemplateCount(): number {
    return this.templates.size;
  }

  // ── Registration ──────────────────────────────────────────────────────

  register(template: AutomationTemplate): void {
    this.templates.set(template.id, template);
  }

  unregister(id: string): boolean {
    this.versions.delete(id);
    return this.templates.delete(id);
  }

  // ── Duplicate ─────────────────────────────────────────────────────────

  duplicate(id: string, options?: DuplicateTemplateOptions): AutomationTemplate | undefined {
    const original = this.templates.get(id);
    if (!original) return undefined;

    this.lastIdCounter += 1;
    const newId = `${original.id}-copy-${this.lastIdCounter}-${Date.now().toString(36)}`;

    const duplicated: AutomationTemplate = {
      ...original,
      id: newId,
      name: options?.name ?? `${original.name} (Copy)`,
      category: options?.category ?? original.category,
      status: "draft",
      metadata: {
        ...original.metadata,
        version: "1.0.0",
        tags: options?.mergeTags
          ? [...new Set([...original.metadata.tags, ...options.mergeTags])]
          : [...original.metadata.tags],
      },
    };

    this.templates.set(newId, duplicated);
    this.versions.set(newId, [
      {
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        changelog: `Duplicated from "${original.name}" (${original.id})`,
        templateId: newId,
      },
    ]);

    return duplicated;
  }

  // ── Versioning ────────────────────────────────────────────────────────

  createVersion(id: string, changelog = "Updated version"): AutomationTemplate | undefined {
    const existing = this.templates.get(id);
    if (!existing) return undefined;

    const currentVersion = existing.metadata.version;
    const parts = currentVersion.split(".").map(Number);
    parts[parts.length - 1] += 1;
    const newVersion = parts.join(".");

    const updated: AutomationTemplate = {
      ...existing,
      metadata: {
        ...existing.metadata,
        version: newVersion,
      },
    };

    this.templates.set(id, updated);

    const versionHistory = this.versions.get(id) ?? [];
    versionHistory.push({
      version: newVersion,
      createdAt: new Date().toISOString(),
      changelog,
      templateId: id,
    });
    this.versions.set(id, versionHistory);

    return updated;
  }

  getVersionHistory(id: string): TemplateVersionInfo[] {
    return this.versions.get(id) ?? [];
  }

  // ── Publishing / Archiving ────────────────────────────────────────────

  publish(id: string): AutomationTemplate | undefined {
    const existing = this.templates.get(id);
    if (!existing) return undefined;
    const updated: AutomationTemplate = { ...existing, status: "active" };
    this.templates.set(id, updated);
    return updated;
  }

  archive(id: string): AutomationTemplate | undefined {
    const existing = this.templates.get(id);
    if (!existing) return undefined;
    const updated: AutomationTemplate = { ...existing, status: "archived" };
    this.templates.set(id, updated);
    return updated;
  }

  // ── Conversion to WorkflowDefinition Input ────────────────────────────

  toWorkflowDefinitionInput(id: string, companyId: string, overrides?: {
    name?: string;
    description?: string;
    category?: string;
  }): Record<string, unknown> | undefined {
    const template = this.templates.get(id);
    if (!template) return undefined;

    return {
      companyId,
      name: overrides?.name ?? template.name,
      description: overrides?.description ?? template.description,
      category: overrides?.category ?? template.category,
      steps: JSON.parse(JSON.stringify(template.steps)),
      inputSchema: template.inputSchema ?? undefined,
      outputSchema: template.outputSchema ?? undefined,
      status: "ACTIVE",
      version: 1,
      isSystem: false,
    };
  }

  // ── Edit ──────────────────────────────────────────────────────────────

  edit(id: string, updates: Partial<Omit<AutomationTemplate, "id" | "metadata">> & {
    metadata?: Partial<AutomationTemplate["metadata"]>;
  }): AutomationTemplate | undefined {
    const existing = this.templates.get(id);
    if (!existing) return undefined;

    const updated: AutomationTemplate = {
      ...existing,
      ...updates,
      metadata: updates.metadata
        ? { ...existing.metadata, ...updates.metadata }
        : existing.metadata,
    };

    this.templates.set(id, updated);
    return updated;
  }

  // ── Bulk Operations ───────────────────────────────────────────────────

  getActiveCount(): number {
    return this.getByStatus("active").length;
  }

  getArchivedCount(): number {
    return this.getByStatus("archived").length;
  }

  getDraftCount(): number {
    return this.getByStatus("draft").length;
  }
}
