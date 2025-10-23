import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { AlertCircle, Wallet as WalletIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface AllocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenorDays: number;
  apr: number;
  invoiceId?: string;
  invoiceNumber?: string;
  onSuccess?: () => void;
  gateStatus?: string;
  profileStatus?: string;
}

export function AllocationModal({
  open,
  onOpenChange,
  tenorDays,
  apr,
  invoiceId,
  invoiceNumber,
  onSuccess,
  gateStatus,
  profileStatus,
}: AllocationModalProps) {
  const navigate = useNavigate();
  const { publicKey, connected, disconnect } = useWallet();
  const [amount, setAmount] = useState('');
  const [disclaimer, setDisclaimer] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [allocating, setAllocating] = useState(false);

  const isVerified = gateStatus === 'verified' && profileStatus === 'approved';
  const canAllocate = isVerified && connected;
  const network = 'DEVNET'; // Solana Testnet

  // Calculate expected yield
  const expectedYield = amount ? (parseFloat(amount) * apr * (tenorDays / 365)).toFixed(2) : '0.00';

  const handleAllocate = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your Solana wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) < 100) {
      toast.error('Minimum allocation is €100');
      return;
    }

    if (parseFloat(amount) > 250000) {
      toast.error('Maximum allocation is €250,000');
      return;
    }

    if (!disclaimer || !termsAccepted) {
      toast.error('Please accept all terms and disclaimers');
      return;
    }

    setAllocating(true);
    try {
      console.log('🚀 Allocating funds to Solana pool...');
      
      const result = await apiClient.solana.poolAllocate({
        tenorDays,
        amount: parseFloat(amount),
        invoiceId: invoiceId || null,
        walletAddress: publicKey.toBase58(),
        network: 'devnet',
        idempotencyKey: crypto.randomUUID(),
      });

      console.log('✅ Allocation successful:', result);

      if (result.error) {
        if (result.code === 'GATE_REQUIRED') {
          toast.error('Verification required', {
            description: 'Complete your verification to allocate funds',
            action: {
              label: 'Verify Now',
              onClick: () => navigate('/onboarding/funder'),
            },
          });
          return;
        }
        throw new Error(result.error);
      }

      const explorerUrl = result.signature ? `https://explorer.solana.com/tx/${result.signature}?cluster=${network.toLowerCase()}` : null;

      toast.success(`Successfully allocated €${amount} to ${tenorDays}d pool!`, {
        description: result.signature ? `Transaction: ${result.signature.slice(0, 8)}...` : 'Allocation recorded on-chain',
        action: explorerUrl ? {
          label: 'Explorer',
          onClick: () => window.open(explorerUrl, '_blank'),
        } : undefined,
      });

      onOpenChange(false);
      setAmount('');
      setDisclaimer(false);
      setTermsAccepted(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Allocation error:', error);
      
      if (error.message?.includes('429')) {
        toast.error('Rate limit exceeded', {
          description: 'Please wait a moment before trying again',
        });
      } else {
        toast.error(error.message || 'Failed to allocate funds');
      }
    } finally {
      setAllocating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Allocate to {tenorDays}d Pool
            {invoiceNumber && <span className="text-sm font-normal text-muted-foreground ml-2">• Invoice #{invoiceNumber}</span>}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <span>APR: {(apr * 100).toFixed(1)}% • Tenor: {tenorDays} days</span>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
              Solana {network}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {!isVerified && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-2">
              <span>Verification required to allocate funds</span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/onboarding/funder')}
                >
                  Complete Verification
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => window.location.reload()}
                >
                  Check Status
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isVerified && !connected && (
          <Alert>
            <WalletIcon className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-3">
              <span>Connect your Solana wallet to stake EURC funds</span>
              <div className="flex flex-col gap-2">
                <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !h-10 !px-4 !rounded-md !text-sm !font-medium !w-full" />
                <span className="text-xs text-center text-muted-foreground">
                  Phantom, Solflare, or Torus supported
                </span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isVerified && connected && publicKey && (
          <Alert>
            <WalletIcon className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-medium">Wallet Connected</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => disconnect()}
              >
                Disconnect
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="amount">Amount (EUR)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              max="250000"
              step="100"
              disabled={!canAllocate}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Min: €100 • Max: €250,000
            </p>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Principal:</span>
                  <span className="font-medium">€{parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Yield:</span>
                  <span className="font-medium text-green-600">€{expectedYield}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total at Maturity:</span>
                  <span>€{(parseFloat(amount) + parseFloat(expectedYield)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="disclaimer"
                checked={disclaimer}
                onCheckedChange={(checked) => setDisclaimer(checked as boolean)}
                disabled={!canAllocate}
              />
              <label
                htmlFor="disclaimer"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this uses test EURC on Solana Devnet. Funds are tracked in the ledger for demonstration purposes.
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                disabled={!canAllocate}
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the Pilot Investment Terms and understand this uses Solana Testnet ({network}) with test tokens.
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={allocating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAllocate} 
            disabled={allocating || !canAllocate || !disclaimer || !termsAccepted || !amount}
          >
            {allocating ? 'Allocating EURC...' : 'Allocate EURC'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
