"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { Crown, Mail, Lock, User, Loader2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signUp(email, password, { 
        full_name: fullName, 
        role: 'staff' 
      });
      if (error) throw error;
      
      alert("Registration successful! Please verify your email.");
      router.push("/login");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0806] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0806] via-[#14110e] to-[#0a0806] -z-10" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-grey.png')] opacity-20 -z-10" />
      
      <div className="max-w-md w-full bg-black/40 backdrop-blur-xl p-10 rounded-sm border border-amber-500/20 shadow-2xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <Crown className="text-amber-400 mx-auto" size={32} />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/20 mb-4">
            <Sparkles size={10} className="text-amber-400" />
            <span className="text-amber-400 text-[8px] tracking-[0.3em] font-sans uppercase">Join The Elite</span>
            <Sparkles size={10} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-serif text-white tracking-widest uppercase italic">Join the Elite</h1>
          <p className="text-stone-500 text-[10px] tracking-[0.2em] uppercase mt-2 font-sans">Staff Enrollment</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50" size={16} />
            <input
              type="text" 
              placeholder="FULL NAME"
              className="w-full bg-stone-900/50 border border-amber-500/10 rounded-sm py-3 pl-10 pr-4 text-white text-xs tracking-widest focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-700"
              onChange={(e) => setFullName(e.target.value)} 
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50" size={16} />
            <input
              type="email" 
              placeholder="EMAIL ADDRESS"
              className="w-full bg-stone-900/50 border border-amber-500/10 rounded-sm py-3 pl-10 pr-4 text-white text-xs tracking-widest focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-700"
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50" size={16} />
            <input
              type="password" 
              placeholder="PASSWORD"
              className="w-full bg-stone-900/50 border border-amber-500/10 rounded-sm py-3 pl-10 pr-4 text-white text-xs tracking-widest focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-700"
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black py-4 rounded-sm font-sans font-bold text-[10px] tracking-[0.3em] uppercase hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (
              <>
                Register Account <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-[10px] tracking-widest text-stone-500 uppercase">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
            Sign In
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[8px] tracking-[0.3em] uppercase text-stone-600 hover:text-stone-500 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}