# Notification Platform

**Platform**: NotificationPlatform
**Contract**: NotificationContract
**Mission**: Deliver notifications to the right person at the right time through the right channel — supporting in-app, email, Slack, Teams, and webhook delivery with preference management, policy evaluation, and delivery tracking.
**Status**: Partially Built (4+3 files in `src/modules/notifications/`, 3 channels: in-app, email, Slack; webhook via PgBoss queue)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 5 ("Every External Dependency Is Observable")

---

## Responsibilities

1. **Deliver** notifications via multiple channels (in-app, email, Slack, Teams, webhooks)
2. **Manage** user notification preferences (per event type, per channel)
3. **Evaluate** notification policies (quiet hours, severity thresholds, department routing)
4. **Track** delivery status (sent, delivered, failed, read)
5. **Enqueue** delivery via background jobs (PgBoss) for non-blocking operation
6. **Support** real-time push via WebSocket/SSE for in-app notifications
7. **Manage** notification channels (create, update, delete, activate/deactivate)
8. **Handle** broadcast notifications (company-wide announcements)
9. **Integrate** with connector platform for Slack/Teams connector-based delivery
10. **Audit** notification actions (send, read, channel changes)
11. **Support** notification templates for consistent messaging
12. **Aggregate** unread counts for badge display
13. **Mark** notifications as read (individual and bulk)
14. **Respect** quiet hours and user timezone preferences

---

## Public API (Capability Contract)

### NotificationContract

```typescript
interface NotificationContract {
  // Send
  send(input: SendNotificationInput): Promise<Notification>;
  broadcast(input: SendNotificationInput): Promise<void>;
  
  // List & Read
  list(ctx: TenantContext, opts?: ListOptions): Promise<PaginatedNotifications>;
  getUnreadCount(ctx: TenantContext): Promise<{ count: number }>;
  markRead(ctx: TenantContext, ids: string[]): Promise<void>;
  markAllRead(ctx: TenantContext): Promise<{ count: number }>;
  
  // Preferences
  getPreferences(ctx: TenantContext): Promise<NotificationPreference[]>;
  updatePreference(ctx: TenantContext, prefId: string, enabled: boolean): Promise<void>;
  setupDefaultPreferences(ctx: TenantContext): Promise<{ created: number }>;
  
  // Channels
  getChannels(ctx: TenantContext): Promise<NotificationChannel[]>;
  createChannel(ctx: TenantContext, data: CreateChannelInput): Promise<NotificationChannel>;
  updateChannel(ctx: TenantContext, channelId: string, data: UpdateChannelInput): Promise<void>;
  deleteChannel(ctx: TenantContext, channelId: string): Promise<void>;
  
  // Policies
  evaluatePolicy(policy: NotificationPolicy, context: PolicyEvaluationContext): PolicyResult;
  
  // Health
  getNotificationHealth(): Promise<NotificationHealth>;
}
```

---

## Internal API

### Service Architecture

| Module | Location | Purpose |
|---|---|---|
| **Notification Service** | `src/modules/notifications/notifications.service.ts` | Core send, list, preferences, channels |
| **In-App Channel** | `src/modules/notifications/channels/in-app.ts` | Direct DB write + real-time push |
| **Email Channel** | `src/modules/notifications/channels/email.ts` | Email template rendering + send |
| **Slack Channel** | `src/modules/notifications/channels/slack.ts` | Slack webhook delivery |
| **Policies** | `src/modules/notifications/policies.ts` | Quiet hours, severity, department routing |
| **Notification Delivery Job** | `src/modules/queue/jobs/notification-delivery.job.ts` | Background email/Slack delivery via PgBoss |
| **Connector Delivery Job** | `src/modules/connector-platform/jobs/notification-connector-delivery.job.ts` | Slack/Teams via connector platform |

### Delivery Pipeline

```
NotificationService.send()
  → 1. In-App: Direct DB write (synchronous)
  → 2. Webhook: Enqueue to PgBoss "webhook-send" queue
  → 3. External Channels: Check user preferences → Route to channel
     → Email: enqueueEmailDelivery()
     → Slack: enqueueSlackDelivery()
     → Slack Connector: enqueue("notification-connector-deliver")
     → Teams Connector: enqueue("notification-connector-deliver")
  → 4. Real-time: emitRealtimeEvent() via WebSocket
```

