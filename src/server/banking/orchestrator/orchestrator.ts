import type { CommandKind, ExecutionContext, ExecutionResult, CommandInput } from "./types";
import { BankingRegion, ProviderCapability } from "../domain/types";
import { executionPipeline } from "./pipeline/engine";
import { getCommand } from "./commands";
import { orchestrationEventBus } from "./events/events";
import { orchestrationAudit } from "./audit/audit";
import { circuitBreaker } from "./retry/circuit-breaker";
import { deadLetterQueue } from "./retry/dead-letter";
import { orchestrationQueue } from "./queue/engine";

export interface OrchestrateOptions {
  commandKind: CommandKind;
  input: CommandInput;
  provider?: string;
  metadata?: Record<string, unknown>;
  queue?: boolean;
  priority?: "high" | "normal" | "low";
}

export class BankingOrchestrator {
  async orchestrate(options: OrchestrateOptions): Promise<ExecutionResult> {
    const correlationId = crypto.randomUUID();

    const context: ExecutionContext = {
      correlationId,
      commandKind: options.commandKind,
      tenantId: options.input.tenantId,
      legalEntityId: options.input.legalEntityId,
      region: options.input.region,
      countryCode: options.input.countryCode,
      requestedCapabilities: this.getCapabilitiesForCommand(options.commandKind),
      currentProvider: options.provider as any,
      preferredProtocol: undefined,
      currency: options.input.currency,
      userId: options.input.userId,
      sessionId: options.input.sessionId,
      auditId: undefined,
      connectionId: options.input.connectionId,
      accountId: options.input.accountId,
      metadata: { ...options.metadata, input: options.metadata },
      startedAt: new Date().toISOString(),
    };

    const command = getCommand(options.commandKind);
    const requiredCapabilities = command.getRequiredCapabilities();
    context.requestedCapabilities = requiredCapabilities as any;

    if (options.queue) {
      const queueItemId = orchestrationQueue.enqueue(
        context,
        options.priority ?? "normal",
      );
      return {
        success: true,
        data: { queued: true, queueItemId, correlationId },
        providerUsed: context.currentProvider ?? "plaid",
        durationMs: 0,
        retryCount: 0,
        fallbackCount: 0,
      };
    }

    return executionPipeline.execute(context);
  }

  async batch(commands: OrchestrateOptions[]): Promise<ExecutionResult[]> {
    return Promise.all(commands.map((cmd) => this.orchestrate(cmd)));
  }

  getContextSummary(correlationId: string): Record<string, unknown> {
    const audits = orchestrationAudit.getByCorrelationId(correlationId);
    return {
      correlationId,
      viaAuditCount: audits.length,
      status: audits.length > 0 ? (audits[audits.length - 1].success ? "completed" : "failed") : "unknown",
    };
  }

  getCircuitBreakerStatuses(): Map<string, unknown> {
    const statuses = new Map<string, unknown>();
    const all = circuitBreaker.getAllStatuses();
    for (const [key, val] of all) {
      statuses.set(key, val);
    }
    return statuses;
  }

  getDeadLetterQueueItems(): import("./retry/dead-letter").DeadLetterRecord[] {
    return deadLetterQueue.recent;
  }

  clearCircuitBreaker(provider?: string): void {
    circuitBreaker.reset(provider as any);
  }

  private getCapabilitiesForCommand(kind: CommandKind): ProviderCapability[] {
    const command = getCommand(kind);
    return command.getRequiredCapabilities() as ProviderCapability[];
  }
}

export const bankingOrchestrator = new BankingOrchestrator();