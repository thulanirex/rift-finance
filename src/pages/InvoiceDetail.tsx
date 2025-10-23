import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ExternalLink, FileText, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RiftScoreCard } from "@/components/RiftScoreCard";
import { useRiftScore } from "@/hooks/useRiftScore";

type Invoice = {
  id: string;
  invoice_number: string | null;
  amount_eur: number;
  due_date: string;
  tenor_days: number;
  currency: string;
  buyer_name: string | null;
  buyer_country: string | null;
  buyer_vat: string | null;
  counterparty: string;
  status: string;
  file_hash: string;
  file_url: string;
  mint_tx: string | null;
  cnft_leaf_id: string | null;
  cnft_collection: string | null;
  created_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  minted_at: string | null;
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

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState("");

  const { data: scoreData } = useRiftScore('invoice', id);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    if (!id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setInvoice(data);

      // Load PDF signed URL
      const { data: fileData, error: fileError } = await supabase.functions.invoke("invoice-file", {
        body: { invoice_id: id },
      });

      if (!fileError && fileData?.signed_url) {
        setPdfUrl(fileData.signed_url);
      }
    } catch (error: any) {
      console.error("Error loading invoice:", error);
      toast({
        title: "Failed to load invoice",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invoice not found</h2>
          <Button onClick={() => navigate("/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Invoice {invoice.invoice_number || invoice.id.slice(0, 8)}
            </h1>
            <p className="text-muted-foreground">
              Created {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge className={`text-lg px-4 py-2 ${STATUS_COLORS[invoice.status]}`}>
            {invoice.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">
                    {invoice.currency} {invoice.amount_eur.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Tenor</p>
                <p className="font-medium">{invoice.tenor_days} days</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Buyer</p>
                <p className="font-medium">{invoice.buyer_name || invoice.counterparty}</p>
                <p className="text-sm text-muted-foreground">{invoice.buyer_country}</p>
                {invoice.buyer_vat && (
                  <p className="text-sm text-muted-foreground">VAT: {invoice.buyer_vat}</p>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">File Hash (SHA-256)</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted p-2 rounded flex-1 break-all">
                    {invoice.file_hash}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(invoice.file_hash);
                      toast({ title: "Hash copied to clipboard" });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full bg-green-500`} />
                  <div>
                    <p className="font-medium">Uploaded</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {invoice.submitted_at && (
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full bg-blue-500`} />
                    <div>
                      <p className="font-medium">Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {invoice.approved_at && (
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full bg-green-500`} />
                    <div>
                      <p className="font-medium">Approved</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.approved_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {invoice.minted_at && (
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full bg-purple-500`} />
                    <div>
                      <p className="font-medium">Minted (cNFT)</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.minted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* cNFT Card (if minted) */}
          {invoice.mint_tx && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Compressed NFT Details</CardTitle>
                <CardDescription>
                  This invoice has been tokenized as a compressed NFT on Solana devnet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction</p>
                    <a
                      href={`https://explorer.solana.com/tx/${invoice.mint_tx}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {invoice.mint_tx.slice(0, 20)}...
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  {invoice.cnft_leaf_id && (
                    <div>
                      <p className="text-sm text-muted-foreground">Leaf ID</p>
                      <code className="text-xs">{invoice.cnft_leaf_id}</code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* PDF Preview */}
          {pdfUrl && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>PDF Preview</CardTitle>
                <CardDescription>
                  Secure view of your invoice document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <iframe
                  src={pdfUrl}
                  className="w-full h-[600px] border rounded"
                  title="Invoice PDF"
                />
              </CardContent>
            </Card>
          )}

          {/* RIFT Score Card */}
          {scoreData && !scoreData.error && (
            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                <RiftScoreCard
                  score={scoreData.total_score}
                  grade={scoreData.grade}
                  breakdown={scoreData.breakdown}
                  version={scoreData.version}
                  calculatedAt={scoreData.calculated_at}
                  inputs={scoreData.inputs_snapshot}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
