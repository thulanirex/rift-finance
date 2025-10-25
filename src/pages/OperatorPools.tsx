import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function OperatorPools() {
  // Fetch pools
  const { data: pools, isLoading } = useQuery({
    queryKey: ['ops-pools'],
    queryFn: async () => {
      return await apiClient.pools.getAll();
    },
  });

  const totalTVL = pools?.reduce((sum, p) => sum + (Number(p.tvl) || 0), 0) || 0;
  const totalAvailable = pools?.reduce((sum, p) => sum + (Number(p.available_liquidity) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Liquidity Pools
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage pool liquidity and monitor performance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total TVL</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">€{totalTVL.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Available Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">€{totalAvailable.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Pools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{pools?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pool Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading pools...</div>
          ) : pools && pools.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenor</TableHead>
                  <TableHead>APR</TableHead>
                  <TableHead>TVL</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pools.map((pool: any) => {
                  const utilization = Number(pool.tvl || 0) > 0 
                    ? (((Number(pool.tvl) - Number(pool.available_liquidity)) / Number(pool.tvl)) * 100)
                    : 0;
                  
                  return (
                    <TableRow key={pool.id}>
                      <TableCell className="font-medium">{pool.tenor_days} days</TableCell>
                      <TableCell>{(pool.apr * 100).toFixed(2)}%</TableCell>
                      <TableCell>€{Number(pool.tvl).toLocaleString()}</TableCell>
                      <TableCell>€{Number(pool.available_liquidity).toLocaleString()}</TableCell>
                      <TableCell>{utilization.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant={pool.is_active ? "default" : "secondary"}>
                          {pool.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-slate-500">No pools found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
