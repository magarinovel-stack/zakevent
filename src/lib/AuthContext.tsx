import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

export interface UserProfile {
  role: "CLIENT" | "PRESTATAIRE" | "ADMIN";
  displayName?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  city?: string;
  bio?: string;
  description?: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  status?: string;
  isPremium?: boolean;
  type?: string;
  createdAt?: string;
  [key: string]: string | boolean | undefined;
}

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, profile: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from("users").select("*").eq("auth_id", userId).single();
    if (data) {
      setProfile({
        role: data.role || "CLIENT",
        displayName: data.full_name,
        firstName: data.full_name?.split(" ")[0],
        lastName: data.full_name?.split(" ").slice(1).join(" "),
        email: data.email,
        phone: data.phone,
        city: data.city,
        avatarUrl: data.avatar_url,
        status: data.status,
        isPremium: data.is_premium,
        createdAt: data.created_at,
      });
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
