"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function SellerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !authData.user) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // Check role in profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profile?.role === "seller") {
        window.location.href = "/seller/dashboard";
        return;
      }

      if (profile?.role === "seller_pending") {
        await supabase.auth.signOut();
        setError("Your application is still under review. You will receive an email when approved.");
        setLoading(false);
        return;
      }

      // Fall back: check seller_applications for more specific status message
      const { data: application } = await supabase
        .from("seller_applications")
        .select("status")
        .eq("applicant_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      await supabase.auth.signOut();

      if (application?.status === "pending") {
        setError("Your application is still under review. You will receive an email when approved.");
      } else if (application?.status === "rejected") {
        setError("Your application was not approved. Please contact us for more information.");
      } else {
        setError("No seller account found for this email. Please apply to sell first.");
      }
      setLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid email or password. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Logo bar */}
          <div className="bg-[#1a4a2e] flex flex-col items-center justify-center py-5">
            <Image
              src="/main_logo.png"
              alt="Natures Alternative Market Place"
              width={200}
              height={65}
              className="object-contain"
            />
            <span className="text-green-200 text-xs font-semibold tracking-wide mt-1">Seller Center</span>
          </div>
          {/* Card content */}
          <div className="p-8">
          <div className="text-center mb-7">
            <p className="text-gray-500 text-sm">Welcome back, farmer! 🌿</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email Address</label>
              <input
                id="email" type="email" placeholder="you@yourfarm.com" required
                value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" required
                  value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Toggle password">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a10.05 10.05 0 011.875.175M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-4.364l-14.728 14.728" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button type="button" className="text-xs text-[#1a4a2e] hover:underline font-medium">Forgot Password?</button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#1a4a2e] hover:bg-[#2d6b47] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>}
              {loading ? "Signing in..." : "Login to Seller Center"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-sm text-gray-500 text-center">
            Not approved yet?{" "}
            <Link href="/seller/apply" className="text-[#1a4a2e] font-semibold hover:underline">Apply to Sell</Link>
          </p>
          </div>{/* end p-8 */}
        </div>

        <div className="text-center mt-5">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
