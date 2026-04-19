"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";
import DashboardSection from "@/components/account/DashboardSection";

export default function AccountPage() {
  const router = useRouter();

  // Guard: redirect to login if no valid session
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || !JSON.parse(stored).loggedIn) {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
            <AccountSidebar />
            <DashboardSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
