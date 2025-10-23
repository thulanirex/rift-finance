import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorInsurance() {
  const navigate = useNavigate();
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [eventType, setEventType] = useState<'bind' | 'claim_opened' | 'claim_paid'>('bind');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch insurance events
  const { data: events, refetch: refetchEvents } = useQuery({
    queryKey: ['insurance-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_events')
        .select('*, invoice:invoices(invoice_number, amount_eur), creator:created_by(email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch funded invoices for event creation
  const { data: fundedInvoices } = useQuery({
    queryKey: ['funded-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, amount_eur, status')
        .in('status', ['funded', 'listed'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmitEvent = async () => {
    if (!selectedInvoiceId) {
      toast.error('Please select an invoice');
      return;
    }

    if ((eventType === 'claim_paid') && (!amount || parseFloat(amount) <= 0)) {
      toast.error('Amount required for claim_paid event');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('insurance-event', {
        body: {
          invoice_id: selectedInvoiceId,
          event: eventType,
          amount: amount ? parseFloat(amount) : null,
          note,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Insurance event created: ${eventType}`);
      
      setEventDialogOpen(false);
      setSelectedInvoiceId('');
      setAmount('');
      setNote('');
      refetchEvents();
    } catch (error: any) {
      console.error('Insurance event error:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const getEventBadge = (event: string) => {
    switch (event) {
      case 'bind': return <Badge variant="outline">Bind</Badge>;
      case 'claim_opened': return <Badge variant="secondary">Claim Opened</Badge>;
      case 'claim_paid': return <Badge>Claim Paid</Badge>;
      default: return <Badge variant="outline">{event}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Operator: Insurance</h1>
            <Button variant="outline" onClick={() => navigate('/')}>
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Insurance Events
              </CardTitle>
              <CardDescription>Mock insurance workflow for pilot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => setEventDialogOpen(true)}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Emit Event
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events && events.length > 0 ? (
                      events.map((event: any) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-sm">
                            {new Date(event.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            #{event.invoice?.invoice_number}
                          </TableCell>
                          <TableCell>{getEventBadge(event.event)}</TableCell>
                          <TableCell>
                            {event.amount ? `€${parseFloat(event.amount).toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{event.note}</TableCell>
                          <TableCell className="text-sm">
                            {event.creator?.email || 'System'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No insurance events yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Event Creation Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Insurance Event</DialogTitle>
            <DialogDescription>
              Emit a mock insurance event for testing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="invoice">Invoice</Label>
              <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  {fundedInvoices?.map((inv: any) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      #{inv.invoice_number} - €{parseFloat(inv.amount_eur).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventType} onValueChange={(v: any) => setEventType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bind">Bind (tag as insured)</SelectItem>
                  <SelectItem value="claim_opened">Claim Opened</SelectItem>
                  <SelectItem value="claim_paid">Claim Paid (credit pool)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {eventType === 'claim_paid' && (
              <div>
                <Label htmlFor="amount">Amount (EUR)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Full invoice amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                />
              </div>
            )}

            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Details about this insurance event"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEvent} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
