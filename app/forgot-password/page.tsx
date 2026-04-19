"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            {/* Header */}
            <div className="text-center mb-7">
              {/* Leaf icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#1a4a2e]/10 flex items-center justify-center">
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 4 C10 4 7 8 7 12 C7 16 10 19 15 20 C20 19 23 16 23 12 C23 8 20 4 15 4Z" fill="#1a4a2e" opacity="0.85" />
                    <line x1="15" y1="20" x2="15" y2="27" stroke="#1a4a2e" strokeWidth="2" strokeLinecap="round" />
                    <path d="M11 15 Q15 11 19 15" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
                    <path d="M12 18 Q15 14 18 18" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Reset Your Password</h1>
              <p className="text-sm font-medium text-[#1a4a2e]">Natures Alternative Market Place</p>
            </div>

            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {/* Form */}
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4a2e]/30 focus:border-[#1a4a2e] transition"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold py-2.5 rounded-xl transition-colors mt-2"
              >
                Send Reset Link
              </button>
            </form>

            {/* Back to login */}
            <div className="text-center mt-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-[#1a4a2e] font-semibold hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
