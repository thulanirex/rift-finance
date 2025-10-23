
import React, { useEffect, useRef, useState } from 'react';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      },
      { threshold: 0.1 }
    );
    
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    
    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-rift-light to-rift-cream opacity-70 z-0"></div>
      
      {/* Abstract Shape Background with Parallax */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div 
          className="absolute -top-20 -right-20 w-96 h-96 bg-rift-sand/20 rounded-full blur-3xl animate-float"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        ></div>
        <div 
          className="absolute top-1/2 -left-20 w-80 h-80 bg-rift-terracotta/10 rounded-full blur-3xl animate-float"
          style={{ transform: `translateY(${scrollY * 0.2}px)`, animationDelay: '2s' }}
        ></div>
        <div 
          className="absolute bottom-0 right-1/3 w-64 h-64 bg-rift-blue/10 rounded-full blur-3xl animate-float"
          style={{ transform: `translateY(${scrollY * 0.15}px)`, animationDelay: '4s' }}
        ></div>
      </div>
      
      <div ref={heroRef} className="section-container relative z-10 opacity-0">
        <div className="max-w-4xl mx-auto text-center">
          <span className="title-accent inline-block mb-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>A New Model for Trade Finance</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-rift-dark leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Unlocking Liquidity for Cross-Border Trade
          </h1>
          <p className="text-lg md:text-xl text-rift-dark/80 mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            Rift helps SMEs get paid faster on their invoices, while funders access short-term, yield-bearing assets. Powered by modern digital infrastructure — secure, transparent, and ESG-aligned.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <a href="#how-it-works" className="btn-primary w-full sm:w-auto">
              Learn More
            </a>
            <a href="/auth" className="bg-rift-terracotta text-white px-6 py-3 rounded-lg shadow-lg hover:bg-rift-terracotta/90 transition-all duration-300 font-medium w-full sm:w-auto text-center">
              Get Started
            </a>
          </div>
        </div>
      </div>
      
      {/* Updated Scroll Indicator with proper spacing */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-sm text-rift-dark/60 mb-2">Scroll to explore</span>
        <div className="w-8 h-14 border-2 border-rift-dark/20 rounded-full flex justify-center">
          <div className="w-1.5 h-2.5 bg-rift-dark/30 rounded-full mt-2 animate-bounce-slow"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
