import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { useGateStatus } from '@/hooks/useGateVerification';

export function GateStatusBadge() {
  const { gateStatus, loading } = useGateStatus();

  if (loading || !gateStatus) return null;

  const statusConfig = {
    verified: {
      icon: CheckCircle2,
      text: 'Verified',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    pending: {
      icon: Clock,
      text: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    denied: {
      icon: XCircle,
      text: 'Denied',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
    unverified: {
      icon: AlertCircle,
      text: 'Unverified',
      className: 'bg-gray-100 text-gray-800 border-gray-200',
    },
  };

  const config = statusConfig[gateStatus.gate_status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
      {gateStatus.wallet_address && gateStatus.gate_status === 'verified' && (
        <span className="ml-1 text-xs opacity-70">
          {gateStatus.wallet_address.slice(0, 4)}...{gateStatus.wallet_address.slice(-4)}
        </span>
      )}
    </Badge>
  );
}
