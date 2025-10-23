import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, Activity, Download } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function OperatorPools() {
  const navigate = useNavigate();
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [creditTenor, setCreditTenor] = useState('30');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [crediting, setCrediting] = useState(false);

  // Fetch pools
  const { data: pools, refetch: refetchPools } = useQuery({
    queryKey: ['ops-pools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .order('tenor_days', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch pool snapshots for chart
  const { data: snapshots } = useQuery({
    queryKey: ['pool-snapshots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pool_snapshots')
        .select('*, pool:pools(tenor_days)')
        .order('timestamp', { ascending: true })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Fetch ledger entries
  const { data: ledgerEntries } = useQuery({
    queryKey: ['pool-ledger'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ledger_entries')
        .select('*, pool:pools(tenor_days), user:users(email)')
        .not('pool_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Fetch health
  const { data: health } = useQuery({
    queryKey: ['ops-health'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ops-health');
      if (error) throw error;
      return data;
    },
  });

  const handleCreditRepayment = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setCrediting(true);
    try {
      const { data, error } = await supabase.functions.invoke('pool-credit-repayment', {
        body: {
          pool_tenor: parseInt(creditTenor),
          amount: parseFloat(creditAmount),
          note: creditNote,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Credited €${creditAmount} to ${creditTenor}d pool`, {
        description: `Distributed to ${data.distributions} positions`,
      });

      setCreditDialogOpen(false);
      setCreditAmount('');
      setCreditNote('');
      refetchPools();
    } catch (error: any) {
      console.error('Credit error:', error);
      toast.error(error.message || 'Failed to credit repayment');
    } finally {
      setCrediting(false);
    }
  };

  const totalTVL = pools?.reduce((sum, p) => sum + (Number(p.tvl) || 0), 0) || 0;
  const totalAvailable = pools?.reduce((sum, p) => sum + (Number(p.available_liquidity) || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Operator: Pools</h1>
            <Button variant="outline" onClick={() => navigate('/')}>
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Health Status */}
          {health && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                      {health.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cluster</p>
                    <Badge variant="outline">{health.cluster}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Relayer Balance</p>
                    <p className="font-medium">{health.relayer?.balance_sol} SOL</p>
                    {health.relayer?.warning && (
                      <p className="text-xs text-destructive">{health.relayer.warning}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Accrual</p>
                    <p className="text-xs">
                      {health.accrual?.last_run 
                        ? new Date(health.accrual.last_run).toLocaleString()
                        : 'Never'}
                    </p>
                    {health.accrual?.warning && (
                      <p className="text-xs text-destructive">{health.accrual.warning}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total TVL</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">€{totalTVL.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Available Liquidity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">€{totalAvailable.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{health?.stats?.active_positions || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{health?.stats?.recent_errors || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ledger">Ledger</TabsTrigger>
              <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Pools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pools?.map((pool) => (
                  <Card key={pool.id}>
                    <CardHeader>
                      <CardTitle>{pool.tenor_days}-Day Pool</CardTitle>
                      <CardDescription>APR: {(pool.apr * 100).toFixed(1)}%</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TVL</span>
                        <span className="font-semibold">€{Number(pool.tvl).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available</span>
                        <span className="font-semibold">€{Number(pool.available_liquidity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className="font-semibold">
                           {Number(pool.tvl || 0) > 0 
                            ? (((Number(pool.tvl) - Number(pool.available_liquidity)) / Number(pool.tvl)) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                  <CardDescription>Manage pool operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setCreditDialogOpen(true)}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Credit Repayment
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ledger">
              <Card>
                <CardHeader>
                  <CardTitle>Pool Ledger</CardTitle>
                  <CardDescription>All pool-related transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Pool</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerEntries?.map((entry: any) => (
                          <TableRow key={entry.id}>
                            <TableCell className="text-sm">
                              {new Date(entry.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{entry.pool?.tenor_days}d</Badge>
                            </TableCell>
                            <TableCell>{entry.ref_type}</TableCell>
                            <TableCell className={parseFloat(entry.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                              €{parseFloat(entry.amount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-sm">{entry.user?.email || 'System'}</TableCell>
                            <TableCell className="text-sm max-w-xs truncate">{entry.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="snapshots">
              <Card>
                <CardHeader>
                  <CardTitle>TVL Over Time</CardTitle>
                  <CardDescription>Historical pool snapshots</CardDescription>
                </CardHeader>
                <CardContent>
                  {snapshots && snapshots.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={snapshots}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="timestamp" 
                          tickFormatter={(time) => new Date(time).toLocaleDateString()}
                        />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="tvl" stroke="#3b82f6" name="TVL" />
                        <Line type="monotone" dataKey="available_liquidity" stroke="#10b981" name="Available" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No snapshot data yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Credit Repayment Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credit Repayment to Pool</DialogTitle>
            <DialogDescription>
              Manually credit a repayment for testing or admin purposes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="tenor">Pool Tenor</Label>
              <Select value={creditTenor} onValueChange={setCreditTenor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="120">120 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount (EUR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                min="0"
                step="100"
              />
            </div>

            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Admin repayment credit for testing"
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialogOpen(false)} disabled={crediting}>
              Cancel
            </Button>
            <Button onClick={handleCreditRepayment} disabled={crediting || !creditAmount}>
              {crediting ? 'Processing...' : 'Credit Pool'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
