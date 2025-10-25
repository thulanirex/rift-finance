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
import { apiClient } from "@/lib/api-client";
import { CheckCircle, XCircle, Coins, ExternalLink } from "lucide-react";
import { toast } from "sonner";
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
  file_url?: string | null;
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [sellerOrg, setSellerOrg] = useState<any>(null);
  const [orgDocuments, setOrgDocuments] = useState<any[]>([]);
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
      const data = await apiClient.invoices.getAll();
      setInvoices(data || []);
    } catch (error: any) {
      console.error("Error loading invoices:", error);
      toast.error("Failed to load invoices: " + error.message);
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

  const handleSelectInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setNote("");
    
    // Load seller organization data
    loadSellerData(invoice.org_id);

    // Load PDF from file_url if available
    if (invoice.file_url) {
      setPdfUrl(invoice.file_url);
    } else {
      setPdfUrl("");
      console.warn("No file URL available for this invoice");
    }
  };

  const handleApprove = async () => {
    if (!selectedInvoice) return;

    setProcessing(true);
    try {
      await apiClient.invoices.update(selectedInvoice.id, {
        status: 'approved',
      });

      toast.success("Invoice approved successfully");

      setSelectedInvoice(null);
      loadInvoices();
    } catch (error: any) {
      console.error("Approval error:", error);
      toast.error("Approval failed: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedInvoice) return;

    setProcessing(true);
    try {
      await apiClient.invoices.update(selectedInvoice.id, {
        status: 'draft',
      });

      toast.success("Invoice rejected");

      setSelectedInvoice(null);
      loadInvoices();
    } catch (error: any) {
      console.error("Rejection error:", error);
      toast.error("Rejection failed: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const loadSellerData = async (orgId: string) => {
    try {
      const org = await apiClient.organizations.getById(orgId);
      setSellerOrg(org);
      
      const docs = await apiClient.organizations.getDocuments(orgId);
      setOrgDocuments(docs);
    } catch (error) {
      console.error('Error loading seller data:', error);
    }
  };

  const handleMint = async () => {
    if (!selectedInvoice) return;

    setProcessing(true);
    try {
      // TODO: Implement Solana cNFT minting
      // This will require Solana program integration
      
      // For now, just update status to 'listed'
      await apiClient.invoices.update(selectedInvoice.id, {
        status: 'listed',
      });

      toast.success("Invoice listed successfully. cNFT minting coming soon!");

      setSelectedInvoice(null);
      loadInvoices();
    } catch (error: any) {
      console.error("Listing error:", error);
      toast.error("Listing failed: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const countries = Array.from(new Set(invoices.map((inv) => inv.buyer_country).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Invoice Review Console
          </h1>
          <p className="text-muted-foreground text-lg">
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
                      {invoice.org_id?.slice(0, 8) || '-'}
                    </TableCell>
                    <TableCell>{invoice.invoice_number || invoice.id?.slice(0, 8) || '-'}</TableCell>
                    <TableCell>€{invoice.amount_eur.toLocaleString()}</TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.tenor_days}d</TableCell>
                    <TableCell className="font-mono text-xs">
                      {invoice.file_hash ? `${invoice.file_hash.slice(0, 8)}...` : '-'}
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
                          onClick={() => handleSelectInvoice(invoice)}
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
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="seller">Seller</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="risk">Risk</TabsTrigger>
                  <TabsTrigger value="pdf">PDF</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6 mt-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Invoice Overview</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Review all details carefully before approving. Check seller KYB status, documents, and risk assessment.
                    </p>
                  </div>

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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Buyer Name</Label>
                      <div className="font-medium">{selectedInvoice.buyer_name || 'Not provided'}</div>
                    </div>
                    <div>
                      <Label>Buyer Country</Label>
                      <div className="font-medium">{selectedInvoice.buyer_country || 'Not provided'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Invoice Number</Label>
                      <div className="font-mono text-sm">{selectedInvoice.invoice_number || 'Auto-generated'}</div>
                    </div>
                    <div>
                      <Label>Created Date</Label>
                      <div className="text-sm">{new Date(selectedInvoice.created_at).toLocaleString()}</div>
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

                <TabsContent value="seller" className="space-y-6 mt-4">
                  {sellerOrg ? (
                    <>
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3">Organization Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Organization Name</Label>
                            <div className="font-medium">{sellerOrg.name}</div>
                          </div>
                          <div>
                            <Label>Legal Name</Label>
                            <div className="font-medium">{sellerOrg.legal_name || 'Not provided'}</div>
                          </div>
                          <div>
                            <Label>Country</Label>
                            <div>{sellerOrg.country || 'Not provided'}</div>
                          </div>
                          <div>
                            <Label>Registration Number</Label>
                            <div className="font-mono text-sm">{sellerOrg.registration_number || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3">KYB Status</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Verification Status</Label>
                            <div>
                              <Badge variant={
                                sellerOrg.kyb_status === 'approved' ? 'default' :
                                sellerOrg.kyb_status === 'pending' ? 'secondary' :
                                'destructive'
                              }>
                                {sellerOrg.kyb_status || 'pending'}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label>KYB Score</Label>
                            <div className="text-lg font-bold">{sellerOrg.kyb_score || 'N/A'}</div>
                          </div>
                          <div>
                            <Label>Sanctions Risk</Label>
                            <div>
                              <Badge variant={sellerOrg.sanctions_risk === 'low' ? 'default' : 'destructive'}>
                                {sellerOrg.sanctions_risk || 'Not assessed'}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label>Member Since</Label>
                            <div className="text-sm">{new Date(sellerOrg.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>

                      {sellerOrg.address && (
                        <div>
                          <Label>Business Address</Label>
                          <div className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded">
                            {sellerOrg.address}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">Loading seller information...</div>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4 mt-4">
                  {orgDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {orgDocuments.map((doc: any) => (
                        <div key={doc.id} className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{doc.type}</div>
                              <div className="text-sm text-muted-foreground">{doc.filename}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          {doc.rejection_reason && (
                            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                              Rejection reason: {doc.rejection_reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No documents uploaded yet
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="risk" className="space-y-6 mt-4">
                  <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Risk Assessment</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Comprehensive risk scoring based on multiple factors including seller KYB, buyer creditworthiness, and invoice characteristics.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                      <Label>RIFT Score</Label>
                      <div className="text-3xl font-bold mt-2">
                        {selectedInvoice.rift_score || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Risk score (0-100, higher is better)
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                      <Label>RIFT Grade</Label>
                      <div className="mt-2">
                        {selectedInvoice.rift_grade ? (
                          <Badge className={
                            selectedInvoice.rift_grade === 'A' ? 'bg-green-500 text-white text-2xl px-4 py-2' :
                            selectedInvoice.rift_grade === 'B' ? 'bg-yellow-500 text-white text-2xl px-4 py-2' :
                            'bg-red-500 text-white text-2xl px-4 py-2'
                          }>
                            {selectedInvoice.rift_grade}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Not graded</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        A: Low risk, B: Medium risk, C: High risk
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Risk Factors</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                        <span>Seller KYB Status</span>
                        <Badge variant={sellerOrg?.kyb_status === 'approved' ? 'default' : 'secondary'}>
                          {sellerOrg?.kyb_status || 'pending'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                        <span>Tenor Period</span>
                        <span className="font-medium">{selectedInvoice.tenor_days} days</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                        <span>Invoice Amount</span>
                        <span className="font-medium">€{selectedInvoice.amount_eur.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                        <span>Buyer Country Risk</span>
                        <Badge variant="outline">{selectedInvoice.buyer_country || 'Unknown'}</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded">
                        <span>Documents Verified</span>
                        <Badge variant={orgDocuments.some(d => d.status === 'approved') ? 'default' : 'secondary'}>
                          {orgDocuments.filter(d => d.status === 'approved').length} / {orgDocuments.length}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Recommendation</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {selectedInvoice.rift_grade === 'A' 
                        ? '✓ Low risk - Recommended for approval'
                        : selectedInvoice.rift_grade === 'B'
                        ? '⚠ Medium risk - Review carefully before approval'
                        : selectedInvoice.rift_grade === 'C'
                        ? '⚠ High risk - Additional due diligence recommended'
                        : 'ℹ Not yet scored - Complete risk assessment before approval'}
                    </p>
                  </div>
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
