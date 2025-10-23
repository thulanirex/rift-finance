import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Invoice = {
  id: string;
  invoice_number: string | null;
  amount_eur: number;
  due_date: string;
  tenor_days: number;
  status: string;
  mint_tx: string | null;
  cnft_leaf_id: string | null;
  created_at: string;
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

export default function Invoices() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("org_id, role")
        .eq("auth_id", user.id)
        .single();

      if (!userData?.org_id) {
        toast({
          title: "No organization found",
          description: "Please complete seller onboarding first",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("org_id", userData.org_id)
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

  if (invoices.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Invoices</h1>
            <Button onClick={() => navigate("/invoices/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Invoice
            </Button>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Upload your first invoice to get started with tokenization and funding
              </p>
              <Button onClick={() => navigate("/invoices/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Your First Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Invoices</h1>
            <p className="text-muted-foreground">
              Manage and track your submitted invoices
            </p>
          </div>
          <Button onClick={() => navigate("/invoices/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Invoice
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
            <CardDescription>
              {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Tenor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>cNFT</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number || invoice.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>€{invoice.amount_eur.toLocaleString()}</TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.tenor_days} days</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[invoice.status] || "bg-gray-500"}>
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
                      {invoice.mint_tx ? (
                        <a
                          href={`https://explorer.solana.com/tx/${invoice.mint_tx}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
