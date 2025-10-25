import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Upload, Copy, FileText, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { AppLayout } from "@/components/AppLayout";

const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
  "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
  "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
  "Spain", "Sweden"
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function InvoiceNewConnected() {
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileHash, setFileHash] = useState("");
  
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tenor, setTenor] = useState("30");
  const [buyerName, setBuyerName] = useState("");
  const [buyerCountry, setBuyerCountry] = useState("");
  const [buyerVat, setBuyerVat] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  // Calculate SHA-256 hash of file
  const calculateFileHash = async (file: File): Promise<string> => {
    try {
      // Check if crypto.subtle is available
      if (!window.crypto || !window.crypto.subtle) {
        console.warn('crypto.subtle not available, using fallback hash');
        // Fallback: use a simple hash based on file properties
        return `${file.name}-${file.size}-${file.lastModified}`.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0).toString(16);
      }

      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('Hash calculation error:', error);
      // Fallback hash
      return `fallback-${file.name}-${file.size}-${Date.now()}`;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Maximum file size is 10MB");
      return;
    }

    setFile(selectedFile);
    setUploading(true);

    try {
      // Calculate file hash
      const hash = await calculateFileHash(selectedFile);
      setFileHash(hash);

      toast.success("Invoice PDF loaded and hash computed");
    } catch (error: any) {
      console.error("File processing error:", error);
      toast.error("Processing failed: " + error.message);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select an invoice PDF before submitting");
      return;
    }

    if (!confirmed) {
      toast.error("Please confirm that the details match the uploaded invoice");
      return;
    }

    if (!invoiceNumber || !amount || !dueDate || !buyerName || !buyerCountry) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < 100 || amountNum > 2000000) {
      toast.error("Amount must be between €100 and €2,000,000");
      return;
    }

    const dueDateObj = new Date(dueDate);
    const minDueDate = new Date();
    minDueDate.setDate(minDueDate.getDate() + 7);

    if (dueDateObj < minDueDate) {
      toast.error("Due date must be at least 7 days from today");
      return;
    }

    setSubmitting(true);

    try {
      console.log('📤 Uploading file to server...');
      
      // Upload file first
      const uploadResult = await apiClient.upload.single(file);
      console.log('✅ File uploaded:', uploadResult.file.url);

      // Create invoice via API
      console.log('📝 Creating invoice record...');
      const invoice = await apiClient.invoices.create({
        invoiceNumber,
        amountEur: amountNum,
        dueDate,
        counterparty: buyerName,
        buyerCountry,
        buyerVat: buyerVat || null,
        fileHash,
        tenorDays: parseInt(tenor),
        fileUrl: uploadResult.file.url,
      });

      console.log('✅ Invoice created:', invoice.id);

      toast.success(`Invoice ${invoiceNumber} has been submitted for review`);

      // Navigate to invoices list
      navigate("/invoices");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("Submission failed: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Upload New Invoice
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Submit an invoice for tokenization and funding
          </p>
        </div>

        <div className="space-y-6">
          {/* Card 1: Upload PDF */}
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Upload Invoice PDF</CardTitle>
              <CardDescription className="dark:text-slate-300">
                Select a PDF file (max 10MB). We'll compute a SHA-256 hash for verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
                  )}
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {uploading ? "Processing..." : file ? file.name : "Click to upload or drag and drop"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    PDF only, max 10MB
                  </div>
                </label>
              </div>

              {fileHash && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-500 dark:text-slate-400">SHA-256 Hash</Label>
                      <div className="font-mono text-sm break-all text-slate-900 dark:text-white">{fileHash}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(fileHash);
                        toast.success("Hash copied to clipboard");
                      }}
                      className="ml-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Invoice Details */}
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Invoice Details</CardTitle>
              <CardDescription className="dark:text-slate-300">
                Enter the invoice information that matches your uploaded PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-number" className="text-slate-900 dark:text-white">Invoice Number *</Label>
                  <Input
                    id="invoice-number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-2025-001"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-900 dark:text-white">Amount (EUR) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="100"
                    max="2000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10000"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date" className="text-slate-900 dark:text-white">Due Date *</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-white">Tenor (Days) *</Label>
                  <RadioGroup value={tenor} onValueChange={setTenor}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30" id="tenor-30" />
                      <Label htmlFor="tenor-30" className="text-slate-700 dark:text-slate-300">30 days (5% APR)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="90" id="tenor-90" />
                      <Label htmlFor="tenor-90" className="text-slate-700 dark:text-slate-300">90 days (7.5% APR)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="120" id="tenor-120" />
                      <Label htmlFor="tenor-120" className="text-slate-700 dark:text-slate-300">120 days (8.5% APR)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-medium text-slate-900 dark:text-white">Counterparty (Buyer)</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyer-name" className="text-slate-900 dark:text-white">Buyer Name *</Label>
                    <Input
                      id="buyer-name"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Acme Corp GmbH"
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyer-country" className="text-slate-900 dark:text-white">Buyer Country *</Label>
                    <Select value={buyerCountry} onValueChange={setBuyerCountry}>
                      <SelectTrigger id="buyer-country" className="dark:bg-slate-800 dark:border-slate-700">
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
                    <Label htmlFor="buyer-vat" className="text-slate-900 dark:text-white">Buyer VAT Number (Optional)</Label>
                    <Input
                      id="buyer-vat"
                      value={buyerVat}
                      onChange={(e) => setBuyerVat(e.target.value)}
                      placeholder="DE123456789"
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Submit */}
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Submit for Review</CardTitle>
              <CardDescription className="dark:text-slate-300">
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
                <Label htmlFor="confirm" className="font-normal text-slate-700 dark:text-slate-300">
                  I confirm that the details above match the uploaded invoice
                </Label>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!confirmed || !file || uploading || submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Submit for Review
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/invoices")}
                  disabled={submitting}
                  className="dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
