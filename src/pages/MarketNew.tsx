import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FundInvoiceModal } from '@/components/FundInvoiceModal';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  Clock,
  Hash,
  Wallet,
  ExternalLink,
  FileText
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function MarketNew() {
  const navigate = useNavigate();
  const { connected } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [tenorFilter, setTenorFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [fundModalOpen, setFundModalOpen] = useState(false);

  // Mock invoices with blockchain data
  const invoices = [
    {
      id: 'INV-2024-001',
      tokenId: 'rift_inv_7x9k2m4p',
      nftMint: '7xKJ9mNp2QvXz8kLpRtYwNmHqS4vFdE3cBaG1hJiKuMn',
      seller: 'AutoParts GmbH',
      buyer: 'BMW AG',
      amount: 125000,
      tenor: 30,
      apr: 6.5,
      rating: 'A',
      creditScore: 850,
      dueDate: '2024-11-30',
      verified: true,
      documentsVerified: 3,
      totalDocuments: 3,
      ipfsHash: 'Qm...abc123',
      status: 'available',
      advanceRate: 95,
    },
    {
      id: 'INV-2024-005',
      tokenId: 'rift_inv_3m8n5k2p',
      nftMint: '3MnKp5wXzQvYz9kLpRtYwNmHqS4vFdE3cBaG1hJiKuMn',
      seller: 'AeroSupply Ltd',
      buyer: 'Airbus SE',
      amount: 250000,
      tenor: 120,
      apr: 8.5,
      rating: 'AAA',
      creditScore: 920,
      dueDate: '2025-01-15',
      verified: true,
      documentsVerified: 4,
      totalDocuments: 4,
      ipfsHash: 'Qm...def456',
      status: 'available',
      advanceRate: 98,
    },
    {
      id: 'INV-2024-003',
      tokenId: 'rift_inv_9p2k7m4n',
      nftMint: '9PqLm3rTyQvXz8kLpRtYwNmHqS4vFdE3cBaG1hJiKuMn',
      seller: 'FoodSupply BV',
      buyer: 'Carrefour SA',
      amount: 65000,
      tenor: 90,
      apr: 7.0,
      rating: 'B',
      creditScore: 780,
      dueDate: '2024-12-25',
      verified: true,
      documentsVerified: 3,
      totalDocuments: 3,
      ipfsHash: 'Qm...ghi789',
      status: 'available',
      advanceRate: 90,
    },
    {
      id: 'INV-2024-004',
      tokenId: 'rift_inv_5k8m2p9n',
      nftMint: '5KHxQ7mNpQvXz8kLpRtYwNmHqS4vFdE3cBaG1hJiKuMn',
      seller: 'MedEquip SpA',
      buyer: 'Philips NV',
      amount: 95000,
      tenor: 90,
      apr: 7.2,
      rating: 'A',
      creditScore: 880,
      dueDate: '2024-12-12',
      verified: true,
      documentsVerified: 3,
      totalDocuments: 3,
      ipfsHash: 'Qm...jkl012',
      status: 'available',
      advanceRate: 95,
    },
    {
      id: 'INV-2024-002',
      tokenId: 'rift_inv_2n7k4m8p',
      nftMint: '2MnKp5wXzQvYz9kLpRtYwNmHqS4vFdE3cBaG1hJiKuMn',
      seller: 'TechComponents Ltd',
      buyer: 'Siemens AG',
      amount: 85000,
      tenor: 30,
      apr: 6.8,
      rating: 'A',
      creditScore: 820,
      dueDate: '2024-12-05',
      verified: true,
      documentsVerified: 3,
      totalDocuments: 3,
      ipfsHash: 'Qm...mno345',
      status: 'available',
      advanceRate: 93,
    },
  ];

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTenor = tenorFilter === 'all' || inv.tenor.toString() === tenorFilter;
    const matchesRating = ratingFilter === 'all' || inv.rating === ratingFilter;
    return matchesSearch && matchesTenor && matchesRating;
  });

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'AAA':
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400';
      case 'B': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400';
      case 'C': return 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Invoice Market
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Browse tokenized invoices available for funding
            </p>
          </div>
          {!connected && (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              Connect wallet to fund invoices
            </Badge>
          )}
        </div>

        {/* Filters */}
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={tenorFilter} onValueChange={setTenorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tenor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenors</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="120">120 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="AAA">AAA</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => navigate(`/invoices/${invoice.id}`)}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                            {invoice.id}
                          </div>
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                            NFT
                          </Badge>
                          {invoice.verified && (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          {invoice.seller} → {invoice.buyer}
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-300 flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          NFT Mint
                        </div>
                        <div className="font-mono text-xs font-medium text-slate-900 dark:text-white flex items-center gap-1">
                          {invoice.nftMint}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://explorer.solana.com/address/${invoice.nftMint}?cluster=devnet`, '_blank');
                            }}
                          >
                            <ExternalLink className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-300">Token ID</div>
                        <div className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                          {invoice.tokenId}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-300">IPFS Storage</div>
                        <div className="font-mono text-xs text-slate-600 dark:text-slate-300">
                          {invoice.ipfsHash}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-300">Documents</div>
                        <div className="text-xs font-medium text-green-600 dark:text-green-400">
                          {invoice.documentsVerified}/{invoice.totalDocuments} verified
                        </div>
                      </div>
                    </div>

                    {/* Main Details */}
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-300">Amount</div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          €{invoice.amount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-300">APR</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {invoice.apr}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-300">Tenor</div>
                        <div className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {invoice.tenor}d
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-300">Credit Rating</div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRatingColor(invoice.rating)}>
                            {invoice.rating}
                          </Badge>
                          <span className="text-xs text-slate-600 dark:text-slate-400">{invoice.creditScore}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-300">Advance Rate</div>
                        <div className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
                          {invoice.advanceRate}%
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Shield className="h-3 w-3" />
                        <span>Smart contract escrow • Instant settlement • On-chain verification</span>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInvoice(invoice);
                          setFundModalOpen(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        disabled={!connected}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Fund Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No invoices found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your filters or search term
              </p>
            </CardContent>
          </Card>
        )}

        {/* Funding Modal */}
        {selectedInvoice && (
          <FundInvoiceModal
            open={fundModalOpen}
            onOpenChange={setFundModalOpen}
            invoice={selectedInvoice}
          />
        )}
      </div>
    </AppLayout>
  );
}
