/**
 * Phase 22.4 — Evidence Engine.
 *
 * The single source of truth for evidence assembly. Consumers request an
 * `EvidencePackage` via `assembleEvidenceFor`; they never compose evidence
 * by hand. Domain providers register via `registerEvidenceProviders`.
 */
export * from "./types";
export * from "./registry";
export * from "./resolver";
export * from "./assembler";
