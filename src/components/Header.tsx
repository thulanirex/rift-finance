
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <a href="/" className="flex items-center space-x-2">
            <span className="text-rift-blue font-bold text-2xl">RiFT</span>
            <span className="text-rift-dark font-medium">Finance</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/#how-it-works" className="text-rift-dark hover:text-rift-blue transition-colors duration-300">How It Works</a>
            <a href="/#rift-score" className="text-rift-dark hover:text-rift-blue transition-colors duration-300">RiFT Score™</a>
            <a href="/#esg-advantage" className="text-rift-dark hover:text-rift-blue transition-colors duration-300">ESG</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <a href="/auth" className="btn-primary">Get Started</a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-rift-dark focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 right-0 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            <a href="/#how-it-works" className="block text-rift-dark hover:text-rift-blue transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>How It Works</a>
            <a href="/#rift-score" className="block text-rift-dark hover:text-rift-blue transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>RiFT Score™</a>
            <a href="/#esg-advantage" className="block text-rift-dark hover:text-rift-blue transition-colors duration-300" onClick={() => setIsMobileMenuOpen(false)}>ESG</a>
            <a href="/auth" className="btn-primary inline-block" onClick={() => setIsMobileMenuOpen(false)}>Get Started</a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
