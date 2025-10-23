import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AllocationModal } from '@/components/AllocationModal';
import { useGateStatus } from '@/hooks/useGateVerification';
import { useFunderProfile } from '@/hooks/useFunderProfile';
import { TrendingUp, MapPin, Calendar, DollarSign, Lock, Filter, Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Market() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { gateStatus } = useGateStatus();
  const { profile } = useFunderProfile();
  const { publicKey, connected } = useWallet();

  const isVerified = gateStatus?.gate_status === 'verified';
  const profileApproved = profile?.status === 'approved';
  const hasWalletAddress = !!gateStatus?.wallet_address;
  const canAllocate = isVerified && profileApproved && (connected || hasWalletAddress);

  // Allocation modal state
  const [allocationModal, setAllocationModal] = useState<{
    open: boolean;
    tenorDays: number;
    apr: number;
    invoiceId?: string;
    invoiceNumber?: string;
  }>({
    open: false,
    tenorDays: 30,
    apr: 0.05,
  });

  // Filters from URL
  const gradeFilter = searchParams.get('grade') || 'AB';
  const tenorFilter = searchParams.get('tenor') || 'Any';
  const countryFilter = searchParams.get('country') || '';
  const amountBandFilter = searchParams.get('amount_band') || '';

  const setFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'any') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Fetch pools
  const { data: pools, isLoading, refetch: refetchPools } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const data = await apiClient.pools.getAll();
      return data || [];
    },
  });

  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['market-invoices', gradeFilter, tenorFilter, countryFilter, amountBandFilter],
    queryFn: async () => {
      // Get all invoices from MySQL backend
      const data = await apiClient.invoices.getAll();
      
      // Filter based on search params
      let filtered = data || [];
      
      // Apply filters (simple client-side filtering for now)
      if (tenorFilter && tenorFilter !== 'Any') {
        const days = parseInt(tenorFilter);
        filtered = filtered.filter((inv: any) => {
          const daysUntilDue = Math.ceil((new Date(inv.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilDue <= days;
        });
      }
      
      if (countryFilter) {
        filtered = filtered.filter((inv: any) => inv.country === countryFilter);
      }
      
      // Only show listed invoices
      return filtered.filter((inv: any) => inv.status === 'listed');
    },
  });

  const handleAllocateSuccess = () => {
    refetchPools();
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Marketplace</h1>
            <div className="flex gap-2 items-center">
              {isVerified && profileApproved && (
                <>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
                    {connected && publicKey ? (
                      <>
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-sm font-mono">
                          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                        </span>
                      </>
                    ) : hasWalletAddress ? (
                      <>
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-sm">Demo Wallet</span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not Connected</span>
                    )}
                  </div>
                  <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !h-10 !px-4 !rounded-md !text-sm !font-medium" />
                </>
              )}
              <Button variant="outline" onClick={() => navigate('/dashboard/funder')}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="invoices">Invoice Market</TabsTrigger>
            <TabsTrigger value="pools">Pools</TabsTrigger>
          </TabsList>

          {/* Invoice Market Tab */}
          <TabsContent value="invoices" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Grade</label>
                    <Select value={gradeFilter} onValueChange={(v) => setFilter('grade', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A Only</SelectItem>
                        <SelectItem value="AB">A + B</SelectItem>
                        <SelectItem value="All">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tenor</label>
                    <Select value={tenorFilter} onValueChange={(v) => setFilter('tenor', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="120">120 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Amount Band</label>
                    <Select value={amountBandFilter} onValueChange={(v) => setFilter('amount_band', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="small">€ &lt; 50k</SelectItem>
                        <SelectItem value="medium">€ 50k - 250k</SelectItem>
                        <SelectItem value="large">€ &gt; 250k</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchParams(new URLSearchParams());
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Grid */}
            {invoicesLoading ? (
              <div className="text-center py-12">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No invoices match your filters. Try adjusting your criteria.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invoices.map((invoice: any) => (
                  <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Invoice #{invoice.invoice_number}</CardTitle>
                          <CardDescription>
                            <Badge variant="outline" className="mt-1">
                              {invoice.tenor_days}d
                            </Badge>
                          </CardDescription>
                        </div>
                        <Badge className={getGradeColor(invoice.rift_grade)}>
                          {invoice.rift_grade}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          Amount
                        </div>
                        <span className="font-semibold">€{invoice.amount_eur.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Due
                        </div>
                        <span className="text-sm">{new Date(invoice.due_date).toLocaleDateString()}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          Buyer
                        </div>
                        <span className="text-sm">{invoice.buyer_country}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="text-sm text-muted-foreground">Pool APR</div>
                        <span className="font-bold text-green-600">{(invoice.pool_apr * 100).toFixed(1)}%</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Expected Yield</div>
                        <span className="font-medium">€{invoice.expected_yield.toFixed(2)}</span>
                      </div>

                      <Button 
                        className="w-full mt-4"
                        disabled={!canAllocate}
                        onClick={() => {
                          const pool = pools?.find(p => p.tenor_days === invoice.tenor_days);
                          setAllocationModal({
                            open: true,
                            tenorDays: invoice.tenor_days,
                            apr: pool?.apr || 0,
                            invoiceId: invoice.id,
                            invoiceNumber: invoice.invoice_number,
                          });
                        }}
                      >
                        {!isVerified || !profileApproved ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Verification Required
                          </>
                        ) : !connected && !hasWalletAddress ? (
                          <>
                            <Wallet className="mr-2 h-4 w-4" />
                            Connect Wallet
                          </>
                        ) : (
                          'Allocate'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pools Tab */}
          <TabsContent value="pools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pools?.map((pool) => (
                <Card key={pool.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{pool.tenor_days}-Day Pool</span>
                      <Badge variant="outline">DEVNET</Badge>
                    </CardTitle>
                    <CardDescription>Short-term invoice financing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">APR</span>
                        <span className="text-2xl font-bold text-green-600">
                          {(pool.apr * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">TVL</span>
                        <span className="font-semibold">€{((pool.tvl || 0) / 1000).toFixed(1)}k</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Available</span>
                        <span className="font-semibold">
                          €{((pool.available_liquidity || 0) / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>

                    <Button 
                      className="w-full"
                      disabled={!canAllocate}
                      onClick={() => {
                        setAllocationModal({
                          open: true,
                          tenorDays: pool.tenor_days,
                          apr: pool.apr,
                        });
                      }}
                    >
                      {!isVerified || !profileApproved ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Verification Required
                        </>
                      ) : !connected && !hasWalletAddress ? (
                        <>
                          <Wallet className="mr-2 h-4 w-4" />
                          Connect Wallet
                        </>
                      ) : (
                        'Allocate Funds'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AllocationModal
        open={allocationModal.open}
        onOpenChange={(open) => setAllocationModal({ ...allocationModal, open })}
        tenorDays={allocationModal.tenorDays}
        apr={allocationModal.apr}
        invoiceId={allocationModal.invoiceId}
        invoiceNumber={allocationModal.invoiceNumber}
        onSuccess={handleAllocateSuccess}
        gateStatus={gateStatus?.gate_status}
        profileStatus={profile?.status}
      />
    </div>
  );
}
