"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Hard 3-second timeout: if auth check hasn't finished, redirect to login
    const timeout = setTimeout(() => {
      window.location.href = "/admin/login";
    }, 3000);

    async function checkAuth() {
      // Check for an active session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        clearTimeout(timeout);
        window.location.href = "/admin/login";
        return;
      }

      // Query profiles table directly to verify admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      clearTimeout(timeout);

      if (profile?.role === "admin") {
        setAuthorized(true);
      } else {
        window.location.href = "/admin/login";
      }
    }

    checkAuth().catch(() => {
      clearTimeout(timeout);
      window.location.href = "/admin/login";
    });

    return () => clearTimeout(timeout);
  }, []);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#1a4a2e] border-t-transparent animate-spin"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <AdminNavbar/>
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar/>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
