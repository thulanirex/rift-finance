import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFunderDecision, useRequestMoreInfo, useFunderCase } from '@/hooks/useFunderProfile';
import { CheckCircle, XCircle, AlertCircle, FileText, Clock } from 'lucide-react';

export function OperatorFunderReview() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  const { data: cases, isLoading } = useQuery({
    queryKey: ['funder-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funder_cases')
        .select(`
          *,
          funder_profiles!inner(type, status),
          user:users!funder_cases_user_id_fkey(email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: caseDetails } = useFunderCase(selectedCase);
  const makeDecision = useFunderDecision();
  const requestMore = useRequestMoreInfo();

  const handleApprove = () => {
    if (!selectedCase) return;
    makeDecision.mutate(
      { caseId: selectedCase, decision: 'approved', notes: decisionNotes },
      { onSuccess: () => setSelectedCase(null) }
    );
  };

  const handleReject = () => {
    if (!selectedCase) return;
    makeDecision.mutate(
      { caseId: selectedCase, decision: 'rejected', notes: decisionNotes },
      { onSuccess: () => setSelectedCase(null) }
    );
  };

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
          <CardTitle>Funder Verification Queue</CardTitle>
          <CardDescription>Review and approve funder applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Sanctions</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases?.map((case_) => {
                const checklist = case_.checklist as any;
                return (
                  <TableRow key={case_.id}>
                    <TableCell className="font-medium">{(case_.user as any)?.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {case_.type === 'kyc_individual' ? 'Individual' : 'Entity'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(case_.status)}</TableCell>
                    <TableCell>{getScoreBadge(checklist?.score)}</TableCell>
                    <TableCell>
                      {checklist?.sanctions?.isClean ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      {checklist?.docsComplete ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(case_.created_at).toLocaleDateString()}
                    </TableCell>
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
            <SheetTitle>Case Review</SheetTitle>
            <SheetDescription>Review funder verification details</SheetDescription>
          </SheetHeader>

          {caseDetails && (
            <Tabs defaultValue="profile" className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="checks">Checks</TabsTrigger>
                <TabsTrigger value="decision">Decision</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{caseDetails.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p>{getStatusBadge(caseDetails.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Residency</p>
                    <p className="font-medium">
                      {caseDetails.funder_profiles?.residency_country}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Residency</p>
                    <p className="font-medium">
                      {caseDetails.funder_profiles?.tax_residency_country}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                {caseDetails.funder_documents?.map((doc: any) => (
                  <Card key={doc.id}>
                    <CardHeader>
                      <CardTitle className="text-sm">{doc.doc_type}</CardTitle>
                      <CardDescription>
                        Uploaded {new Date(doc.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">Hash: {doc.file_hash}</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        View Document
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="checks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Automated Checks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(() => {
                      const checklist = caseDetails.checklist as any;
                      return (
                        <>
                          <div className="flex justify-between">
                            <span>Overall Score</span>
                            <span>{getScoreBadge(checklist?.score)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sanctions Clear</span>
                            <span>
                              {checklist?.sanctions?.isClean ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Documents Complete</span>
                            <span>{checklist?.docsComplete ? '✓' : '✗'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax Certification</span>
                            <span>{checklist?.taxCert ? '✓' : '✗'}</span>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="decision" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Decision Notes</label>
                  <Textarea
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Add notes about this decision..."
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleApprove} className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button onClick={handleReject} variant="destructive" className="flex-1">
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    requestMore.mutate({
                      caseId: selectedCase,
                      missing: [],
                      message: decisionNotes,
                    });
                  }}
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