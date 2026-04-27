"use client";

import { useEffect, useState } from "react";
import SellerNavbar from "./SellerNavbar";
import SellerSidebar from "./SellerSidebar";
import { supabase } from "@/lib/supabase";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          window.location.href = "/seller/login";
          return;
        }

        const { data: sellerProfile } = await supabase
          .from("sellers")
          .select("id, status")
          .eq("user_id", session.user.id)
          .single();

        if (!sellerProfile || sellerProfile.status !== "approved") {
          window.location.href = "/seller/login";
          return;
        }

        setChecking(false);
      } catch (err) {
        console.error("SellerLayout auth error:", err);
        window.location.href = "/seller/login";
      }
    }

    checkAuth();
  }, []);

  if (checking) {
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
