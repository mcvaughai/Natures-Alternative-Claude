"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import {
  getUserProfile,
  getSellerProfileForUser,
  UserProfile,
  SellerProfile,
} from "./auth";

// ─── Context shape ───────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  sellerProfile: SellerProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  userProfile: null,
  sellerProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfiles(userId: string) {
    const [profile, seller] = await Promise.all([
      getUserProfile(userId),
      getSellerProfileForUser(userId),
    ]);
    setUserProfile(profile);
    setSellerProfile(seller);
  }

  async function refreshProfile() {
    if (user) {
      await loadProfiles(user.id);
    }
  }

  useEffect(() => {
    // Safety net: never spin forever — force loading=false after 3 seconds
    const maxLoadTimeout = setTimeout(() => setLoading(false), 3000);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfiles(s.user.id).finally(() => {
          clearTimeout(maxLoadTimeout);
          setLoading(false);
        });
      } else {
        clearTimeout(maxLoadTimeout);
        setLoading(false);
      }
    }).catch(() => {
      clearTimeout(maxLoadTimeout);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          await loadProfiles(s.user.id);
        } else {
          setUserProfile(null);
          setSellerProfile(null);
        }
        clearTimeout(maxLoadTimeout);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(maxLoadTimeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, userProfile, sellerProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
