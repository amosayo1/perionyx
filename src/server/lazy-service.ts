export class LazyService<T> {
  private instance: T | null = null
  private factory: () => T
  private initialized = false

  constructor(factory: () => T) {
    this.factory = factory
  }

  get(): T {
    if (!this.initialized) {
      this.instance = this.factory()
      this.initialized = true
    }
    return this.instance!
  }

  isInitialized(): boolean {
    return this.initialized
  }

  reset(): void {
    this.instance = null
    this.initialized = false
  }
}
