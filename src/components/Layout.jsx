import React, { useState, useEffect } from 'react';
import { Menu, X, Building2 } from 'lucide-react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#06090f] bg-mesh flex flex-col md:flex-row text-[#e2e8f0] font-['Inter',sans-serif]">
      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-white">
            <Building2 size={16} strokeWidth={2.5} />
          </div>
          <span className="font-extrabold tracking-wide font-display gradient-text text-sm">
            VASTU
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-400 hover:text-white bg-white/[0.03] rounded-lg border border-white/[0.08]"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:pl-64 min-h-screen overflow-hidden w-full relative">
        {children}
      </main>
    </div>
  );
}
