import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react';

interface FundInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    amount: number;
    apr: number;
    tenor: number;
    seller: string;
    buyer: string;
  };
}

export function FundInvoiceModal({ open, onOpenChange, invoice }: FundInvoiceModalProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [fundAmount, setFundAmount] = useState(invoice.amount.toString());
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFund = async () => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(fundAmount);
    if (amount < 100 || amount > invoice.amount) {
      toast({
        title: 'Invalid amount',
        description: `Amount must be between €100 and €${invoice.amount.toLocaleString()}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Get auth token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      // Call backend to allocate to pool (SIM mode)
      const response = await fetch(`${API_URL}/api/solana/pool-allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tenorDays: invoice.tenor,
          amount: amount,
          invoiceId: invoice.id,
          walletAddress: publicKey.toBase58(),
          network: 'devnet',
          idempotencyKey: `fund-${invoice.id}-${Date.now()}`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Funding failed');
      }

      const data = await response.json();
      
      setTxSignature(data.txSignature);
      setSuccess(true);

      toast({
        title: 'Invoice Funded!',
        description: `Successfully funded €${amount.toLocaleString()} to ${invoice.id}`,
      });

    } catch (error: any) {
      console.error('Funding error:', error);
      toast({
        title: 'Funding Failed',
        description: error.message || 'Transaction failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setTxSignature(null);
    onOpenChange(false);
  };

  const expectedYield = (parseFloat(fundAmount) * (invoice.apr / 100) * (invoice.tenor / 365)).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <DialogTitle className="text-2xl mb-2">Funding Successful!</DialogTitle>
            <DialogDescription className="mb-6">
              Your transaction has been confirmed on Solana
            </DialogDescription>
            
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Transaction Signature</div>
                <div className="font-mono text-xs break-all">{txSignature}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Funded Amount</div>
                  <div className="text-lg font-bold">€{parseFloat(fundAmount).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Expected Yield</div>
                  <div className="text-lg font-bold text-green-600">€{expectedYield}</div>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => window.open(`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Solana Explorer
              </Button>

              <Button variant="outline" className="w-full" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Fund Invoice</DialogTitle>
              <DialogDescription>
                Review details and confirm funding for {invoice.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Invoice Details */}
              <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Seller</span>
                  <span className="font-medium">{invoice.seller}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Buyer</span>
                  <span className="font-medium">{invoice.buyer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">APR</span>
                  <span className="font-medium text-green-600">{invoice.apr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Tenor</span>
                  <span className="font-medium">{invoice.tenor} days</span>
                </div>
              </div>

              {/* Funding Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Funding Amount (EUR)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount"
                />
                <p className="text-xs text-slate-500">
                  Max: €{invoice.amount.toLocaleString()}
                </p>
              </div>

              {/* Expected Returns */}
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-900 dark:text-green-100">Expected Yield</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    €{expectedYield}
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Based on {invoice.apr}% APR over {invoice.tenor} days
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={handleFund}
                  disabled={loading || !publicKey}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm & Fund'
                  )}
                </Button>
              </div>

              {!publicKey && (
                <p className="text-xs text-amber-600 text-center">
                  Please connect your wallet to fund this invoice
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
