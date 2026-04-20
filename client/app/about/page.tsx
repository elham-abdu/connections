"use client";
import Link from "next/link";
import { Crown, Target, Eye, Heart, Menu, X, Sparkles, Gem, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0806] font-serif">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0806] via-[#14110e] to-[#0a0806] -z-10" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-grey.png')] opacity-20 -z-10" />

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-black/30 backdrop-blur-xl border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2">
                <Crown className="text-amber-400" size={22} />
                <div>
                  <h1 className="text-lg font-light tracking-[0.15em] uppercase">
                    <span className="font-serif italic text-amber-400 font-normal">Pulse</span>
                    <span className="text-stone-400 text-[8px] font-sans ml-1 tracking-[0.2em]">HOSPITALITY</span>
                  </h1>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link href="/what-we-do" className="text-stone-300 hover:text-amber-400 text-xs font-sans tracking-[0.15em] uppercase">What We Do</Link>
                <Link href="/about" className="text-amber-400 text-xs font-sans tracking-[0.15em] uppercase">About Us</Link>
                <Link href="/contact" className="text-stone-300 hover:text-amber-400 text-xs font-sans tracking-[0.15em] uppercase">Contact</Link>
              </nav>

              <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="text-xs font-sans tracking-[0.1em] uppercase text-stone-300 hover:text-amber-400 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-black text-[11px] font-sans font-bold tracking-[0.15em] uppercase rounded-sm hover:shadow-lg transition-all">
                  Get Started
                </Link>
              </div>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-amber-400"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/20 mb-6">
              <Sparkles size={10} className="text-amber-400" />
              <span className="text-amber-400 text-[10px] tracking-[0.3em] font-sans uppercase">Our Story</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6">
              Redefining <span className="text-amber-400 italic">Luxury</span> Hospitality
            </h1>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />
            <p className="text-stone-400 text-lg leading-relaxed">
              Founded in 2026, Pulse was born from a singular vision: transform hotel staff management from administrative burden to strategic advantage.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-amber-500/20">
              <Target className="text-amber-400 mb-4" size={32} />
              <h2 className="text-2xl font-serif text-white mb-3">Our Mission</h2>
              <div className="w-12 h-px bg-amber-500/40 mb-4" />
              <p className="text-stone-400 leading-relaxed">
                To empower luxury hospitality leaders with AI-driven intelligence that optimizes staff performance, rewards excellence, and elevates guest experiences.
              </p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-amber-500/20">
              <Eye className="text-amber-400 mb-4" size={32} />
              <h2 className="text-2xl font-serif text-white mb-3">Our Vision</h2>
              <div className="w-12 h-px bg-amber-500/40 mb-4" />
              <p className="text-stone-400 leading-relaxed">
                A world where every hospitality professional is recognized, rewarded, and developed through intelligent performance systems.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <Heart className="text-amber-400 mx-auto mb-3" size={28} />
              <h2 className="text-3xl font-serif text-white">Our Core Values</h2>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-3" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Gem className="text-amber-400 mx-auto mb-3" size={24} />
                <h3 className="text-white font-serif mb-2">Excellence</h3>
                <p className="text-stone-400 text-sm">Uncompromising quality in everything we build</p>
              </div>
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 mx-auto mb-3">
                  <path d="M12 4a4 4 0 0 1 3.5 6A4 4 0 0 1 12 18a4 4 0 0 1-3.5-6A4 4 0 0 1 12 4z"/>
                  <path d="M12 2v2"/>
                  <path d="M12 20v2"/>
                  <path d="M17 5l-1 1"/>
                  <path d="M7 7L6 6"/>
                  <path d="M17 19l-1-1"/>
                  <path d="M7 17l-1 1"/>
                </svg>
                <h3 className="text-white font-serif mb-2">Innovation</h3>
                <p className="text-stone-400 text-sm">Pushing boundaries with AI and intelligence</p>
              </div>
              <div className="text-center">
                <Heart className="text-amber-400 mx-auto mb-3" size={24} />
                <h3 className="text-white font-serif mb-2">Integrity</h3>
                <p className="text-stone-400 text-sm">Transparent, fair, and ethical operations</p>
              </div>
            </div>
          </div>

          {/* Team Section Placeholder */}
          <div className="bg-gradient-to-r from-amber-600/10 to-amber-500/10 border border-amber-500/20 rounded-sm p-12 text-center">
            <h2 className="text-2xl font-serif text-white mb-3">Leadership</h2>
            <div className="w-12 h-px bg-amber-500/40 mx-auto mb-6" />
            <p className="text-stone-400 mb-6">
              A team of hospitality veterans, AI engineers, and luxury brand experts united by a shared mission.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-amber-400 text-sm hover:text-amber-300 transition-colors">
              Meet the team → 
            </Link>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-black text-xs font-bold uppercase tracking-widest rounded-sm hover:shadow-lg transition-all">
              Join the Movement <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative bg-black/80 backdrop-blur-md border-t border-amber-500/10 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className="text-amber-400" size={14} />
              <p className="text-stone-500 text-[9px] font-sans tracking-[0.2em] uppercase">© 2026 Pulse Intelligence Systems</p>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-stone-500 hover:text-amber-400 text-[9px] tracking-[0.15em] uppercase">Privacy</Link>
              <Link href="/terms" className="text-stone-500 hover:text-amber-400 text-[9px] tracking-[0.15em] uppercase">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}