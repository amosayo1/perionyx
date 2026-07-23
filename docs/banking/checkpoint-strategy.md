# Checkpoint Strategy

## Overview

The Checkpoint Engine provides resumable synchronization state for each account, enabling incremental syncs, recovery from failures, and data freshness tracking.

## Checkpoint Data Model

```typescript
interface SyncCheckpoint {
  id: string;                    // Unique checkpoint identifier
  connectionId: string;          // Bank connection
  accountId: string;             // Bank account
  lastSuccessfulSync: string;    // ISO timestamp
  lastFailedSync: string;        // ISO timestamp
  checkpointToken: string;       // Provider-specific state token
  cursor: string;                // Pagination cursor
  paginationState: object;       // Multi-page pagination state
  providerSyncToken: string;     // Provider sync token (webhook-style)
  continuationToken: string;     // Long-running operation token
  lastTransactionExternalId: string; // Last imported transaction
  totalTransactionsSynced: number;   // Running total
  lastSyncDurationMs: number;    // Last sync duration
  consecutiveFailures: number;   // Failure streak counter
  isStale: boolean;              // Staleness flag
  staleThresholdMinutes: number; // Staleness threshold
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}
```

## Checkpoint Update Strategy

### On Success
```
1. Update lastSuccessfulSync to current time
2. Update cursor to last pagination position
3. Update checkpointToken from provider
4. Update providerSyncToken
5. Update lastTransactionExternalId
6. Update lastSyncDurationMs
7. Reset consecutiveFailures to 0
8. Set isStale to false
```

### On Failure
```
1. Update lastFailedSync to current time
2. Increment consecutiveFailures by 1
3. If consecutiveFailures >= 3, mark isStale = true
4. Keep cursor at last known position (for retry)
```

## Staleness Detection

```
Checkpoint Freshness = now - lastSuccessfulSync

If no lastSuccessfulSync:
  → Account is STALE (never synced)

If freshness > staleThresholdMinutes:
  → Account is STALE (needs re-sync)

If consecutiveFailures >= 3:
  → Account is STALE (failure threshold exceeded)
```

## Cursor Management

### Incremental Sync Cursor
- Updated after each successful page fetch
- Preserved on failure for retry
- Format: `cursor-{accountId}-{pageNumber}`
- Enables resumable pagination

### Provider Sync Token
- Provider-specific opaque token
- Used for webhook-style syncs
- Updated only on successful completion

### Pagination State
- Tracks multi-page sync progress
- Supports out-of-order page completion
- Enables parallel page fetching
- Format: `{ page: number, completedPages: Set<number> }`

## Storage Strategy

Current implementation uses in-memory storage (Map<string, SyncCheckpoint>). The key format is:
```
{connectionId}::{accountId}
```

### Migration to Persistent Storage
1. Add Prisma Checkpoint model
2. Implement repository pattern
3. Add cache layer with TTL
4. Implement batch checkpoint updates

## Concurrent Access

Checkpoints are per-account, so concurrent syncs of different accounts do not conflict. For the same account:
- Newer syncs overwrite stale checkpoints
- Checkpoint updates are atomic per account
- No locking required for current implementation

## Edge Cases

### First Sync
- No checkpoint exists
- Engine creates a new checkpoint with null cursors
- Full historical sync is performed

### Recovery After Extended Downtime
- Checkpoint is marked stale
- Full re-sync is triggered
- Historical engine handles date-range gap

### Partial Completion
- Some pages succeed, some fail
- Cursor marks last successful page
- Retry resumes from cursor position
- Deduplication prevents double imports

### Provider Token Expiry
- ProviderSyncToken may expire server-side
- onStale flag triggers re-authentication
- New token obtained during authentication phase

## Performance Considerations

- Checkpoint updates are O(1) Map operations
- Staleness checks are O(1) per account
- Connection-wide clear is O(n) for account count
- Memory scales linearly with active accounts
- No I/O overhead (in-memory)
