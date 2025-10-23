import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, Shield, Clock, Leaf, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useGateStatus } from '@/hooks/useGateVerification';
import { toast } from 'sonner';

const DeFiPools: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { gateStatus } = useGateStatus();
  const isVerified = gateStatus?.gate_status === 'verified';
  
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [disclaimer, setDisclaimer] = useState(false);
  const [allocating, setAllocating] = useState(false);
  
  const { data: pools, isLoading, refetch: refetchPools } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .order('tenor_days', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleAllocate = async () => {
    if (!selectedPool || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!disclaimer) {
      toast.error('Please accept the disclaimer');
      return;
    }

    setAllocating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('Please sign in to allocate funds');
        return;
      }

      const { data, error } = await supabase.functions.invoke('pool-allocate', {
        body: {
          tenor_days: selectedPool.tenor_days,
          amount: parseFloat(amount),
          idempotencyKey: crypto.randomUUID(),
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success(`Successfully allocated €${amount} to ${selectedPool.tenor_days}d pool!`, {
        description: data.position?.mode === 'SIM' ? 'Simulated transaction' : `TX: ${data.position?.tx_sig?.substring(0, 20)}...`,
      });

      setAllocateDialogOpen(false);
      setAmount("");
      setDisclaimer(false);
      refetchPools();
    } catch (error: any) {
      console.error('Allocation error:', error);
      toast.error(error.message || 'Failed to allocate funds');
    } finally {
      setAllocating(false);
    }
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const getPoolRisk = (tenorDays: number) => {
    if (tenorDays <= 30) return { risk: "Low Risk", color: "rift-blue", icon: Shield };
    if (tenorDays <= 90) return { risk: "Medium Risk", color: "rift-sand", icon: TrendingUp };
    return { risk: "High Risk", color: "rift-terracotta", icon: Clock };
  };

  if (isLoading) {
    return <div className="py-24 bg-rift-cream text-center">Loading pools...</div>;
  }

  return (
    <section id="defi-pools" className="py-24 bg-rift-cream">
      <div ref={sectionRef} className="section-container opacity-0">
        <div className="text-center mb-16">
          <span className="title-accent">Dual Capital Sources</span>
          <h2 className="section-title">Risk-Based Funding Pools</h2>
          <p className="max-w-2xl mx-auto text-rift-dark/80">
            Unlike traditional platforms that rely only on institutions, Rift allows individual funders and large offices to participate side by side in risk-based stablecoin pools.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pools?.map((pool) => {
            const { risk, color, icon: Icon } = getPoolRisk(pool.tenor_days);
            
            return (
              <div 
                key={pool.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 group"
              >
                <div className={`h-2 bg-${color}`}></div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`h-8 w-8 text-${color}`} />
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">ESG Option</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-rift-dark">{risk}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-rift-dark/70">Tenor:</span>
                      <span className="font-medium text-rift-dark">{pool.tenor_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rift-dark/70">APR:</span>
                      <span className="font-bold text-rift-terracotta text-lg">{(pool.apr * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rift-dark/70">TVL:</span>
                      <span className="font-medium text-rift-dark">
                        €{((pool.tvl || 0) / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    className={`w-full bg-${color} hover:bg-${color}/90`}
                    disabled={!isVerified}
                    onClick={() => {
                      setSelectedPool(pool);
                      setAllocateDialogOpen(true);
                    }}
                  >
                    {!isVerified && <Lock className="mr-2 h-4 w-4" />}
                    {isVerified ? 'Allocate Funds' : 'Verification Required'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-gradient-to-r from-rift-blue to-rift-terracotta rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Experience DeFi Trade Finance?</h3>
          <p className="mb-6 max-w-2xl mx-auto opacity-90">
            Discover how EURC and USDC power transparent, efficient trade finance through our decentralized infrastructure.
          </p>
          <button className="bg-white text-rift-dark px-8 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors duration-300">
            Learn More
          </button>
        </div>
      </div>

      <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate to {selectedPool?.tenor_days}d Pool</DialogTitle>
            <DialogDescription>
              APR: {selectedPool ? (selectedPool.apr * 100).toFixed(1) : 0}% | Tenor: {selectedPool?.tenor_days} days
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="amount">Amount (EUR)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="100"
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="disclaimer"
                checked={disclaimer}
                onCheckedChange={(checked) => setDisclaimer(checked as boolean)}
              />
              <label
                htmlFor="disclaimer"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this is a pilot with simulated custody. Funds are tracked in the ledger for demonstration purposes.
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocateDialogOpen(false)} disabled={allocating}>
              Cancel
            </Button>
            <Button onClick={handleAllocate} disabled={allocating || !disclaimer || !amount}>
              {allocating ? 'Allocating...' : 'Allocate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default DeFiPools;