### Notification Event Types

```typescript
// Located at: src/modules/notifications/notifications.service.ts
type NotificationEventType =
  | "APPROVAL_REQUIRED"
  | "APPROVAL_COMPLETED"
  | "APPROVAL_REJECTED"
  | "RISK_ALERT_CREATED"
  | "RISK_ALERT_RESOLVED"
  | "RECONCILIATION_COMPLETED"
  | "RECONCILIATION_FAILED"
  | "POLICY_VIOLATION"
  | "CONNECTOR_FAILURE"
  | "TRANSFER_COMPLETED"
  | "TRANSFER_FAILED"
  | "CALENDAR_EVENT_REMINDER"
  | "PLAID_SYNC_FAILED"
  | "PLAID_ACCOUNT_LINKED"
  | "PLAID_ACCOUNT_UNLINKED";
```

---

## Events

### Notification Lifecycle Events

| Event | Description | Payload |
|---|---|---|
| `notification.created` | In-app notification created | notificationId, eventType, userId |
| `notification.sent` | Delivery attempted | notificationId, channel, status |
| `notification.delivered` | Delivery confirmed | notificationId, channel |
| `notification.delivery-failed` | Delivery failed | notificationId, channel, error |
| `notification.read` | User read notification | notificationId, userId |
| `notification.all-read` | All notifications marked read | userId, count |
| `notification.preference-changed` | User changed preference | userId, prefId, enabled |
| `notification.channel-created` | Channel configured | channelId, type |
| `notification.channel-deleted` | Channel removed | channelId |

### Real-time Events

```typescript
// Located at: src/server/realtime.ts
RealtimeChannels.NOTIFICATION = "notification"
RealtimeEvents.NOTIFICATION_NEW = "notification:new"
```

---

## Commands

| Command | Description | Permission |
|---|---|---|
| `sendNotification` | Send to user/group | System (internal) |
| `broadcastNotification` | Send to all company members | `admin.notifications` |
| `markNotificationsRead` | Mark specific notifications read | Authenticated |
| `markAllNotificationsRead` | Mark all read | Authenticated |
| `updateNotificationPreference` | Toggle preference | Authenticated |
| `createNotificationChannel` | Add channel | `admin.notifications` |
| `updateNotificationChannel` | Modify channel | `admin.notifications` |
| `deleteNotificationChannel` | Remove channel | `admin.notifications` |
| `setupDefaultPreferences` | Initialize defaults | Authenticated |

---

## Queries

| Query | Description | Cacheable |
|---|---|---|
| `listNotifications` | Paginated notification list | No |
| `getUnreadCount` | Unread badge count | No (real-time) |
| `getPreferences` | User preferences | Yes (60s) |
| `getChannels` | Company channels | Yes (30s) |
| `evaluatePolicy` | Test policy rules | No |

---

## Errors

| Code | Description | Recovery |
|---|---|---|
| `NOTIFICATION_CHANNEL_NOT_FOUND` | Channel does not exist | Check channel ID |
| `NOTIFICATION_PREFERENCE_NOT_FOUND` | Preference not found | Check pref ID |
| `NOTIFICATION_DELIVERY_FAILED` | Channel delivery failed | Retry via queue |
| `NOTIFICATION_CHANNEL_INACTIVE` | Channel is disabled | Activate channel |
| `NOTIFICATION_POLICY_BLOCKED` | Policy rejected notification | Check policy rules |
| `NOTIFICATION_INVALID_EVENT_TYPE` | Unknown event type | Use valid type |

---

## Security Model

1. **Tenant Isolation**: Notifications scoped to company — cross-tenant notifications blocked
2. **User Scoping**: Notifications targeted to specific users or broadcast to company
3. **Preference Control**: Users control which event types they receive per channel
4. **Channel Security**: Webhook URLs encrypted; OAuth tokens for Slack/Teams
5. **Audit Trail**: Every send, channel change, and preference change logged
6. **No Sensitive Data**: Notification titles/messages never contain credentials or secrets

---

## Permission Model

