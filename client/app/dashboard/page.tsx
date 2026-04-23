"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { 
  Sparkles, 
  Users, 
  Crown, 
  Loader2, 
  Send, 
  CheckCircle2, 
  Menu, 
  X,
  LogOut,
  Shield,
  Brain
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  const [requirement, setRequirement] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // SECURITY GUARD: This prevents non-admins from accessing the page
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/profile'); 
    }
  }, [user, profile, authLoading, router]);

  // Show a loading screen while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" size={40} />
      </div>
    );
  }

  // If we are still here and not an admin, don't render anything
  if (!user || profile?.role !== 'admin') {
    return null;
  }

  const handleRecruit = async () => {
    setLoading(true);
    try {
      const requestBody = {
        requirement: requirement,
        ...(role && { role: role })
      };
      
      const response = await fetch("http://localhost:8080/api/recruit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      setResult(data.recommendation);
    } catch (err) {
      setResult("Error connecting to the backend.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0806] font-serif">
      {/* Premium Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0806] via-[#14110e] to-[#0a0806] -z-10" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-grey.png')] opacity-20 -z-10" />

      {/* Fixed Glass Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-black/30 backdrop-blur-xl border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                <Crown className="text-amber-400" size={22} />
                <div>
                  <h1 className="text-lg font-light tracking-[0.15em] uppercase">
                    <span className="font-serif italic text-amber-400 font-normal">Pulse</span>
                    <span className="text-stone-400 text-[8px] font-sans ml-1 tracking-[0.2em]">HOSPITALITY</span>
                  </h1>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link href="/dashboard" className="text-amber-400 text-xs font-sans tracking-[0.15em] uppercase">
                  Admin Portal
                </Link>
              </nav>

              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3 px-3 py-1.5 bg-amber-500/10 rounded-full">
                  <Shield className="text-amber-400" size={14} />
                  <span className="text-amber-400 text-[10px] font-sans tracking-wider uppercase">Admin</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-xs font-sans tracking-[0.1em] uppercase text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-amber-400 focus:outline-none"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-black/80 backdrop-blur-xl border-b border-amber-500/20">
            <div className="px-6 py-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="text-amber-400" size={14} />
                  <span className="text-amber-400 text-xs">Admin Access</span>
                </div>
                <button onClick={() => signOut()} className="text-stone-300 hover:text-amber-400 text-sm">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/20 mb-6">
              <Brain size={10} className="text-amber-400" />
              <span className="text-amber-400 text-[10px] tracking-[0.3em] font-sans uppercase">Kuriftu AI Engine</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-light text-white mb-4">
              Staffing Intelligence
            </h1>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />
            <p className="text-stone-400 max-w-2xl mx-auto">
              Authorized Admin Access — AI-powered staff matching for luxury hospitality
            </p>
          </div>

          {/* Admin Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <Crown className="text-amber-400" size={14} />
              <span className="text-amber-400 text-[10px] tracking-wider uppercase">Administrator: {profile?.full_name || user?.email}</span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm overflow-hidden">
            <div className="p-8">
              {/* Role Filter */}
              <div className="mb-8">
                <label className="block text-stone-400 text-xs tracking-wider uppercase mb-3">
                  Filter by Role (Optional)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full md:w-64 bg-stone-900/50 border border-amber-500/20 rounded-sm py-3 px-4 text-white text-sm focus:border-amber-500/50 outline-none transition-all cursor-pointer"
                >
                  <option value="">All Staff</option>
                  <option value="waiter">Waiters</option>
                  <option value="host">Hosts</option>
                  <option value="bartender">Bartenders</option>
                  <option value="manager">Managers</option>
                </select>
              </div>

              {/* Staffing Requirement */}
              <div className="mb-8">
                <label className="block text-stone-400 text-xs tracking-wider uppercase mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500/60" />
                  Staffing Requirement
                </label>
                <textarea
                  className="w-full bg-stone-900/50 border border-amber-500/20 rounded-sm py-4 px-5 text-white text-sm focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-600 resize-none"
                  placeholder="Example: I need an energetic and funny host for a casual dining experience..."
                  rows={4}
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleRecruit}
                disabled={loading || !requirement.trim()}
                className="relative w-full group overflow-hidden rounded-sm bg-gradient-to-r from-amber-600 to-amber-500 text-black font-sans font-bold py-4 px-6 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative flex items-center justify-center gap-2 text-xs tracking-[0.2em] uppercase">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AI is analyzing candidates...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Find Matching Staff
                    </>
                  )}
                </span>
              </button>

              {/* Results */}
              {result && (
                <div className="mt-8 animate-fadeIn">
                  <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-black" />
                        <h2 className="font-serif font-bold text-black text-sm tracking-wider uppercase">
                          AI Recommendation
                        </h2>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="whitespace-pre-wrap text-stone-300 leading-relaxed text-sm">
                        {result}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-black/80 backdrop-blur-md border-t border-amber-500/10 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className="text-amber-400" size={14} />
              <p className="text-stone-500 text-[9px] font-sans tracking-[0.2em] uppercase">
                © 2026 Pulse Intelligence Systems — Admin Portal
              </p>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-stone-500 hover:text-amber-400 text-[9px] tracking-[0.15em] uppercase transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-stone-500 hover:text-amber-400 text-[9px] tracking-[0.15em] uppercase transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}