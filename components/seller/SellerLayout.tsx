"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SellerNavbar from "./SellerNavbar";
import SellerSidebar from "./SellerSidebar";
import { useAuth } from "@/lib/authContext";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, sellerProfile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || !sellerProfile || sellerProfile.status !== "approved") {
      router.replace("/seller/login");
    }
  }, [loading, user, sellerProfile, router]);

  if (loading || !user || !sellerProfile) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <SellerNavbar />
      <div className="flex flex-1 overflow-hidden">
        <SellerSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
