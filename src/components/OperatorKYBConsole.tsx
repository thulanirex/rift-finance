import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Users, FileText, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function OperatorKYBConsole() {
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [orgDocuments, setOrgDocuments] = useState<any[]>([]);
  
  // Fetch organizations for KYB review
  const { data: organizations, isLoading, refetch } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      return await apiClient.organizations.getAll();
    },
  });
  
  const handleSelectOrg = async (org: any) => {
    setSelectedOrg(org);
    try {
      const docs = await apiClient.organizations.getDocuments(org.id);
      setOrgDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setOrgDocuments([]);
    }
  };
  
  const handleApproveKYB = async () => {
    if (!selectedOrg) return;
    try {
      await apiClient.organizations.update(selectedOrg.id, {
        kyb_status: 'approved',
        kyb_score: 85 // Default score, can be customized
      });
      toast.success('Organization KYB approved');
      setSelectedOrg(null);
      refetch();
    } catch (error: any) {
      toast.error('Failed to approve: ' + error.message);
    }
  };
  
  const handleRejectKYB = async () => {
    if (!selectedOrg) return;
    try {
      await apiClient.organizations.update(selectedOrg.id, {
        kyb_status: 'rejected'
      });
      toast.success('Organization KYB rejected');
      setSelectedOrg(null);
      refetch();
    } catch (error: any) {
      toast.error('Failed to reject: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          KYB Review Console
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Review and approve seller verification requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Organizations Pending Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading organizations...</div>
          ) : organizations && organizations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Legal Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>KYB Status</TableHead>
                  <TableHead>KYB Score</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org: any) => (
                  <TableRow 
                    key={org.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                    onClick={() => handleSelectOrg(org)}
                  >
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.legal_name || '-'}</TableCell>
                    <TableCell>{org.country || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        org.kyb_status === 'approved' ? 'default' :
                        org.kyb_status === 'pending' ? 'secondary' :
                        'destructive'
                      }>
                        {org.kyb_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{org.kyb_score || '-'}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(org.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-slate-500">No organizations found</div>
          )}
        </CardContent>
      </Card>

      {/* KYB Review Sheet */}
      <Sheet open={!!selectedOrg} onOpenChange={() => setSelectedOrg(null)}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          {selectedOrg && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedOrg.name}</SheetTitle>
                <SheetDescription>
                  Review organization details and KYB documentation
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Organization Information</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Verify all organization details before approving KYB status.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Organization Name</Label>
                      <div className="font-medium text-lg">{selectedOrg.name}</div>
                    </div>
                    <div>
                      <Label>Legal Name</Label>
                      <div className="font-medium">{selectedOrg.legal_name || 'Not provided'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Country</Label>
                      <div>{selectedOrg.country || 'Not provided'}</div>
                    </div>
                    <div>
                      <Label>Registration Number</Label>
                      <div className="font-mono text-sm">{selectedOrg.registration_number || 'Not provided'}</div>
                    </div>
                  </div>

                  {selectedOrg.address && (
                    <div>
                      <Label>Business Address</Label>
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-sm">
                        {selectedOrg.address}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Current KYB Status</Label>
                      <div className="mt-2">
                        <Badge variant={
                          selectedOrg.kyb_status === 'approved' ? 'default' :
                          selectedOrg.kyb_status === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {selectedOrg.kyb_status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>KYB Score</Label>
                      <div className="text-2xl font-bold mt-1">{selectedOrg.kyb_score || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Sanctions Risk</Label>
                      <div className="mt-2">
                        <Badge variant={selectedOrg.sanctions_risk === 'low' ? 'default' : 'destructive'}>
                          {selectedOrg.sanctions_risk || 'Not assessed'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Member Since</Label>
                      <div className="mt-2">{new Date(selectedOrg.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div>
                    <Label>Organization ID</Label>
                    <code className="text-xs bg-slate-100 dark:bg-slate-900 p-2 rounded block mt-1">
                      {selectedOrg.id}
                    </code>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4 mt-4">
                  <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      <FileText className="inline h-5 w-5 mr-2" />
                      Document Verification
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Review all uploaded documents to verify organization legitimacy.
                    </p>
                  </div>

                  {orgDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {orgDocuments.map((doc: any) => (
                        <div key={doc.id} className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div className="font-medium">{doc.type}</div>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">{doc.filename}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                              </div>
                              {doc.file_hash && (
                                <div className="text-xs font-mono text-muted-foreground mt-2">
                                  Hash: {doc.file_hash.slice(0, 16)}...
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={
                                doc.status === 'approved' ? 'default' :
                                doc.status === 'pending' ? 'secondary' :
                                'destructive'
                              }>
                                {doc.status}
                              </Badge>
                              {doc.file_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(doc.file_url, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              )}
                            </div>
                          </div>
                          {doc.rejection_reason && (
                            <div className="mt-3 p-2 bg-red-50 dark:bg-red-950 rounded text-sm text-red-600 dark:text-red-400">
                              <strong>Rejection reason:</strong> {doc.rejection_reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p>No documents uploaded yet</p>
                      <p className="text-sm mt-1">Organization needs to upload KYB documents</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="risk" className="space-y-6 mt-4">
                  <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Risk Assessment</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Evaluate organization risk based on documentation, country risk, and business profile.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Risk Factors</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                        <span>Documents Submitted</span>
                        <Badge variant={orgDocuments.length > 0 ? 'default' : 'secondary'}>
                          {orgDocuments.length} documents
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                        <span>Documents Approved</span>
                        <Badge variant={orgDocuments.some(d => d.status === 'approved') ? 'default' : 'secondary'}>
                          {orgDocuments.filter(d => d.status === 'approved').length} / {orgDocuments.length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                        <span>Country Risk</span>
                        <Badge variant="outline">{selectedOrg.country || 'Unknown'}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                        <span>Sanctions Check</span>
                        <Badge variant={selectedOrg.sanctions_risk === 'low' ? 'default' : 'destructive'}>
                          {selectedOrg.sanctions_risk || 'Not checked'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                        <span>Registration Verified</span>
                        <Badge variant={selectedOrg.registration_number ? 'default' : 'secondary'}>
                          {selectedOrg.registration_number ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Recommendation</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {orgDocuments.filter(d => d.status === 'approved').length >= 2 && selectedOrg.registration_number
                        ? '✓ Organization meets KYB requirements - Recommended for approval'
                        : '⚠ Additional documentation or verification required before approval'}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-6 border-t flex gap-3">
                {selectedOrg.kyb_status !== 'approved' && (
                  <Button
                    onClick={handleApproveKYB}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve KYB
                  </Button>
                )}
                {selectedOrg.kyb_status !== 'rejected' && (
                  <Button
                    onClick={handleRejectKYB}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject KYB
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
