/**
 * Runtime Core — Singleton Runtime Environment
 *
 * Phase 24.0B
 *
 * The Runtime is the canonical execution environment.
 * Every Platform, Provider Driver, AI Agent, Workflow, and Financial Domain
 * inherits from this.
 */

import type { RuntimeMetadata, RuntimeState, ServiceRegistration, LifecycleHooks } from './types';

export class Runtime {
  private static instance: Runtime;

  private state: RuntimeState = 'UNINITIALIZED';
  private metadata: RuntimeMetadata;
  private services = new Map<string, ServiceRegistration>();
  private hooks: LifecycleHooks = {};

  private constructor() {
    this.metadata = {
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0',
      environment: process.env.NODE_ENV ?? 'development',
      startedAt: new Date(),
      state: 'UNINITIALIZED',
      modules: [],
    };
  }

  static getInstance(): Runtime {
    if (!Runtime.instance) {
      Runtime.instance = new Runtime();
    }
    return Runtime.instance;
  }

  // ── State ───────────────────────────────────────────────────────────────

  getState(): RuntimeState {
    return this.state;
  }

  getMetadata(): Readonly<RuntimeMetadata> {
    return { ...this.metadata, state: this.state };
  }

  isReady(): boolean {
    return this.state === 'READY' || this.state === 'RUNNING';
  }

  // ── Service Registry ────────────────────────────────────────────────────

  registerService(registration: ServiceRegistration): void {
    this.services.set(registration.name, registration);
    this.metadata.modules.push(registration.name);
  }

  getService<T = unknown>(name: string): T | undefined {
    return this.services.get(name)?.service as T | undefined;
  }

  hasService(name: string): boolean {
    return this.services.has(name);
  }

  listServices(): ServiceRegistration[] {
    return Array.from(this.services.values());
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  setState(state: RuntimeState): void {
    this.metadata.state = state;
    this.state = state;
  }

  setHooks(hooks: LifecycleHooks): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  async notifyReady(): Promise<void> {
    this.setState('READY');
    this.metadata.initializedAt = new Date();
    await this.hooks.onReady?.();
  }

  async drain(): Promise<void> {
    this.setState('DRAINING');
    await this.hooks.onDraining?.();
  }

  async stop(): Promise<void> {
    this.setState('STOPPED');
    this.metadata.stoppedAt = new Date();
    await this.hooks.onStopped?.();
  }

  async handleError(error: Error): Promise<void> {
    this.setState('ERROR');
    await this.hooks.onError?.(error);
  }

  // ── Health ──────────────────────────────────────────────────────────────

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, { status: string; latencyMs?: number; error?: string }>;
  }> {
    const results: Record<string, { status: string; latencyMs?: number; error?: string }> = {};
    let unhealthy = 0;

    for (const [name, reg] of this.services) {
      if (reg.health) {
        try {
          const start = Date.now();
          const health = await reg.health();
          results[name] = {
            status: health.status,
            latencyMs: health.latencyMs ?? Date.now() - start,
            error: health.error,
          };
          if (health.status === 'unhealthy') unhealthy++;
        } catch (error) {
          results[name] = {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : String(error),
          };
          unhealthy++;
        }
      }
    }

    const total = Object.keys(results).length;
    const status = unhealthy === 0 ? 'healthy' : unhealthy < total / 2 ? 'degraded' : 'unhealthy';

    return { status, services: results };
  }
}

// ── Singleton export ──────────────────────────────────────────────────────

export const runtime = Runtime.getInstance();