| Operation | Permission | Notes |
|---|---|---|
| View notifications | Authenticated | Own notifications only |
| Mark read | Authenticated | Own notifications only |
| Manage preferences | Authenticated | Own preferences only |
| Create channel | `admin.notifications` | Company-wide |
| Update channel | `admin.notifications` | Company-wide |
| Delete channel | `admin.notifications` | Company-wide |
| Broadcast | `admin.notifications` | Company-wide |
| View audit log | `admin.audit` | All notification events |

---

## Observability

### Metrics

| Metric | Type | Labels |
|---|---|---|
| `notification_sent_total` | Counter | event_type, channel, status |
| `notification_delivered_total` | Counter | channel, status |
| `notification_delivery_duration_ms` | Histogram | channel |
| `notification_delivery_failed_total` | Counter | channel, error_type |
| `notification_read_rate` | Gauge | event_type |
| `notification_unread_count` | Gauge | user_id, company_id |
| `notification_queue_depth` | Gauge | channel |
| `notification_realtime_push_total` | Counter | status |

### Tracing

```
Span: notification.send.{eventType}
  Attributes:
    notification.channel = "email"
    notification.user_id = "user_123"
    notification.company_id = "company_abc"
    notification.event_type = "APPROVAL_REQUIRED"
  Events:
    notification.in_app.write
    notification.policy.evaluate
    notification.channel.route
    notification.enqueue
    notification.realtime.push
```

---

## Metrics

| Metric | Description | Alert |
|---|---|---|
| Delivery success rate | % successful deliveries | < 99% |
| Delivery latency p95 | 95th percentile delivery time | > 5s |
| Queue depth | Pending deliveries | > 1000 |
| Read rate | % notifications read | < 50% (content issue?) |
| Channel failure rate | Failures per channel | > 1% |

---

## Rate Limiting

| Operation | Limit | Window | Notes |
|---|---|---|---|
| Send (per user) | 100/hour | Rolling | Prevent notification spam |
| Broadcast (per company) | 10/hour | Rolling | Prevent abuse |
| Channel CRUD | 20/hour | Rolling | Prevent config churn |
| Real-time push | 300/min | Rolling | WebSocket bandwidth |

---

## Retry Policy

| Operation | Max Retries | Backoff | Notes |
|---|---|---|---|
| Email delivery | 3 | Exponential 60s, with backoff | PgBoss queue configured |
| Slack delivery | 3 | Exponential 60s, with backoff | PgBoss queue configured |
| Connector delivery | 3 | Exponential 60s, with backoff | PgBoss queue configured |
| In-app write | 0 | N/A | Synchronous; failure = notification lost |
| Real-time push | 0 | N/A | Best-effort; next poll catches up |

### Queue Configuration

```typescript
// Source: src/modules/notifications/notifications.service.ts:53-68
enqueue("webhook-send", payload, {
  retryLimit: 3,
  retryDelay: 60,
  retryBackoff: true,
  expireInSeconds: 600,
});
```

---

## Circuit Breakers

Notification delivery does NOT use traditional circuit breakers:

1. **Queue-based resilience**: Failed deliveries retry via PgBoss; dead-letter queue captures persistent failures
2. **Channel isolation**: Email failure does not affect Slack delivery
3. **Graceful degradation**: In-app delivery always works; external channels are best-effort
4. **Alert on persistent failure**: Dead-letter queue depth triggers alerting

---

## Caching

| Data | TTL | Location | Notes |
|---|---|---|---|
| User preferences | 60 seconds | Memory + DB | Revalidated on change |
| Company channels | 30 seconds | Memory + DB | Revalidated on change |
| Unread count | No cache | Real-time | Updated via WebSocket |
| Notification list | No cache | DB | Always fresh |

---

## Versioning

| Component | Versioning | Notes |
|---|---|---|
| NotificationContract | semver | Major for breaking changes |
| Event types | Append-only | New types added |
| Channel types | Append-only | New channels added |
| Notification schema | Additive | New fields optional |

---

## Lifecycle

### Notification Lifecycle

```
Trigger (domain event) → Service.send() → 
  → In-App: DB write → Real-time push (WebSocket)
  → Email: Enqueue → Send → Track delivery
  → Slack: Enqueue → Webhook → Track delivery
  → Teams: Enqueue → Connector → Track delivery
  → Webhook: Enqueue → External endpoint → Track delivery
```

