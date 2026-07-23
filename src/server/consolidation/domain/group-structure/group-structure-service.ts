import type { GroupNode, EntityType } from "../../types";

export class GroupStructureService {
  private items = new Map<string, GroupNode>();

  add(node: GroupNode): GroupNode {
    this.items.set(node.entityId, node);
    return node;
  }

  get(entityId: string): GroupNode | undefined {
    return this.items.get(entityId);
  }

  getAll(): GroupNode[] {
    return Array.from(this.items.values());
  }

  getRoots(): GroupNode[] {
    return this.getAll().filter((n) => !n.parentId);
  }

  getChildren(parentId: string): GroupNode[] {
    return this.getAll().filter((n) => n.parentId === parentId);
  }

  getDescendants(entityId: string): GroupNode[] {
    const node = this.items.get(entityId);
    if (!node) return [];
    const result: GroupNode[] = [];
    const stack = [...node.children];
    while (stack.length > 0) {
      const current = stack.pop()!;
      result.push(current);
      stack.push(...current.children);
    }
    return result;
  }

  getAncestors(entityId: string): GroupNode[] {
    const result: GroupNode[] = [];
    let current = this.items.get(entityId);
    while (current && current.parentId) {
      const parent = this.items.get(current.parentId);
      if (parent) {
        result.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return result;
  }

  getDepth(entityId: string): number {
    const node = this.items.get(entityId);
    return node ? node.depth : -1;
  }

  update(id: string, updates: Partial<GroupNode>): GroupNode {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`GroupNode ${id} not found`);
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }

  delete(entityId: string): void {
    this.items.delete(entityId);
  }

  remove(entityId: string): void {
    this.delete(entityId);
  }

  rebuild(entityId: string): GroupNode {
    const node = this.items.get(entityId);
    if (!node) throw new Error(`GroupNode ${entityId} not found`);
    const ancestors = this.getAncestors(entityId);
    const depth = ancestors.length;
    const path = ancestors.length > 0
      ? ancestors.map((a) => a.entityId).concat(entityId).join("/")
      : entityId;
    return this.update(entityId, { depth, path });
  }

  buildTree(): GroupNode[] {
    const roots = this.getRoots();
    return roots.map((root) => this.buildSubTree(root));
  }

  private buildSubTree(node: GroupNode): GroupNode {
    const children = this.getChildren(node.entityId);
    return { ...node, children: children.map((c) => this.buildSubTree(c)) };
  }

  getHierarchyPath(entityId: string): string[] {
    const ancestors = this.getAncestors(entityId);
    return ancestors.map((a) => a.entityId).concat(entityId);
  }

  count(): number {
    return this.items.size;
  }

  countByType(type: EntityType): number {
    return this.getAll().filter((n) => n.entityType === type).length;
  }
}
