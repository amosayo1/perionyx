# Lesson 37: Integration Tests Catch Interaction Bugs That Unit Tests Miss

**Date**: July 22, 2026
**Phase**: 21A.4 — AP Workflow Execution & Integration
**Context**: Validating 16 AP workflows with 87 integration tests

## The Lesson

Unit tests verify individual components work correctly in isolation. Integration tests verify components work correctly together. The bugs we found in Phase 21A.4 were both interaction bugs — they existed at the boundary between components, not within them.

### Bug 1: Approval Cascade

The `approveLevel()` method in `approval-service.ts` loaded all approval records for an invoice, then checked if all records were "approved" using:

```typescript
const allApproved = allRecords.every(
  (r) => r.status === "APPROVED" || r.status === "SKIPPED"
);
```

A unit test of `approveLevel()` in isolation would have passed — the method correctly approves the record it receives. The bug only manifests when you:
1. Create a multi-level approval chain (level 1 PENDING, level 2 SKIPPED)
2. Approve level 1
3. Expect level 2 to transition SKIPPED → PENDING

Because SKIPPED was treated as "approved," the chain completed immediately after level 1, never activating level 2. Only an integration test that chains `requestApproval()` → `approveLevel()` → `findRecordsByInvoiceId()` could catch this.

### Bug 2: In-Memory Repository Stale References

In-memory repositories return shallow copies on `save()` and `findById()`:

```typescript
async save(entity: T): Promise<void> {
  this.store.set(entity.id, { ...entity });
}
```

This means the caller's reference becomes stale after any operation that loads and saves the same entity. A unit test of the service would mock the repository and never encounter this pattern. The integration test discovered it when:
1. `receiveAndValidateInvoice()` returned a reference to an invoice
2. The test set `inv.poReferenceId = "po-001"` on that reference
3. But the service had already reloaded and saved the invoice, creating a new copy in the repo
4. The test's reference pointed to the old copy

The fix: always reload from the repository after any mutation step in tests.

## The Principle

**When testing complex business processes, integration tests are not optional — they are the primary verification method.** Unit tests are necessary for edge cases and error paths within a single method, but they cannot detect:

- State machine transitions that depend on upstream service behavior
- Repository patterns that create stale references across service calls
- Event propagation across service boundaries
- Audit trail completeness across a full command chain

The investment in integration tests (87 tests, ~70ms execution) is small compared to the cost of shipping a broken approval cascade to production.

## Application

- Always write integration tests for multi-step workflows before unit tests for individual methods
- Test the "happy path" through the full chain first, then add error-path unit tests
- When an in-memory repository is involved, always reload entities from the repo before asserting on their state
- When a helper function returns a direct value (not a CommandResult), document it clearly — callers shouldn't unwrap with `.data!`
