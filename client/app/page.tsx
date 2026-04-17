"use client";
import Link from "next/link";
import { 
  ArrowRight, 
  Hotel, 
  Shield, 
  UserCircle, 
  Sparkles, 
  Gem, 
  Crown, 
  Clock, 
  Menu, 
  X 
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0806] flex flex-col font-serif selection:bg-amber-500 selection:text-black overflow-x-hidden">
      
      {/* Premium Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0806] via-[#14110e] to-[#0a0806] -z-10" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-grey.png')] opacity-20 -z-10" />

      {/* ==================== CLEAN LUXURY HEADER ==================== */}
      <header className="relative z-50">
        <div className="bg-black/40 backdrop-blur-md border-b border-amber-500/10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 lg:h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                <Crown className="text-amber-400" size={22} />
                <div>
                  <h1 className="text-lg font-light tracking-[0.15em] uppercase">
                    <span className="font-serif italic text-amber-400 font-normal">Pulse</span>
                    <span className="text-stone-400 text-[8px] font-sans ml-1 tracking-[0.2em]">HOSPITALITY</span>
                  </h1>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/about" className="text-stone-300 hover:text-amber-400 transition-colors duration-300 text-xs font-sans tracking-[0.15em] uppercase">
                  System
                </Link>
                <Link href="/security" className="text-stone-300 hover:text-amber-400 transition-colors duration-300 text-xs font-sans tracking-[0.15em] uppercase">
                  Security
                </Link>
                <Link href="/solutions" className="text-stone-300 hover:text-amber-400 transition-colors duration-300 text-xs font-sans tracking-[0.15em] uppercase">
                  Solutions
                </Link>
                <Link href="/enterprise" className="text-stone-300 hover:text-amber-400 transition-colors duration-300 text-xs font-sans tracking-[0.15em] uppercase">
                  Enterprise
                </Link>
              </nav>

              {/* CTA Buttons Desktop */}
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="text-xs font-sans tracking-[0.1em] uppercase text-stone-300 hover:text-amber-400 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black text-[11px] font-sans font-bold tracking-[0.15em] uppercase rounded-sm hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-amber-400 focus:outline-none"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-amber-500/20">
            <div className="px-6 py-6 flex flex-col gap-4">
              <Link href="/about" className="text-stone-300 hover:text-amber-400 transition-colors text-sm font-sans tracking-[0.15em] uppercase py-2" onClick={() => setMobileMenuOpen(false)}>
                System
              </Link>
              <Link href="/security" className="text-stone-300 hover:text-amber-400 transition-colors text-sm font-sans tracking-[0.15em] uppercase py-2" onClick={() => setMobileMenuOpen(false)}>
                Security
              </Link>
              <Link href="/solutions" className="text-stone-300 hover:text-amber-400 transition-colors text-sm font-sans tracking-[0.15em] uppercase py-2" onClick={() => setMobileMenuOpen(false)}>
                Solutions
              </Link>
              <Link href="/enterprise" className="text-stone-300 hover:text-amber-400 transition-colors text-sm font-sans tracking-[0.15em] uppercase py-2" onClick={() => setMobileMenuOpen(false)}>
                Enterprise
              </Link>
              <div className="flex gap-4 pt-4 border-t border-amber-500/20">
                <Link href="/login" className="text-sm font-sans tracking-[0.1em] uppercase text-stone-300 hover:text-amber-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black text-xs font-sans font-bold tracking-[0.15em] uppercase rounded-sm" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative">
        <div className="max-w-5xl relative">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/20 backdrop-blur-sm">
            <Sparkles size={10} className="text-amber-400" />
            <span className="text-amber-400 text-[10px] tracking-[0.3em] font-sans uppercase">Luxury Command Interface</span>
            <Sparkles size={10} className="text-amber-400" />
          </div>

          <h2 className="text-6xl md:text-8xl font-serif font-light text-white leading-[0.9] tracking-tighter mb-8">
            COMMAND
            <span className="block text-amber-400 italic font-serif font-normal relative">
              THE VIBE.
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </span>
          </h2>
          
          <p className="text-stone-400 text-base md:text-lg max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            The elite management interface for luxury hospitality.
            <span className="block text-stone-500 text-xs mt-1">Synchronize your staff with surgical precision.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link href="/register" className="group relative px-8 py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 text-black overflow-hidden rounded-sm transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/20">
              <span className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 font-sans font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2">
                Join as Staff
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
              </span>
            </Link>
            <Link href="/login" className="px-8 py-3.5 border border-amber-500/40 text-amber-400 font-sans font-bold uppercase tracking-[0.2em] text-xs rounded-sm hover:bg-amber-500/10 hover:border-amber-400 transition-all duration-500 backdrop-blur-sm">
              Existing Member
            </Link>
          </div>

          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 text-stone-600 text-[9px] tracking-[0.3em] font-sans">
            <Gem size={8} />
            <span>EST. 2026</span>
            <Gem size={8} />
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-amber-500/20">
          <div className="bg-black/40 backdrop-blur-sm p-8 transition-all duration-500 hover:bg-black/60 group border-r border-amber-500/10">
            <div className="mb-6 relative">
              <div className="absolute inset-0 blur-xl bg-amber-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Shield size={32} className="text-amber-400 relative z-10" />
            </div>
            <h4 className="font-serif text-xl font-light text-white mb-3">Secure Access</h4>
            <div className="w-10 h-px bg-amber-500/40 mb-4" />
            <p className="text-stone-400 text-sm leading-relaxed font-light">
              Encrypted authentication layers for administrative control and staff privacy.
            </p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm p-8 transition-all duration-500 hover:bg-black/60 group border-r border-amber-500/10">
            <div className="mb-6 relative">
              <div className="absolute inset-0 blur-xl bg-amber-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <UserCircle size={32} className="text-amber-400 relative z-10" />
            </div>
            <h4 className="font-serif text-xl font-light text-white mb-3">Vibe Intel</h4>
            <div className="w-10 h-px bg-amber-500/40 mb-4" />
            <p className="text-stone-400 text-sm leading-relaxed font-light">
              Real-time performance feedback and loyalty metrics for every team member.
            </p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm p-8 transition-all duration-500 hover:bg-black/60 group">
            <div className="mb-6 relative">
              <div className="absolute inset-0 blur-xl bg-amber-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Hotel size={32} className="text-amber-400 relative z-10" />
            </div>
            <h4 className="font-serif text-xl font-light text-white mb-3">Global Sync</h4>
            <div className="w-10 h-px bg-amber-500/40 mb-4" />
            <p className="text-stone-400 text-sm leading-relaxed font-light">
              Instant availability updates across all hotel departments and shifts.
            </p>
          </div>
        </div>
      </section>

      {/* Elegant Quote Section */}
      <section className="py-20 px-6 border-y border-amber-500/10 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <Clock size={20} className="text-amber-500/50 mx-auto mb-5" />
          <p className="text-white/80 text-lg md:text-xl font-light italic leading-relaxed">
            "Where precision meets elegance — redefine the standard of hospitality management."
          </p>
          <div className="w-12 h-px bg-amber-500/30 mx-auto mt-6" />
        </div>
      </section>

      {/* ==================== CLEAN FOOTER ==================== */}
      <footer className="relative bg-black/80 backdrop-blur-md border-t border-amber-500/10">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="text-amber-400" size={22} />
                <div>
                  <h3 className="text-lg font-light tracking-[0.15em] uppercase">
                    <span className="font-serif italic text-amber-400 font-normal">Pulse</span>
                    <span className="text-stone-400 text-[8px] font-sans ml-1 tracking-[0.2em]">HOSPITALITY</span>
                  </h3>
                </div>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed mb-5 max-w-sm">
                Redefining luxury hospitality management with precision, elegance, and world-class service intelligence.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-amber-400 text-[10px] font-sans tracking-[0.2em] uppercase mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-stone-400 hover:text-amber-400 text-sm transition-colors">Features</Link></li>
                <li><Link href="/security" className="text-stone-400 hover:text-amber-400 text-sm transition-colors">Security</Link></li>
                <li><Link href="/integrations" className="text-stone-400 hover:text-amber-400 text-sm transition-colors">Integrations</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-amber-400 text-[10px] font-sans tracking-[0.2em] uppercase mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-stone-400 hover:text-amber-400 text-sm transition-colors">About</Link></li>
                <li><Link href="/careers" className="text-stone-400 hover:text-amber-400 text-sm transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-stone-400 hover:text-amber-400 text-sm transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-10 pt-6 border-t border-amber-500/10 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <Hotel size={10} className="text-amber-500/40" />
              <p className="text-stone-500 text-[9px] font-sans tracking-[0.2em] uppercase">
                © 2026 Pulse Intelligence Systems.
              </p>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-stone-500 hover:text-amber-400 text-[9px] font-sans tracking-[0.15em] uppercase transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-stone-500 hover:text-amber-400 text-[9px] font-sans tracking-[0.15em] uppercase transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Global Styles */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        
        ::selection {
          background: #f59e0b;
          color: #0a0806;
        }
        
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: #0a0806;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #f59e0b40;
          border-radius: 2px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #f59e0b;
        }
      `}</style>
    </div>
  );
}