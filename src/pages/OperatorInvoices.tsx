import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Coins, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RiftScoreOverride } from "@/components/RiftScoreOverride";

type Invoice = {
  id: string;
  invoice_number: string | null;
  amount_eur: number;
  due_date: string;
  tenor_days: number;
  status: string;
  buyer_name: string | null;
  buyer_country: string | null;
  file_hash: string;
  org_id: string;
  mint_tx: string | null;
  cnft_leaf_id: string | null;
  created_at: string;
  rift_score?: number | null;
  rift_grade?: 'A' | 'B' | 'C' | null;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500",
  submitted: "bg-blue-500",
  in_review: "bg-yellow-500",
  approved: "bg-green-500",
  listed: "bg-purple-500",
  funded: "bg-indigo-500",
  repaid: "bg-emerald-500",
  defaulted: "bg-red-500",
};

export default function OperatorInvoices() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, countryFilter, gradeFilter, invoices]);

  const loadInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInvoices(data || []);
    } catch (error: any) {
      console.error("Error loading invoices:", error);
      toast({
        title: "Failed to load invoices",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    if (countryFilter !== "all") {
      filtered = filtered.filter((inv) => inv.buyer_country === countryFilter);
    }

    if (gradeFilter !== "all") {
      filtered = filtered.filter((inv) => inv.rift_grade === gradeFilter);
    }

    setFilteredInvoices(filtered);
  };

  const openDrawer = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setNote("");

    // Load PDF
    try {
      const { data: fileData, error } = await supabase.functions.invoke("invoice-file", {
        body: { invoice_id: invoice.id },
      });

      if (!error && fileData?.signed_url) {
        setPdfUrl(fileData.signed_url);
      }
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  };

  const handleApprove = async () => {
    if (!selectedInvoice) return;

    setProcessing(true);
    try {
      const { error } = await supabase.functions.invoke("invoice-approve", {
        body: {
          invoice_id: selectedInvoice.id,
          note: note || undefined,
        },
      });

      if (error) throw error;

      toast({
        title: "Invoice approved",
        description: "The invoice has been approved successfully",
      });

      setSelectedInvoice(null);
      loadInvoices();
    } catch (error: any) {
      console.error("Approval error:", error);
      toast({
        title: "Approval failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleMint = async () => {
    if (!selectedInvoice) return;

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("invoice-mint-cnft", {
        body: { invoice_id: selectedInvoice.id },
      });

      if (error) throw error;

      toast({
        title: "cNFT minted",
        description: (
          <div>
            Successfully minted compressed NFT on Solana devnet.{" "}
            <a
              href={data.explorer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View transaction
            </a>
          </div>
        ),
      });

      setSelectedInvoice(null);
      loadInvoices();
    } catch (error: any) {
      console.error("Mint error:", error);
      toast({
        title: "Minting failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const countries = Array.from(new Set(invoices.map((inv) => inv.buyer_country).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Invoice Review Console</h1>
          <p className="text-muted-foreground">
            Review and approve seller invoices for tokenization
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="listed">Listed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Buyer Country</Label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country as string}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>RIFT Grade</Label>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="A">Grade A</SelectItem>
                    <SelectItem value="B">Grade B</SelectItem>
                    <SelectItem value="C">Grade C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("all");
                    setCountryFilter("all");
                    setGradeFilter("all");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              {filteredInvoices.length} {filteredInvoices.length === 1 ? "invoice" : "invoices"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Org</TableHead>
                  <TableHead>Inv #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Tenor</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-xs">
                      {invoice.org_id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{invoice.invoice_number || invoice.id.slice(0, 8)}</TableCell>
                    <TableCell>€{invoice.amount_eur.toLocaleString()}</TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.tenor_days}d</TableCell>
                    <TableCell className="font-mono text-xs">
                      {invoice.file_hash.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.rift_grade ? (
                        <Badge 
                          className={
                            invoice.rift_grade === 'A' ? 'bg-green-500 text-white' :
                            invoice.rift_grade === 'B' ? 'bg-yellow-500 text-white' :
                            'bg-red-500 text-white'
                          }
                        >
                          {invoice.rift_grade}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {invoice.rift_score !== null && invoice.rift_score !== undefined ? (
                        <span className="font-medium">{invoice.rift_score}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDrawer(invoice)}
                        >
                          Review
                        </Button>
                        {invoice.rift_score && (
                          <RiftScoreOverride
                            entityType="invoice"
                            entityId={invoice.id}
                            currentScore={invoice.rift_score}
                            onOverrideApplied={loadInvoices}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Review Drawer */}
      <Sheet open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedInvoice && (
            <>
              <SheetHeader>
                <SheetTitle>
                  Invoice {selectedInvoice.invoice_number || selectedInvoice.id.slice(0, 8)}
                </SheetTitle>
                <SheetDescription>
                  Review invoice details and take action
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="summary" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="pdf">PDF</TabsTrigger>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="text-2xl font-bold">
                      €{selectedInvoice.amount_eur.toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Due Date</Label>
                      <div>{new Date(selectedInvoice.due_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <Label>Tenor</Label>
                      <div>{selectedInvoice.tenor_days} days</div>
                    </div>
                  </div>

                  <div>
                    <Label>Buyer</Label>
                    <div className="font-medium">{selectedInvoice.buyer_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedInvoice.buyer_country}
                    </div>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <div>
                      <Badge className={STATUS_COLORS[selectedInvoice.status]}>
                        {selectedInvoice.status}
                      </Badge>
                    </div>
                  </div>

                  {selectedInvoice.mint_tx && (
                    <div>
                      <Label>cNFT Transaction</Label>
                      <a
                        href={`https://explorer.solana.com/tx/${selectedInvoice.mint_tx}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {selectedInvoice.mint_tx.slice(0, 20)}...
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="pdf" className="mt-4">
                  {pdfUrl ? (
                    <iframe
                      src={pdfUrl}
                      className="w-full h-[600px] border rounded"
                      title="Invoice PDF"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Loading PDF...
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="metadata" className="space-y-4 mt-4">
                  <div>
                    <Label>File Hash (SHA-256)</Label>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {selectedInvoice.file_hash}
                    </code>
                  </div>

                  <div>
                    <Label>Organization ID</Label>
                    <code className="text-xs bg-muted p-2 rounded block">
                      {selectedInvoice.org_id}
                    </code>
                  </div>

                  <div>
                    <Label>Created</Label>
                    <div>{new Date(selectedInvoice.created_at).toLocaleString()}</div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="note">Review Note (Optional)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add any notes about this review..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  {["submitted", "in_review"].includes(selectedInvoice.status) && (
                    <Button
                      onClick={handleApprove}
                      disabled={processing}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  )}

                  {selectedInvoice.status === "approved" && !selectedInvoice.mint_tx && (
                    <Button
                      onClick={handleMint}
                      disabled={processing}
                      className="flex-1"
                      variant="secondary"
                    >
                      <Coins className="mr-2 h-4 w-4" />
                      Mint cNFT (Devnet)
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
