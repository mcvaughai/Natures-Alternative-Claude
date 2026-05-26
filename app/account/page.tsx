"use client";

import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";
import DashboardSection from "@/components/account/DashboardSection";
import { getValidCustomerSession } from "@/lib/sessionHelper";

export default function AccountPage() {
  useEffect(() => {
    getValidCustomerSession();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="w-full px-6">
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
