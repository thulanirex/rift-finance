import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { useGateStatus, useGateVerify } from '@/hooks/useGateVerification';

export function GateVerificationBanner() {
  const { gateStatus, loading, refetch } = useGateStatus();
  const { verify, verifying } = useGateVerify();

  const handleVerify = async () => {
    const result = await verify();
    if (result.success) {
      refetch();
    }
  };

  if (loading) {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>Checking verification status...</AlertTitle>
      </Alert>
    );
  }

  if (!gateStatus) return null;

  if (gateStatus.gate_status === 'verified') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">Verified</AlertTitle>
        <AlertDescription className="text-green-700">
          You're verified and can fund invoices
          {gateStatus.wallet_address && (
            <Badge variant="outline" className="ml-2">
              {gateStatus.wallet_address.slice(0, 4)}...{gateStatus.wallet_address.slice(-4)}
            </Badge>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (gateStatus.gate_status === 'denied') {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Verification Denied</AlertTitle>
        <AlertDescription>
          Your verification was denied. Please contact support for assistance.
        </AlertDescription>
      </Alert>
    );
  }

  if (gateStatus.gate_status === 'pending') {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>Verification Pending</AlertTitle>
        <AlertDescription>
          Your verification is being processed. This usually takes a few minutes.
        </AlertDescription>
      </Alert>
    );
  }

  // Unverified state
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Verify to Fund</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          Complete a quick verification to enable funding. No documents needed for this pilot.
        </p>
        <Button 
          onClick={handleVerify} 
          disabled={verifying}
          size="sm"
        >
          {verifying ? 'Verifying...' : 'Verify now'}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
