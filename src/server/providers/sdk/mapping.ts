import { Mapper, mappingRegistry, registerMapping, TRANSFORMERS, type MappingDirection, type FieldMapping } from "../mapping/mapping-framework";
import type { CanonicalCustomer, CanonicalVendor, CanonicalInvoice, CanonicalPayment, CanonicalTransaction, CanonicalBankAccount, CanonicalJournal, CanonicalEmployee, CanonicalAsset, CanonicalTaxRecord } from "../models/canonical-models";

type CanonicalRecord = Record<string, unknown>;

export function getMapper<TInput extends CanonicalRecord, TOutput extends CanonicalRecord>(
  sourceType: string,
  targetType: string,
  direction: MappingDirection,
): Mapper<TInput, TOutput> | null {
  return mappingRegistry.getMapper<TInput, TOutput>(sourceType, targetType, direction);
}

export function mapToCanonical<TInput extends CanonicalRecord>(
  sourceType: string,
  input: TInput,
): Promise<CanonicalRecord> {
  const mapper = mappingRegistry.getMapper<TInput, CanonicalRecord>(sourceType, "canonical", "provider_to_canonical");
  if (!mapper) {
    throw new Error(`No mapping registered for ${sourceType} → canonical`);
  }
  return mapper.map(input);
}

export function mapFromCanonical(
  targetType: string,
  canonical: CanonicalRecord,
): Promise<CanonicalRecord> {
  const mapper = mappingRegistry.getMapper<CanonicalRecord, CanonicalRecord>("canonical", targetType, "canonical_to_provider");
  if (!mapper) {
    throw new Error(`No mapping registered for canonical → ${targetType}`);
  }
  return mapper.map(canonical);
}

export function registerDefaultMapping(
  sourceType: string,
  fields: FieldMapping<CanonicalRecord, CanonicalRecord>[],
): void {
  registerMapping(sourceType, "canonical", "provider_to_canonical", fields);
}

export const mappingHelpers = {
  getMapper,
  mapToCanonical,
  mapFromCanonical,
  registerDefaultMapping,
  TRANSFORMERS,
};
