import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, FileText, Clock, Shield } from 'lucide-react';

export function OperatorKYBConsole() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cases, isLoading } = useQuery({
    queryKey: ['kyb-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kyb_cases')
        .select(`
          *,
          organization:organizations!kyb_cases_org_id_fkey(name, legal_name, kyb_score, sanctions_risk),
          submitter:users!kyb_cases_submitted_by_fkey(email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: caseDetails } = useQuery({
    queryKey: ['kyb-case', selectedCase],
    queryFn: async () => {
      if (!selectedCase) return null;
      
      // Get case with organization
      const { data: caseData, error: caseError } = await supabase
        .from('kyb_cases')
        .select(`
          *,
          organization:organizations!kyb_cases_org_id_fkey(*),
          decided_by_user:users!kyb_cases_decided_by_fkey(email)
        `)
        .eq('id', selectedCase)
        .single();

      if (caseError) throw caseError;

      // Get beneficial owners separately
      const { data: owners, error: ownersError } = await supabase
        .from('beneficial_owners')
        .select('*')
        .eq('org_id', caseData.org_id);

      if (ownersError) throw ownersError;

      // Get org documents separately
      const { data: docs, error: docsError } = await supabase
        .from('org_documents')
        .select('*')
        .eq('org_id', caseData.org_id);

      if (docsError) throw docsError;

      return {
        ...caseData,
        beneficial_owners: owners,
        org_documents: docs,
      };
    },
    enabled: !!selectedCase,
  });

  const makeDecision = useMutation({
    mutationFn: async ({ decision, notes }: { decision: string; notes: string }) => {
      const { data, error } = await supabase.functions.invoke('kyb-decision', {
        body: { caseId: selectedCase, decision, notes },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyb-cases'] });
      toast({ title: 'Decision recorded', description: 'The seller has been notified' });
      setSelectedCase(null);
      setDecisionNotes('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Decision failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const requestMore = useMutation({
    mutationFn: async ({ missing, message }: any) => {
      const { data, error } = await supabase.functions.invoke('kyb-request-more', {
        body: { caseId: selectedCase, missing, message },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyb-cases'] });
      toast({ title: 'Request sent', description: 'The seller will be notified' });
      setSelectedCase(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Request failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: { variant: 'secondary', icon: Clock },
      in_review: { variant: 'default', icon: AlertCircle },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      awaiting_docs: { variant: 'outline', icon: FileText },
    };

    const config = variants[status] || variants.open;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getScoreBadge = (score: number | undefined) => {
    if (!score) return <Badge variant="outline">-</Badge>;
    if (score >= 80) return <Badge className="bg-green-600">High ({score})</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-600">Medium ({score})</Badge>;
    return <Badge variant="destructive">Low ({score})</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading cases...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>KYB Verification Queue</CardTitle>
          <CardDescription>Review and approve seller applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Sanctions</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases?.map((case_) => {
                const checklist = case_.checklist as any;
                const org = case_.organization as any;
                const submitter = case_.submitter as any;
                
                return (
                  <TableRow key={case_.id}>
                    <TableCell className="font-medium">{org?.legal_name || org?.name}</TableCell>
                    <TableCell>{submitter?.email}</TableCell>
                    <TableCell>{getStatusBadge(case_.status)}</TableCell>
                    <TableCell>{getScoreBadge(checklist?.score || org?.kyb_score)}</TableCell>
                    <TableCell>
                      {org?.sanctions_risk === 'clear' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>{new Date(case_.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCase(case_.id)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>KYB Case Review</SheetTitle>
            <SheetDescription>Review organization verification</SheetDescription>
          </SheetHeader>

          {caseDetails && (
            <Tabs defaultValue="org" className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="org">Organization</TabsTrigger>
                <TabsTrigger value="owners">Owners</TabsTrigger>
                <TabsTrigger value="checks">Checks</TabsTrigger>
                <TabsTrigger value="decision">Decision</TabsTrigger>
              </TabsList>

              <TabsContent value="org" className="space-y-4">
                {(() => {
                  const org = caseDetails.organization as any;
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Legal Name</p>
                        <p className="font-medium">{org?.legal_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Registration Number</p>
                        <p className="font-medium">{org?.registration_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Country</p>
                        <p className="font-medium">{org?.registration_country || org?.country}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">VAT Number</p>
                        <p className="font-medium">{org?.vat_number || 'N/A'}</p>
                      </div>
                    </div>
                  );
                })()}
              </TabsContent>

              <TabsContent value="owners" className="space-y-4">
                {caseDetails.beneficial_owners && caseDetails.beneficial_owners.length > 0 ? (
                  caseDetails.beneficial_owners.map((owner: any) => (
                    <Card key={owner.id}>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          {owner.first_name} {owner.last_name}
                        </CardTitle>
                        <CardDescription>
                          <Badge variant="outline">{owner.role}</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm space-y-1">
                        <p><strong>DOB:</strong> {owner.dob}</p>
                        <p><strong>Nationality:</strong> {owner.nationality}</p>
                        <p><strong>Residence:</strong> {owner.country_of_residence}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={owner.pep_status === 'clear' ? 'default' : 'destructive'}>
                            PEP: {owner.pep_status}
                          </Badge>
                          <Badge variant={owner.sanctions_status === 'clear' ? 'default' : 'destructive'}>
                            Sanctions: {owner.sanctions_status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No beneficial owners recorded</p>
                )}
              </TabsContent>

              <TabsContent value="checks" className="space-y-4">
                {(() => {
                  const checklist = caseDetails.checklist as any;
                  const org = caseDetails.organization as any;
                  
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle>Automated Checks</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Overall Score</span>
                          <span>{getScoreBadge(checklist?.score || org?.kyb_score)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Organization Sanctions</span>
                          <span>{checklist?.orgSanctions?.isClean ? '✓ Clear' : '✗ Hit'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Owner Sanctions</span>
                          <span>
                            {checklist?.ownerSanctions?.every((c: any) => c.isClean)
                              ? '✓ All Clear'
                              : '✗ Issues Found'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>VAT Verified</span>
                          <span>{checklist?.vat?.valid ? '✓ Valid' : '- Not Provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Documents Complete</span>
                          <span>{checklist?.docsComplete ? '✓' : '✗'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </TabsContent>

              <TabsContent value="decision" className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Decision Notes</Label>
                  <Textarea
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Add notes about this decision..."
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => makeDecision.mutate({ decision: 'approved', notes: decisionNotes })}
                    className="flex-1"
                    disabled={makeDecision.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => makeDecision.mutate({ decision: 'rejected', notes: decisionNotes })}
                    variant="destructive"
                    className="flex-1"
                    disabled={makeDecision.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    requestMore.mutate({
                      missing: [],
                      message: decisionNotes,
                    });
                  }}
                  disabled={requestMore.isPending}
                >
                  Request More Information
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}