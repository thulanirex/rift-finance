import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GateVerificationBanner } from '@/components/GateVerificationBanner';
import { useGateStatus } from '@/hooks/useGateVerification';
import { useFunderProfile } from '@/hooks/useFunderProfile';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Clock, CheckCircle, ExternalLink, BarChart3, PieChart, LogOut, Settings, Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletInstallPrompt } from '@/components/WalletInstallPrompt';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function FunderDashboard() {
  const navigate = useNavigate();
  const { gateStatus } = useGateStatus();
  const { profile } = useFunderProfile();
  const { publicKey, connected } = useWallet();
  const [positionDrawer, setPositionDrawer] = useState<any>(null);

  const isVerified = gateStatus?.gate_status === 'verified';
  const needsOnboarding = !profile || profile.status === 'draft';
  const hasWalletAddress = !!gateStatus?.wallet_address;

  // Fetch user's positions
  const { data: positions, isLoading: positionsLoading, refetch: refetchPositions } = useQuery({
    queryKey: ['my-positions'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('positions-my');
      if (error) throw error;
      return data.positions || [];
    },
    enabled: isVerified,
  });

  // Fetch metrics for charts
  const { data: metrics } = useQuery({
    queryKey: ['funder-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('metrics-funder');
      if (error) throw error;
      return data;
    },
    enabled: isVerified,
  });

  const handleRedeem = async (positionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('pool-redeem', {
        body: { position_id: positionId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Position redeemed successfully!', {
        description: `Total: €${data.redemption?.total.toFixed(2)}`,
      });

      refetchPositions();
    } catch (error: any) {
      console.error('Redeem error:', error);
      toast.error(error.message || 'Failed to redeem position');
    }
  };

  const summary = metrics?.summary || {
    total_principal: 0,
    total_accrued: 0,
    total_expected: 0,
    active_positions: 0,
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Funder Dashboard</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/market')}>
                Marketplace
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Home
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/onboarding/funder')}>
                    Verification
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate('/auth');
                      toast.success('Logged out successfully');
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <GateVerificationBanner />

          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>Your funder profile verification progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {profile.status === 'approved' ? (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      ) : (
                        <Clock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Profile Status</p>
                      <Badge
                        variant={
                          profile.status === 'approved'
                            ? 'default'
                            : profile.status === 'in_review'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {profile.status}
                      </Badge>
                    </div>
                  </div>
                  {needsOnboarding && (
                    <Button onClick={() => navigate('/onboarding/funder')}>
                      Complete Verification
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isVerified && profile?.status === 'approved' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Solana Wallet Connection
                </CardTitle>
                <CardDescription>
                  Connect your Solana wallet to fund invoices on Devnet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {connected && publicKey ? (
                      <>
                        <p className="font-medium text-green-600">Wallet Connected</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
                        </p>
                      </>
                    ) : hasWalletAddress ? (
                      <>
                        <p className="font-medium">Demo Wallet Active</p>
                        <p className="text-sm text-muted-foreground">
                          Connect your own wallet to use on Devnet
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">No Wallet Connected</p>
                        <p className="text-sm text-muted-foreground">
                          Connect a Solana wallet to start funding
                        </p>
                      </>
                    )}
                  </div>
                  <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !h-10 !px-4 !rounded-md !text-sm !font-medium" />
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Devnet Mode:</strong> This platform uses Solana Devnet for testing. Use test EURC tokens for allocations.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {needsOnboarding && !profile && (
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  You need to complete the funder verification to access funding pools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/onboarding/funder')}>
                  Start Verification
                </Button>
              </CardContent>
            </Card>
          )}

          {isVerified && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">€{summary.total_principal.toFixed(2)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Accrued Yield</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">€{summary.total_accrued.toFixed(2)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Expected Yield</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">€{summary.total_expected.toFixed(2)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{summary.active_positions}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {isVerified && metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metrics.accrual_timeseries?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Accrued Yield Over Time
                    </CardTitle>
                    <CardDescription>Last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={metrics.accrual_timeseries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {metrics.allocations_by_tenor?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Allocations by Tenor
                    </CardTitle>
                    <CardDescription>Last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={metrics.allocations_by_tenor}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tenor" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {metrics.exposure_by_country?.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Exposure by Country
                    </CardTitle>
                    <CardDescription>Geographic distribution of investments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={metrics.exposure_by_country}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.country}: €${entry.amount.toFixed(0)}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {metrics.exposure_by_country.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {isVerified && (
            <Card>
              <CardHeader>
                <CardTitle>My Positions</CardTitle>
                <CardDescription>Track your active and closed positions</CardDescription>
              </CardHeader>
              <CardContent>
                {positionsLoading ? (
                  <p>Loading positions...</p>
                ) : positions && positions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tenor</TableHead>
                          <TableHead>Principal</TableHead>
                          <TableHead>Accrued</TableHead>
                          <TableHead>Expected</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Opened</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positions.map((position: any) => (
                          <TableRow 
                            key={position.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setPositionDrawer(position)}
                          >
                            <TableCell>{position.pool?.tenor_days}d</TableCell>
                            <TableCell>€{parseFloat(position.amount_funded).toFixed(2)}</TableCell>
                            <TableCell className="text-green-600">
                              €{parseFloat(position.accrued_yield).toFixed(2)}
                            </TableCell>
                            <TableCell>€{parseFloat(position.expected_yield).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={position.status === 'active' ? 'default' : 'secondary'}>
                                {position.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(position.opened_at || position.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {position.status === 'active' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRedeem(position.id);
                                    }}
                                  >
                                    Redeem
                                  </Button>
                                )}
                                {position.chain_tx && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (position.chain_tx.startsWith('SIM')) {
                                        toast.info('Simulated transaction (demo mode)');
                                      } else {
                                        window.open(
                                          `https://explorer.solana.com/tx/${position.chain_tx}?cluster=devnet`,
                                          '_blank'
                                        );
                                      }
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No positions yet. Visit the marketplace to get started.
                    </p>
                    <Button onClick={() => navigate('/market')}>
                      Go to Marketplace
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Sheet open={!!positionDrawer} onOpenChange={() => setPositionDrawer(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Position Details</SheetTitle>
            <SheetDescription>
              {positionDrawer?.pool?.tenor_days}d Pool • {positionDrawer?.status}
            </SheetDescription>
          </SheetHeader>

          {positionDrawer && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Principal</p>
                  <p className="text-lg font-semibold">€{parseFloat(positionDrawer.amount_funded).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accrued Yield</p>
                  <p className="text-lg font-semibold text-green-600">
                    €{parseFloat(positionDrawer.accrued_yield).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Yield</p>
                  <p className="text-lg font-semibold">€{parseFloat(positionDrawer.expected_yield).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-lg font-semibold">
                    {((parseFloat(positionDrawer.accrued_yield) / parseFloat(positionDrawer.expected_yield)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Transaction</p>
                {positionDrawer.chain_tx ? (
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                      {positionDrawer.chain_tx}
                    </code>
                    {!positionDrawer.chain_tx.startsWith('SIM') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(
                            `https://explorer.solana.com/tx/${positionDrawer.chain_tx}?cluster=devnet`,
                            '_blank'
                          );
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No transaction signature</p>
                )}
              </div>

              {positionDrawer.invoice && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Linked Invoice</p>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="font-medium">#{positionDrawer.invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {positionDrawer.invoice.counterparty}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Opened</p>
                <p className="text-sm">
                  {new Date(positionDrawer.opened_at || positionDrawer.created_at).toLocaleString()}
                </p>
                {positionDrawer.closed_at && (
                  <>
                    <p className="text-sm text-muted-foreground mb-1 mt-2">Closed</p>
                    <p className="text-sm">{new Date(positionDrawer.closed_at).toLocaleString()}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
