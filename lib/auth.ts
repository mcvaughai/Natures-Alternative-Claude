import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  zip_code: string | null;
  avatar_url: string | null;
  newsletter: boolean;
  role: string;
  created_at: string;
}

export interface SellerProfile {
  id: string;
  user_id: string;
  slug: string;
  farm_name: string;
  status: string;
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUp({
  email,
  password,
  firstName,
  lastName,
  phone,
  zipCode,
  newsletter,
}: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  zipCode?: string;
  newsletter?: boolean;
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName ?? "",
        last_name: lastName ?? "",
      },
    },
  });

  if (error) throw error;

  // Update profile with additional fields if user was created
  if (data.user) {
    await supabase
      .from("profiles")
      .update({
        first_name: firstName ?? null,
        last_name: lastName ?? null,
        phone: phone ?? null,
        zip_code: zipCode ?? null,
        newsletter: newsletter ?? false,
      })
      .eq("id", data.user.id);
  }

  return data;
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signIn({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Get Current User ─────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─── Get User Profile ─────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as UserProfile;
}

// ─── Update User Profile ──────────────────────────────────────────────────────

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "email" | "created_at">>
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as UserProfile;
}

// ─── Get Seller Profile for logged-in user ────────────────────────────────────

export async function getSellerProfileForUser(userId: string): Promise<SellerProfile | null> {
  const { data, error } = await supabase
    .from("sellers")
    .select("id, user_id, slug, farm_name, status")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data as SellerProfile;
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}
