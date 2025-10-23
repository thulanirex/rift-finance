
import React, { useEffect, useRef } from 'react';

const Partners: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            
            const logos = entry.target.querySelectorAll('.partner-logo');
            logos.forEach((logo, i) => {
              setTimeout(() => {
                logo.classList.add('opacity-100', 'translate-y-0');
              }, i * 100);
            });
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

  // Placeholder data for partners - in a real app these would be images
  const partners = [
    { name: "Financial Group A" },
    { name: "Tech Partner B" },
    { name: "Bank C" },
    { name: "Payment Provider D" },
    { name: "Government Agency E" },
    { name: "Investment Fund F" },
    { name: "Logistics Company G" },
    { name: "SME Network H" }
  ];

  return (
    <section id="partners" className="py-24 bg-rift-cream">
      <div ref={sectionRef} className="section-container opacity-0">
        <div className="text-center mb-16">
          <span className="title-accent">Our Network</span>
          <h2 className="section-title">Trusted By</h2>
          <p className="max-w-2xl mx-auto text-rift-dark/80">
            RiFT Finance collaborates with leading financial institutions, payment providers, and government agencies across Africa.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {partners.map((partner, index) => (
            <div 
              key={index} 
              className="partner-logo bg-white p-8 rounded-xl flex items-center justify-center h-24 shadow-sm opacity-0 translate-y-4 transition-all duration-500 ease-out"
            >
              {/* In a real implementation these would be actual logo images */}
              <div className="text-rift-dark/60 font-medium">{partner.name}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 bg-rift-blue/10 rounded-2xl p-10 border border-rift-blue/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-rift-dark mb-2">Join Our Network</h3>
            <p className="text-rift-dark/80 max-w-2xl mx-auto">
              Whether you're a financial institution, payment provider, or government agency, become part of Africa's growing trade finance ecosystem.
            </p>
          </div>
          
          <div className="flex justify-center">
            <a href="#contact" className="btn-primary">
              Become a Partner
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
