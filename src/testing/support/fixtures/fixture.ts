import type { MockFactory } from "../types";

export function createFixture<T>(data: T): T {
  return Object.freeze({ ...data }) as T;
}

export function createFixtureFactory<T>(defaults: () => T): MockFactory<T> {
  return {
    create: (overrides?: Partial<T>) => Object.freeze({ ...defaults(), ...overrides }) as T,
    createMany: (count: number, overrides?: Partial<T>) =>
      Array.from({ length: count }, () => Object.freeze({ ...defaults(), ...overrides }) as T),
  };
}
