import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { FileText, Download, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorAudit() {
  const navigate = useNavigate();
  const [actionFilter, setActionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Fetch audit logs
  const { data: auditLogs, isLoading, error } = useQuery({
    queryKey: ['audit-logs', actionFilter],
    queryFn: async () => {
      try {
        const logs = await apiClient.audit.getAll();
        console.log('📊 Audit logs fetched:', logs?.length || 0, 'logs');
        
        // Filter by action if needed
        if (actionFilter && actionFilter !== 'all') {
          return logs.filter((log: any) => log.action === actionFilter);
        }
        
        return logs;
      } catch (err) {
        console.error('❌ Error fetching audit logs:', err);
        throw err;
      }
    },
  });

  // Get unique actions for filter
  const uniqueActions = Array.from(
    new Set(auditLogs?.map((log: any) => log.action as string) || [])
  ).sort() as string[];

  const filteredLogs = auditLogs?.filter((log: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.entity.toLowerCase().includes(searchLower) ||
      log.actor_email?.toLowerCase().includes(searchLower)
    );
  });

  const handleExportCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvContent = [
      ['Timestamp', 'Actor', 'Action', 'Entity', 'Entity ID'].join(','),
      ...filteredLogs.map((log: any) => [
        new Date(log.timestamp).toISOString(),
        log.actor_email || 'System',
        log.action,
        log.entity,
        log.entity_id || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Audit logs exported');
  };

  return (
    <div className="space-y-6">
      <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Logs
              </CardTitle>
              <CardDescription>Complete system activity trail</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Entity ID</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span>Loading audit logs...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-red-600">
                            <p className="font-semibold">Error loading audit logs</p>
                            <p className="text-sm mt-1">{(error as Error).message}</p>
                            <p className="text-xs mt-2 text-muted-foreground">Check console for details</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs && filteredLogs.length > 0 ? (
                      filteredLogs.map((log: any) => (
                        <TableRow 
                          key={log.id}
                          className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                          onClick={() => setSelectedLog(log)}
                        >
                          <TableCell className="text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.actor_email || 'System'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.entity}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.entity_id?.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLog(log);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <FileText className="h-12 w-12 text-slate-300" />
                            <div>
                              <p className="font-medium">No audit logs found</p>
                              <p className="text-sm mt-1">
                                {searchTerm || actionFilter !== 'all' 
                                  ? 'Try adjusting your filters'
                                  : 'Audit logs will appear here as actions are performed'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Showing {filteredLogs?.length || 0} of {auditLogs?.length || 0} logs
              </p>
            </CardContent>
      </Card>

      {/* Audit Log Details Sheet */}
      <Sheet open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedLog && (
            <>
              <SheetHeader>
                <SheetTitle>Audit Log Details</SheetTitle>
                <SheetDescription>
                  Complete information about this audit event
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Overview Section */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Event Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-blue-700 dark:text-blue-300">Action</Label>
                      <div className="mt-1">
                        <Badge className="bg-blue-600 text-white">{selectedLog.action}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-blue-700 dark:text-blue-300">Entity Type</Label>
                      <div className="mt-1 font-medium text-blue-900 dark:text-blue-100">{selectedLog.entity}</div>
                    </div>
                  </div>
                </div>

                {/* Actor Information */}
                <div>
                  <h3 className="font-semibold mb-3">Actor Information</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <div className="font-medium">{selectedLog.actor_email || 'System'}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                      <Label className="text-xs text-muted-foreground">User ID</Label>
                      <div className="font-mono text-sm">{selectedLog.actor_user_id || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Entity Information */}
                <div>
                  <h3 className="font-semibold mb-3">Entity Information</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                      <Label className="text-xs text-muted-foreground">Entity Type</Label>
                      <div className="font-medium">{selectedLog.entity}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                      <Label className="text-xs text-muted-foreground">Entity ID</Label>
                      <div className="font-mono text-sm break-all">{selectedLog.entity_id || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div>
                  <h3 className="font-semibold mb-3">Timestamp</h3>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-xs text-muted-foreground">Date & Time</Label>
                        <div className="font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <Label className="text-xs text-muted-foreground">Relative</Label>
                        <div className="text-sm">{getRelativeTime(selectedLog.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {selectedLog.metadata && (
                  <div>
                    <h3 className="font-semibold mb-3">Additional Data (Metadata)</h3>
                    <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-lg border border-slate-700">
                      <pre className="text-xs text-green-400 overflow-x-auto">
                        {JSON.stringify(
                          typeof selectedLog.metadata === 'string' 
                            ? JSON.parse(selectedLog.metadata) 
                            : selectedLog.metadata, 
                          null, 
                          2
                        )}
                      </pre>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This shows the detailed data that was captured during this action
                    </p>
                  </div>
                )}

                {/* Log ID */}
                <div>
                  <h3 className="font-semibold mb-3">Log Reference</h3>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                    <Label className="text-xs text-muted-foreground">Log ID</Label>
                    <div className="font-mono text-xs break-all">{selectedLog.id}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Helper function for relative time
function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return then.toLocaleDateString();
}
