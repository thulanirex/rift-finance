import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Shield,
  Activity
} from 'lucide-react';

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingKYB: 0,
    pendingInvoices: 0,
    activeFunders: 0,
    totalInvoices: 0,
    totalFunded: 0,
    recentActivity: [] as any[],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load pending KYB applications
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, kyb_status')
        .eq('kyb_status', 'pending');

      // Load pending invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .in('status', ['submitted', 'in_review']);

      // Load all invoices for stats
      const { data: allInvoices } = await supabase
        .from('invoices')
        .select('amount_eur, status');

      // Load funders
      const { data: funders } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'funder');

      // Load recent audit logs
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*, actor:actor_user_id(email)')
        .order('timestamp', { ascending: false })
        .limit(10);

      const totalFunded = allInvoices
        ?.filter(inv => inv.status === 'funded')
        .reduce((sum, inv) => sum + parseFloat(String(inv.amount_eur)), 0) || 0;

      setStats({
        pendingKYB: orgs?.length || 0,
        pendingInvoices: invoices?.length || 0,
        activeFunders: funders?.length || 0,
        totalInvoices: allInvoices?.length || 0,
        totalFunded,
        recentActivity: auditLogs || [],
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Operator Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and pending actions
          </p>
        </div>

        {/* Alert Cards for Pending Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {stats.pendingKYB > 0 && (
            <Card className="border-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Pending KYB Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.pendingKYB}</div>
                    <p className="text-sm text-muted-foreground">Organizations awaiting review</p>
                  </div>
                  <Button onClick={() => navigate('/ops/kyb')}>
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.pendingInvoices > 0 && (
            <Card className="border-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Pending Invoice Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
                    <p className="text-sm text-muted-foreground">Invoices awaiting approval</p>
                  </div>
                  <Button onClick={() => navigate('/ops/invoices')}>
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalInvoices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Funded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                €{(stats.totalFunded / 1000).toFixed(0)}k
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Funders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeFunders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Platform Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg font-semibold">Healthy</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common operator tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/ops/kyb')}
              >
                <Shield className="h-5 w-5" />
                <span className="text-sm">KYB Review</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/ops/invoices')}
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm">Invoice Review</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/ops/funders')}
              >
                <Users className="h-5 w-5" />
                <span className="text-sm">Funder Review</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/ops/audit')}
              >
                <Activity className="h-5 w-5" />
                <span className="text-sm">Audit Trail</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform actions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {log.entity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        by {log.actor?.email || 'System'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
