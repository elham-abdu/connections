"use client";
import Link from "next/link";
import { 
  Crown, 
  TrendingUp, 
  Heart, 
  Brain, 
  Calendar, 
  BarChart3, 
  ArrowRight, 
  Menu, 
  X,
  Sparkles,
  Gem
} from "lucide-react";
import { useState } from "react";

export default function WhatWeDoPage() {
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
                <Link href="/what-we-do" className="text-amber-400 text-xs font-sans tracking-[0.15em] uppercase">What We Do</Link>
                <Link href="/about" className="text-stone-300 hover:text-amber-400 text-xs font-sans tracking-[0.15em] uppercase">About Us</Link>
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
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/20 mb-6">
              <Brain size={10} className="text-amber-400" />
              <span className="text-amber-400 text-[10px] tracking-[0.3em] font-sans uppercase">Kuriftu AI Engine</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6">
              Intelligence Meets <span className="text-amber-400 italic">Hospitality</span>
            </h1>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />
            <p className="text-stone-400 max-w-2xl mx-auto">
              Pulse transforms hotel staff management through AI-driven performance scoring and intelligent scheduling.
            </p>
          </div>

          {/* Vibe Grade Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/20 mb-4">
                <TrendingUp size={10} className="text-amber-400" />
                <span className="text-amber-400 text-[8px] tracking-[0.3em] font-sans uppercase">Core Metric</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Vibe Grade <span className="text-amber-400">0-100</span></h2>
              <div className="w-16 h-px bg-amber-500/40 mb-6" />
              <p className="text-stone-300 leading-relaxed mb-4">
                Every staff member receives a real-time <span className="text-amber-400 font-semibold">Vibe Grade</span> — a dynamic performance score calculated from:
              </p>
              <ul className="space-y-2 text-stone-400 mb-6">
                <li className="flex items-center gap-2">• Manager performance reviews</li>
                <li className="flex items-center gap-2">• Peer feedback and collaboration</li>
                <li className="flex items-center gap-2">• Guest satisfaction metrics</li>
                <li className="flex items-center gap-2">• Punctuality and reliability data</li>
              </ul>
              <p className="text-stone-400 text-sm italic border-l-2 border-amber-500/40 pl-4">
                "Higher Vibe Grades unlock premium shifts and recognition opportunities."
              </p>
            </div>
            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-amber-500/20 text-center">
              <div className="text-8xl font-serif text-amber-400 mb-2">94</div>
              <div className="text-stone-400 text-xs tracking-widest uppercase mb-4">Current Vibe Grade</div>
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full" style={{ width: '94%' }} />
              </div>
              <p className="text-stone-500 text-xs mt-4">Elite Performer • Top 5%</p>
            </div>
          </div>

          {/* Loyalty Score Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-amber-500/20 text-center">
                <div className="text-6xl font-serif text-amber-400 mb-2">★ 872</div>
                <div className="text-stone-400 text-xs tracking-widest uppercase mb-4">Loyalty Score</div>
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full" style={{ width: '87%' }} />
                </div>
                <p className="text-stone-500 text-xs mt-4">3+ Years • Gold Tier</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/20 mb-4">
                <Heart size={10} className="text-amber-400" />
                <span className="text-amber-400 text-[8px] tracking-[0.3em] font-sans uppercase">Retention Metric</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Loyalty Score</h2>
              <div className="w-16 h-px bg-amber-500/40 mb-6" />
              <p className="text-stone-300 leading-relaxed mb-4">
                The <span className="text-amber-400 font-semibold">Loyalty Score</span> measures staff commitment and career progression:
              </p>
              <ul className="space-y-2 text-stone-400 mb-6">
                <li className="flex items-center gap-2">• Tenure and attendance consistency</li>
                <li className="flex items-center gap-2">• Skill development and certifications</li>
                <li className="flex items-center gap-2">• Peer recognition and mentorship</li>
                <li className="flex items-center gap-2">• Retention and promotion history</li>
              </ul>
              <p className="text-stone-400 text-sm italic border-l-2 border-amber-500/40 pl-4">
                "Higher Loyalty Scores unlock benefits, bonuses, and leadership opportunities."
              </p>
            </div>
          </div>

          {/* AI Shift Matching Section */}
          <div className="bg-gradient-to-r from-amber-600/10 to-amber-500/10 border border-amber-500/20 rounded-sm p-12 mb-20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/20 mb-4">
                <Brain size={10} className="text-amber-400" />
                <span className="text-amber-400 text-[8px] tracking-[0.3em] font-sans uppercase">Kuriftu AI</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Intelligent Shift Matching</h2>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />
              <p className="text-stone-300 max-w-2xl mx-auto">
                Our proprietary AI engine analyzes Vibe Grades and Loyalty Scores to automatically suggest optimal shift assignments.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Calendar className="text-amber-400 mx-auto mb-3" size={28} />
                <h4 className="text-white font-serif mb-2">Smart Scheduling</h4>
                <p className="text-stone-400 text-sm">Matches high-performers to premium shifts</p>
              </div>
              <div className="text-center">
                <BarChart3 className="text-amber-400 mx-auto mb-3" size={28} />
                <h4 className="text-white font-serif mb-2">Performance-Based</h4>
                <p className="text-stone-400 text-sm">Vibe Grade influences shift priority</p>
              </div>
              <div className="text-center">
                <TrendingUp className="text-amber-400 mx-auto mb-3" size={28} />
                <h4 className="text-white font-serif mb-2">Continuous Learning</h4>
                <p className="text-stone-400 text-sm">AI improves with every shift and review</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-black text-xs font-bold uppercase tracking-widest rounded-sm hover:shadow-lg transition-all">
              Join the Intelligence <ArrowRight size={14} />
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