"use client";
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  supabase: SupabaseClient;
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<any>;
  // Updated to accept metadata object
  signUp: (email: string, password: string, metadata: { full_name: string; role: string }) => Promise<any>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(supabaseUrl, supabaseAnonKey);
  }, []);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const role = user.user_metadata?.role;
    setIsAdmin(role === 'admin');
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminRole(session?.user ?? null);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.data.user) {
      checkAdminRole(result.data.user);
    }
    return result;
  };

  // Updated signUp function
  const signUp = async (email: string, password: string, metadata: { full_name: string; role: string }) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // metadata now passed directly to user_metadata
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ supabase, user, session, signIn, signUp, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}