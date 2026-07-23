import { healthEndpoint } from "./health";
import http from "http";

export interface ShutdownHandler {
  name: string;
  handler: () => Promise<void>;
  timeout: number;
}

export class GracefulShutdown {
  private shuttingDown = false;
  private handlers: ShutdownHandler[] = [];
  private shutdownTimeoutMs = 60000;

  setShutdownTimeout(ms: number): void {
    this.shutdownTimeoutMs = ms;
  }

  register(name: string, handler: () => Promise<void>, timeout = 30000): void {
    this.handlers.push({ name, handler, timeout });
  }

  async shutdown(signal: string): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    console.log(`\n[GracefulShutdown] Received ${signal}, starting graceful shutdown...`);

    const forceExit = setTimeout(() => {
      console.error(`[GracefulShutdown] Forced shutdown after ${this.shutdownTimeoutMs}ms`);
      process.exit(1);
    }, this.shutdownTimeoutMs);

    for (const { name, handler, timeout } of this.handlers) {
      try {
        await Promise.race([
          handler(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${name} shutdown timed out after ${timeout}ms`)), timeout),
          ),
        ]);
        console.log(`[GracefulShutdown] ✓ ${name}`);
      } catch (err) {
        console.error(`[GracefulShutdown] ✗ ${name}:`, err instanceof Error ? err.message : err);
      }
    }

    clearTimeout(forceExit);
    console.log("[GracefulShutdown] Shutdown complete");
    process.exit(0);
  }

  setup(signalHandlers: string[] = ["SIGTERM", "SIGINT"]): void {
    for (const signal of signalHandlers) {
      process.on(signal, () => this.shutdown(signal));
    }
  }
}

export class GracefulStartup {
  private ready = false;
  private dependencies: Array<{ name: string; check: () => Promise<boolean> }> = [];
  private readyCallbacks: Array<() => void> = [];

  markReady(): void {
    this.ready = true;
    for (const cb of this.readyCallbacks) cb();
    this.readyCallbacks = [];
  }

  isReady(): boolean {
    return this.ready;
  }

  onReady(cb: () => void): void {
    if (this.ready) {
      cb();
    } else {
      this.readyCallbacks.push(cb);
    }
  }

  addDependency(name: string, check: () => Promise<boolean>): void {
    this.dependencies.push({ name, check });
  }

  async waitForDependencies(timeoutMs = 60000): Promise<void> {
    const start = Date.now();
    for (const dep of this.dependencies) {
      while (true) {
        if (Date.now() - start > timeoutMs) {
          throw new Error(`Dependency "${dep.name}" not ready within ${timeoutMs}ms`);
        }
        try {
          const ok = await dep.check();
          if (ok) break;
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      logger.info(`[GracefulStartup] ✓ ${dep.name}`);
    }
  }

  async waitForReady(timeoutMs = 30000): Promise<void> {
    const start = Date.now();
    while (!this.ready) {
      if (Date.now() - start > timeoutMs) {
        throw new Error("Startup timeout exceeded");
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

export class ConnectionDrainer {
  private connections = new Set<http.Server>();
  private draining = false;

  add(server: http.Server): void {
    this.connections.add(server);
  }

  async drain(timeoutMs = 30000): Promise<void> {
    if (this.draining) return;
    this.draining = true;

    const promises = [...this.connections].map(
      (server) =>
        new Promise<void>((resolve) => {
          server.close(() => resolve());
        }),
    );

    await Promise.race([
      Promise.all(promises),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Drain timeout")), timeoutMs)),
    ]).catch((err) => {
      console.error("[ConnectionDrainer] Drain error:", err);
    });
  }
}

import { logger } from "@/lib/logger";

export const gracefulShutdown = new GracefulShutdown();
export const gracefulStartup = new GracefulStartup();
export const connectionDrainer = new ConnectionDrainer();
