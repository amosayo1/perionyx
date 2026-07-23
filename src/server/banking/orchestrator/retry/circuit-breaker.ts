import type { BankProviderKind } from "../../domain/types";
import type { RetryBreakerState, RetryBreakerStatus } from "./types";
import { orchestrationEventBus } from "../events/events";

type BreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface BreakerEntry {
  provider: string;
  state: BreakerState;
  failureCount: number;
  successCount: number;
  failureThreshold: number;
  halfOpenMaxRequests: number;
  halfOpenRequests: number;
  lastFailureAt: string | null;
  openedAt: string | null;
  lastTimeoutMs: number;
  nextAttemptAt: string | null;
}

export class CircuitBreaker {
  private breakers = new Map<string, BreakerEntry>();

  private readonly defaultFailureThreshold = 5;
  private readonly defaultHalfOpenMaxRequests = 3;
  private readonly defaultTimeoutMs = 30000;

  recordFailure(provider: BankProviderKind): void {
    const entry = this.getOrCreate(provider);
    entry.failureCount++;
    entry.successCount = 0;
    entry.lastFailureAt = new Date().toISOString();

    if (entry.failureCount >= entry.failureThreshold && entry.state === "CLOSED") {
      entry.state = "OPEN";
      entry.openedAt = new Date().toISOString();
      entry.nextAttemptAt = new Date(Date.now() + entry.lastTimeoutMs).toISOString();

      orchestrationEventBus.publish("CircuitBreakerOpened", {
        provider,
        failureCount: entry.failureCount,
        timeoutMs: entry.lastTimeoutMs,
      });
    }

    if (entry.state === "HALF_OPEN") {
      entry.state = "OPEN";
      entry.openedAt = new Date().toISOString();
      entry.nextAttemptAt = new Date(Date.now() + entry.lastTimeoutMs * 2).toISOString();
      entry.lastTimeoutMs *= 2;

      orchestrationEventBus.publish("CircuitBreakerOpened", {
        provider,
        reason: "half_open_failure",
        newTimeout: entry.lastTimeoutMs,
      });
    }
  }

  recordSuccess(provider: BankProviderKind): void {
    const entry = this.getOrCreate(provider);
    entry.successCount++;
    entry.failureCount = 0;

    if (entry.state === "HALF_OPEN") {
      entry.state = "CLOSED";
      entry.openedAt = null;
      entry.nextAttemptAt = null;
      entry.lastTimeoutMs = this.defaultTimeoutMs;

      orchestrationEventBus.publish("CircuitBreakerClosed", {
        provider,
        reason: "half_open_success",
      });
    }
  }

  isOpen(provider: BankProviderKind): boolean {
    const entry = this.breakers.get(provider);
    if (!entry) return false;
    if (entry.state === "CLOSED") return false;
    if (entry.state === "HALF_OPEN") return false;

    if (entry.nextAttemptAt && new Date(entry.nextAttemptAt) <= new Date()) {
      entry.state = "HALF_OPEN";
      entry.halfOpenRequests = 0;

      orchestrationEventBus.publish("CircuitBreakerHalfOpen", { provider });

      return false;
    }

    return true;
  }

  canAttempt(provider: BankProviderKind): boolean {
    const entry = this.breakers.get(provider);
    if (!entry) return true;
    if (entry.state === "CLOSED") return true;
    if (entry.state === "OPEN") {
      if (entry.nextAttemptAt && new Date(entry.nextAttemptAt) <= new Date()) {
        entry.state = "HALF_OPEN";
        entry.halfOpenRequests = 0;

        orchestrationEventBus.publish("CircuitBreakerHalfOpen", { provider });

        return true;
      }
      return false;
    }
    if (entry.state === "HALF_OPEN") {
      entry.halfOpenRequests++;
      return entry.halfOpenRequests <= entry.halfOpenMaxRequests;
    }
    return true;
  }

  getStatus(provider: BankProviderKind): BreakerEntry | null {
    return this.breakers.get(provider) ?? null;
  }

  getAllStatuses(): Map<string, BreakerEntry> {
    return new Map(this.breakers);
  }

  reset(provider?: BankProviderKind): void {
    if (provider) {
      this.breakers.delete(provider);
    } else {
      this.breakers.clear();
    }
  }

  private getOrCreate(provider: BankProviderKind): BreakerEntry {
    let entry = this.breakers.get(provider);
    if (!entry) {
      entry = {
        provider,
        state: "CLOSED",
        failureCount: 0,
        successCount: 0,
        failureThreshold: this.defaultFailureThreshold,
        halfOpenMaxRequests: this.defaultHalfOpenMaxRequests,
        halfOpenRequests: 0,
        lastFailureAt: null,
        openedAt: null,
        lastTimeoutMs: this.defaultTimeoutMs,
        nextAttemptAt: null,
      };
      this.breakers.set(provider, entry);
    }
    return entry;
  }
}

export const circuitBreaker = new CircuitBreaker();