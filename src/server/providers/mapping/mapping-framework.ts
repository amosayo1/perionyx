import { SerializationError, ValidationError } from "../errors/provider-errors";

export type MappingDirection = "provider_to_canonical" | "canonical_to_provider";

export interface FieldMapping<TInput, TOutput> {
  sourceField: string;
  targetField: string;
  transform?: (value: unknown, input: TInput) => TOutput[keyof TOutput] | Promise<TOutput[keyof TOutput]>;
  defaultValue?: unknown;
  required?: boolean;
  validate?: (value: unknown) => boolean;
}

export interface MappingDefinition<TInput, TOutput> {
  sourceType: string;
  targetType: string;
  direction: MappingDirection;
  fields: FieldMapping<TInput, TOutput>[];
  version: string;
}

export class Mapper<TInput extends Record<string, unknown>, TOutput extends Record<string, unknown>> {
  constructor(private readonly definition: MappingDefinition<TInput, TOutput>) {}

  async map(input: TInput): Promise<TOutput> {
    const output: Record<string, unknown> = {};
    const errors: string[] = [];

    for (const field of this.definition.fields) {
      let value: unknown = input[field.sourceField] ?? field.defaultValue;

      if (field.required && (value === undefined || value === null)) {
        errors.push(`Required field '${field.sourceField}' is missing`);
        continue;
      }

      if (value !== undefined && value !== null && field.validate) {
        if (!field.validate(value)) {
          errors.push(`Validation failed for field '${field.sourceField}'`);
          continue;
        }
      }

      if (value !== undefined && value !== null && field.transform) {
        try {
          value = await field.transform(value, input);
        } catch (error) {
          errors.push(`Transform failed for field '${field.sourceField}': ${error instanceof Error ? error.message : String(error)}`);
          continue;
        }
      }

      if (value !== undefined) {
        output[field.targetField] = value;
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(
        `Mapping failed with ${errors.length} error(s): ${errors.join("; ")}`,
        "mapper",
        undefined,
        errors,
      );
    }

    return output as TOutput;
  }

  async mapMany(inputs: TInput[]): Promise<TOutput[]> {
    return Promise.all(inputs.map((input) => this.map(input)));
  }

  getDefinition(): MappingDefinition<TInput, TOutput> {
    return this.definition;
  }
}

export class MappingRegistry {
  private mappings = new Map<string, MappingDefinition<Record<string, unknown>, Record<string, unknown>>>();

  register<TInput extends Record<string, unknown>, TOutput extends Record<string, unknown>>(
    definition: MappingDefinition<TInput, TOutput>,
  ): void {
    const key = `${definition.sourceType}:${definition.targetType}:${definition.direction}`;
    this.mappings.set(key, definition as MappingDefinition<Record<string, unknown>, Record<string, unknown>>);
  }

  getMapper<TInput extends Record<string, unknown>, TOutput extends Record<string, unknown>>(
    sourceType: string,
    targetType: string,
    direction: MappingDirection,
  ): Mapper<TInput, TOutput> | null {
    const key = `${sourceType}:${targetType}:${direction}`;
    const definition = this.mappings.get(key);
    if (!definition) return null;
    return new Mapper<TInput, TOutput>(definition as MappingDefinition<TInput, TOutput>);
  }

  hasMapping(sourceType: string, targetType: string, direction: MappingDirection): boolean {
    const key = `${sourceType}:${targetType}:${direction}`;
    return this.mappings.has(key);
  }

  removeMapping(sourceType: string, targetType: string, direction: MappingDirection): void {
    const key = `${sourceType}:${targetType}:${direction}`;
    this.mappings.delete(key);
  }

  clear(): void {
    this.mappings.clear();
  }

  listMappings(): MappingDefinition<Record<string, unknown>, Record<string, unknown>>[] {
    return Array.from(this.mappings.values());
  }
}

export const mappingRegistry = new MappingRegistry();

export function createFieldMapping<TInput extends Record<string, unknown>, TOutput extends Record<string, unknown>>(
  config: Omit<FieldMapping<TInput, TOutput>, "sourceField" | "targetField"> & { sourceField: keyof TInput & string; targetField: keyof TOutput & string },
): FieldMapping<TInput, TOutput> {
  return config as FieldMapping<TInput, TOutput>;
}

export function registerMapping<TInput extends Record<string, unknown>, TOutput extends Record<string, unknown>>(
  sourceType: string,
  targetType: string,
  direction: MappingDirection,
  fields: FieldMapping<TInput, TOutput>[],
  version = "1.0.0",
): void {
  mappingRegistry.register<TInput, TOutput>({
    sourceType,
    targetType,
    direction,
    fields,
    version,
  });
}

export const TRANSFORMERS = {
  toUpperCase: (value: unknown): string => String(value).toUpperCase(),
  toLowerCase: (value: unknown): string => String(value).toLowerCase(),
  toNumber: (value: unknown): number => {
    const num = Number(value);
    if (isNaN(num)) throw new Error(`Cannot convert "${value}" to number`);
    return num;
  },
  toString: (value: unknown): string => String(value ?? ""),
  toBoolean: (value: unknown): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
    if (typeof value === "number") return value === 1;
    return false;
  },
  toDate: (value: unknown): Date => {
    if (value instanceof Date) return value;
    const date = new Date(String(value));
    if (isNaN(date.getTime())) throw new Error(`Cannot convert "${value}" to date`);
    return date;
  },
  trim: (value: unknown): string => String(value).trim(),
  defaultIfEmpty: (defaultValue: unknown) => (value: unknown): unknown => {
    return (value === undefined || value === null || value === "") ? defaultValue : value;
  },
  mapCurrency: (currencyMap: Record<string, string>) => (value: unknown): string => {
    const key = String(value);
    return currencyMap[key] ?? key;
  },
};
