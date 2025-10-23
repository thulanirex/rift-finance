import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

interface RiftScoreOverrideProps {
  entityType: 'invoice' | 'organization';
  entityId: string;
  currentScore: number;
  onOverrideApplied?: () => void;
}

export function RiftScoreOverride({ entityType, entityId, currentScore, onOverrideApplied }: RiftScoreOverrideProps) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (delta < -10 || delta > 10) {
      toast({
        title: "Invalid delta",
        description: "Delta must be between -10 and 10",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for the override",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('rift-score-override', {
        body: { entity_type: entityType, entity_id: entityId, delta, reason },
      });

      if (error) throw error;

      toast({
        title: "Override applied",
        description: `Score adjusted by ${delta > 0 ? '+' : ''}${delta}`,
      });

      setOpen(false);
      setDelta(0);
      setReason('');
      
      if (onOverrideApplied) {
        onOverrideApplied();
      }
    } catch (error: any) {
      console.error('Override error:', error);
      toast({
        title: "Failed to apply override",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const newScore = Math.max(0, Math.min(100, currentScore + delta));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Override Score
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override RIFT Score</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="delta">Delta (-10 to +10)</Label>
            <Input
              id="delta"
              type="number"
              min={-10}
              max={10}
              value={delta}
              onChange={(e) => setDelta(parseInt(e.target.value) || 0)}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Current: {currentScore} → New: {newScore}
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this override is needed..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Applying...' : 'Apply Override'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
