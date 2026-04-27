"use client";

import { useEffect, useState } from "react";
import SellerNavbar from "./SellerNavbar";
import SellerSidebar from "./SellerSidebar";
import { getSellerSession } from "@/lib/sessionHelper";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getSellerSession();
    if (!session?.access_token) {
      window.location.href = "/seller/login";
      return;
    }
    setAuthorized(true);
  }, []);

  if (!authorized) {
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
