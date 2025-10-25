import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, TrendingUp, Clock, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { publicKey, connected } = useWallet();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    funded: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Check if user has org_id (from AuthContext)
      if (!user?.orgId) {
        // User needs to complete onboarding
        console.log('No org_id found, redirecting to onboarding');
        navigate('/onboarding/seller');
        return;
      }

      // Load invoices from MySQL backend
      // TODO: Implement invoices API endpoint
      console.log('Loading invoices for org:', user.orgId);
      
      // For now, show empty state
      const invoicesData: any[] = [];
      setInvoices(invoicesData);

      // Calculate stats
      const total = invoicesData.length;
      const pending = invoicesData.filter(inv => ['draft', 'submitted', 'in_review'].includes(inv.status)).length;
      const funded = invoicesData.filter(inv => inv.status === 'funded').length;
      const totalAmount = invoicesData.reduce((sum, inv) => sum + parseFloat(String(inv.amount_eur)), 0);

      setStats({ total, pending, funded, totalAmount });
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'funded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'approved':
      case 'listed':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'submitted':
      case 'in_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      submitted: 'bg-blue-500',
      in_review: 'bg-yellow-500',
      approved: 'bg-green-500',
      listed: 'bg-purple-500',
      funded: 'bg-indigo-500',
      repaid: 'bg-emerald-500',
      defaulted: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your invoices and track funding status
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md">
              <Wallet className="h-4 w-4" />
              {connected ? (
                <span className="text-sm font-medium">{publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}</span>
              ) : (
                <span className="text-sm text-muted-foreground">Not Connected</span>
              )}
            </div>
            <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !h-10 !px-4 !rounded-md !text-sm !font-medium" />
            <Button onClick={() => navigate('/invoices/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Invoice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Funded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.funded}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">€{stats.totalAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Invoices
            </CardTitle>
            <CardDescription>
              Track the status of your uploaded invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your first invoice to get started with funding
                </p>
                <Button onClick={() => navigate('/invoices/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Your First Invoice
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Tenor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number || invoice.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>€{parseFloat(invoice.amount_eur).toLocaleString()}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.tenor_days}d</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice.rift_grade ? (
                          <Badge
                            className={
                              invoice.rift_grade === 'A'
                                ? 'bg-green-500 text-white'
                                : invoice.rift_grade === 'B'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                            }
                          >
                            {invoice.rift_grade}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
