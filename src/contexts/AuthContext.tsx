import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      setLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const resolvedSession = error ? null : (session ?? null);
      setSession(resolvedSession);
      setUser(resolvedSession?.user ?? null);
      setLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setSession(session ?? null);
      setUser(session?.user ?? null);
      setLoading(false);

      // After email confirmation, create the profile if it doesn't exist yet
      // (profile upsert is skipped during signUp when no session is returned)
      if (event === 'SIGNED_IN' && session?.user) {
        // A new sign-in always clears the signed-out flag so resolveFlow
        // doesn't short-circuit on the stale flag from a previous session
        sessionStorage.removeItem('tradinsight_signed_out');

        // Create profile if it doesn't exist yet (post email-confirmation path,
        // where signUp skipped the upsert because no session existed at signup time)
        const u = session.user;
        supabase
          .from('profiles')
          .upsert([{
            id: u.id,
            email: u.email,
            full_name: u.user_metadata?.full_name || '',
          }], { ignoreDuplicates: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) throw error;

      // Profile is created automatically by the on_auth_user_created DB trigger.
      // No manual insert needed here.

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    // Set flag so App.tsx routing doesn't immediately re-route on session cleanup
    sessionStorage.setItem('tradinsight_signed_out', 'true');
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    localStorage.removeItem('tradinsight_flow');
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut }}
    >
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