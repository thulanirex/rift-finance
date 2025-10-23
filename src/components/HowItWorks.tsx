
import React, { useRef } from 'react';
import { Upload, DollarSign, CreditCard } from 'lucide-react';
import { useScrollAnimation, useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation';

const HowItWorks: React.FC = () => {
  const sectionRef = useScrollAnimation({ animationClass: 'animate-fade-in' }) as React.RefObject<HTMLDivElement>;
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const benefitsContainerRef = useRef<HTMLDivElement>(null);
  
  useStaggeredScrollAnimation(stepsContainerRef, '.step-card', { 
    animationClass: 'animate-scale',
    staggerDelay: 0.2 
  });
  
  useStaggeredScrollAnimation(benefitsContainerRef, '.benefit-card', { 
    animationClass: 'animate-fade-in-right',
    staggerDelay: 0.15 
  });
  
  const steps = [
    {
      icon: <Upload className="text-rift-blue h-10 w-10" />,
      title: "Upload & Verify",
      description: "Businesses upload invoices with KYB checks, VAT/EORI validation, and authenticity verification — ensuring compliance and legitimacy from day one."
    },
    {
      icon: <DollarSign className="text-rift-blue h-10 w-10" />,
      title: "RIFT Score™ Rating",
      description: "Every invoice receives a proprietary RIFT Score™, combining company legitimacy, financial health, payment behavior, trade flow risk, and ESG impact. This ensures risk is priced fairly for both businesses and funders."
    },
    {
      icon: <CreditCard className="text-rift-blue h-10 w-10" />,
      title: "Match & Repay",
      description: "Invoices are matched to 30/90/120-day liquidity pools with risk-appropriate yields. Repayments are automated, and funders receive principal + yield — backed by insurance and ESG monitoring."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-rift-light">
      <div ref={sectionRef} className="section-container opacity-0">
        <div className="text-center mb-16">
          <span className="title-accent">The Triangle Model</span>
          <h2 className="section-title">Closing the Trade Finance Gap for SMEs</h2>
          <p className="max-w-3xl mx-auto text-rift-dark/80">
            SMEs across the EU face cash flow delays of 30–120 days. Rift helps businesses access working capital quickly, while funders gain transparent, asset-backed yield opportunities — all secured by modern infrastructure and aligned with ESG standards.
          </p>
        </div>
        
        
        <div ref={stepsContainerRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="step-card feature-card group opacity-0"
            >
              <div className="bg-rift-blue/10 p-4 rounded-full inline-block mb-4 group-hover:bg-rift-blue/20 transition-colors duration-300">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-rift-dark">{step.title}</h3>
              <p className="text-rift-dark/80">{step.description}</p>
            </div>
          ))}
        </div>
        
        {/* Benefits to Each Party */}
        <div ref={benefitsContainerRef} className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="benefit-card opacity-0 bg-gradient-to-br from-rift-blue/10 to-rift-blue/5 rounded-2xl p-6 border border-rift-blue/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <h4 className="font-bold text-rift-blue mb-3">For Buyers</h4>
            <p className="text-rift-dark/80 text-sm">Unlock working capital without relying on banks. Flexible 30/90/120-day terms, faster approvals, and simple onboarding.</p>
          </div>
          <div className="benefit-card opacity-0 bg-gradient-to-br from-rift-terracotta/10 to-rift-terracotta/5 rounded-2xl p-6 border border-rift-terracotta/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <h4 className="font-bold text-rift-terracotta mb-3">For Sellers</h4>
            <p className="text-rift-dark/80 text-sm">Get paid upfront at a discount, improve cash flow instantly, and strengthen your trading relationships.</p>
          </div>
          <div className="benefit-card opacity-0 bg-gradient-to-br from-rift-sand/20 to-rift-sand/5 rounded-2xl p-6 border border-rift-sand/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <h4 className="font-bold text-rift-sand mb-3">For Funders</h4>
            <p className="text-rift-dark/80 text-sm">Earn predictable short-term yield backed by real invoices, with risk transparency, insurance protection, and measurable ESG impact.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
