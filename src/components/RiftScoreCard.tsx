import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface RiftScoreCardProps {
  score: number;
  grade: 'A' | 'B' | 'C';
  breakdown?: {
    identity_integrity: number;
    financial_health: number;
    payment_behavior: number;
    trade_flow_risk: number;
    esg: number;
  };
  version?: string;
  calculatedAt?: string;
  inputs?: any;
}

const FACTOR_LABELS = {
  identity_integrity: 'Identity & Integrity',
  financial_health: 'Financial Health',
  payment_behavior: 'Payment Behavior',
  trade_flow_risk: 'Trade Flow Risk',
  esg: 'ESG Factors',
};

const FACTOR_WEIGHTS = {
  identity_integrity: 10,
  financial_health: 20,
  payment_behavior: 30,
  trade_flow_risk: 20,
  esg: 20,
};

export function RiftScoreCard({ score, grade, breakdown, version = '1.0.0', calculatedAt, inputs }: RiftScoreCardProps) {
  const gradeColor = grade === 'A' ? 'bg-green-500' : grade === 'B' ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">RIFT Score™</h3>
          <p className="text-sm text-muted-foreground">
            Static v{version} • {calculatedAt ? new Date(calculatedAt).toLocaleDateString() : 'Just now'}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Why this score?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-semibold mb-2">Score Breakdown</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  The RIFT Score is calculated using 5 weighted factors. Each factor is scored 0-100, then weighted to produce the final score.
                </p>
              </div>
              
              {breakdown && Object.entries(breakdown).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {FACTOR_LABELS[key as keyof typeof FACTOR_LABELS]}
                    </span>
                    <span className="text-muted-foreground">
                      {value}/100 × {FACTOR_WEIGHTS[key as keyof typeof FACTOR_WEIGHTS]}% = {Math.round(value * FACTOR_WEIGHTS[key as keyof typeof FACTOR_WEIGHTS] / 100)}
                    </span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}

              {inputs && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Input Values</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(inputs).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(score / 100) * 251.2} 251.2`}
              className={gradeColor.replace('bg-', 'text-')}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{score}</span>
          </div>
        </div>

        <div>
          <Badge className={gradeColor + ' text-white text-lg px-4 py-1'}>
            Grade {grade}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            {grade === 'A' && 'Excellent creditworthiness'}
            {grade === 'B' && 'Good creditworthiness'}
            {grade === 'C' && 'Fair creditworthiness'}
          </p>
        </div>
      </div>

      {breakdown && (
        <div className="space-y-3">
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span>{FACTOR_LABELS[key as keyof typeof FACTOR_LABELS]}</span>
                <span className="text-muted-foreground">{value}/100</span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
