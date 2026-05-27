import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

const DEMO_KEY = "lmu.demo_user";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  demoSignIn: (role: "admin" | "student") => void;
  signOut: () => Promise<void>;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function buildDemoUser(role: "admin" | "student"): User {
  const now = new Date().toISOString();
  return {
    id: role === "admin" ? "demo-admin-id" : "demo-student-id",
    app_metadata: {},
    user_metadata: {
      full_name: role === "admin" ? "Demo Admin" : "Demo Student",
      avatar_url: null,
    },
    aud: "authenticated",
    confirmation_sent_at: now,
    recovery_sent_at: undefined,
    email_change_sent_at: undefined,
    new_email: undefined,
    invited_at: undefined,
    action_link: undefined,
    email: role === "admin" ? "admin@lmu.edu.ng" : "student@lmu.edu.ng",
    phone: "",
    created_at: now,
    confirmed_at: now,
    email_confirmed_at: now,
    phone_confirmed_at: undefined,
    last_sign_in_at: now,
    role: "authenticated",
    updated_at: now,
    identities: [],
    factors: [],
  } as User;
}

function buildDemoSession(user: User): Session {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: "demo-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: "demo-refresh",
    user,
  } as Session;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check for demo login first
    const demoRole = localStorage.getItem(DEMO_KEY) as "admin" | "student" | null;
    if (demoRole) {
      const demoUser = buildDemoUser(demoRole);
      setUser(demoUser);
      setSession(buildDemoSession(demoUser));
      setIsDemo(true);
      setLoading(false);
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsDemo(false);
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    return { error: error?.message ?? null };
  };

  const demoSignIn = (role: "admin" | "student") => {
    localStorage.setItem(DEMO_KEY, role);
    const demoUser = buildDemoUser(role);
    setUser(demoUser);
    setSession(buildDemoSession(demoUser));
    setIsDemo(true);
  };

  const signOut = async () => {
    localStorage.removeItem(DEMO_KEY);
    setIsDemo(false);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, demoSignIn, signOut, isDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
