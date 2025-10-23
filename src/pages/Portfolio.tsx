import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Clock, CheckCircle, ExternalLink, FileText } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Portfolio() {
  const { connected, publicKey } = useWallet();

  // Mock data - replace with real API calls
  const positions = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      counterparty: 'BMW AG',
      amount: 50000,
      invested: 50000,
      currentValue: 51200,
      yield: 1200,
      yieldPercent: 2.4,
      apr: 6.5,
      tenor: 30,
      daysRemaining: 22,
      status: 'active',
      entryDate: '2024-10-01',
      maturityDate: '2024-10-31',
      txSignature: '5KHxQ...7mNp',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-005',
      counterparty: 'Airbus SE',
      amount: 250000,
      invested: 100000,
      currentValue: 102800,
      yield: 2800,
      yieldPercent: 2.8,
      apr: 8.5,
      tenor: 120,
      daysRemaining: 95,
      status: 'active',
      entryDate: '2024-10-15',
      maturityDate: '2025-01-15',
      txSignature: '3JKmP...9xQw',
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      counterparty: 'Carrefour SA',
      amount: 65000,
      invested: 75000,
      currentValue: 76500,
      yield: 1500,
      yieldPercent: 2.0,
      apr: 7.0,
      tenor: 90,
      daysRemaining: 68,
      status: 'active',
      entryDate: '2024-10-10',
      maturityDate: '2024-12-25',
      txSignature: '8NpLq...4rTy',
    },
  ];

  const closedPositions = [
    {
      id: '4',
      invoiceNumber: 'INV-2024-002',
      counterparty: 'Siemens AG',
      invested: 85000,
      finalValue: 87200,
      yield: 2200,
      yieldPercent: 2.59,
      apr: 6.8,
      tenor: 60,
      status: 'completed',
      entryDate: '2024-08-15',
      exitDate: '2024-10-14',
      txSignature: '2MnKp...5wXz',
    },
  ];

  const totalInvested = positions.reduce((sum, p) => sum + p.invested, 0);
  const totalCurrentValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalYield = positions.reduce((sum, p) => sum + p.yield, 0);
  const totalYieldPercent = ((totalCurrentValue - totalInvested) / totalInvested) * 100;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Portfolio
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Track your trade finance investments and yields
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40">
            <CardContent className="p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Invested
                </p>
                <p className="text-3xl font-bold text-blue-950 dark:text-white">
                  €{totalInvested.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {positions.length} active positions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/40">
            <CardContent className="p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  Current Value
                </p>
                <p className="text-3xl font-bold text-indigo-950 dark:text-white">
                  €{totalCurrentValue.toLocaleString()}
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-indigo-700 dark:text-indigo-300">
                    +{totalYieldPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40">
            <CardContent className="p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Total Yield
                </p>
                <p className="text-3xl font-bold text-green-950 dark:text-white">
                  €{totalYield.toLocaleString()}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Accrued earnings
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40">
            <CardContent className="p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Avg APR
                </p>
                <p className="text-3xl font-bold text-purple-950 dark:text-white">
                  {(positions.reduce((sum, p) => sum + p.apr, 0) / positions.length).toFixed(1)}%
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Weighted average
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Positions Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active Positions ({positions.length})</TabsTrigger>
            <TabsTrigger value="closed">Closed Positions ({closedPositions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {positions.map((position) => (
              <Card key={position.id} className="border-slate-200 dark:border-slate-700 dark:bg-slate-950 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                            {position.invoiceNumber}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {position.counterparty}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200">
                          {position.tenor}d
                        </Badge>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                          Active
                        </Badge>
                      </div>

                      <div className="grid grid-cols-5 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">Invested</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            €{position.invested.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">Current Value</div>
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            €{position.currentValue.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">Yield</div>
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            +€{position.yield.toLocaleString()} ({position.yieldPercent.toFixed(2)}%)
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">APR</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {position.apr}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">Days Remaining</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {position.daysRemaining}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-500 dark:text-slate-300">
                          Entry: {position.entryDate}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-300">
                          Maturity: {position.maturityDate}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          onClick={() => window.open(`https://explorer.solana.com/tx/${position.txSignature}?cluster=devnet`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Explorer
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="closed" className="space-y-4 mt-6">
            {closedPositions.map((position) => (
              <Card key={position.id} className="border-slate-200 dark:border-slate-700 dark:bg-slate-950">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                            {position.invoiceNumber}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                            {position.counterparty}
                          </div>
                        </div>
                        <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ml-2">
                          Completed
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">Invested</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            €{position.invested.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">Final Value</div>
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            €{position.finalValue.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">Total Yield</div>
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            +€{position.yield.toLocaleString()} ({position.yieldPercent.toFixed(2)}%)
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-300">APR</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {position.apr}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-500 dark:text-slate-300">
                          {position.entryDate} → {position.exitDate}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          onClick={() => window.open(`https://explorer.solana.com/tx/${position.txSignature}?cluster=devnet`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Explorer
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
