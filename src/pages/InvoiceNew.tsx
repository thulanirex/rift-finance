import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Copy, FileText } from "lucide-react";

const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
  "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
  "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
  "Spain", "Sweden"
];

export default function InvoiceNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileHash, setFileHash] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tenor, setTenor] = useState("30");
  const [buyerName, setBuyerName] = useState("");
  const [buyerCountry, setBuyerCountry] = useState("");
  const [buyerVat, setBuyerVat] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are allowed",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setUploading(true);

    try {
      // Get current user and org
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("org_id")
        .eq("auth_id", user.id)
        .single();

      if (!userData?.org_id) throw new Error("No organization found");

      // Upload via edge function
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("org_id", userData.org_id);
      formData.append("amount_eur", amount || "0");
      formData.append("due_date", dueDate || new Date().toISOString().split('T')[0]);
      formData.append("counterparty", buyerName || "TBD");
      formData.append("tenor_days", tenor);

      const { data, error } = await supabase.functions.invoke("invoice-upload", {
        body: formData,
      });

      if (error) throw error;

      setFileHash(data.file_hash);
      setInvoiceId(data.invoice_id);

      toast({
        title: "File uploaded",
        description: "Invoice PDF uploaded and hash computed",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!invoiceId) {
      toast({
        title: "Upload file first",
        description: "Please upload an invoice PDF before submitting",
        variant: "destructive",
      });
      return;
    }

    if (!confirmed) {
      toast({
        title: "Confirmation required",
        description: "Please confirm that the details match the uploaded invoice",
        variant: "destructive",
      });
      return;
    }

    if (!invoiceNumber || !amount || !dueDate || !buyerName || !buyerCountry) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < 100 || amountNum > 2000000) {
      toast({
        title: "Invalid amount",
        description: "Amount must be between €100 and €2,000,000",
        variant: "destructive",
      });
      return;
    }

    const dueDateObj = new Date(dueDate);
    const minDueDate = new Date();
    minDueDate.setDate(minDueDate.getDate() + 7);

    if (dueDateObj < minDueDate) {
      toast({
        title: "Invalid due date",
        description: "Due date must be at least 7 days from today",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update invoice with all metadata
      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          invoice_number: invoiceNumber,
          amount_eur: amountNum,
          due_date: dueDate,
          tenor_days: parseInt(tenor),
          buyer_name: buyerName,
          buyer_country: buyerCountry,
          buyer_vat: buyerVat || null,
          currency: "EUR",
        })
        .eq("id", invoiceId);

      if (updateError) throw updateError;

      // Submit for review
      const { error: submitError } = await supabase.functions.invoke("invoice-submit", {
        body: { invoice_id: invoiceId },
      });

      if (submitError) throw submitError;

      toast({
        title: "Invoice submitted",
        description: "Your invoice has been submitted for review",
      });

      navigate("/invoices");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload New Invoice</h1>
          <p className="text-muted-foreground">
            Submit an invoice for tokenization and funding
          </p>
        </div>

        <div className="space-y-6">
          {/* Card 1: Upload PDF */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Invoice PDF</CardTitle>
              <CardDescription>
                Select a PDF file (max 10MB). We'll compute a SHA-256 hash for verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading || !!invoiceId}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : file ? file.name : "Click to upload or drag and drop"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    PDF only, max 10MB
                  </div>
                </label>
              </div>

              {fileHash && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs text-muted-foreground">SHA-256 Hash</Label>
                      <div className="font-mono text-sm break-all">{fileHash}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(fileHash);
                        toast({ title: "Hash copied to clipboard" });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>
                Enter the invoice information that matches your uploaded PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Invoice Number *</Label>
                  <Input
                    id="invoice-number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-2025-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (EUR) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="100"
                    max="2000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date *</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tenor (Days) *</Label>
                  <RadioGroup value={tenor} onValueChange={setTenor}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30" id="tenor-30" />
                      <Label htmlFor="tenor-30">30 days</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="90" id="tenor-90" />
                      <Label htmlFor="tenor-90">90 days</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="120" id="tenor-120" />
                      <Label htmlFor="tenor-120">120 days</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Counterparty (Buyer)</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyer-name">Buyer Name *</Label>
                    <Input
                      id="buyer-name"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Acme Corp GmbH"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyer-country">Buyer Country *</Label>
                    <Select value={buyerCountry} onValueChange={setBuyerCountry}>
                      <SelectTrigger id="buyer-country">
                        <SelectValue placeholder="Select EU country" />
                      </SelectTrigger>
                      <SelectContent>
                        {EU_COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="buyer-vat">Buyer VAT Number (Optional)</Label>
                    <Input
                      id="buyer-vat"
                      value={buyerVat}
                      onChange={(e) => setBuyerVat(e.target.value)}
                      placeholder="DE123456789"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Submit */}
          <Card>
            <CardHeader>
              <CardTitle>Submit for Review</CardTitle>
              <CardDescription>
                Review and confirm your invoice details before submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm"
                  checked={confirmed}
                  onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                />
                <Label htmlFor="confirm" className="font-normal">
                  I confirm that the details above match the uploaded invoice
                </Label>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!confirmed || !invoiceId || uploading}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Submit for Review
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/invoices")}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