### Channel Lifecycle

```
Create → Configure (credentials) → Activate → Active →
  → Health Check → Degraded (if failing) → Active (auto-recover)
  → Deactivate → Retired
```

### Preference Lifecycle

```
Default Setup → User Customizes → Active →
  → Toggle On/Off → Updated
```

---

## Extension Model

### Adding a New Notification Channel

1. **Implement** channel handler (`sendVia{Channel}` function)
2. **Add** channel type to Prisma enum
3. **Register** in `sendViaExternalChannels()` routing logic
4. **Add** PgBoss job handler for async delivery
5. **Configure** channel-specific credentials
6. **Write** delivery tests
7. **Document** channel-specific quirks

### Adding a New Event Type

1. **Add** to `NotificationEventType` union
2. **Add** default preference in `setupDefaultPreferences()`
3. **Document** event trigger and audience
4. **Add** to notification templates (if applicable)

---

## Provider Model

### Current Channels

| Channel | Type | Delivery | Status |
|---|---|---|---|
| In-App | `IN_APP` | Synchronous DB write + WebSocket | Built |
| Email | `EMAIL` | Async via PgBoss queue | Built |
| Slack (webhook) | `SLACK` | Async via PgBoss queue | Built |
| Slack (connector) | `SLACK_CONNECTOR` | Async via connector platform | Built |
| Teams (connector) | `TEAMS_CONNECTOR` | Async via connector platform | Scaffolded |
| Webhook | `webhook-send` | Async via PgBoss queue | Built |
| Push (mobile) | N/A | Not started | Not Started |

### Channel Preference Model

```typescript
// User preferences control which channels receive which event types
interface NotificationPreference {
  id: string;
  userId: string;
  companyId: string;
  eventType: NotificationEventType;
  channelId: string | null;   // null = in-app only
  enabled: boolean;
}
```

### Policy Model

```typescript
// Located at: src/modules/notifications/policies.ts
interface NotificationPolicy {
  immediate: boolean;           // send immediately vs queue
  channelPriority?: number;     // channel selection priority
  severityThreshold?: string;   // minimum severity to notify
  categories?: string[];        // event types to include
  departments?: string[];       // departments to notify
  executiveOnly?: boolean;      // restrict to executive dept
  quietHours?: {                // suppress during quiet hours
    start: string;              // "22:00"
    end: string;                // "07:00"
    timezone: string;           // "America/New_York"
  };
}
```

---

## Testing Strategy

| Test | Scope | Frequency |
|---|---|---|
| Unit | Policy evaluation, channel routing | Every PR |
| Integration | In-app delivery + real-time push | Every PR |
| Queue | PgBoss job enqueue + process | Every PR |
| E2E | Trigger → deliver → read flow | Nightly |
| Performance | 1000+ concurrent notifications | Weekly |

---

## Failure Modes

| Failure | Impact | Recovery |
|---|---|---|
| Email provider down | Email delivery fails | PgBoss retries; in-app still works |
| Slack webhook invalid | Slack delivery fails | PgBoss retries; dead-letter queue |
| Queue overflow | Delivery delays | Scale PgBoss workers |
| DB failure | In-app write fails | Notification lost (no retry for in-app) |
| WebSocket disconnect | Real-time push fails | Next page load catches up |
| Policy misconfiguration | Notifications suppressed | Audit log reveals; admin fixes |

---

## Recovery Strategy

1. **Email Delivery Failure**: PgBoss retries 3x with exponential backoff; dead-letter queue captures persistent failures
2. **Slack Delivery Failure**: Same as email — queue-based retry with dead-letter
3. **In-App Write Failure**: No retry (synchronous); notification lost — monitor via metrics
4. **Real-time Push Failure**: Best-effort; next client poll or page load retrieves notifications
5. **Queue Overflow**: Scale PgBoss workers; monitor queue depth metrics
6. **Channel Credential Expiry**: Delivery fails; admin must rotate credentials
7. **Policy Misconfiguration**: Notifications silently suppressed; audit log shows policy rejection reasons
