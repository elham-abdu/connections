"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Crown, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, fullName);
        if (result.error) throw result.error;
        alert('Account created! Please check your email to verify.');
        setIsSignUp(false);
      } else {
        result = await signIn(email, password);
        if (result.error) throw result.error;
        router.push('/staff');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-stone-50 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-3 rounded-2xl shadow-lg">
              <Crown className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-800">Pulse Staffing AI</h1>
          <p className="text-stone-500 mt-2">Luxury Hospitality Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-100 p-8">
          <h2 className="text-2xl font-serif font-bold text-stone-800 mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-4 pl-12 bg-stone-50 border-2 border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-stone-800"
                    placeholder="John Doe"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 pl-12 bg-stone-50 border-2 border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-stone-800"
                  placeholder="manager@luxuryhotel.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pl-12 pr-12 bg-stone-50 border-2 border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-stone-800"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-stone-400" /> : <Eye className="w-5 h-5 text-stone-400" />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-stone-800 to-stone-700 text-white font-bold py-4 rounded-2xl transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
        
        {/* Demo Credentials */}
        <div className="mt-6 text-center text-stone-400 text-xs">
          <p>Demo: demo@luxuryhotel.com / demo123</p>
          <p className="mt-1">Admin: admin@luxuryhotel.com / admin123</p>
        </div>
      </div>
    </div>
  );
}