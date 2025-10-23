import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Users, AlertCircle, CheckCircle, Clock, PieChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Analytics() {
  // Mock analytics data
  const metrics = {
    totalFunded: 1250000,
    totalRepaid: 850000,
    outstandingLiabilities: 400000,
    defaultRate: 2.1,
    avgRepaymentTime: 58,
    activeInvoices: 12,
    completedInvoices: 28,
    defaultedInvoices: 1,
  };

  const poolPerformance = [
    { tenor: '30d', tvl: 1000000, apr: 6.5, utilization: 75, activePositions: 8, defaultRate: 0 },
    { tenor: '90d', tvl: 2000000, apr: 7.5, utilization: 60, activePositions: 15, defaultRate: 1.2 },
    { tenor: '120d', tvl: 1500000, apr: 8.5, utilization: 80, activePositions: 10, defaultRate: 3.5 },
  ];

  const riskTranches = [
    { name: 'Senior Tranche', allocation: 60, yield: 5.5, risk: 'Low', tvl: 750000 },
    { name: 'Junior Tranche', allocation: 40, yield: 9.5, risk: 'High', tvl: 500000 },
  ];

  const recentActivity = [
    { type: 'funded', invoice: 'INV-2024-012', amount: 125000, date: '2024-10-20', status: 'active' },
    { type: 'repaid', invoice: 'INV-2024-008', amount: 85000, date: '2024-10-19', status: 'completed' },
    { type: 'funded', invoice: 'INV-2024-011', amount: 95000, date: '2024-10-18', status: 'active' },
    { type: 'repaid', invoice: 'INV-2024-007', amount: 65000, date: '2024-10-17', status: 'completed' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Analytics & Performance
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Real-time metrics and on-chain analytics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40">
            <CardContent className="p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Funded
                </p>
                <p className="text-3xl font-bold text-blue-950 dark:text-white">
                  €{metrics.totalFunded.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {metrics.activeInvoices} active invoices
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40">
            <CardContent className="p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Total Repaid
                </p>
                <p className="text-3xl font-bold text-green-950 dark:text-white">
                  €{metrics.totalRepaid.toLocaleString()}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {metrics.completedInvoices} completed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/40">
            <CardContent className="p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Outstanding
                </p>
                <p className="text-3xl font-bold text-amber-950 dark:text-white">
                  €{metrics.outstandingLiabilities.toLocaleString()}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Pending repayment
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/40">
            <CardContent className="p-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Default Rate
                </p>
                <p className="text-3xl font-bold text-red-950 dark:text-white">
                  {metrics.defaultRate}%
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  {metrics.defaultedInvoices} defaulted
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pool Performance */}
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Liquidity Pool Performance</CardTitle>
            <CardDescription className="dark:text-slate-300">Real-time pool metrics and utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {poolPerformance.map((pool, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1">
                        {pool.tenor} Pool
                      </Badge>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {pool.activePositions} positions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        {pool.apr}% APR
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-300">TVL</div>
                      <div className="text-sm font-medium">€{pool.tvl.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-300">Utilization</div>
                      <div className="text-sm font-medium">{pool.utilization}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-300">Default Rate</div>
                      <div className={`text-sm font-medium ${pool.defaultRate === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pool.defaultRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-300">Status</div>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">
                        Active
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Utilization</span>
                      <span>{pool.utilization}%</span>
                    </div>
                    <Progress value={pool.utilization} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Tranches */}
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Risk Tranching
            </CardTitle>
            <CardDescription className="dark:text-slate-300">Senior and Junior tranche allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskTranches.map((tranche, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{tranche.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        {tranche.allocation}% allocation
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {tranche.yield}% APY
                      </div>
                      <Badge variant={tranche.risk === 'Low' ? 'outline' : 'destructive'} className="mt-1">
                        {tranche.risk} Risk
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-300">TVL</div>
                      <div className="text-sm font-medium">€{tranche.tvl.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-300">Allocation</div>
                      <div className="text-sm font-medium">{tranche.allocation}%</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Progress value={tranche.allocation} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Recent On-Chain Activity</CardTitle>
            <CardDescription className="dark:text-slate-300">Latest funding and repayment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    {activity.type === 'funded' ? (
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {activity.type === 'funded' ? 'Invoice Funded' : 'Invoice Repaid'}
                      </div>
                      <div className="text-xs text-slate-500">{activity.invoice}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">€{activity.amount.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">{activity.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Repayment Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">On-Time Repayments</span>
                <span className="font-medium text-green-600">97.9%</span>
              </div>
              <Progress value={97.9} className="bg-green-100" />

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">Avg Repayment Time</span>
                <span className="font-medium">{metrics.avgRepaymentTime} days</span>
              </div>
              <Progress value={(metrics.avgRepaymentTime / 90) * 100} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio Diversification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">30-day Pool</span>
                <span className="font-medium">35%</span>
              </div>
              <Progress value={35} />

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">90-day Pool</span>
                <span className="font-medium">45%</span>
              </div>
              <Progress value={45} />

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">120-day Pool</span>
                <span className="font-medium">20%</span>
              </div>
              <Progress value={20} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
