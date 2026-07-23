import type { MockFactory } from "../types";

export function createMockFactory<T>(
  defaults: () => T,
  transformers?: Array<(data: T) => T>,
): MockFactory<T> {
  return {
    create: (overrides?: Partial<T>) => {
      let data = { ...defaults(), ...overrides } as unknown as T;
      if (transformers) {
        for (const fn of transformers) {
          data = fn(data);
        }
      }
      return data;
    },
    createMany: (count: number, overrides?: Partial<T>) =>
      Array.from({ length: count }, () => ({ ...defaults(), ...overrides }) as unknown as T),
  };
}
