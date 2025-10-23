import React, { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, TrendingUp, FileText, Leaf, Shield } from 'lucide-react';

const FundingSimulator: React.FC = () => {
  const sectionRef = useScrollAnimation({ animationClass: 'animate-fade-in' }) as React.RefObject<HTMLDivElement>;
  
  // Input states
  const [invoiceAmount, setInvoiceAmount] = useState(100000);
  const [tenor, setTenor] = useState(90); // 30, 90, or 120
  const [riftScore, setRiftScore] = useState(80);
  const [esgEnabled, setEsgEnabled] = useState(false);
  const [insuranceEnabled, setInsuranceEnabled] = useState(true);
  
  // Advanced settings
  const [riskFreeRate, setRiskFreeRate] = useState(3.0);
  const [insuranceCoverage, setInsuranceCoverage] = useState(90);
  const [esgAdjustment, setEsgAdjustment] = useState(-0.50);

  // Calculate grade based on RIFT Score
  const getGrade = (score: number): string => {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 55) return 'C';
    return 'Not Eligible';
  };

  const grade = getGrade(riftScore);
  const isEligible = riftScore >= 55;

  // Calculate risk premium by grade
  const getRiskPremium = (grade: string): number => {
    switch (grade) {
      case 'A': return 2.0;
      case 'B': return 5.0;
      case 'C': return 8.0;
      default: return 0;
    }
  };

  // Calculate insurance cost
  const getInsuranceCost = (grade: string, insuranceOn: boolean): number => {
    if (grade === 'A') {
      return insuranceOn ? 0.5 : 0.0;
    }
    if (grade === 'B') return 1.0;
    if (grade === 'C') return 2.5;
    return 0;
  };

  // Check if insurance is required
  const isInsuranceRequired = grade === 'B' || grade === 'C';
  
  // Auto-enable insurance for B/C grades
  useEffect(() => {
    if (isInsuranceRequired && !insuranceEnabled) {
      setInsuranceEnabled(true);
    }
    // Update coverage based on grade
    if (grade === 'B' || grade === 'C') {
      setInsuranceCoverage(90);
    } else {
      setInsuranceCoverage(0);
    }
  }, [grade, isInsuranceRequired]);

  // Calculate tenor factor
  const tenorFactor = tenor / 360;

  // Calculate yields
  const rawAnnual = riskFreeRate + getRiskPremium(grade);
  const insuranceCost = getInsuranceCost(grade, insuranceEnabled);
  const esgAdj = esgEnabled ? esgAdjustment : 0;
  const netAnnual = Math.max(1, Math.min(20, rawAnnual - insuranceCost + esgAdj));
  const periodYield = netAnnual * tenorFactor;

  // Calculate cash flows
  const advance = invoiceAmount * (1 - periodYield / 100);
  const maturity = invoiceAmount;
  const funderAPR = ((maturity / advance) - 1) * (360 / tenor) * 100;

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-rift-sand';
      case 'C': return 'bg-rift-terracotta';
      default: return 'bg-gray-400';
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

  return (
    <section id="funding-simulator" className="py-24 bg-rift-cream">
      <div ref={sectionRef} className="section-container opacity-0">
        <div className="text-center mb-12">
          <h2 className="section-title">Choose Your Funding Strategy</h2>
          <p className="max-w-2xl mx-auto text-rift-dark/70">
            Explore how tenor, risk, and ESG choices affect yield and cashflows. Values are illustrative for demo purposes.
          </p>
        </div>

        {!isEligible && (
          <div className="bg-rift-terracotta/10 border border-rift-terracotta rounded-xl p-6 mb-8 flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-rift-terracotta flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-rift-dark mb-1">Invoice Not Eligible</h3>
              <p className="text-rift-dark/80 text-sm">
                Improve score (KYB, docs, on-time payments) to qualify for funding.
              </p>
            </div>
          </div>
        )}

        {invoiceAmount < 5000 && (
          <div className="bg-rift-terracotta/10 border border-rift-terracotta rounded-xl p-4 mb-8 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rift-terracotta" />
            <p className="text-rift-dark/80 text-sm">
              Minimum ticket size is €5,000 for demo.
            </p>
          </div>
        )}

        <Card className="max-w-6xl mx-auto shadow-xl border-0">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* LEFT COLUMN - INPUTS */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-rift-dark mb-4">Simulation Inputs</h3>
                
                {/* Invoice Amount */}
                <div className="space-y-2">
                  <Label htmlFor="invoice-amount" className="text-rift-dark font-medium">
                    Invoice Amount (EUR)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rift-dark/60">€</span>
                    <Input
                      id="invoice-amount"
                      type="number"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                      className="pl-8 border-rift-light focus:border-rift-blue"
                      min={5000}
                    />
                  </div>
                </div>

                {/* Tenor */}
                <div className="space-y-3">
                  <Label className="text-rift-dark font-medium">Tenor</Label>
                  <div className="flex gap-2">
                    {[30, 90, 120].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTenor(t)}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                          tenor === t
                            ? 'bg-rift-blue text-white shadow-md'
                            : 'bg-rift-light text-rift-dark hover:bg-rift-light/70'
                        }`}
                      >
                        {t} days
                      </button>
                    ))}
                  </div>
                </div>

                {/* RIFT Score */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-rift-dark font-medium">RIFT Score</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-rift-blue">{riftScore}</span>
                      <Badge className={`${getGradeBadgeColor(grade)} text-white border-0`}>
                        Grade {grade}
                      </Badge>
                    </div>
                  </div>
                  <Slider
                    value={[riftScore]}
                    onValueChange={(values) => setRiftScore(values[0])}
                    min={50}
                    max={95}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-rift-dark/60">
                    <span>50</span>
                    <span>95</span>
                  </div>
                </div>

                {/* ESG Enhanced */}
                <div className="flex items-center justify-between p-4 bg-rift-light rounded-lg">
                  <div className="flex items-center gap-3">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <div>
                      <Label htmlFor="esg-toggle" className="text-rift-dark font-medium cursor-pointer">
                        ESG Enhanced
                      </Label>
                      <p className="text-xs text-rift-dark/60">Lower rates for sustainable invoices</p>
                    </div>
                  </div>
                  <Switch
                    id="esg-toggle"
                    checked={esgEnabled}
                    onCheckedChange={setEsgEnabled}
                  />
                </div>

                {/* Insurance */}
                <div className="flex items-center justify-between p-4 bg-rift-light rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-rift-blue" />
                    <div>
                      <Label htmlFor="insurance-toggle" className="text-rift-dark font-medium">
                        Insurance Coverage
                      </Label>
                      <p className="text-xs text-rift-dark/60">
                        {isInsuranceRequired ? 'Required for Grade B/C' : 'Optional for Grade A'}
                      </p>
                    </div>
                  </div>
                  <Checkbox
                    id="insurance-toggle"
                    checked={insuranceEnabled}
                    onCheckedChange={(checked) => setInsuranceEnabled(checked as boolean)}
                    disabled={isInsuranceRequired}
                  />
                </div>

                {/* Advanced Settings */}
                <Accordion type="single" collapsible className="border border-rift-light rounded-lg">
                  <AccordionItem value="advanced" className="border-0">
                    <AccordionTrigger className="px-4 hover:no-underline text-rift-dark font-medium">
                      Advanced Settings
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="risk-free" className="text-sm text-rift-dark/80">
                          Risk-free rate (annual %)
                        </Label>
                        <Input
                          id="risk-free"
                          type="number"
                          step="0.1"
                          value={riskFreeRate}
                          onChange={(e) => setRiskFreeRate(Number(e.target.value))}
                          className="border-rift-light"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coverage" className="text-sm text-rift-dark/80">
                          Insurance coverage (%)
                        </Label>
                        <Input
                          id="coverage"
                          type="number"
                          value={insuranceCoverage}
                          onChange={(e) => setInsuranceCoverage(Number(e.target.value))}
                          className="border-rift-light"
                          disabled={grade === 'B' || grade === 'C'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="esg-adj" className="text-sm text-rift-dark/80">
                          ESG pricing adjustment (bps)
                        </Label>
                        <Input
                          id="esg-adj"
                          type="number"
                          step="0.01"
                          value={esgAdjustment}
                          onChange={(e) => setEsgAdjustment(Number(e.target.value))}
                          className="border-rift-light"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* RIGHT COLUMN - OUTPUTS */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-rift-dark mb-4">Expected Outcomes</h3>
                
                {/* Main Yield Display */}
                <div className="bg-gradient-to-br from-rift-blue to-rift-blue/80 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <p className="text-sm opacity-90">Estimated Annualized Yield</p>
                  </div>
                  <p className="text-5xl font-bold mb-1">{funderAPR.toFixed(1)}%</p>
                  <p className="text-xs opacity-75">Net to funder after all costs</p>
                </div>

                {/* Cashflow Details */}
                <div className="space-y-4 p-6 bg-rift-light rounded-xl">
                  <div className="flex justify-between items-center pb-3 border-b border-rift-dark/10">
                    <span className="text-rift-dark/70 text-sm">Upfront Payout to Seller</span>
                    <span className="text-rift-dark font-bold text-lg">
                      €{advance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-rift-dark/10">
                    <span className="text-rift-dark/70 text-sm">Funder Advance</span>
                    <span className="text-rift-dark font-bold text-lg">
                      €{advance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-rift-dark/10">
                    <span className="text-rift-dark/70 text-sm">Maturity Proceeds (Face Value)</span>
                    <span className="text-rift-dark font-bold text-lg">
                      €{maturity.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-rift-dark/70 text-sm">Period Discount</span>
                    <span className="text-rift-dark font-medium">
                      {periodYield.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-rift-blue text-white border-0 px-3 py-1">
                    {tenor} days
                  </Badge>
                  <Badge className={`${getGradeBadgeColor(grade)} text-white border-0 px-3 py-1`}>
                    Grade {grade}
                  </Badge>
                  {esgEnabled && (
                    <Badge className="bg-green-600 text-white border-0 px-3 py-1">
                      <Leaf className="h-3 w-3 mr-1" />
                      ESG ON
                    </Badge>
                  )}
                  {insuranceEnabled && (
                    <Badge className="bg-rift-sand text-rift-dark border-0 px-3 py-1">
                      <Shield className="h-3 w-3 mr-1" />
                      Insured {insuranceCoverage}%
                    </Badge>
                  )}
                </div>

                {/* Insurance Note */}
                {insuranceEnabled && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-rift-dark">
                      {isInsuranceRequired
                        ? `Insurance coverage ${insuranceCoverage}% included. Recoveries flow back to pool on default.`
                        : 'Optional insurance enabled.'}
                    </p>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    disabled={!isEligible}
                    className="w-full bg-rift-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-rift-blue/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="h-5 w-5" />
                    Simulate Funding Flow
                  </button>
                  <button
                    disabled={!isEligible}
                    className="w-full bg-rift-sand text-rift-dark py-3 px-6 rounded-lg font-medium hover:bg-rift-sand/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FileText className="h-5 w-5" />
                    Preview Terms PDF
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FundingSimulator;
