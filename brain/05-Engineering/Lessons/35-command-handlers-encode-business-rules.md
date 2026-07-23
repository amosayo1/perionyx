# Lesson 35: Command Handlers Encode Business Rules, Not Infrastructure

**Date**: July 21, 2026
**Phase**: 21A.2 — AP Application Layer
**Context**: Building 51 command handlers across 7 application services

## The Lesson

Application service methods (command handlers) are where business rules live — not in infrastructure, not in repositories, not in API routes. The command handler is the single place where:
1. Authorization is checked (who can do this?)
2. State machine transitions are validated (is this state change allowed?)
3. Business invariants are enforced (does this satisfy all business rules?)
4. Domain events are collected (what happened?)
5. Audit entries are recorded (who did what?)

Infrastructure concerns (DB transactions, HTTP responses, caching) belong in the layers above and below the application service. The service itself is pure business logic.

## The Anti-Pattern

The anti-pattern is spreading business rules across layers:
- Validation in API routes (Zod schemas only catch format, not business rules)
- State transitions in repositories (repos should persist, not decide what's valid)
- Authorization in middleware (middleware can't know invoice-specific SoD rules)
- Audit in controllers (controllers shouldn't know what's auditable)

## The Principle

Every command follows this execution path:
```
API Route → Application Service → Repository → Events
     ↓              ↓                ↓           ↓
  Zod validation  Business rules  Persistence  Post-commit
  HTTP mapping    State machine   DB constraints  Notification
```

The application service owns the middle two steps: business rules and state machine. Everything else is infrastructure.

## Evidence

In Phase 21A.2, we built 51 command handlers. Each one:
- Takes a typed command input and a CommandContext
- Returns a CommandResult with data, events, and audit entries
- Validates state transitions inline (e.g., "invoice must be in RECEIVED state")
- Enforces SoD rules (e.g., "creator cannot approve own vendor")
- Collects domain events for post-commit publication
- Collects audit entries for immutable record

Zero business logic leaked into repositories. Zero business logic leaked into API routes.
