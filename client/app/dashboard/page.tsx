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
  Brain,
  Star,
  Edit2
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, profile, loading: authLoading, signOut, session } = useAuth();
  const router = useRouter();
  
  const [requirement, setRequirement] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [editingScore, setEditingScore] = useState<string | null>(null);
  const [tempScore, setTempScore] = useState<number>(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // SECURITY GUARD
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/profile'); 
    }
  }, [user, profile, authLoading, router]);

  // Fetch all staff
  const fetchAllStaff = async () => {
    if (!session) return;
    setLoadingStaff(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/staff`, {
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setAllStaff(data);
      } else if (data.data && Array.isArray(data.data)) {
        setAllStaff(data.data);
      } else {
        console.error("Unexpected response format:", data);
        setAllStaff([]);
      }
    } catch (err) {
      console.error(err);
      setAllStaff([]);
    }
    setLoadingStaff(false);
  };

  useEffect(() => {
    if (user && profile?.role === 'admin' && session) {
      fetchAllStaff();
    }
  }, [user, profile, session]);

  const updateLoyaltyScore = async (staffId: string, newScore: number) => {
    try {
      await fetch(`${API_URL}/api/admin/staff/${staffId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ loyalty_score: newScore })
      });
      setEditingScore(null);
      fetchAllStaff();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecruit = async () => {
    setLoading(true);
    try {
      const requestBody = {
        requirement: requirement,
        ...(role && { role: role })
      };
      
      const response = await fetch(`${API_URL}/api/recruit`, {
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0806] flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" size={40} />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0806] font-serif">
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
                className="md:hidden text-amber-400"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-black/80 backdrop-blur-xl border-b border-amber-500/20">
            <div className="px-6 py-6 flex flex-col gap-4">
              <button onClick={() => signOut()} className="text-stone-300 hover:text-amber-400 text-sm">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/20 mb-6">
              <Brain size={10} className="text-amber-400" />
              <span className="text-amber-400 text-[10px] tracking-[0.3em] font-sans uppercase">Kuriftu AI Engine</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-light text-white mb-4">
              Admin Dashboard
            </h1>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />
            <p className="text-stone-400 max-w-2xl mx-auto">
              Manage staff, track performance, and find the perfect match with AI
            </p>
          </div>

          {/* Admin Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <Crown className="text-amber-400" size={14} />
              <span className="text-amber-400 text-[10px] tracking-wider uppercase">Administrator: {profile?.full_name || user?.email}</span>
            </div>
          </div>

          {/* Staff Management Table */}
          <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/20 px-6 py-4 border-b border-amber-500/20">
              <h2 className="font-serif text-white text-lg flex items-center gap-2">
                <Users size={18} className="text-amber-400" />
                Staff Directory
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/40 border-b border-amber-500/20">
                  <tr>
                    <th className="text-left py-3 px-4 text-stone-400 text-xs uppercase tracking-wider">Name</th>
                    <th className="text-left py-3 px-4 text-stone-400 text-xs uppercase tracking-wider">Role</th>
                    <th className="text-left py-3 px-4 text-stone-400 text-xs uppercase tracking-wider">Loyalty Score</th>
                    <th className="text-left py-3 px-4 text-stone-400 text-xs uppercase tracking-wider">Vibe Tags</th>
                    <th className="text-left py-3 px-4 text-stone-400 text-xs uppercase tracking-wider">Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStaff ? (
                    <tr><td colSpan={5} className="text-center py-8"><Loader2 className="animate-spin text-amber-400 mx-auto" /></td></tr>
                  ) : allStaff && allStaff.length > 0 ? (
                    allStaff.map((staff) => (
                      <tr key={staff.id} className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-all">
                        <td className="py-3 px-4 text-white text-sm">{staff.full_name}</td>
                        <td className="py-3 px-4 text-stone-400 text-sm capitalize">{staff.role}</td>
                        <td className="py-3 px-4">
                          {editingScore === staff.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={tempScore}
                                onChange={(e) => setTempScore(parseInt(e.target.value))}
                                className="w-20 bg-black/50 border border-amber-500/30 rounded px-2 py-1 text-white text-sm"
                                min="0"
                                max="100"
                              />
                              <button onClick={() => updateLoyaltyScore(staff.id, tempScore)} className="text-green-400 text-xs">Save</button>
                              <button onClick={() => setEditingScore(null)} className="text-red-400 text-xs">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="text-amber-400" size={14} />
                                <span className="text-amber-400 text-sm font-bold">{staff.loyalty_score}%</span>
                              </div>
                              <button onClick={() => {
                                setEditingScore(staff.id);
                                setTempScore(staff.loyalty_score);
                              }} className="text-stone-500 hover:text-amber-400">
                                <Edit2 size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {staff.vibe_tags?.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full text-[10px]">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-400 text-xs">
                          {staff.availability?.slice(0, 3).join(", ")}{staff.availability?.length > 3 ? "..." : ""}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-8 text-stone-500">No staff members found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Recruitment Section */}
          <div className="bg-black/40 backdrop-blur-xl border border-amber-500/20 rounded-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/20 px-6 py-4 border-b border-amber-500/20">
              <h2 className="font-serif text-white text-lg flex items-center gap-2">
                <Brain size={18} className="text-amber-400" />
                AI Staff Matching
              </h2>
            </div>
            <div className="p-8">
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