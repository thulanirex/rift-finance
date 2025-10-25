import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Wallet, 
  Shield, 
  ExternalLink,
  Download,
  Hash,
  Users,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function InvoiceDetailNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      const data = await apiClient.invoices.getById(id!);
      setInvoice(data);
    } catch (error: any) {
      console.error('Failed to load invoice:', error);
      toast.error('Failed to load invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading invoice...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-muted-foreground">Invoice not found</p>
            <Button onClick={() => navigate('/invoices')} className="mt-4">Back to Invoices</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Format invoice data for display
  const invoiceData = {
    id: invoice.invoice_number || invoice.id,
    tokenId: invoice.id,
    nftMint: invoice.cnft_mint || 'Not minted',
    amount: invoice.amount_eur,
    currency: invoice.currency || 'EUR',
    issueDate: new Date(invoice.created_at).toLocaleDateString(),
    dueDate: new Date(invoice.due_date).toLocaleDateString(),
    tenor: invoice.tenor_days,
    status: invoice.status,
    
    // Parties
    seller: {
      name: invoice.org_name || 'Seller Organization',
      wallet: 'Not connected',
      verified: true,
      creditScore: invoice.rift_score || 0,
      rating: invoice.rift_grade || 'N/A'
    },
    buyer: {
      name: invoice.counterparty || 'Buyer',
      wallet: 'Not connected',
      verified: false,
      creditScore: 0,
      rating: 'N/A'
    },
    funder: {
      name: 'Pending',
      wallet: 'N/A',
      verified: false,
      amount: 0
    },
    
    // Blockchain data
    blockchain: {
      network: 'Solana Devnet',
      mintTx: invoice.mint_tx || 'Not minted',
      fundTx: 'Pending',
      verificationHash: invoice.file_hash || 'N/A',
      ipfsHash: 'N/A',
      status: invoice.cnft_mint ? 'on-chain' : 'off-chain',
      confirmations: invoice.cnft_mint ? 1 : 0
    },
    
    // Documents
    documents: invoice.file_url ? [
      {
        name: 'Invoice PDF',
        type: 'invoice',
        hash: invoice.file_hash || 'N/A',
        ipfs: 'N/A',
        verified: invoice.status === 'approved' || invoice.status === 'listed' || invoice.status === 'funded',
        verifiedBy: invoice.status === 'approved' ? 'Operator' : null,
        verifiedAt: invoice.status === 'approved' ? new Date(invoice.updated_at).toLocaleDateString() : null,
        url: invoice.file_url
      }
    ] : [],
    
    // Signatures
    signatures: [
      {
        party: 'Seller',
        wallet: '5KHxQ...7mNp',
        signed: true,
        timestamp: '2024-10-01 14:32:15',
        txSignature: '3Km...9xQ'
      },
      {
        party: 'Buyer',
        wallet: '3JKmP...9xQw',
        signed: true,
        timestamp: '2024-10-01 16:45:22',
        txSignature: '7Np...2mK'
      },
      {
        party: 'Funder',
        wallet: '8NpLq...4rTy',
        signed: true,
        timestamp: '2024-10-02 09:15:08',
        txSignature: '5Qw...8pL'
      }
    ],
    
    // Financing details
    financing: {
      advanceRate: 95,
      discountRate: 6.5,
      advanceAmount: 118750,
      fee: 6250,
      expectedRepayment: 125000,
      repaymentDate: '2024-11-30',
      daysRemaining: 22
    }
  };

  const verificationProgress = invoiceData.documents.length > 0 ? (invoiceData.documents.filter(d => d.verified).length / invoiceData.documents.length) * 100 : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                ←
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {invoiceData.id}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Tokenized Invoice NFT
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={
              invoiceData.status === 'funded' ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
              invoiceData.status === 'approved' || invoiceData.status === 'listed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
              'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400'
            }>
              <CheckCircle className="h-3 w-3 mr-1" />
              {invoiceData.status}
            </Badge>
            {invoiceData.nftMint !== 'Not minted' && (
              <Button
                variant="outline"
                onClick={() => window.open(`https://explorer.solana.com/address/${invoiceData.nftMint}?cluster=devnet`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View NFT on Explorer
              </Button>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Blockchain Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  On-Chain Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">NFT Mint Address</div>
                    <div className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {invoiceData.nftMint}
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Token ID</div>
                    <div className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                      {invoiceData.tokenId}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Verification Hash</div>
                    <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      {invoiceData.blockchain.verificationHash}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">IPFS Storage</div>
                    <div className="font-mono text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      {invoiceData.blockchain.ipfsHash}
                      <Download className="h-3 w-3" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Network</div>
                    <Badge variant="outline">{invoiceData.blockchain.network}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Confirmations</div>
                    <div className="text-sm font-medium text-green-600">{invoiceData.blockchain.confirmations}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parties & Wallets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Multi-Party Agreement
                </CardTitle>
                <CardDescription>All parties verified and signed on-chain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Seller */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Seller</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{invoiceData.seller.name}</div>
                      <div className="font-mono text-xs text-slate-500">{invoiceData.seller.wallet}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 mb-1">
                      Verified
                    </Badge>
                    <div className="text-sm font-medium">Credit Score: {invoiceData.seller.creditScore}</div>
                    <Badge variant="outline" className="mt-1">Rating: {invoiceData.seller.rating}</Badge>
                  </div>
                </div>

                {/* Buyer */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Buyer</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{invoiceData.buyer.name}</div>
                      <div className="font-mono text-xs text-slate-500">{invoiceData.buyer.wallet}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 mb-1">
                      Verified
                    </Badge>
                    <div className="text-sm font-medium">Credit Score: {invoiceData.buyer.creditScore}</div>
                    <Badge variant="outline" className="mt-1">Rating: {invoiceData.buyer.rating}</Badge>
                  </div>
                </div>

                {/* Funder */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Funder</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{invoiceData.funder.name}</div>
                      <div className="font-mono text-xs text-slate-500">{invoiceData.funder.wallet}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 mb-1">
                      Verified
                    </Badge>
                    <div className="text-sm font-medium">Funded: €{invoiceData.funder.amount.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents & Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-amber-600" />
                  Document Verification
                </CardTitle>
                <CardDescription>
                  All documents verified and stored on IPFS
                </CardDescription>
                <Progress value={verificationProgress} className="mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                {invoiceData.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-600" />
                      <div>
                        <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{doc.name}</div>
                        <div className="font-mono text-xs text-slate-500">Hash: {doc.hash}</div>
                        <div className="font-mono text-xs text-slate-500">IPFS: {doc.ipfs}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                      <div className="text-xs text-slate-500 mt-1">
                        by {doc.verifiedBy} on {doc.verifiedAt}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Digital Signatures */}
            <Card>
              <CardHeader>
                <CardTitle>On-Chain Signatures</CardTitle>
                <CardDescription>Wallet-based digital signatures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoiceData.signatures.map((sig, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <div className="font-medium text-sm">{sig.party}</div>
                      <div className="font-mono text-xs text-slate-500">{sig.wallet}</div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 mb-1">
                        Signed
                      </Badge>
                      <div className="text-xs text-slate-500">{sig.timestamp}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs mt-1"
                        onClick={() => window.open(`https://explorer.solana.com/tx/${sig.txSignature}?cluster=devnet`, '_blank')}
                      >
                        Tx: {sig.txSignature}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Financing Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Amount</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    €{invoiceData.amount.toLocaleString()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Issue Date</div>
                    <div className="text-sm font-medium">{invoiceData.issueDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Due Date</div>
                    <div className="text-sm font-medium">{invoiceData.dueDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Tenor</div>
                    <div className="text-sm font-medium">{invoiceData.tenor} days</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Days Remaining</div>
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {invoiceData.financing.daysRemaining}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financing Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Advance Rate</span>
                  <span className="font-medium">{invoiceData.financing.advanceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Discount Rate</span>
                  <span className="font-medium">{invoiceData.financing.discountRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Advance Amount</span>
                  <span className="font-medium text-green-600">€{invoiceData.financing.advanceAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Fee</span>
                  <span className="font-medium">€{invoiceData.financing.fee.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Expected Repayment</span>
                    <span className="font-bold">€{invoiceData.financing.expectedRepayment.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Due: {invoiceData.financing.repaymentDate}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Smart Contract Escrow
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      Funds are held in escrow until repayment. Automatic settlement on maturity date.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
