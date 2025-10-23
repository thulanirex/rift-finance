
import React, { useRef, useEffect } from 'react';
import { useScrollAnimation, useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation';

const RiftScore: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const featuresContainerRef = useRef<HTMLDivElement>(null);
  
  useStaggeredScrollAnimation(featuresContainerRef, '.feature-box', { 
    animationClass: 'animate-fade-in-left',
    staggerDelay: 0.15 
  });
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            if (chartRef.current) {
              const elements = chartRef.current.querySelectorAll('.chart-element');
              elements.forEach((el, i) => {
                setTimeout(() => {
                  (el as HTMLElement).style.width = (el as HTMLElement).dataset.width || '0%';
                  (el as HTMLElement).style.opacity = '1';
                }, i * 100);
              });
            }
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

  const scoreFactors = [
    { name: "Payment History", score: 92, width: "92%" },
    { name: "Business Longevity", score: 78, width: "78%" },
    { name: "Industry Risk", score: 85, width: "85%" },
    { name: "Market Conditions", score: 70, width: "70%" },
    { name: "Financial Health", score: 88, width: "88%" }
  ];

  return (
    <section id="rift-score" className="py-24 bg-gradient-to-br from-rift-blue to-rift-blue/80 text-white">
      <div ref={sectionRef} className="section-container opacity-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div ref={featuresContainerRef}>
            <span className="text-sm font-semibold tracking-wider uppercase text-rift-sand mb-2">Proprietary Technology</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">RiFT Score™</h2>
            <p className="mb-8 text-white/90">
              Our proprietary scoring engine provides a transparent, standardized way to assess SME trade finance risk across the EU. Each invoice is evaluated using a blend of financial health, payment behavior, trade delivery risk, and ESG footprint. The result: a clear, real-time score that builds confidence for both businesses and funders.
            </p>
            
            <div className="space-y-6">
              <div className="feature-box opacity-0 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-xl font-semibold mb-2">Smart Risk Assessment</h3>
                <p className="text-white/80">
                  RIFT Score™ combines traditional credit metrics with real trade finance factors — including buyer repayment history, seller delivery reliability, and counterparty legitimacy.
                </p>
              </div>
              
              <div className="feature-box opacity-0 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-xl font-semibold mb-2">ESG & Compliance Layer</h3>
                <p className="text-white/80">
                  Scores incorporate sustainability signals and EU regulatory checks, helping funders align with ESG targets and compliance standards.
                </p>
              </div>
              
              <div className="feature-box opacity-0 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
                <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
                <p className="text-white/80">
                  Scores refresh dynamically as new payments are made, buyers repay, and trade documents are verified — giving funders up-to-date risk visibility.
                </p>
              </div>
            </div>
          </div>
          
          <div ref={chartRef} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold">RiFT Score™</h3>
                <p className="text-white/70">Example Breakdown</p>
              </div>
              <div className="text-4xl font-bold text-rift-sand">85</div>
            </div>
            
            <div className="space-y-6">
              {scoreFactors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span>{factor.name}</span>
                    <span className="font-semibold">{factor.score}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full">
                    <div 
                      className="chart-element h-full bg-rift-sand rounded-full transition-all duration-1000 ease-out"
                      style={{ width: '0%', opacity: 0 }}
                      data-width={factor.width}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Overall Score Trend</span>
                <span className="text-rift-sand font-medium">+15% this quarter</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiftScore;
