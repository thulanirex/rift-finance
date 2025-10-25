import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Shield,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingInvoices: 0,
    approvedInvoices: 0,
    fundedInvoices: 0,
    totalVolume: 0,
    recentInvoices: [] as any[],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const invoices = await apiClient.invoices.getAll();

      const pending = invoices.filter((inv: any) => inv.status === 'submitted' || inv.status === 'in_review').length;
      const approved = invoices.filter((inv: any) => inv.status === 'approved' || inv.status === 'listed').length;
      const funded = invoices.filter((inv: any) => inv.status === 'funded').length;
      const totalVolume = invoices.reduce((sum: number, inv: any) => sum + (inv.amount_eur || 0), 0);

      const recent = invoices
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setStats({
        pendingInvoices: pending,
        approvedInvoices: approved,
        fundedInvoices: funded,
        totalVolume,
        recentInvoices: recent,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Operator Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage invoices, review KYB applications, and monitor platform activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.pendingInvoices}
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <Button
                variant="link"
                className="mt-2 p-0 h-auto text-yellow-600 hover:text-yellow-700"
                onClick={() => navigate('/ops/invoices')}
              >
                Review now <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.approvedInvoices}
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-sm text-slate-500 mt-2">Ready for funding</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Funded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.fundedInvoices}
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-sm text-slate-500 mt-2">Active positions</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  €{(stats.totalVolume / 1000).toFixed(0)}K
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-sm text-slate-500 mt-2">All invoices</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/ops/invoices')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Review Invoices
              </CardTitle>
              <CardDescription>
                Approve or reject submitted invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Go to Invoices <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/ops/kyb')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                KYB Applications
              </CardTitle>
              <CardDescription>
                Review seller verification requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Review KYB <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/ops/audit')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                Monitor platform activity and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                View Logs <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest invoice submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-slate-500 py-8">Loading...</p>
            ) : stats.recentInvoices.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No invoices yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentInvoices.map((invoice: any) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-10 w-10 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {invoice.invoice_number || invoice.id}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">
                        €{invoice.amount_eur?.toLocaleString()}
                      </p>
                      <Badge className={`mt-1 ${
                        invoice.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                        invoice.status === 'approved' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'funded' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
