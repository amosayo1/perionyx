# 43 — The Strongest Enterprise Platforms Implement Shared Capabilities Before Integrations

**Status**: Active
**Phase**: 24.0
**Domain**: Architecture
**Impact**: Foundation

## Lesson

The strongest enterprise platforms implement shared capabilities first, then build integrations on top. Perionyx Phase 24.0 built 5 foundation platforms (Data Classification, Configuration, Secret Management, Capability Registry, Provider Runtime) before any new integrations or features. Every future platform inherits these capabilities.

## Context

Building the Provider Runtime (WS5) revealed that every provider driver was independently implementing retry logic, circuit breakers, rate limiting, and error handling. By extracting these into a shared base class, we eliminated thousands of lines of duplicated code and ensured consistent behavior across all providers.

The Configuration Platform (WS2) showed that feature flags, config hierarchies, and schema validation are needed by every domain. Implementing them centrally means no domain builds its own config system.

## Evidence

- **ProviderDriver base class**: 1 file replaces 200+ lines of per-provider retry/circuit-breaker/rate-limiting code
- **ConfigurationRegistry**: Singleton with hierarchical resolution serves all 15 platforms
- **ClassificationRegistry**: 11 classification levels and 10 default policies cover all enterprise data types
- **SecretManager**: Pluggable provider model supports 4 backends without consumer changes
- **CapabilityRegistry**: Provider discovery enables dynamic load balancing and failover

## Application

When starting a new enterprise platform:
1. Check if any foundation capability is needed (classification, config, secrets, capabilities, provider runtime)
2. If yes, inherit from the foundation platform — do not reimplement
3. If the foundation doesn't cover a need, extend the foundation (don't fork it)
4. Every provider must extend ProviderDriver — no exceptions

## Related

- Principle #18: Platform Constitution is Highest Engineering Authority
- Principle #19: Validation Gives Authority
- Principle #20: Every Shared Capability Implemented Once, Centrally
- Phase 24.0: Enterprise Foundation Implementation
- Phase 23.0: Platform Constitution
