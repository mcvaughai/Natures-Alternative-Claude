"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  userProfile: null,
  sellerProfile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
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

  const refreshProfile = useCallback(async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (u) await loadProfiles(u.id);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut errors — still clear state
    }
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setSellerProfile(null);
    window.location.href = "/";
  }, []);

  useEffect(() => {
    // Hard cap: loading must resolve within 3 seconds no matter what
    const maxTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Get initial session from Supabase (reads from local storage — fast)
    supabase.auth.getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          loadProfiles(s.user.id).finally(() => {
            clearTimeout(maxTimeout);
            setLoading(false);
          });
        } else {
          clearTimeout(maxTimeout);
          setLoading(false);
        }
      })
      .catch(() => {
        clearTimeout(maxTimeout);
        setLoading(false);
      });

    // Keep state in sync with Supabase auth events (sign in, sign out, token refresh)
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
        clearTimeout(maxTimeout);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(maxTimeout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, userProfile, sellerProfile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
