"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Crown, Mail, Lock, Loader2, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp, supabase } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        const result = await signUp(email, password, { 
          full_name: fullName, 
          role: 'staff' 
        });
        if (result.error) throw result.error;
        alert('Account created! Please check your email to verify.');
        setIsSignUp(false);
      } else {
        // 1. Sign In
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        if (!data.user) throw new Error("No user found");

        // 2. Fetch the profile to check the role using supabase from context
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw new Error("Profile not found");

        // 3. Redirect based on role
        if (profile.role === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/profile');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0806] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0806] via-[#14110e] to-[#0a0806] -z-10" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-grey.png')] opacity-20 -z-10" />
      
      <div className="max-w-md w-full bg-black/40 backdrop-blur-xl p-10 rounded-sm border border-amber-500/20 shadow-2xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <Crown className="text-amber-400 mx-auto" size={32} />
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/20 mb-4">
            <span className="text-amber-400 text-[8px] tracking-[0.3em] font-sans uppercase">Elite Access</span>
          </div>
          <h1 className="text-xl font-serif text-white tracking-[0.2em] uppercase italic">Pulse Interface</h1>
          <p className="text-stone-500 text-[9px] tracking-[0.3em] uppercase mt-2">Luxury Hospitality Systems</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50" size={16} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-stone-900/50 border border-amber-500/10 rounded-sm py-3 pl-10 pr-4 text-white text-xs tracking-widest focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-700"
                placeholder="FULL NAME"
                required={isSignUp}
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50" size={16} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-900/50 border border-amber-500/10 rounded-sm py-3 pl-10 pr-4 text-white text-xs tracking-widest focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-700"
              placeholder="EMAIL ADDRESS"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50" size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-900/50 border border-amber-500/10 rounded-sm py-3 pl-10 pr-10 text-white text-xs tracking-widest focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-700"
              placeholder="PASSWORD"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 hover:text-amber-400 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-sm text-red-400 text-[10px] uppercase tracking-widest text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black py-4 rounded-sm font-sans font-bold text-[10px] tracking-[0.3em] uppercase hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[9px] tracking-[0.2em] uppercase text-stone-500 hover:text-amber-400 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[8px] tracking-[0.3em] uppercase text-stone-600 hover:text-stone-500 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}