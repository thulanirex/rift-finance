import { useParams, useNavigate } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function InvoiceDetailNew() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock invoice data with blockchain details
  const invoice = {
    id: 'INV-2024-001',
    tokenId: 'rift_inv_7x9k2m4p',
    nftMint: '7xKJ9...mNp2Q',
    amount: 125000,
    currency: 'EUR',
    issueDate: '2024-10-01',
    dueDate: '2024-11-30',
    tenor: 60,
    status: 'funded',
    
    // Parties
    seller: {
      name: 'AutoParts GmbH',
      wallet: '5KHxQ...7mNp',
      verified: true,
      creditScore: 850,
      rating: 'A'
    },
    buyer: {
      name: 'BMW AG',
      wallet: '3JKmP...9xQw',
      verified: true,
      creditScore: 920,
      rating: 'AAA'
    },
    funder: {
      name: 'Institutional Funder',
      wallet: '8NpLq...4rTy',
      verified: true,
      amount: 125000
    },
    
    // Blockchain data
    blockchain: {
      network: 'Solana Devnet',
      mintTx: '2MnKp5wXz...7xQw',
      fundTx: '9PqLm3rTy...5kNp',
      verificationHash: '0x7a8f9e2d1c4b6a3e5f8d9c2b1a4e7f6d',
      ipfsHash: 'Qm...abc123',
      status: 'on-chain',
      confirmations: 1247
    },
    
    // Documents
    documents: [
      {
        name: 'Purchase Order',
        type: 'purchase_order',
        hash: '0x1a2b3c4d...',
        ipfs: 'QmPO...xyz',
        verified: true,
        verifiedBy: 'Operator',
        verifiedAt: '2024-10-02'
      },
      {
        name: 'Bill of Lading',
        type: 'bill_of_lading',
        hash: '0x5e6f7g8h...',
        ipfs: 'QmBOL...abc',
        verified: true,
        verifiedBy: 'Operator',
        verifiedAt: '2024-10-02'
      },
      {
        name: 'Commercial Invoice',
        type: 'commercial_invoice',
        hash: '0x9i0j1k2l...',
        ipfs: 'QmCI...def',
        verified: true,
        verifiedBy: 'Operator',
        verifiedAt: '2024-10-02'
      }
    ],
    
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

  const verificationProgress = (invoice.documents.filter(d => d.verified).length / invoice.documents.length) * 100;

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
                  {invoice.id}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Tokenized Invoice NFT
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Funded
            </Badge>
            <Button
              variant="outline"
              onClick={() => window.open(`https://explorer.solana.com/address/${invoice.nftMint}?cluster=devnet`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View NFT on Explorer
            </Button>
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
                      {invoice.nftMint}
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Token ID</div>
                    <div className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                      {invoice.tokenId}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Verification Hash</div>
                    <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      {invoice.blockchain.verificationHash}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">IPFS Storage</div>
                    <div className="font-mono text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      {invoice.blockchain.ipfsHash}
                      <Download className="h-3 w-3" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Network</div>
                    <Badge variant="outline">{invoice.blockchain.network}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Confirmations</div>
                    <div className="text-sm font-medium text-green-600">{invoice.blockchain.confirmations}</div>
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
                      <div className="text-sm text-slate-600 dark:text-slate-400">{invoice.seller.name}</div>
                      <div className="font-mono text-xs text-slate-500">{invoice.seller.wallet}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 mb-1">
                      Verified
                    </Badge>
                    <div className="text-sm font-medium">Credit Score: {invoice.seller.creditScore}</div>
                    <Badge variant="outline" className="mt-1">Rating: {invoice.seller.rating}</Badge>
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
                      <div className="text-sm text-slate-600 dark:text-slate-400">{invoice.buyer.name}</div>
                      <div className="font-mono text-xs text-slate-500">{invoice.buyer.wallet}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 mb-1">
                      Verified
                    </Badge>
                    <div className="text-sm font-medium">Credit Score: {invoice.buyer.creditScore}</div>
                    <Badge variant="outline" className="mt-1">Rating: {invoice.buyer.rating}</Badge>
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
                      <div className="text-sm text-slate-600 dark:text-slate-400">{invoice.funder.name}</div>
                      <div className="font-mono text-xs text-slate-500">{invoice.funder.wallet}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 mb-1">
                      Verified
                    </Badge>
                    <div className="text-sm font-medium">Funded: €{invoice.funder.amount.toLocaleString()}</div>
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
                {invoice.documents.map((doc, idx) => (
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
                {invoice.signatures.map((sig, idx) => (
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
                    €{invoice.amount.toLocaleString()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Issue Date</div>
                    <div className="text-sm font-medium">{invoice.issueDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Due Date</div>
                    <div className="text-sm font-medium">{invoice.dueDate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Tenor</div>
                    <div className="text-sm font-medium">{invoice.tenor} days</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Days Remaining</div>
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {invoice.financing.daysRemaining}
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
                  <span className="font-medium">{invoice.financing.advanceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Discount Rate</span>
                  <span className="font-medium">{invoice.financing.discountRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Advance Amount</span>
                  <span className="font-medium text-green-600">€{invoice.financing.advanceAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Fee</span>
                  <span className="font-medium">€{invoice.financing.fee.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Expected Repayment</span>
                    <span className="font-bold">€{invoice.financing.expectedRepayment.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Due: {invoice.financing.repaymentDate}</div>
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
