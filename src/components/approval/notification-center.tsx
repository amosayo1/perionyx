'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationBadge } from '@/components/approval';
import { X, Bell } from 'lucide-react';
import { useState } from 'react';

export interface ApprovalNotification {
  id: string;
  type: 'approval-requested' | 'approval-granted' | 'approval-rejected' | 'escalation-triggered' | 'expiration-approaching';
  title: string;
  message: string;
  timestamp: string;
  transactionId?: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface NotificationCenterProps {
  notifications: ApprovalNotification[];
  onDismiss?: (id: string) => void;
  isLoading?: boolean;
}

export function NotificationCenter({ notifications, onDismiss, isLoading = false }: NotificationCenterProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissedIds(new Set([...dismissedIds, id]));
    onDismiss?.(id);
  };

  const visibleNotifications = notifications.filter((n) => !dismissedIds.has(n.id));
  const unreadCount = visibleNotifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Operational Notifications</CardTitle>
          <CardDescription className="text-perionyx-text-muted">Approval workflow notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleNotifications.length === 0) {
    return (
      <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-perionyx-text-primary">Operational Notifications</CardTitle>
          <CardDescription className="text-perionyx-text-muted">No active notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Bell className="w-8 h-8 text-perionyx-text-muted opacity-50" />
            <div className="text-center text-sm text-perionyx-text-muted">All systems operational. No pending notifications.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[rgba(212,175,55,0.12)] bg-perionyx-bg-panel shadow-soft">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium text-perionyx-text-primary">Operational Notifications</CardTitle>
            <CardDescription className="text-perionyx-text-muted">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All notifications read'}
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">
              {unreadCount}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-all ${
                notification.priority === 'high'
                  ? 'border-red-600/30 bg-[rgba(139,0,0,0.1)]'
                  : notification.priority === 'medium'
                    ? 'border-perionyx-gold/30 bg-[rgba(212,175,55,0.08)]'
                    : 'border-[rgba(212,175,55,0.12)] bg-[rgba(212,175,55,0.04)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <NotificationBadge type={notification.type} count={1} compact={true} />
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-perionyx-gold flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-perionyx-text-primary">{notification.title}</div>
                  <div className="text-xs text-perionyx-text-muted mt-1">{notification.message}</div>
                  <div className="text-[10px] text-perionyx-text-muted mt-2">{notification.timestamp}</div>
                </div>
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="flex-shrink-0 p-1 text-perionyx-text-muted hover:text-perionyx-text-primary transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
