
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import RiftScore from '../components/RiftScore';
import FundingSimulator from '../components/FundingSimulator';
import ESGAdvantage from '../components/ESGAdvantage';
import WaitingList from '../components/WaitingList';
import Footer from '../components/Footer';

const Index = () => {
  const navigate = useNavigate();

  // Redirect logged-in users based on their role
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Get user role and redirect accordingly
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('auth_id', session.user.id)
          .single();

        if (!userData?.role) {
          navigate('/role-selection');
        } else if (userData.role === 'seller') {
          navigate('/dashboard/seller');
        } else if (userData.role === 'funder') {
          navigate('/dashboard/funder');
        } else if (userData.role === 'operator' || userData.role === 'admin') {
          navigate('/dashboard/operator');
        }
      }
    });
  }, [navigate]);

  // Initialize intersection observer for scroll animations
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
    
    const sections = document.querySelectorAll('.slide-in-section');
    sections.forEach(section => {
      observer.observe(section);
    });
    
    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <RiftScore />
        <FundingSimulator />
        <ESGAdvantage />
        <WaitingList />
      </main>
      <Footer />

      {/* Smooth Scroll Back to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-rift-blue text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-rift-blue/90 opacity-0 translate-y-10 hover:scale-110 z-50"
        style={{ opacity: 0, transform: 'translateY(10px)' }}
        id="backToTop"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {/* Back to Top Button Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.addEventListener('scroll', function() {
            const button = document.getElementById('backToTop');
            if (window.scrollY > 500) {
              button.style.opacity = '1';
              button.style.transform = 'translateY(0)';
            } else {
              button.style.opacity = '0';
              button.style.transform = 'translateY(10px)';
            }
          });
        `
      }} />
    </div>
  );
};

export default Index;
