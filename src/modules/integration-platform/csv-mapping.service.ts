import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ImportTemplateData, FieldMapping, MappingSourceType } from "./types";

export class CsvMappingService {
  static async createTemplate(ctx: TenantContext, data: { name: string; sourceType: string; mapping: FieldMapping[]; isShared?: boolean }): Promise<ImportTemplateData> {
    const template = await prisma.importTemplate.create({
      data: { companyId: ctx.companyId, name: data.name, sourceType: data.sourceType as MappingSourceType, mapping: data.mapping as any, isShared: data.isShared ?? false, createdBy: ctx.userId },
    });
    return this.toTemplateData(template);
  }

  static async getTemplate(ctx: TenantContext, templateId: string): Promise<ImportTemplateData | null> {
    const template = await prisma.importTemplate.findFirst({ where: { id: templateId, companyId: ctx.companyId } });
    return template ? this.toTemplateData(template) : null;
  }

  static async listTemplates(ctx: TenantContext, opts?: { sourceType?: string }): Promise<ImportTemplateData[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (opts?.sourceType) where.sourceType = opts.sourceType;
    const templates = await prisma.importTemplate.findMany({ where, orderBy: { updatedAt: "desc" } });
    return templates.map(t => this.toTemplateData(t));
  }

  static async updateTemplate(ctx: TenantContext, templateId: string, data: Partial<ImportTemplateData>): Promise<ImportTemplateData> {
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.mapping) updateData.mapping = data.mapping;
    if (data.isShared != null) updateData.isShared = data.isShared;
    if (data.isActive != null) updateData.isActive = data.isActive;
    const template = await prisma.importTemplate.update({ where: { id: templateId }, data: updateData });
    return this.toTemplateData(template);
  }

  static async deleteTemplate(ctx: TenantContext, templateId: string): Promise<void> {
    await prisma.importTemplate.delete({ where: { id: templateId } });
  }

  static async saveMappingRules(ctx: TenantContext, templateId: string, rules: FieldMapping[]): Promise<void> {
    const template = await prisma.importTemplate.findFirst({ where: { id: templateId, companyId: ctx.companyId } });
    if (!template) throw new Error("Template not found");
    await prisma.csvMappingRule.deleteMany({ where: { templateId } });
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      await prisma.csvMappingRule.create({
        data: { templateId, companyId: ctx.companyId, sourceColumn: rule.sourceColumn, targetField: rule.targetField, defaultValue: rule.defaultValue, transform: rule.transform, isRequired: rule.isRequired, validation: rule.validation, order: rule.order },
      });
    }
    await prisma.importTemplate.update({ where: { id: templateId }, data: { mapping: rules as any } });
  }

  static async applyMapping(ctx: TenantContext, templateId: string, rows: Record<string, string>[]): Promise<{ mapped: Record<string, unknown>[]; errors: string[] }> {
    const template = await prisma.importTemplate.findFirst({ where: { id: templateId, companyId: ctx.companyId } });
    if (!template) throw new Error("Template not found");
    const mapping = template.mapping as any as FieldMapping[];
    const mapped: Record<string, unknown>[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const result: Record<string, unknown> = {};
      for (const rule of mapping) {
        let value: string | undefined = row[rule.sourceColumn];
        if ((value === undefined || value === "") && rule.defaultValue) {
          value = rule.defaultValue;
        }
        if (rule.transform === "number") result[rule.targetField] = Number(value);
        else if (rule.transform === "date") result[rule.targetField] = value ? new Date(value).toISOString() : null;
        else if (rule.transform === "uppercase") result[rule.targetField] = value?.toUpperCase();
        else if (rule.transform === "lowercase") result[rule.targetField] = value?.toLowerCase();
        else result[rule.targetField] = value;
      }
      mapped.push(result);
    }
    return { mapped, errors };
  }

  static async previewMapping(ctx: TenantContext, templateId: string, rows: Record<string, string>[]): Promise<{ preview: Record<string, unknown>[]; issues: string[] }> {
    const result = await this.applyMapping(ctx, templateId, rows);
    return { preview: result.mapped.slice(0, 10), issues: result.errors };
  }

  static async shareTemplate(ctx: TenantContext, templateId: string): Promise<void> {
    await prisma.importTemplate.update({ where: { id: templateId }, data: { isShared: true } });
  }

  private static toTemplateData(t: Record<string, unknown>): ImportTemplateData {
    return { id: t.id as string, companyId: t.companyId as string, name: t.name as string, sourceType: t.sourceType as MappingSourceType, mapping: t.mapping as FieldMapping[], preview: t.preview as unknown, isActive: t.isActive as boolean, isShared: t.isShared as boolean, createdBy: t.createdBy as string, createdAt: (t.createdAt as Date).toISOString(), updatedAt: (t.updatedAt as Date).toISOString() };
  }
}
