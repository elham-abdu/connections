"use client";
import Link from "next/link";
import { Crown, Mail, Phone, MapPin, Send, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here (connect to your backend)
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

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
                <Link href="/about" className="text-stone-300 hover:text-amber-400 text-xs font-sans tracking-[0.15em] uppercase">About Us</Link>
                <Link href="/contact" className="text-amber-400 text-xs font-sans tracking-[0.15em] uppercase">Contact</Link>
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
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/20 mb-6">
              <Sparkles size={10} className="text-amber-400" />
              <span className="text-amber-400 text-[10px] tracking-[0.3em] font-sans uppercase">Get In Touch</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-light text-white mb-4">
              Let's Connect
            </h1>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />
            <p className="text-stone-400 max-w-2xl mx-auto">
              Ready to transform your hospitality operations? Reach out to our team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-amber-500/20">
              <h2 className="text-2xl font-serif text-white mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-stone-400 text-xs tracking-wider uppercase mb-2">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-stone-900/50 border border-amber-500/20 rounded-sm py-3 px-4 text-white text-sm focus:border-amber-500/50 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-xs tracking-wider uppercase mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-stone-900/50 border border-amber-500/20 rounded-sm py-3 px-4 text-white text-sm focus:border-amber-500/50 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-stone-400 text-xs tracking-wider uppercase mb-2">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full bg-stone-900/50 border border-amber-500/20 rounded-sm py-3 px-4 text-white text-sm focus:border-amber-500/50 outline-none transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black py-3 rounded-sm font-sans font-bold text-xs tracking-[0.2em] uppercase hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Send Message <Send size={14} />
                </button>
                {submitted && (
                  <p className="text-green-500 text-xs text-center">Message sent successfully!</p>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-amber-500/20">
                <h2 className="text-2xl font-serif text-white mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-stone-300">
                    <Mail className="text-amber-400" size={20} />
                    <span>concierge@pulsehospitality.com</span>
                  </div>
                  <div className="flex items-center gap-4 text-stone-300">
                    <Phone className="text-amber-400" size={20} />
                    <span>+1 (888) 997-8573</span>
                  </div>
                  <div className="flex items-center gap-4 text-stone-300">
                    <MapPin className="text-amber-400" size={20} />
                    <span>Park Avenue, New York, NY 10022</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-amber-500/20">
                <h2 className="text-2xl font-serif text-white mb-4">Sales Inquiries</h2>
                <div className="w-12 h-px bg-amber-500/40 mb-4" />
                <p className="text-stone-400 mb-4">
                  For enterprise solutions and partnership opportunities, our sales team is ready to assist.
                </p>
                <Link href="mailto:sales@pulsehospitality.com" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
                  sales@pulsehospitality.com →
                </Link>
              </div>

              <div className="bg-black/40 backdrop-blur-sm p-8 rounded-sm border border-amber-500/20">
                <h2 className="text-2xl font-serif text-white mb-4">Support</h2>
                <div className="w-12 h-px bg-amber-500/40 mb-4" />
                <p className="text-stone-400 mb-4">
                  24/7 technical support for all Pulse customers.
                </p>
                <Link href="mailto:support@pulsehospitality.com" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
                  support@pulsehospitality.com →
                </Link>
              </div>
            </div>
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