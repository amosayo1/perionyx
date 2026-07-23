import type { PostingBatch, PostingRule, PostingTemplate, PostingStatus, PostingError } from "../../types";

export class PostingService {
  private batches = new Map<string, PostingBatch>();
  private rules = new Map<string, PostingRule>();
  private templates = new Map<string, PostingTemplate>();
  private errors = new Map<string, PostingError>();

  createBatch(batch: PostingBatch): PostingBatch {
    this.batches.set(batch.id, batch);
    return batch;
  }

  getBatch(id: string): PostingBatch | undefined {
    return this.batches.get(id);
  }

  getAllBatches(): PostingBatch[] {
    return Array.from(this.batches.values());
  }

  approveBatch(id: string, userId: string): PostingBatch | undefined {
    const batch = this.batches.get(id);
    if (!batch) return undefined;
    const updated = { ...batch, status: "approved" as PostingStatus, approvedBy: userId, approvedAt: new Date(), updatedAt: new Date() };
    this.batches.set(id, updated);
    return updated;
  }

  postBatch(id: string, userId: string): PostingBatch | undefined {
    const batch = this.batches.get(id);
    if (!batch) return undefined;
    const updated = { ...batch, status: "posted" as PostingStatus, postedBy: userId, postedAt: new Date(), updatedAt: new Date() };
    this.batches.set(id, updated);
    return updated;
  }

  reverseBatch(id: string, userId: string): PostingBatch | undefined {
    const batch = this.batches.get(id);
    if (!batch) return undefined;
    const updated = { ...batch, status: "reversed" as PostingStatus, postedBy: userId, postedAt: new Date(), updatedAt: new Date() };
    this.batches.set(id, updated);
    return updated;
  }

  getByStatus(status: PostingStatus): PostingBatch[] {
    return this.getAllBatches().filter(b => b.status === status);
  }

  addRule(rule: PostingRule): PostingRule {
    this.rules.set(rule.id, rule);
    return rule;
  }

  getRule(id: string): PostingRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): PostingRule[] {
    return Array.from(this.rules.values());
  }

  addTemplate(template: PostingTemplate): PostingTemplate {
    this.templates.set(template.id, template);
    return template;
  }

  getTemplate(id: string): PostingTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): PostingTemplate[] {
    return Array.from(this.templates.values());
  }

  addError(error: PostingError): PostingError {
    this.errors.set(error.id, error);
    return error;
  }

  getError(id: string): PostingError | undefined {
    return this.errors.get(id);
  }

  getAllErrors(): PostingError[] {
    return Array.from(this.errors.values());
  }

  getUnresolvedErrors(): PostingError[] {
    return this.getAllErrors().filter(e => !e.resolved);
  }

  count(): number {
    return this.batches.size;
  }

  countRules(): number {
    return this.rules.size;
  }

  countTemplates(): number {
    return this.templates.size;
  }

  countErrors(): number {
    return this.errors.size;
  }
}
