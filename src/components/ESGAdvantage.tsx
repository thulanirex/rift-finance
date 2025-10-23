import React, { useRef } from 'react';
import { Leaf, BarChart3, Euro, Sparkles } from 'lucide-react';
import { useScrollAnimation, useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation';

const ESGAdvantage: React.FC = () => {
  const sectionRef = useScrollAnimation({ animationClass: 'animate-fade-in' }) as React.RefObject<HTMLDivElement>;
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const statsContainerRef = useRef<HTMLDivElement>(null);
  
  useStaggeredScrollAnimation(cardsContainerRef, '.esg-card', { 
    animationClass: 'animate-scale',
    staggerDelay: 0.15 
  });
  
  useStaggeredScrollAnimation(statsContainerRef, '.stat-card', { 
    animationClass: 'animate-fade-in',
    staggerDelay: 0.1 
  });
  
  const features = [
    {
      icon: Leaf,
      title: "Green Invoices",
      description: "Tag sustainable imports/exports to access lower financing costs and preferential pool allocation.",
      highlight: "Future Phase"
    },
    {
      icon: BarChart3,
      title: "Carbon Credits", 
      description: "Future: integrate EU carbon markets so financed invoices automatically include offset tracking — creating new revenue streams for businesses.",
      highlight: "Coming Soon"
    },
    {
      icon: Euro,
      title: "EU Incentives",
      description: "Align with EU Green Deal and CBAM rules. Help businesses unlock tax credits and avoid compliance penalties while financing trade sustainably.",
      highlight: "Regulatory Ready"
    }
  ];

  return (
    <section id="esg-advantage" className="py-24 bg-gradient-to-br from-green-50 to-rift-light">
      <div ref={sectionRef} className="section-container opacity-0">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-green-600" />
            <span className="title-accent text-green-700">Future Phase Highlight</span>
          </div>
          <h2 className="section-title">Building the Future of Sustainable Trade Finance</h2>
          <p className="max-w-3xl mx-auto text-rift-dark/80">
            Rift is developing ESG-aligned features so every trade can contribute to measurable environmental impact — unlocking preferential funding, carbon credits, and EU incentives.
          </p>
        </div>
        
        <div ref={cardsContainerRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="esg-card opacity-0 bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 group relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                  {feature.highlight}
                </span>
              </div>
              
              <div className="bg-green-100 p-4 rounded-full inline-block mb-6 group-hover:bg-green-200 transition-colors duration-300">
                <feature.icon className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold mb-4 text-rift-dark">{feature.title}</h3>
              <p className="text-rift-dark/80">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full"></div>
            <div className="absolute top-12 right-8 w-6 h-6 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-8 left-12 w-4 h-4 bg-white/15 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/10 rounded-full"></div>
          </div>
          <div className="relative z-10 text-center">
            <h3 className="text-3xl font-bold mb-4">The First ESG-Integrated Trade Finance Platform</h3>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              By 2030, Rift aims for every financed trade to be carbon-tracked and ESG-aligned, ensuring compliance with EU standards while creating new value through incentives and offsets.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto" ref={statsContainerRef}>
              <div className="stat-card opacity-0 bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl font-bold mb-2">2027</div>
                <div className="text-sm opacity-90">ESG Features Live</div>
              </div>
              <div className="stat-card opacity-0 bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-sm opacity-90">Carbon-Tracked Invoices</div>
              </div>
              <div className="stat-card opacity-0 bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl font-bold mb-2">EU Ready</div>
                <div className="text-sm opacity-90">CBAM & CSRD Compliant</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ESGAdvantage;