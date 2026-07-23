import { LazyService } from './lazy-service'

type ServiceFactory = () => any

const registry = new Map<string, LazyService<any>>()

export function registerService<T>(name: string, factory: () => T): LazyService<T> {
  const service = new LazyService(factory)
  registry.set(name, service)
  return service
}

export function getService<T>(name: string): T | undefined {
  const service = registry.get(name)
  return service ? service.get() : undefined
}

export function getInitializationStatus(): Record<string, boolean> {
  const status: Record<string, boolean> = {}
  registry.forEach((service, name) => {
    status[name] = service.isInitialized()
  })
  return status
}

export function resetAll(): void {
  registry.forEach((service) => service.reset())
}
