import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, XCircle, ZapOff } from 'lucide-react';

export interface ApprovalStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  compact?: boolean;
}

export function ApprovalStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  compact = false,
}: ApprovalStatusBadgeProps) {
  const statusConfig = {
    pending: {
      variant: 'warning' as const,
      label: 'Pending',
      icon: Clock,
      color: 'text-perionyx-gold',
    },
    approved: {
      variant: 'success' as const,
      label: 'Approved',
      icon: CheckCircle2,
      color: 'text-green-400',
    },
    rejected: {
      variant: 'danger' as const,
      label: 'Rejected',
      icon: XCircle,
      color: 'text-red-400',
    },
    escalated: {
      variant: 'warning' as const,
      label: 'Escalated',
      icon: AlertCircle,
      color: 'text-perionyx-gold',
    },
    expired: {
      variant: 'danger' as const,
      label: 'Expired',
      icon: ZapOff,
      color: 'text-red-400',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-1',
    md: 'text-[11px] px-3 py-1.5',
    lg: 'text-[12px] px-4 py-2',
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {showIcon && <Icon className={`w-4 h-4 ${config.color}`} />}
        <span className="text-xs font-semibold text-perionyx-text-primary uppercase tracking-wide">
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <Badge variant={config.variant} className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span className="uppercase tracking-[0.18em]">{config.label}</span>
    </Badge>
  );
}
