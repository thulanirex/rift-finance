import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Wallet, DollarSign, Clock, ArrowRight, PieChart } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function FunderDashboardNew() {
  const navigate = useNavigate();
  const { connected } = useWallet();

  // Mock data - replace with real API calls
  const stats = {
    totalInvested: 225000,
    activePositions: 8,
    totalYield: 12450,
    avgAPR: 7.2,
  };

  const recentPositions = [
    {
      id: '1',
      invoice: 'INV-2024-001',
      counterparty: 'BMW AG',
      amount: 50000,
      apr: 6.5,
      tenor: 30,
      status: 'active',
      daysRemaining: 22,
    },
    {
      id: '2',
      invoice: 'INV-2024-005',
      counterparty: 'Airbus SE',
      amount: 100000,
      apr: 8.5,
      tenor: 120,
      status: 'active',
      daysRemaining: 95,
    },
    {
      id: '3',
      invoice: 'INV-2024-003',
      counterparty: 'Carrefour SA',
      amount: 75000,
      apr: 7.0,
      tenor: 90,
      status: 'active',
      daysRemaining: 68,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Funder Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Manage your trade finance investments
            </p>
          </div>
          <Button
            onClick={() => navigate('/market')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Browse Market
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Wallet Warning */}
        {!connected && (
          <Card className="border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Connect your Solana wallet
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Connect your wallet in the sidebar to start investing in invoices
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Invested
                </p>
                <p className="text-3xl font-bold text-blue-950 dark:text-white">
                  €{stats.totalInvested.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Across {stats.activePositions} positions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-green-600 dark:bg-green-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Total Yield Earned
                </p>
                <p className="text-3xl font-bold text-green-950 dark:text-white">
                  €{stats.totalYield.toLocaleString()}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  +{((stats.totalYield / stats.totalInvested) * 100).toFixed(2)}% return
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-purple-600 dark:bg-purple-500 flex items-center justify-center shadow-lg">
                  <PieChart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Average APR
                </p>
                <p className="text-3xl font-bold text-purple-950 dark:text-white">
                  {stats.avgAPR}%
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Weighted average
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  Active Positions
                </p>
                <p className="text-3xl font-bold text-indigo-950 dark:text-white">
                  {stats.activePositions}
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Diversified portfolio
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Positions */}
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-950">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Active Positions</CardTitle>
                <CardDescription>Your current trade finance investments</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/portfolio')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentPositions.map((position) => (
                <div
                  key={position.id}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/invoices/${position.invoice}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {position.counterparty.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {position.counterparty}
                          </span>
                          <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-700">
                            {position.tenor}d
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-300 font-mono">
                          {position.invoice}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Amount
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          €{position.amount.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          APR
                        </div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {position.apr}%
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Remaining
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          {position.daysRemaining}d
                        </div>
                      </div>

                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
