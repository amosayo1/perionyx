import { Bell, CheckCircle2, XCircle, AlertCircle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface NotificationBadgeProps {
  type: 'approval-requested' | 'approval-granted' | 'approval-rejected' | 'escalation-triggered' | 'expiration-approaching';
  count?: number;
  compact?: boolean;
}

export function NotificationBadge({ type, count = 1, compact = false }: NotificationBadgeProps) {
  const notificationConfig = {
    'approval-requested': {
      icon: Bell,
      label: 'Approvals Requested',
      variant: 'warning' as const,
      color: 'text-perionyx-gold',
    },
    'approval-granted': {
      icon: CheckCircle2,
      label: 'Approvals Granted',
      variant: 'success' as const,
      color: 'text-green-400',
    },
    'approval-rejected': {
      icon: XCircle,
      label: 'Approvals Rejected',
      variant: 'danger' as const,
      color: 'text-red-400',
    },
    'escalation-triggered': {
      icon: Zap,
      label: 'Escalations Triggered',
      variant: 'danger' as const,
      color: 'text-red-400',
    },
    'expiration-approaching': {
      icon: AlertCircle,
      label: 'Expirations Approaching',
      variant: 'warning' as const,
      color: 'text-perionyx-gold',
    },
  };

  const config = notificationConfig[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.12)]">
        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        <span className="text-[10px] font-bold text-perionyx-text-primary uppercase">{count}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        <span className="uppercase tracking-[0.18em]">{config.label}</span>
      </Badge>
      {count > 1 && (
        <span className="text-xs font-bold text-perionyx-text-primary bg-[rgba(212,175,55,0.12)] px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}
