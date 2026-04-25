"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const NEXT_STEPS = [
  "We review your application and farming practices",
  "You may be contacted for additional information",
  "You will receive an approval or feedback email",
  "If approved you will get access to set up your seller account",
];

export default function SellerApplicationSubmittedPage() {
  const [refNumber, setRefNumber] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setRefNumber(ref);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-md p-8 sm:p-10 text-center">
            {/* Checkmark */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1a4a2e] mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a4a2e] mb-3">Application Submitted!</h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Thank you for applying to sell on Natures Alternative Market Place.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              We will review your application and get back to you within 3–5 business days.
            </p>

            {refNumber && (
              <p className="text-xs text-gray-400 mb-8">
                Application Reference: <span className="font-semibold text-gray-600">{refNumber}</span>
              </p>
            )}

            {/* What happens next */}
            <div className="text-left mb-8">
              <h2 className="text-sm font-bold text-gray-700 mb-4">What happens next?</h2>
              <ol className="space-y-3">
                {NEXT_STEPS.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#1a4a2e] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-sm text-gray-600 leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Link href="/"
                className="block w-full bg-[#1a4a2e] hover:bg-[#2d6b47] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                Return to Homepage
              </Link>
              <a href="#"
                className="block w-full border border-[#1a4a2e] text-[#1a4a2e] font-semibold py-2.5 rounded-xl hover:bg-[#1a4a2e]/5 transition-colors text-sm">
                Follow Us on Social Media
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
