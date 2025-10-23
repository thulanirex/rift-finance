
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-rift-dark text-white">
      <div className="section-container py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Company Info (Contact form removed) */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-6">
                <span className="text-rift-sand font-bold text-2xl mr-2">RiFT</span>
                <span className="text-white font-medium text-xl">Finance</span>
              </div>
              
              <p className="text-white/80 mb-8 max-w-md">
                The first DeFi + ESG trade finance protocol, unlocking short-term working capital through blockchain-powered invoice discounting.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                <div>
                  <h4 className="text-rift-sand font-medium mb-4">Product</h4>
                  <ul className="space-y-3">
                    <li><a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How It Works</a></li>
                    <li><a href="#rift-score" className="text-white/70 hover:text-white transition-colors">RiFT Score™</a></li>
                    <li><a href="#defi-pools" className="text-white/70 hover:text-white transition-colors">DeFi Pools</a></li>
                    <li><a href="#esg-advantage" className="text-white/70 hover:text-white transition-colors">ESG Features</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-rift-sand font-medium mb-4">Company</h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-white/70 hover:text-white transition-colors">About</a></li>
                    <li><a href="#" className="text-white/70 hover:text-white transition-colors">Documentation</a></li>
                    <li><a href="#" className="text-white/70 hover:text-white transition-colors">Blog</a></li>
                    <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-6 text-white/60 text-sm">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <p>© {new Date().getFullYear()} RiFT Finance. All rights reserved.</p>
                <div className="flex space-x-6">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                  <a href="#" className="hover:text-white transition-colors">Discord</a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Second column - can be used for other information or kept empty */}
          <div className="flex flex-col">
            <h3 className="text-2xl font-bold mb-6">Legal Disclaimer</h3>
            <p className="text-white/80 mb-4 text-sm leading-relaxed">
              Rift is currently in MVP stage. Trade finance products may be subject to regulatory approval in certain jurisdictions. 
              DeFi protocols involve risk and past performance does not guarantee future results.
            </p>
            <div className="text-white/60 text-xs">
              <p className="mb-2">Socials:</p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-white transition-colors">X (Twitter)</a>
                <a href="#" className="hover:text-white transition-colors">Discord</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
