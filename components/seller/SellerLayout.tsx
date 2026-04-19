"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SellerNavbar from "./SellerNavbar";
import SellerSidebar from "./SellerSidebar";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("seller");
      if (!stored || !JSON.parse(stored).loggedIn) {
        router.replace("/seller/login");
        return;
      }
      setReady(true);
    } catch {
      router.replace("/seller/login");
    }
  }, [router]);

  if (!ready) {
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
